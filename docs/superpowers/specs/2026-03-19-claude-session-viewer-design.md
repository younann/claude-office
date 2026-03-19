# Claude Session Viewer — Design Spec

A local web dashboard that displays all Claude Code sessions (terminal + IDE) with real-time status, session details, and a mini conversation log.

## Scope

- **In scope:** Claude Code sessions from terminal and IDE (VS Code, Cursor). Read-only — never writes to Claude's files.
- **Out of scope:** Claude Desktop app sessions. SSE/WebSocket (future enhancement).

## Architecture

```
React + Vite + Tailwind (frontend)
        │  HTTP polling every 5s
Express + Node.js (backend)
        │  Reads ~/.claude/projects/**/*.jsonl
        │  Runs `ps` to detect live claude processes
        └─ Returns unified session objects
```

Backend is stateless and read-only. Results cached for 2 seconds to avoid redundant filesystem reads.

## Data Model

```typescript
interface Session {
  id: string;
  project: string;
  projectPath: string;
  gitBranch: string | null;
  status: SessionStatus;
  model: string | null;
  version: string | null;
  startedAt: string;
  lastActivityAt: string;
  messageCount: number;
  toolCallCount: number;
  lastMessage: MessagePreview;
  recentActivity: Activity[];
}

type SessionStatus = "working" | "waiting" | "idle" | "stopped";

interface MessagePreview {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Activity {
  type: "user" | "assistant" | "tool_call" | "tool_result";
  summary: string;
  timestamp: string;
}
```

### Status Detection (Hybrid)

1. Run `ps aux | grep claude` once per scan. Build map of CWD to alive/dead.
2. For alive sessions, parse last JSONL entries:
   - Last message is tool call or assistant thinking → **working** (green)
   - Last message is assistant response, recent → **waiting** (yellow)
   - No activity for 5+ minutes → **idle** (blue)
3. No matching process → **stopped** (red)

## API Endpoints

```
GET /api/sessions
  → Session[] (without recentActivity, sorted by lastActivityAt desc)
  → ?status=working,waiting (optional filter)

GET /api/sessions/:id
  → Session (full detail including recentActivity[])

GET /api/health
  → { ok: true, sessionCount: number, lastScan: string }
```

## Backend Structure

```
server/
├── index.ts              # Express app, routes, CORS
├── services/
│   └── sessionScanner.ts # Core scanning: read projects, parse JSONL tails, detect processes
├── utils/
│   └── jsonlParser.ts    # Read last ~50 lines of JSONL, parse entries
└── types.ts              # Shared TypeScript interfaces
```

Key decisions:
- Tail-read JSONL files (last ~50 lines), not full files — some are thousands of lines
- Single `ps` call per scan, not per session
- 2-second cache on scan results

## Frontend Structure

```
src/
├── App.tsx
├── components/
│   ├── Header.tsx
│   ├── Sidebar/
│   │   ├── StatusFilter.tsx
│   │   ├── SessionList.tsx
│   │   └── SessionItem.tsx
│   └── DetailPanel/
│       ├── DetailPanel.tsx
│       ├── SessionHeader.tsx
│       ├── SessionStats.tsx
│       ├── ActivityLog.tsx
│       └── ActivityItem.tsx
├── hooks/
│   └── useSessions.ts
├── types.ts
└── utils/
    └── formatTime.ts
```

### Layout: Sidebar + Detail Panel

- Fixed sidebar (280px) with status filter pills and scrollable session list
- Detail panel fills remaining width
- Detail panel shows: session header (name, path, branch, model, status badge), 4 stat cards (duration, messages, tool calls, last active), scrollable activity log

### Component Responsibilities

| Component | Role |
|-----------|------|
| Header | Logo, "updated Xs ago" text, manual refresh button |
| StatusFilter | Pill buttons (All, Working, Waiting, Idle, Stopped) with counts |
| SessionList | Filtered, sorted list of SessionItem |
| SessionItem | Project name, status dot, relative time |
| DetailPanel | Container, shows empty state when nothing selected |
| SessionHeader | Project name, path, branch, model, version, status badge |
| SessionStats | 4-card grid: duration, messages, tool calls, last active |
| ActivityLog | Scrollable list of recent ActivityItem |
| ActivityItem | Timestamp, icon by type, description text |

### State Management

Single custom hook `useSessions()`:
- `useState` + `useEffect` + `useCallback` — no external libraries
- Polls `GET /api/sessions` every 5s
- Fetches `GET /api/sessions/:id` when a session is selected
- Pauses polling when tab is hidden (`document.visibilityState`)
- Manual refresh resets timer and fetches immediately

## Styling

Tailwind CSS, dark theme only.

```
Backgrounds:   #0a0a0a (main), #0f0f0f (sidebar), #111 (cards)
Borders:       #1a1a1a (subtle), #222 (visible)
Text:          #e2e8f0 (primary), #888 (secondary), #444 (muted)
Accent:        #7c3aed (purple)

Status:
  Working:     #22c55e (green)
  Waiting:     #eab308 (yellow)
  Idle:        #3b82f6 (blue)
  Stopped:     #ef4444 (red)
```

## Future Enhancements

- SSE for real-time push updates (replace polling)
- Electron/Tauri wrapper for native desktop app
- Claude Desktop app session support
