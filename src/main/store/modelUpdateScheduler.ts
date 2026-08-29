/**
 * Model Auto-Update Scheduler
 *
 * Periodically refreshes the model list for every provider that exposes a
 * `modelsApiEndpoint`. Newly discovered models are merged ADDITIVELY into
 * the provider's user model overrides (`addedModels`), so they survive
 * restarts and existing models are never removed.
 */

import { IpcChannels } from '../ipc/channels'
import { getBuiltinProvider } from '../providers/builtin/index'
import { ProviderChecker } from '../providers/checker'
import { getMainWindow } from '../window/manager'
import { storeManager } from './store'

/** Minimum interval between automatic refreshes (1 hour). */
const MIN_INTERVAL_HOURS = 1

let timer: ReturnType<typeof setInterval> | null = null
let running = false

/**
 * Notify the renderer that a provider's model list was updated,
 * so the UI can refresh without a manual reload.
 */
function notifyRenderer(providerId: string, addedModels: string[]): void {
  const win = getMainWindow()

  if (!win || win.isDestroyed()) {
    return
  }

  win.webContents.send(IpcChannels.PROVIDERS_MODELS_UPDATED, {
    providerId,
    addedModels,
    timestamp: Date.now(),
  })
}

/**
 * Perform one refresh pass over all supported providers.
 * Sequential execution avoids overlapping invocations.
 * Returns the list of providers that received new models.
 */
export async function runModelUpdate(): Promise<
  { providerId: string; addedModels: string[] }[]
> {
  if (running) {
    return []
  }

  running = true

  const results: { providerId: string; addedModels: string[] }[] = []

  try {
    const providers = storeManager.getProviders()

    for (const provider of providers) {
      if (!provider.enabled) {
        continue
      }

      const builtinConfig = getBuiltinProvider(provider.id)

      // Only providers that expose a models API are supported.
      if (!builtinConfig || !builtinConfig.modelsApiEndpoint) {
        continue
      }

      try {
        const fetched = await ProviderChecker.fetchProviderModels(provider.id)

        const fetchedModels = fetched.supportedModels.map((name) => ({
          displayName: name,
          actualModelId: fetched.modelMappings[name] || name,
        }))

        const addedNames = storeManager.mergeFetchedModels(provider.id, fetchedModels)

        if (addedNames.length > 0) {
          storeManager.addLog(
            'info',
            `Auto model update: added ${addedNames.length} new model(s) to ${provider.name}: ${addedNames.join(', ')}`
          )
          results.push({ providerId: provider.id, addedModels: addedNames })
          notifyRenderer(provider.id, addedNames)
        }
      } catch (error) {
        storeManager.addLog(
          'warn',
          `Auto model update failed for ${provider.name}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }

    if (results.length > 0) {
      storeManager.addLog(
        'info',
        `Auto model update finished: ${results.length} provider(s) received new models`
      )
    }

    return results
  } finally {
    running = false
  }
}

/**
 * Resolve the refresh interval (ms) from config, with a sane lower bound.
 */
function getIntervalMs(): number {
  try {
    const config = storeManager.getConfig()
    const hours = Math.max(MIN_INTERVAL_HOURS, Number(config.autoUpdateModelsIntervalHours) || 24)
    return hours * 60 * 60 * 1000
  } catch {
    return 24 * 60 * 60 * 1000
  }
}

function setupTimer(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }

  const intervalMs = getIntervalMs()

  timer = setInterval(() => {
    void runModelUpdate()
  }, intervalMs)

  // Don't keep the process alive just for this timer.
  if (typeof timer.unref === 'function') {
    timer.unref()
  }
}

/**
 * Start the scheduler. Safe to call multiple times.
 * The interval is re-applied whenever the autoUpdateModels setting changes.
 * When the feature is disabled the scheduler stays idle.
 */
export function startModelUpdateScheduler(): void {
  try {
    const config = storeManager.getConfig()

    if (!config.autoUpdateModels) {
      stopModelUpdateScheduler()
      return
    }
  } catch {
    // Store not ready yet; keep quiet.
    return
  }

  setupTimer()

  console.log(
    `[ModelUpdateScheduler] Started: model lists refresh every ${getIntervalMs() / 3600000} hour(s)`
  )

  // Immediate first run so new models appear right after startup.
  void runModelUpdate()
}

/**
 * Stop the scheduler.
 */
export function stopModelUpdateScheduler(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
    console.log('[ModelUpdateScheduler] Stopped')
  }
}

/**
 * Apply a changed auto-update configuration (enable/disable or interval).
 */
export function applyModelUpdateConfig(): void {
  try {
    const config = storeManager.getConfig()

    if (!config.autoUpdateModels) {
      stopModelUpdateScheduler()
      return
    }
  } catch {
    return
  }

  setupTimer()
  console.log(
    `[ModelUpdateScheduler] Config applied: interval ${getIntervalMs() / 3600000} hour(s)`
  )
}

/**
 * Trigger an immediate refresh for all supported providers,
 * regardless of the auto-update setting.
 */
export function triggerModelUpdate(): Promise<
  { providerId: string; addedModels: string[] }[]
> {
  return runModelUpdate()
}
