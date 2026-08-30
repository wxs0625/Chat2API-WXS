import { app } from 'electron'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

const LINUX_AUTOSTART_DIR = path.join(os.homedir(), '.config', 'autostart')
const LINUX_AUTOSTART_FILE = path.join(LINUX_AUTOSTART_DIR, 'chat2api.desktop')

/**
 * Quote a single argument for a freedesktop Exec line.
 */
function quoteExecArg(arg: string): string {
  return /[\s"\\]/.test(arg) ? `"${arg.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : arg
}

/**
 * Resolve the command line used to launch the app on Linux.
 */
function resolveLinuxExecLine(): string {
  const args: string[] = []
  if (process.env.APPIMAGE) {
    // Running from an AppImage: relaunch the AppImage file itself.
    args.push(process.env.APPIMAGE)
  } else if (app.isPackaged) {
    args.push(process.execPath)
  } else {
    // Development fallback: run the app directory with the Electron binary.
    args.push(process.execPath, app.getAppPath())
  }
  // Chromium refuses the setuid sandbox as root; keep launches working for root users.
  if (process.platform === 'linux' && typeof process.getuid === 'function' && process.getuid() === 0) {
    args.push('--no-sandbox')
  }
  return args.map(quoteExecArg).join(' ')
}

function buildDesktopEntry(): string {
  return [
    '[Desktop Entry]',
    'Type=Application',
    'Name=Chat2API',
    'Comment=OpenAI-compatible API proxy manager',
    `Exec=${resolveLinuxExecLine()}`,
    'Terminal=false',
    'StartupWMClass=chat2api',
    'X-GNOME-Autostart-enabled=true',
    '',
  ].join('\n')
}

function applyLinuxAutoStart(enabled: boolean): void {
  if (enabled) {
    fs.mkdirSync(LINUX_AUTOSTART_DIR, { recursive: true })
    fs.writeFileSync(LINUX_AUTOSTART_FILE, buildDesktopEntry(), 'utf-8')
    console.log('[AutoStart] Linux autostart entry written:', LINUX_AUTOSTART_FILE)
  } else if (fs.existsSync(LINUX_AUTOSTART_FILE)) {
    fs.unlinkSync(LINUX_AUTOSTART_FILE)
    console.log('[AutoStart] Linux autostart entry removed:', LINUX_AUTOSTART_FILE)
  }
}

/**
 * Apply the OS-level boot autostart registration for the current platform.
 * Windows/macOS use Electron login-item settings; Linux writes an XDG autostart .desktop entry.
 */
export function applyAutoStart(enabled: boolean): void {
  try {
    if (process.platform === 'linux') {
      applyLinuxAutoStart(enabled)
      return
    }
    app.setLoginItemSettings({ openAtLogin: enabled, openAsHidden: false })
    console.log(`[AutoStart] Login item ${enabled ? 'enabled' : 'disabled'} on ${process.platform}`)
  } catch (error) {
    console.error('[AutoStart] Failed to apply auto-start setting:', error)
  }
}
