/**
 * Account Status Auto-Refresh Scheduler
 *
 * When an account's status is abnormal (anything other than 'active',
 * e.g. inactive / expired / error), it is re-validated every minute
 * until the status recovers to 'active'.
 */

import { IpcChannels } from '../ipc/channels'
import { getMainWindow } from '../window/manager'
import { AccountManager } from './accounts'
import { storeManager } from './store'
import type { Account } from './types'

/** Re-check interval: 1 minute */
const CHECK_INTERVAL_MS = 60_000

let timer: ReturnType<typeof setInterval> | null = null
let checking = false

/**
 * Notify the renderer that an account status has changed,
 * so the UI can update without a manual refresh.
 * Credentials are stripped before sending.
 */
function notifyRenderer(account: Account): void {
  const win = getMainWindow()

  if (!win || win.isDestroyed()) {
    return
  }

  win.webContents.send(IpcChannels.ACCOUNTS_STATUS_CHANGED, {
    ...account,
    credentials: {},
  })
}

/**
 * Re-validate all accounts whose status is not 'active'.
 * Runs sequentially and skips overlapping invocations.
 */
async function runCheck(): Promise<void> {
  if (checking) {
    // Previous check is still in progress; skip this tick.
    return
  }

  checking = true

  try {
    const accounts = AccountManager.getAll(true)
    const abnormal = accounts.filter((account) => account.status !== 'active')

    if (abnormal.length === 0) {
      return
    }

    storeManager.addLog(
      'info',
      `Auto re-checking ${abnormal.length} account(s) with abnormal status`
    )

    for (const account of abnormal) {
      // The account may have been deleted while waiting.
      if (!AccountManager.getById(account.id)) {
        continue
      }

      try {
        const result = await AccountManager.validate(account.id)

        const updated = AccountManager.getById(account.id)

        if (updated) {
          notifyRenderer(updated)
        }

        if (result.valid) {
          storeManager.addLog(
            'info',
            `Account "${account.name}" recovered automatically (status → active)`
          )
        } else {
          storeManager.addLog(
            'debug',
            `Account "${account.name}" is still abnormal: ${result.error || 'Unknown error'}`
          )
        }
      } catch (error) {
        storeManager.addLog(
          'warn',
          `Failed to re-check account "${account.name}": ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }
  } finally {
    checking = false
  }
}

/**
 * Start the scheduler. Safe to call multiple times.
 * Also performs an immediate first check so accounts persisted
 * with an abnormal status are re-validated right after startup.
 */
export function startAccountStatusScheduler(): void {
  if (timer) {
    return
  }

  timer = setInterval(() => {
    void runCheck()
  }, CHECK_INTERVAL_MS)

  // Don't keep the process alive just for this timer.
  if (typeof timer.unref === 'function') {
    timer.unref()
  }

  console.log(
    '[AccountStatusScheduler] Started: abnormal account statuses are re-checked every 60 seconds'
  )

  // Immediate first check (covers statuses persisted from the previous session).
  void runCheck()
}

/**
 * Stop the scheduler.
 */
export function stopAccountStatusScheduler(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
    console.log('[AccountStatusScheduler] Stopped')
  }
}

/**
 * Trigger an immediate re-check of abnormal accounts
 * (does not wait for the next scheduled tick).
 */
export function triggerAccountStatusCheck(): void {
  void runCheck()
}
