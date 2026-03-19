# Claude Session Viewer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local web dashboard that displays all Claude Code sessions with real-time status, session details, and a mini conversation log.

**Architecture:** React + Vite + Tailwind frontend polls an Express backend every 5 seconds. Backend reads `~/.claude/projects/**/*.jsonl` and detects running `claude` processes via `ps` to produce unified session objects with hybrid status detection.

**Tech Stack:** React 18, Vite, Tailwind CSS, Express, TypeScript, tsx (for running TS server)

**Spec:** `docs/superpowers/specs/2026-03-19-claude-session-viewer-design.md`

---

## File Structure

```
viewer/
├── package.json                          # Root workspace scripts (dev, build)
├── tsconfig.json                         # Base TS config
├── server/
│   ├── package.json                      # Express, cors, tsx
│   ├── tsconfig.json                     # Node TS config
│   ├── index.ts                          # Express app: routes, CORS, port 3001
│   ├── types.ts                          # Session, Activity, MessagePreview interfaces
│   ├── services/
│   │   └── sessionScanner.ts             # Core: scan projects, detect processes, derive status
│   └── utils/
│       └── jsonlParser.ts                # Tail-read JSONL files, parse entries
├── src/
│   ├── App.tsx                           # Root layout: Header + Sidebar + DetailPanel
│   ├── main.tsx                          # React entry point
│   ├── index.css                         # Tailwind directives + custom dark theme
│   ├── types.ts                          # Frontend Session/Activity types (mirrors server)
│   ├── hooks/
│   │   └── useSessions.ts               # Polling, selection, filtering state
│   ├── utils/
│   │   └── formatTime.ts                # Relative time formatting
│   └── components/
│       ├── Header.tsx                    # Logo, last-updated, refresh button
│       ├── Sidebar/
│       │   ├── StatusFilter.tsx          # Filter pills with counts
│       │   ├── SessionList.tsx           # Filtered/sorted session list
│       │   └── SessionItem.tsx           # Single session row in sidebar
│       └── DetailPanel/
│           ├── DetailPanel.tsx           # Container + empty state
│           ├── SessionHeader.tsx         # Name, path, branch, model, status badge
│           ├── SessionStats.tsx          # 4-card stat grid
│           ├── ActivityLog.tsx           # Scrollable activity list
│           └── ActivityItem.tsx          # Single activity row
├── index.html                            # Vite HTML entry
├── vite.config.ts                        # Vite config with proxy to backend
├── tailwind.config.js                    # Custom dark theme colors
└── postcss.config.js                     # PostCSS for Tailwind
```

---

## Chunk 1: Project Scaffolding & Backend

### Task 1: Initialize project and install dependencies

**Files:**
- Create: `package.json`
- Create: `server/package.json`
- Create: `tsconfig.json`
- Create: `server/tsconfig.json`

- [ ] **Step 1: Initialize root project**

```bash
cd /Users/younan.nwesre/Desktop/personal/viewer
npm init -y
```

- [ ] **Step 2: Create Vite React TypeScript project in current directory**

```bash
cd /Users/younan.nwesre/Desktop/personal/viewer
npm create vite@latest . -- --template react-ts
```

Select: overwrite existing files if prompted.

- [ ] **Step 3: Install frontend dependencies**

```bash
cd /Users/younan.nwesre/Desktop/personal/viewer
npm install
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 4: Initialize server directory**

```bash
cd /Users/younan.nwesre/Desktop/personal/viewer
mkdir -p server/services server/utils
cd server
npm init -y
npm install express cors
npm install -D @types/express @types/cors @types/node typescript tsx
```

- [ ] **Step 5: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": ".",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 6: Add dev scripts to root package.json**

Add to `scripts`:
```json
{
  "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
  "dev:client": "vite",
  "dev:server": "cd server && npx tsx watch index.ts"
}
```

```bash
npm install -D concurrently
```

- [ ] **Step 7: Add .gitignore**

```
node_modules/
dist/
server/node_modules/
server/dist/
.superpowers/
```

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold project with Vite React TS + Express server"
```

---

### Task 2: Shared types

**Files:**
- Create: `server/types.ts`
- Create: `src/types.ts`

- [ ] **Step 1: Create server/types.ts**

```typescript
export type SessionStatus = "working" | "waiting" | "idle" | "stopped";

export interface MessagePreview {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Activity {
  type: "user" | "assistant" | "tool_call" | "tool_result";
  summary: string;
  timestamp: string;
}

export interface Session {
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
  lastMessage: MessagePreview | null;
  recentActivity: Activity[];
}
```

- [ ] **Step 2: Create src/types.ts**

Mirror the same interfaces for the frontend (copy from server/types.ts). These are identical — kept separate to avoid cross-project imports.

- [ ] **Step 3: Commit**

```bash
git add server/types.ts src/types.ts
git commit -m "feat: add shared Session/Activity type definitions"
```

---

### Task 3: JSONL parser utility

**Files:**
- Create: `server/utils/jsonlParser.ts`

- [ ] **Step 1: Implement jsonlParser.ts**

This utility reads the tail of a JSONL file (last ~8KB) and parses each line as JSON. It should:

1. Open the file with `fs.promises.open`
2. Get file size with `stat`
3. Seek to `max(0, fileSize - 8192)` and read the remainder
4. Split by newlines, discard the first partial line (if we seeked mid-file)
5. Parse each line as JSON, skip lines that fail to parse
6. Return the parsed objects as an array

```typescript
import { open, stat } from "fs/promises";

const TAIL_BYTES = 8192;

export async function tailReadJsonl(filePath: string): Promise<Record<string, any>[]> {
  const fileHandle = await open(filePath, "r");
  try {
    const stats = await fileHandle.stat();
    const fileSize = stats.size;
    if (fileSize === 0) return [];

    const readStart = Math.max(0, fileSize - TAIL_BYTES);
    const readLength = fileSize - readStart;
    const buffer = Buffer.alloc(readLength);
    await fileHandle.read(buffer, 0, readLength, readStart);

    const text = buffer.toString("utf-8");
    const lines = text.split("\n");

    // If we seeked into the middle of the file, discard the first partial line
    if (readStart > 0) {
      lines.shift();
    }

    const results: Record<string, any>[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        results.push(JSON.parse(trimmed));
      } catch {
        // Skip malformed lines
      }
    }
    return results;
  } finally {
    await fileHandle.close();
  }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/younan.nwesre/Desktop/personal/viewer/server
npx tsc --noEmit utils/jsonlParser.ts
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add server/utils/jsonlParser.ts
git commit -m "feat: add JSONL tail-reader utility"
```

---

### Task 4: Session scanner service

**Files:**
- Create: `server/services/sessionScanner.ts`

- [ ] **Step 1: Implement sessionScanner.ts**

This is the core service. It does three things:
1. Scans `~/.claude/projects/` for JSONL session files
2. Runs `ps` to detect live `claude` processes
3. Parses JSONL tails and derives session status

```typescript
import { readdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { tailReadJsonl } from "../utils/jsonlParser.js";
import { Session, SessionStatus, Activity, MessagePreview } from "../types.js";

const execAsync = promisify(exec);
const CLAUDE_PROJECTS_DIR = join(homedir(), ".claude", "projects");
const IDLE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_TTL_MS = 2000;

let cachedSessions: Session[] = [];
let lastScanTime = 0;

export async function getAllSessions(): Promise<Session[]> {
  const now = Date.now();
  if (now - lastScanTime < CACHE_TTL_MS && cachedSessions.length > 0) {
    return cachedSessions;
  }

  const [projectDirs, aliveProcessCwds] = await Promise.all([
    listProjectDirs(),
    detectAliveProcesses(),
  ]);

  const sessions: Session[] = [];

  for (const projectDir of projectDirs) {
    const projectSessions = await scanProjectDir(projectDir, aliveProcessCwds);
    sessions.push(...projectSessions);
  }

  // Sort by lastActivityAt descending
  sessions.sort((a, b) =>
    new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
  );

  cachedSessions = sessions;
  lastScanTime = now;
  return sessions;
}

export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await getAllSessions();
  return sessions.find((s) => s.id === id) ?? null;
}

async function listProjectDirs(): Promise<string[]> {
  try {
    const entries = await readdir(CLAUDE_PROJECTS_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory())
      .map((e) => join(CLAUDE_PROJECTS_DIR, e.name));
  } catch {
    return [];
  }
}

async function detectAliveProcesses(): Promise<Set<string>> {
  try {
    const { stdout } = await execAsync("ps aux");
    const cwds = new Set<string>();
    const lines = stdout.split("\n");
    for (const line of lines) {
      // Match lines where the command is "claude" (CLI process)
      if (/\bclaude\b/.test(line) && !/grep/.test(line)) {
        // Extract the PID and use lsof to find cwd
        const parts = line.trim().split(/\s+/);
        const pid = parts[1];
        if (pid) {
          try {
            const { stdout: lsofOut } = await execAsync(
              `lsof -p ${pid} -Fn 2>/dev/null | grep "^n" | grep cwd`
            );
            const cwdMatch = lsofOut.match(/^n(.+)$/m);
            if (cwdMatch) {
              cwds.add(cwdMatch[1]);
            }
          } catch {
            // lsof failed for this pid, skip
          }
        }
      }
    }
    return cwds;
  } catch {
    return new Set();
  }
}

async function scanProjectDir(
  projectDir: string,
  aliveCwds: Set<string>
): Promise<Session[]> {
  const sessions: Session[] = [];
  try {
    const entries = await readdir(projectDir);
    const jsonlFiles = entries.filter((e) => e.endsWith(".jsonl"));

    for (const file of jsonlFiles) {
      const filePath = join(projectDir, file);
      const session = await parseSessionFile(filePath, aliveCwds);
      if (session) {
        sessions.push(session);
      }
    }
  } catch {
    // Skip unreadable directories
  }
  return sessions;
}

async function parseSessionFile(
  filePath: string,
  aliveCwds: Set<string>
): Promise<Session | null> {
  try {
    const entries = await tailReadJsonl(filePath);
    if (entries.length === 0) return null;

    // Extract metadata from entries
    let sessionId: string | null = null;
    let cwd: string | null = null;
    let gitBranch: string | null = null;
    let model: string | null = null;
    let version: string | null = null;
    let firstTimestamp: string | null = null;
    let lastTimestamp: string | null = null;
    let messageCount = 0;
    let toolCallCount = 0;
    let lastMessage: MessagePreview | null = null;
    const recentActivity: Activity[] = [];
    let lastEntryType: string | null = null;

    for (const entry of entries) {
      // Extract session metadata
      if (entry.sessionId && !sessionId) sessionId = entry.sessionId;
      if (entry.cwd) cwd = entry.cwd;
      if (entry.gitBranch) gitBranch = entry.gitBranch;

      const timestamp = entry.timestamp;
      if (timestamp) {
        if (!firstTimestamp) firstTimestamp = timestamp;
        lastTimestamp = timestamp;
      }

      // Count messages and tool calls
      if (entry.type === "user" || entry.type === "assistant") {
        messageCount++;
      }

      // Extract model from assistant messages
      if (entry.type === "assistant" && entry.message?.model) {
        model = entry.message.model;
      }
      if (entry.version) version = entry.version;

      // Build activity log
      if (entry.type === "user" && entry.message?.content) {
        const content =
          typeof entry.message.content === "string"
            ? entry.message.content
            : "[complex content]";
        lastMessage = {
          role: "user",
          content: content.slice(0, 200),
          timestamp: timestamp || "",
        };
        recentActivity.push({
          type: "user",
          summary: content.slice(0, 200),
          timestamp: timestamp || "",
        });
        lastEntryType = "user";
      } else if (entry.type === "assistant" && entry.message?.content) {
        const contentArr = entry.message.content;
        let text = "";
        if (Array.isArray(contentArr)) {
          const textBlock = contentArr.find(
            (c: any) => c.type === "text" && c.text
          );
          if (textBlock) text = textBlock.text;
          const toolUseBlock = contentArr.find(
            (c: any) => c.type === "tool_use"
          );
          if (toolUseBlock) {
            toolCallCount++;
            recentActivity.push({
              type: "tool_call",
              summary: `${toolUseBlock.name || "Tool"}: ${JSON.stringify(toolUseBlock.input || {}).slice(0, 100)}`,
              timestamp: timestamp || "",
            });
            lastEntryType = "tool_call";
          }
        } else if (typeof contentArr === "string") {
          text = contentArr;
        }
        if (text) {
          lastMessage = {
            role: "assistant",
            content: text.slice(0, 200),
            timestamp: timestamp || "",
          };
          recentActivity.push({
            type: "assistant",
            summary: text.slice(0, 200),
            timestamp: timestamp || "",
          });
          lastEntryType = "assistant";
        }
      } else if (entry.type === "tool_result") {
        recentActivity.push({
          type: "tool_result",
          summary: "Tool result received",
          timestamp: timestamp || "",
        });
        lastEntryType = "tool_result";
      }
    }

    if (!sessionId || !cwd) return null;

    // Derive project name from the project dir name
    // Dir names look like: -Users-younan-nwesre-Desktop-personal-hedg-cms
    const dirName = filePath.split("/").slice(-2, -1)[0] || "";
    const project = dirName.split("-").pop() || dirName;

    // Determine status
    const isAlive = aliveCwds.has(cwd);
    let status: SessionStatus;
    if (!isAlive) {
      status = "stopped";
    } else {
      const lastActivityTime = lastTimestamp
        ? new Date(lastTimestamp).getTime()
        : 0;
      const timeSinceActivity = Date.now() - lastActivityTime;
      if (timeSinceActivity > IDLE_THRESHOLD_MS) {
        status = "idle";
      } else if (
        lastEntryType === "tool_call" ||
        lastEntryType === "tool_result"
      ) {
        status = "working";
      } else {
        status = "waiting";
      }
    }

    return {
      id: sessionId,
      project,
      projectPath: cwd,
      gitBranch,
      status,
      model,
      version,
      startedAt: firstTimestamp || "",
      lastActivityAt: lastTimestamp || "",
      messageCount,
      toolCallCount,
      lastMessage,
      recentActivity: recentActivity.slice(-20),
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/younan.nwesre/Desktop/personal/viewer/server
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add server/services/sessionScanner.ts
git commit -m "feat: add session scanner with hybrid status detection"
```

---

### Task 5: Express server with API routes

**Files:**
- Create: `server/index.ts`

- [ ] **Step 1: Implement server/index.ts**

```typescript
import express from "express";
import cors from "cors";
import { getAllSessions, getSessionById } from "./services/sessionScanner.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /api/sessions — list all sessions (without recentActivity)
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await getAllSessions();
    const statusFilter = req.query.status
      ? (req.query.status as string).split(",")
      : null;

    let filtered = sessions;
    if (statusFilter) {
      filtered = sessions.filter((s) => statusFilter.includes(s.status));
    }

    // Strip recentActivity for list endpoint
    const summary = filtered.map(({ recentActivity, ...rest }) => rest);
    res.json(summary);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// GET /api/sessions/:id — full session detail
app.get("/api/sessions/:id", async (req, res) => {
  try {
    const session = await getSessionById(req.params.id);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// GET /api/health
app.get("/api/health", async (_req, res) => {
  try {
    const sessions = await getAllSessions();
    res.json({
      ok: true,
      sessionCount: sessions.length,
      lastScan: new Date().toISOString(),
    });
  } catch {
    res.json({ ok: false, sessionCount: 0, lastScan: new Date().toISOString() });
  }
});

app.listen(PORT, () => {
  console.log(`Claude Session Viewer API running on http://localhost:${PORT}`);
});
```

- [ ] **Step 2: Test the server starts and returns data**

```bash
cd /Users/younan.nwesre/Desktop/personal/viewer/server
npx tsx index.ts &
sleep 2
curl -s http://localhost:3001/api/health | head -c 200
curl -s http://localhost:3001/api/sessions | head -c 500
kill %1
```

Expected: health returns `{"ok":true,...}` and sessions returns a JSON array.

- [ ] **Step 3: Commit**

```bash
git add server/index.ts
git commit -m "feat: add Express server with sessions API endpoints"
```

---

## Chunk 2: Frontend — Setup & Layout

### Task 6: Configure Vite, Tailwind, and base styles

**Files:**
- Modify: `vite.config.ts`
- Create: `tailwind.config.js` (if not using Tailwind v4 CSS-only config)
- Modify: `src/index.css`
- Modify: `index.html`

- [ ] **Step 1: Configure Vite with Tailwind plugin and API proxy**

Update `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
```

- [ ] **Step 2: Set up Tailwind CSS in src/index.css**

Replace contents of `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg-main: #0a0a0a;
  --color-bg-sidebar: #0f0f0f;
  --color-bg-card: #111111;
  --color-border-subtle: #1a1a1a;
  --color-border-visible: #222222;
  --color-text-primary: #e2e8f0;
  --color-text-secondary: #888888;
  --color-text-muted: #444444;
  --color-accent: #7c3aed;
  --color-status-working: #22c55e;
  --color-status-waiting: #eab308;
  --color-status-idle: #3b82f6;
  --color-status-stopped: #ef4444;
}

body {
  background-color: var(--color-bg-main);
  color: var(--color-text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  min-height: 100vh;
}
```

- [ ] **Step 3: Update index.html title**

Change `<title>` to `Claude Session Viewer`.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts src/index.css index.html
git commit -m "feat: configure Vite with Tailwind and dark theme"
```

---

### Task 7: Utility — formatTime

**Files:**
- Create: `src/utils/formatTime.ts`

- [ ] **Step 1: Implement formatTime.ts**

```typescript
export function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return "—";
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

export function formatDuration(startTimestamp: string): string {
  if (!startTimestamp) return "—";
  const now = Date.now();
  const start = new Date(startTimestamp).getTime();
  const diffMs = now - start;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 60) return `${diffMin}m`;
  return `${diffHour}h ${diffMin % 60}m`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/formatTime.ts
git commit -m "feat: add relative time formatting utilities"
```

---

### Task 8: useSessions hook

**Files:**
- Create: `src/hooks/useSessions.ts`

- [ ] **Step 1: Implement useSessions.ts**

```typescript
import { useState, useEffect, useCallback, useRef } from "react";
import type { Session } from "../types";

const API_BASE = "/api";
const POLL_INTERVAL = 5000;

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSessionDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSession(data);
      }
    } catch (err) {
      console.error("Failed to fetch session detail:", err);
    }
  }, []);

  const selectSession = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (id) {
        fetchSessionDetail(id);
      } else {
        setSelectedSession(null);
      }
    },
    [fetchSessionDetail]
  );

  const refresh = useCallback(() => {
    fetchSessions();
    if (selectedId) {
      fetchSessionDetail(selectedId);
    }
  }, [fetchSessions, fetchSessionDetail, selectedId]);

  // Initial fetch + polling
  useEffect(() => {
    fetchSessions();

    intervalRef.current = setInterval(fetchSessions, POLL_INTERVAL);

    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        fetchSessions();
        intervalRef.current = setInterval(fetchSessions, POLL_INTERVAL);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchSessions]);

  // Re-fetch detail when selectedId changes or sessions update
  useEffect(() => {
    if (selectedId) {
      fetchSessionDetail(selectedId);
    }
  }, [selectedId, sessions, fetchSessionDetail]);

  // Filter sessions
  const filteredSessions =
    statusFilter.length === 0
      ? sessions
      : sessions.filter((s) => statusFilter.includes(s.status));

  // Status counts
  const statusCounts = {
    all: sessions.length,
    working: sessions.filter((s) => s.status === "working").length,
    waiting: sessions.filter((s) => s.status === "waiting").length,
    idle: sessions.filter((s) => s.status === "idle").length,
    stopped: sessions.filter((s) => s.status === "stopped").length,
  };

  return {
    sessions: filteredSessions,
    selectedSession,
    selectedId,
    statusFilter,
    lastUpdated,
    isLoading,
    statusCounts,
    selectSession,
    setStatusFilter,
    refresh,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSessions.ts
git commit -m "feat: add useSessions hook with polling and filtering"
```

---

## Chunk 3: Frontend — Components

### Task 9: Header component

**Files:**
- Create: `src/components/Header.tsx`

- [ ] **Step 1: Implement Header.tsx**

```tsx
import { formatRelativeTime } from "../utils/formatTime";

interface HeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
}

export function Header({ lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="h-12 bg-bg-card border-b border-border-subtle flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-accent text-lg font-bold">⬡</span>
        <span className="text-text-primary text-sm font-semibold">
          Claude Viewer
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-text-muted text-xs">
          Updated {formatRelativeTime(lastUpdated.toISOString())}
        </span>
        <button
          onClick={onRefresh}
          className="bg-bg-card border border-border-visible text-text-secondary text-xs px-3 py-1 rounded hover:bg-border-subtle transition-colors cursor-pointer"
        >
          ↻ Refresh
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: add Header component"
```

---

### Task 10: Sidebar components (StatusFilter, SessionItem, SessionList)

**Files:**
- Create: `src/components/Sidebar/StatusFilter.tsx`
- Create: `src/components/Sidebar/SessionItem.tsx`
- Create: `src/components/Sidebar/SessionList.tsx`

- [ ] **Step 1: Implement StatusFilter.tsx**

```tsx
interface StatusCounts {
  all: number;
  working: number;
  waiting: number;
  idle: number;
  stopped: number;
}

interface StatusFilterProps {
  statusFilter: string[];
  statusCounts: StatusCounts;
  onFilterChange: (statuses: string[]) => void;
}

const filters = [
  { key: "all", label: "All", color: "bg-border-visible text-white" },
  {
    key: "working",
    label: "Working",
    color: "bg-status-working/20 text-status-working",
  },
  {
    key: "waiting",
    label: "Waiting",
    color: "bg-status-waiting/20 text-status-waiting",
  },
  { key: "idle", label: "Idle", color: "bg-status-idle/20 text-status-idle" },
  {
    key: "stopped",
    label: "Stopped",
    color: "bg-status-stopped/20 text-status-stopped",
  },
];

export function StatusFilter({
  statusFilter,
  statusCounts,
  onFilterChange,
}: StatusFilterProps) {
  const isActive = (key: string) =>
    key === "all" ? statusFilter.length === 0 : statusFilter.includes(key);

  const handleClick = (key: string) => {
    if (key === "all") {
      onFilterChange([]);
    } else if (statusFilter.includes(key)) {
      onFilterChange(statusFilter.filter((s) => s !== key));
    } else {
      onFilterChange([...statusFilter, key]);
    }
  };

  return (
    <div className="px-3 py-2 border-b border-border-subtle">
      <div className="flex gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => handleClick(f.key)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-opacity cursor-pointer ${
              f.color
            } ${isActive(f.key) ? "opacity-100" : "opacity-40"}`}
          >
            {f.label} {statusCounts[f.key as keyof StatusCounts]}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement SessionItem.tsx**

```tsx
import type { Session } from "../../types";
import { formatRelativeTime } from "../../utils/formatTime";

const statusColors: Record<string, string> = {
  working: "bg-status-working",
  waiting: "bg-status-waiting",
  idle: "bg-status-idle",
  stopped: "bg-status-stopped",
};

const statusLabels: Record<string, string> = {
  working: "Working",
  waiting: "Waiting",
  idle: "Idle",
  stopped: "Stopped",
};

interface SessionItemProps {
  session: Session;
  isSelected: boolean;
  onClick: () => void;
}

export function SessionItem({ session, isSelected, onClick }: SessionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-md p-2.5 transition-colors cursor-pointer ${
        isSelected
          ? "bg-accent/10 border-l-[3px] border-accent"
          : "bg-transparent hover:bg-bg-card"
      }`}
    >
      <div className="flex justify-between items-center">
        <span
          className={`text-[11px] font-medium ${isSelected ? "text-text-primary" : "text-text-secondary"}`}
        >
          {session.project}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${statusColors[session.status]}`}
        />
      </div>
      <div className="text-text-muted text-[9px] mt-0.5">
        {statusLabels[session.status]} •{" "}
        {formatRelativeTime(session.lastActivityAt)}
      </div>
    </button>
  );
}
```

- [ ] **Step 3: Implement SessionList.tsx**

```tsx
import type { Session } from "../../types";
import { SessionItem } from "./SessionItem";

interface SessionListProps {
  sessions: Session[];
  selectedId: string | null;
  onSelectSession: (id: string) => void;
}

export function SessionList({
  sessions,
  selectedId,
  onSelectSession,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-text-muted text-xs">
        No sessions found
      </div>
    );
  }

  return (
    <div className="px-2 py-1 flex flex-col gap-0.5 overflow-y-auto">
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          isSelected={session.id === selectedId}
          onClick={() => onSelectSession(session.id)}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar/
git commit -m "feat: add Sidebar components (StatusFilter, SessionItem, SessionList)"
```

---

### Task 11: DetailPanel components

**Files:**
- Create: `src/components/DetailPanel/SessionHeader.tsx`
- Create: `src/components/DetailPanel/SessionStats.tsx`
- Create: `src/components/DetailPanel/ActivityItem.tsx`
- Create: `src/components/DetailPanel/ActivityLog.tsx`
- Create: `src/components/DetailPanel/DetailPanel.tsx`

- [ ] **Step 1: Implement SessionHeader.tsx**

```tsx
import type { Session } from "../../types";

const statusConfig: Record<string, { label: string; color: string }> = {
  working: { label: "Working", color: "bg-status-working/20 text-status-working" },
  waiting: { label: "Waiting", color: "bg-status-waiting/20 text-status-waiting" },
  idle: { label: "Idle", color: "bg-status-idle/20 text-status-idle" },
  stopped: { label: "Stopped", color: "bg-status-stopped/20 text-status-stopped" },
};

interface SessionHeaderProps {
  session: Session;
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const status = statusConfig[session.status];
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          {session.project}
        </h2>
        <p className="text-text-muted text-[10px] mt-1">
          {session.projectPath}
          {session.gitBranch && ` • ${session.gitBranch}`}
          {session.model && ` • ${session.model}`}
          {session.version && ` • v${session.version}`}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs ${status.color}`}>
        {status.label}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Implement SessionStats.tsx**

```tsx
import type { Session } from "../../types";
import { formatDuration, formatRelativeTime } from "../../utils/formatTime";

interface SessionStatsProps {
  session: Session;
}

export function SessionStats({ session }: SessionStatsProps) {
  const stats = [
    { label: "Duration", value: formatDuration(session.startedAt) },
    { label: "Messages", value: String(session.messageCount) },
    { label: "Tool Calls", value: String(session.toolCallCount) },
    { label: "Last Active", value: formatRelativeTime(session.lastActivityAt) },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-bg-card rounded-md p-3 text-center"
        >
          <div className="text-text-muted text-[8px] uppercase tracking-wider">
            {stat.label}
          </div>
          <div className="text-text-primary text-sm font-semibold mt-1">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Implement ActivityItem.tsx**

```tsx
import type { Activity } from "../../types";
import { formatRelativeTime } from "../../utils/formatTime";

const typeConfig: Record<string, { icon: string; color: string }> = {
  user: { icon: "👤", color: "bg-green-900/30 text-green-300" },
  assistant: { icon: "🤖", color: "bg-bg-card text-text-primary" },
  tool_call: { icon: "🔧", color: "bg-accent/10 text-purple-300" },
  tool_result: { icon: "📋", color: "bg-bg-card text-text-secondary" },
};

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const config = typeConfig[activity.type] || typeConfig.assistant;
  return (
    <div className="flex gap-2 items-start">
      <span className="text-accent text-[9px] min-w-[36px] pt-0.5 shrink-0">
        {formatRelativeTime(activity.timestamp)}
      </span>
      <span
        className={`px-2 py-0.5 rounded text-[10px] ${config.color} leading-relaxed`}
      >
        {config.icon} {activity.summary}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Implement ActivityLog.tsx**

```tsx
import type { Activity } from "../../types";
import { ActivityItem } from "./ActivityItem";

interface ActivityLogProps {
  activities: Activity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="bg-bg-card rounded-lg p-3">
      <h3 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-3">
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <p className="text-text-muted text-xs">No recent activity</p>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
          {[...activities].reverse().map((activity, i) => (
            <ActivityItem key={i} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Implement DetailPanel.tsx**

```tsx
import type { Session } from "../../types";
import { SessionHeader } from "./SessionHeader";
import { SessionStats } from "./SessionStats";
import { ActivityLog } from "./ActivityLog";

interface DetailPanelProps {
  session: Session | null;
}

export function DetailPanel({ session }: DetailPanelProps) {
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-main">
        <div className="text-center">
          <div className="text-text-muted text-3xl mb-2">⬡</div>
          <p className="text-text-muted text-sm">
            Select a session to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-main p-4">
      <SessionHeader session={session} />
      <SessionStats session={session} />
      <ActivityLog activities={session.recentActivity || []} />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/DetailPanel/
git commit -m "feat: add DetailPanel components (header, stats, activity log)"
```

---

### Task 12: App.tsx — wire everything together

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Delete: `src/App.css` (not needed — using Tailwind)

- [ ] **Step 1: Implement App.tsx**

```tsx
import { useSessions } from "./hooks/useSessions";
import { Header } from "./components/Header";
import { StatusFilter } from "./components/Sidebar/StatusFilter";
import { SessionList } from "./components/Sidebar/SessionList";
import { DetailPanel } from "./components/DetailPanel/DetailPanel";

function App() {
  const {
    sessions,
    selectedSession,
    selectedId,
    statusFilter,
    lastUpdated,
    isLoading,
    statusCounts,
    selectSession,
    setStatusFilter,
    refresh,
  } = useSessions();

  return (
    <div className="h-screen flex flex-col bg-bg-main">
      <Header lastUpdated={lastUpdated} onRefresh={refresh} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[280px] bg-bg-sidebar border-r border-border-subtle flex flex-col shrink-0">
          <StatusFilter
            statusFilter={statusFilter}
            statusCounts={statusCounts}
            onFilterChange={setStatusFilter}
          />
          {isLoading ? (
            <div className="px-3 py-8 text-center text-text-muted text-xs">
              Loading sessions...
            </div>
          ) : (
            <SessionList
              sessions={sessions}
              selectedId={selectedId}
              onSelectSession={selectSession}
            />
          )}
        </aside>
        {/* Detail */}
        <DetailPanel session={selectedSession} />
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Clean up main.tsx**

Update `src/main.tsx` to remove any default Vite boilerplate CSS imports. It should just be:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 3: Delete unused files**

```bash
rm -f src/App.css src/assets/react.svg public/vite.svg
```

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/main.tsx
git add -u  # stages deletions
git commit -m "feat: wire up App with all components and useSessions hook"
```

---

## Chunk 4: Integration & Smoke Test

### Task 13: End-to-end smoke test

- [ ] **Step 1: Start both servers**

```bash
cd /Users/younan.nwesre/Desktop/personal/viewer
npm run dev
```

Expected: Vite dev server on port 5173, Express on port 3001.

- [ ] **Step 2: Open in browser**

Navigate to `http://localhost:5173`. Verify:
- Header shows with "Claude Viewer" and refresh button
- Sidebar shows session list with status dots
- Status filter pills show counts
- Clicking a session shows detail panel with stats and activity log
- Refresh button triggers immediate update
- "Updated Xs ago" text updates

- [ ] **Step 3: Fix any issues found during smoke test**

Address any TypeScript errors, missing imports, styling issues, or API response format mismatches.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Claude Session Viewer v1"
```
