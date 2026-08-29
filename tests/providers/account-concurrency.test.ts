/**
 * Unit tests for the per-account concurrency guard.
 * Run with: node --experimental-strip-types --test tests/providers/account-concurrency.test.ts
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { accountConcurrency } from '../../src/main/proxy/accountConcurrency.ts'

test('acquire grants immediate slot when idle', async () => {
  accountConcurrency.reset()
  const release = await accountConcurrency.acquire('a1', 1, 1000)
  assert.ok(release, 'should acquire immediately')
  assert.equal(accountConcurrency.getInFlightCount('a1'), 1)
  release!()
  assert.equal(accountConcurrency.getInFlightCount('a1'), 0)
})

test('acquire serializes requests per account with limit 1', async () => {
  accountConcurrency.reset()
  const release1 = await accountConcurrency.acquire('a2', 1, 1000)
  assert.ok(release1)

  const order: string[] = []
  const secondPromise = accountConcurrency.acquire('a2', 1, 5000).then((release2) => {
    order.push('second-acquired')
    assert.ok(release2, 'second request should eventually acquire')
    release2!()
  })

  // Second request must be queued while first holds the slot
  await new Promise((r) => setTimeout(r, 20))
  assert.deepEqual(order, [], 'second acquire must wait while first holds slot')
  assert.equal(accountConcurrency.getInFlightCount('a2'), 1)

  order.push('first-released')
  release1!()
  await secondPromise
  assert.deepEqual(order, ['first-released', 'second-acquired'])
  assert.equal(accountConcurrency.getInFlightCount('a2'), 0)
})

test('acquire respects maxConcurrent > 1', async () => {
  accountConcurrency.reset()
  const r1 = await accountConcurrency.acquire('a3', 3, 1000)
  const r2 = await accountConcurrency.acquire('a3', 3, 1000)
  const r3 = await accountConcurrency.acquire('a3', 3, 1000)
  assert.ok(r1 && r2 && r3)
  assert.equal(accountConcurrency.getInFlightCount('a3'), 3)

  // 4th must queue (cannot be acquired immediately)
  let acquired = false
  const p4 = accountConcurrency.acquire('a3', 3, 5000).then((r4) => {
    acquired = true
    r4!()
  })
  await new Promise((r) => setTimeout(r, 20))
  assert.equal(acquired, false, '4th request should queue at limit 3')
  r1!()
  await p4
  assert.equal(acquired, true)
  r2!()
  r3!()
  assert.equal(accountConcurrency.getInFlightCount('a3'), 0)
})

test('acquire returns null after timeout instead of hanging', async () => {
  accountConcurrency.reset()
  // Guard timers are unref()'d (the real server keeps the loop alive), so
  // hold a ref'd keep-alive timer while we wait for the timeout to fire.
  const keepAlive = setTimeout(() => {}, 5000)

  const release = await accountConcurrency.acquire('a4', 1, 1000)
  assert.ok(release)

  const start = Date.now()
  const queued = await accountConcurrency.acquire('a4', 1, 80)
  const elapsed = Date.now() - start
  assert.equal(queued, null, 'should time out with null (caller answers 429)')
  assert.ok(elapsed < 500, 'should not hang beyond timeout')

  release!()
  clearTimeout(keepAlive)
  assert.equal(accountConcurrency.getInFlightCount('a4'), 0)
})

test('release is idempotent', async () => {
  accountConcurrency.reset()
  const release = await accountConcurrency.acquire('a5', 1, 1000)
  assert.ok(release)
  release!()
  release!() // double-release must not corrupt state
  release!()
  assert.equal(accountConcurrency.getInFlightCount('a5'), 0)
})

test('FIFO wake order under burst', async () => {
  accountConcurrency.reset()
  const release = await accountConcurrency.acquire('a6', 1, 1000)
  assert.ok(release)

  const order: number[] = []
  const promises = [1, 2, 3].map((i) =>
    accountConcurrency.acquire('a6', 1, 5000).then((r) => {
      order.push(i)
      assert.ok(r)
      r!()
    })
  )

  await new Promise((r) => setTimeout(r, 20))
  release!()
  await Promise.all(promises)
  assert.deepEqual(order, [1, 2, 3], 'waiters must be served FIFO')
  assert.equal(accountConcurrency.getInFlightCount('a6'), 0)
})
