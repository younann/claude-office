#!/bin/bash
# Start the Claude Office dashboard servers (backend + frontend)
# Idempotent — won't start if already running

PLUGIN_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDFILE="/tmp/claude-office-server.pid"
BACKEND_PORT=3001
FRONTEND_PORT=5173

# Check if backend is already running
if curl -s "http://localhost:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then
  exit 0
fi

# Check if node_modules exist
if [ ! -d "${PLUGIN_ROOT}/server/node_modules" ]; then
  cd "${PLUGIN_ROOT}/server" && npm install --silent 2>/dev/null
fi
if [ ! -d "${PLUGIN_ROOT}/node_modules" ]; then
  cd "${PLUGIN_ROOT}" && npm install --silent 2>/dev/null
fi

# Start backend
cd "${PLUGIN_ROOT}/server" && npx tsx index.ts >/dev/null 2>&1 &
BACKEND_PID=$!

# Wait for backend
for i in 1 2 3 4 5; do
  if curl -s "http://localhost:${BACKEND_PORT}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# Start frontend
cd "${PLUGIN_ROOT}" && npx vite --host >/dev/null 2>&1 &
FRONTEND_PID=$!

# Save PIDs
echo "${BACKEND_PID} ${FRONTEND_PID}" > "${PIDFILE}"

# Wait for frontend
sleep 2

exit 0
