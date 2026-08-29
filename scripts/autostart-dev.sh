#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/wxs0625/Chat2API-main"
LOG_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/chat2api"
LOG_FILE="$LOG_DIR/autostart-dev.log"
LOCK_FILE="$LOG_DIR/autostart-dev.lock"

mkdir -p "$LOG_DIR"
exec 9>"$LOCK_FILE"

if ! flock -n 9; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Chat2API dev autostart already running" >>"$LOG_FILE" 2>&1
  exit 0
fi

if pgrep -f "$APP_DIR/node_modules/electron/dist/electron|electron-vite dev" >/dev/null; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Chat2API dev process already running" >>"$LOG_FILE" 2>&1
  exit 0
fi

{
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Chat2API dev autostart"

  cd "$APP_DIR"
  export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # Desktop autostart does not load shell profile files, so nvm must be loaded here.
    . "$HOME/.nvm/nvm.sh"
    nvm use 22 >/dev/null
  fi

  if [[ -z "${XDG_RUNTIME_DIR:-}" ]]; then
    export XDG_RUNTIME_DIR="/run/user/$(id -u)"
  fi

  if [[ -z "${DBUS_SESSION_BUS_ADDRESS:-}" && -S "$XDG_RUNTIME_DIR/bus" ]]; then
    export DBUS_SESSION_BUS_ADDRESS="unix:path=$XDG_RUNTIME_DIR/bus"
  fi

  for _ in {1..30}; do
    if [[ -n "${DISPLAY:-}" || -n "${WAYLAND_DISPLAY:-}" ]]; then
      break
    fi

    for display in :0 :1; do
      if [[ -S "/tmp/.X11-unix/X${display#:}" ]]; then
        export DISPLAY="$display"
        break 2
      fi
    done

    sleep 1
  done

  if [[ -z "${DISPLAY:-}" && -z "${WAYLAND_DISPLAY:-}" ]]; then
    echo "No desktop display found; skip GUI autostart."
    exit 1
  fi

  export ELECTRON_DISABLE_SANDBOX=1
  # Forward renderer-process console output to stdout so it lands in the log,
  # which is essential for diagnosing renderer crashes (e.g. black window).
  export ELECTRON_ENABLE_LOGGING=1
  echo "node=$(command -v node) $(node -v)"
  echo "npm=$(command -v npm) $(npm -v)"
  echo "starting detached electron app..."
  nohup setsid npx electron-vite dev -- --no-sandbox >>"$LOG_FILE" 2>&1 < /dev/null &
  child_pid=$!
  echo "started detached pid=$child_pid"
} >>"$LOG_FILE" 2>&1