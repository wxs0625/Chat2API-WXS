/**
 * Per-Account Concurrency Guard
 *
 * Many upstream providers effectively serialize requests per account:
 * when several requests hit the same account at the same time, the
 * upstream session can stall and every request hangs ("卡死").
 *
 * This module tracks how many requests are currently in flight for each
 * account and lets callers wait (with a bounded timeout) until a slot
 * frees up. Slots must be released for BOTH streaming and non-streaming
 * responses — for streams only when the stream actually ends or the
 * client disconnects.
 */

export type ReleaseFn = () => void

interface Waiter {
  resolve: (release: ReleaseFn | null) => void
  timer: ReturnType<typeof setTimeout>
}

class AccountConcurrencyManager {
  private inFlight: Map<string, number> = new Map()
  private waiters: Map<string, Waiter[]> = new Map()

  /**
   * Number of requests currently being processed by the account.
   */
  getInFlightCount(accountId: string): number {
    return this.inFlight.get(accountId) || 0
  }

  /**
   * Acquire a processing slot for the account.
   *
   * Resolves with a release function as soon as a slot is available
   * (possibly immediately). If no slot frees up within `timeoutMs`,
   * resolves with `null` so the caller can answer 429 instead of
   * hanging forever.
   */
  acquire(
    accountId: string,
    maxConcurrent: number,
    timeoutMs: number
  ): Promise<ReleaseFn | null> {
    const limit = Math.max(1, Math.floor(maxConcurrent) || 1)
    const count = this.inFlight.get(accountId) || 0

    if (count < limit) {
      this.inFlight.set(accountId, count + 1)
      return Promise.resolve(this.createRelease(accountId, limit))
    }

    return new Promise<ReleaseFn | null>((resolve) => {
      const queue = this.waiters.get(accountId) || []
      const waiter: Waiter = {
        resolve,
        timer: setTimeout(() => {
          const index = queue.indexOf(waiter)
          if (index !== -1) {
            queue.splice(index, 1)
            if (queue.length === 0) {
              this.waiters.delete(accountId)
            }
          }
          resolve(null)
        }, timeoutMs),
      }

      // Don't keep the process alive just for this timer.
      if (typeof waiter.timer.unref === 'function') {
        waiter.timer.unref()
      }

      queue.push(waiter)
      this.waiters.set(accountId, queue)
    })
  }

  /**
   * Create an idempotent release function for one held slot.
   */
  private createRelease(accountId: string, limit: number): ReleaseFn {
    let released = false

    return () => {
      if (released) {
        return
      }
      released = true

      const count = this.inFlight.get(accountId) || 0
      if (count <= 1) {
        this.inFlight.delete(accountId)
      } else {
        this.inFlight.set(accountId, count - 1)
      }

      this.wakeNext(accountId, limit)
    }
  }

  /**
   * Hand freed slots to queued waiters in FIFO order.
   */
  private wakeNext(accountId: string, limit: number): void {
    while ((this.inFlight.get(accountId) || 0) < limit) {
      const queue = this.waiters.get(accountId)
      if (!queue || queue.length === 0) {
        return
      }

      const waiter = queue.shift()!
      if (queue.length === 0) {
        this.waiters.delete(accountId)
      }
      clearTimeout(waiter.timer)

      const count = this.inFlight.get(accountId) || 0
      this.inFlight.set(accountId, count + 1)
      waiter.resolve(this.createRelease(accountId, limit))
    }
  }

  /**
   * Reset all state. Test-only.
   */
  reset(): void {
    for (const queue of this.waiters.values()) {
      for (const waiter of queue) {
        clearTimeout(waiter.timer)
        waiter.resolve(null)
      }
    }
    this.waiters.clear()
    this.inFlight.clear()
  }
}

export const accountConcurrency = new AccountConcurrencyManager()
export default accountConcurrency
