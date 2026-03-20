```
  ______   __                       __            ______    ______   ______   __
 /      \ /  |                     /  |          /      \  /      \ /      \ /  |
/$$$$$$  |$$ |  ______   __    __ $$/ ______   /$$$$$$  |/$$$$$$  |$$$$$$  |$$/   _______   ______
$$ |  $$/ $$ | /      \ /  |  /  |/  /      \  $$ |  $$ |$$ |_ $$/ $$ |_ $$|/  /       | /      \
$$ |      $$ | $$$$$$  |$$ |  $$ |$$ $$$$$$  | $$ |  $$ |$$   |    $$   | $$ |/$$$$$$$/ /$$$$$$  |
$$ |   __ $$ | /    $$ |$$ |  $$ |$$ /    $$ | $$ |  $$ |$$$$/     $$$$/  $$ |$$ |      $$    $$ |
$$ \__/  |$$ |/$$$$$$$ |$$ \__$$ |$$ /$$$$$$$ |$$ \__$$ |$$ |      $$ |  $$ |$$ \_____ $$$$$$$$/
$$    $$/ $$ |$$    $$ |$$    $$/ $$ $$    $$ |$$    $$/ $$ |      $$ |  $$ |$$       |$$       |
 $$$$$$/  $$/  $$$$$$$/  $$$$$$/  $$  $$$$$$$/  $$$$$$/  $$/       $$/   $$/  $$$$$$$/  $$$$$$$/
```

<div align="center">

### A pixel-art office simulation for monitoring your Claude Code sessions

**Every Claude session becomes a living, breathing office room with an animated worker inside.**

[![License: MIT](https://img.shields.io/badge/License-MIT-7c3aed.svg)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude_Code-Plugin-fcd34d.svg)](https://code.claude.com)
[![Made with React](https://img.shields.io/badge/React-18-60a5fa.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)](https://typescriptlang.org)

---

</div>

## What is this?

Claude Office turns your active Claude Code sessions into a **pixel-art office floor**. Each session is a room with a worker who types, waits, sleeps, and reacts based on what the session is actually doing.

It's a Claude Code plugin. Install it, and every time you start a session, the dashboard auto-starts in the background. Type `/claude-office:office` to open it.

## Features

### The Office

Each session gets its own office room with:

- **Pixel-art worker** with unique appearance (skin, hair, shirt, pants) generated from the session ID
- **Desk with monitor** showing code lines when working, blank when idle
- **Office chair, plant, bookshelf, wall art, window**
- **Coffee mug with steam** when the worker is actively coding
- **Office pet** (cat, dog, hamster, or fish) that sleeps when the worker sleeps

### Worker Behavior

Workers are animated based on the real session status:

| Status | Worker Animation | Visual Cues |
|--------|-----------------|-------------|
| **Working** | Typing at desk, bobbing | Monitor shows code, coffee steam, desk lamp glow |
| **Waiting** | Fidgeting, looking around | Monitor on standby |
| **Approval** | Flashing pink **APPROVE ME!** overlay | Urgent — needs you in the terminal |
| **Idle** | Sleeping, Z's floating | Dark window with stars, monitor off, pet sleeps too |

### Mood System

Workers show emotions based on their workload:

| Mood | Trigger | Face |
|------|---------|------|
| Happy `:)` | Low activity, just started | Sparkle eyes, big smile, floating heart |
| Focused `o_o` | Moderate activity, working | Determined expression |
| Tired `-_-` | 20+ tool calls | Half-closed eyes, yawn |
| Stressed `>.<` | 50+ tool calls | X eyes, sweat drop, red cheeks |
| Chill `~_~` | Session idle | Peacefully sleeping |

### Funny Agent Names

Each worker gets a procedurally generated name:

> Debug Dave, Fix-it Felix, Bug Hunter Bob, Merge Martha, Cache Clara, Loop Lucy, Stack Sam, Binary Ben, Token Tina, Patch Pat, Async Andy, Query Quinn...

### Thought Bubbles

A comic-style speech bubble shows the last thing you asked the agent:

> "Fix the header spacing..."

### Day/Night Cycle

The window in each office changes based on your **real clock**:

- **Morning** (6-12): Blue sky, sun
- **Afternoon** (12-17): Clouds
- **Sunset** (17-20): Orange/red gradient
- **Night** (20-6): Stars, moon

### Growing Plants

The office plant grows taller the longer the session runs. After ~2 hours, it blooms a flower.

### Confetti

When a worker finishes a task (working -> waiting), 20 colorful pixel confetti pieces rain down.

---

## Power Features

### Token & Cost Tracking

Each session card shows:
- **Total tokens** used (in thousands)
- **Estimated USD cost** based on Claude API pricing
- Cost chip turns **gold** when spending gets high

### Git Status

See at a glance:
- **Branch name** in purple
- **Uncommitted changes** count with yellow badge
- **Ahead/behind** upstream count

### Error Detection

- Sessions with errors get a **flashing red badge** on the room
- Error count shown in the stats bar
- Activity log highlights errors in red

### Approval Detection

When Claude is waiting for you to approve a command:
- **Flashing pink border** around the room
- Big **"APPROVE ME!"** badge in the center
- **Desktop notification**: "APPROVE: Debug Dave needs permission!"
- Header shows flashing count of sessions needing approval

### Desktop Notifications

Get notified when you're in another tab:
- Agent needs your input (working -> waiting)
- Agent needs command approval
- Agent hits an error
- Agent falls asleep (idle 5+ min)

Toggle with the **ALERTS ON/OFF** button in the header.

### Sticky Notes

Add notes to any session via the NOTES tab:
- "Waiting for PR review"
- "Blocked on API key"
- "Deploy after lunch"

Notes persist to disk (`~/.claude/viewer-notes/`).

### Conversation Preview

The CHAT tab shows the last 10 messages as chat bubbles — your messages on the right, agent responses on the left.

---

## Installation

### As a Claude Code Plugin

```bash
# Clone the repo
git clone https://github.com/younan-nwesre/claude-office.git

# Install dependencies
cd claude-office
npm install
cd server && npm install && cd ..

# Load as a plugin
claude --plugin-dir /path/to/claude-office
```

After installation:
- The dashboard **auto-starts** on every new Claude session (via SessionStart hook)
- Type `/claude-office:office` to open it in your browser
- Type `/claude-office:office-stop` to shut it down

### Standalone (without plugin)

```bash
git clone https://github.com/younan-nwesre/claude-office.git
cd claude-office

# Install
npm install
cd server && npm install && cd ..

# Run
npx concurrently "cd server && npx tsx index.ts" "npx vite --host"

# Open http://localhost:5173
```

---

## Architecture

```
Browser (React + Vite + Tailwind)
    |
    |  Polls GET /api/sessions every 5s
    |
Express Backend (port 3001)
    |
    |-- Reads ~/.claude/projects/**/*.jsonl (session data)
    |-- Runs `ps aux` to detect active claude processes
    |-- Runs `lsof` to match PIDs to CWDs
    |-- Runs `git status` per session CWD
    |-- Reads/writes ~/.claude/viewer-notes/ (sticky notes)
    |
    └-- Returns unified Session objects with status, tokens, git, errors
```

**Read-only by design.** The backend never writes to Claude's session files. It only reads JSONL tails (last 8KB) for performance.

### Status Detection (Hybrid)

1. **Process detection**: `ps aux` finds running `claude` processes, `lsof` resolves their CWDs
2. **JSONL parsing**: tail-reads session files to determine what the agent is doing
3. **Status logic**:
   - Activity < 30s ago = **working**
   - Pending tool_use with no tool_result for 3s+ = **approval**
   - Last entry is assistant text = **waiting**
   - No activity for 5+ min = **idle**

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite 8, Tailwind CSS 4 |
| Backend | Express, Node.js, TypeScript |
| Fonts | Press Start 2P (pixel), VT323 (retro terminal) |
| Style | Pixel art, retro NES palette, CRT scanlines |
| Runtime | tsx (TypeScript execution) |

---

## Plugin Structure

```
claude-office/
├── .claude-plugin/
│   └── plugin.json            # Plugin manifest
├── skills/
│   ├── office/SKILL.md        # /claude-office:office
│   └── office-stop/SKILL.md   # /claude-office:office-stop
├── hooks/
│   └── hooks.json             # SessionStart auto-start
├── scripts/
│   ├── start-server.sh        # Idempotent startup
│   └── stop-server.sh         # Clean shutdown
├── server/
│   ├── index.ts               # Express API
│   ├── types.ts               # TypeScript interfaces
│   ├── services/
│   │   └── sessionScanner.ts  # Core scanning engine
│   └── utils/
│       └── jsonlParser.ts     # JSONL tail reader
├── src/
│   ├── App.tsx                # Main layout
│   ├── hooks/
│   │   └── useSessions.ts     # Polling + notifications
│   ├── components/
│   │   └── Office/
│   │       ├── OfficeRoom.tsx  # Room scene
│   │       ├── Worker.tsx      # Pixel art character
│   │       ├── Pet.tsx         # Pixel art pets
│   │       └── OfficeDetail.tsx # Detail modal
│   └── utils/
│       ├── agentIdentity.ts   # Names, moods, items
│       └── formatTime.ts      # Time formatting
├── marketplace.json           # For distribution
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | All active sessions (without activity log) |
| GET | `/api/sessions/:id` | Full session detail with activity + conversation |
| POST | `/api/sessions/:id/notes` | Add a sticky note |
| DELETE | `/api/sessions/:id/notes/:index` | Remove a sticky note |
| GET | `/api/health` | Server health + session count |

---

## Configuration

The dashboard only shows sessions with **active `claude` CLI processes** (terminal + IDE). Claude Desktop app sessions are not supported.

| Setting | Default | Location |
|---------|---------|----------|
| Poll interval | 5 seconds | `src/hooks/useSessions.ts` |
| Backend port | 3001 | `server/index.ts` |
| Frontend port | 5173 | Vite default |
| Cache TTL | 2 seconds | `server/services/sessionScanner.ts` |
| Idle threshold | 5 minutes | `server/services/sessionScanner.ts` |
| Notes storage | `~/.claude/viewer-notes/` | `server/services/sessionScanner.ts` |

---

## Contributing

PRs welcome. The codebase is straightforward:

1. **Backend changes**: Edit `server/services/sessionScanner.ts` for data extraction, `server/index.ts` for new endpoints
2. **Frontend changes**: Components live in `src/components/Office/`, identity generation in `src/utils/agentIdentity.ts`
3. **New desk items**: Add to `DESK_ITEMS` array in `agentIdentity.ts` and `DeskItem` component in `OfficeRoom.tsx`
4. **New pet types**: Add to `PET_TYPES` in `agentIdentity.ts` and render in `Pet.tsx`

---

## License

MIT

---

<div align="center">

**Built with Claude Code.**

*Because even AI agents deserve a nice office.*

</div>
