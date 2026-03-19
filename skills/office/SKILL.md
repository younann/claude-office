---
name: office
description: Open the Claude Office dashboard — a pixel-art office that shows all active Claude sessions as animated workers. Use when the user wants to see their sessions, check what's running, or open the dashboard.
---

# Claude Office Dashboard

Start the office dashboard and open it in the browser.

## Steps:

1. **Check if the server is already running** by checking port 3001:

```bash
curl -s http://localhost:3001/api/health 2>/dev/null
```

2. **If not running, start both servers:**

```bash
cd "${CLAUDE_PLUGIN_ROOT}" && cd server && npx tsx index.ts &
sleep 2
cd "${CLAUDE_PLUGIN_ROOT}" && npx vite --host &
sleep 3
```

3. **If already running, skip to opening the browser.**

4. **Open the dashboard in the browser:**

- macOS: `open http://localhost:5173`
- Linux: `xdg-open http://localhost:5173`

5. **Confirm to the user:** Tell them the dashboard is running at http://localhost:5173 with the number of active sessions.

## Troubleshooting:

- If port 3001 is in use by something else, kill it: `kill $(lsof -ti:3001)`
- If port 5173 is in use, Vite will auto-pick the next port (5174, 5175...)
- Make sure `node_modules` are installed: `cd "${CLAUDE_PLUGIN_ROOT}" && npm install && cd server && npm install`
