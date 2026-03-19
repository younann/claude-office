#!/bin/bash
# Stop the Claude Office dashboard servers

PIDFILE="/tmp/claude-office-server.pid"

if [ -f "${PIDFILE}" ]; then
  read -r BACKEND_PID FRONTEND_PID < "${PIDFILE}"
  kill "${BACKEND_PID}" 2>/dev/null
  kill "${FRONTEND_PID}" 2>/dev/null
  rm -f "${PIDFILE}"
fi

# Also kill by port as fallback
kill $(lsof -ti:3001) 2>/dev/null
kill $(lsof -ti:5173) 2>/dev/null

echo "Claude Office servers stopped."
