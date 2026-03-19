import { readdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { tailReadJsonl } from "../utils/jsonlParser.js";
import {
  Session,
  SessionStatus,
  Activity,
  MessagePreview,
} from "../types.js";

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
  sessions.sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
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
    const entries = await readdir(CLAUDE_PROJECTS_DIR, {
      withFileTypes: true,
    });
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
    const claudePids: string[] = [];

    for (const line of lines) {
      // Match lines where the command is "claude" (CLI process)
      // Avoid matching grep itself or Claude.app (desktop)
      if (
        /\bclaude\s*$/.test(line.trim()) ||
        (/\bclaude\b/.test(line) &&
          !/grep/.test(line) &&
          !/Claude\.app/.test(line) &&
          !/Claude Helper/.test(line) &&
          !/ShipIt/.test(line))
      ) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[1];
        if (pid && /^\d+$/.test(pid)) {
          claudePids.push(pid);
        }
      }
    }

    // Use lsof to find CWDs for all claude PIDs
    for (const pid of claudePids) {
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
      const session = await parseSessionFile(
        filePath,
        projectDir,
        aliveCwds
      );
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
  projectDir: string,
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
          const toolUseBlocks = contentArr.filter(
            (c: any) => c.type === "tool_use"
          );
          for (const toolUseBlock of toolUseBlocks) {
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

    if (!sessionId) {
      // Try to use filename as session ID
      const fileName = filePath.split("/").pop() || "";
      sessionId = fileName.replace(".jsonl", "");
    }
    if (!cwd) return null;

    // Derive project name from the project dir name
    // Dir names look like: -Users-younan-nwesre-Desktop-personal-hedg-cms
    const dirName = projectDir.split("/").pop() || "";
    // Take the last meaningful segment(s) from the path-encoded dir name
    const segments = dirName.split("-").filter(Boolean);
    const project =
      segments.length > 0 ? segments[segments.length - 1] : dirName;

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
