import { readdir, readFile, writeFile, mkdir } from "fs/promises";
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
  TokenUsage,
  GitInfo,
  SessionNote,
} from "../types.js";

const execAsync = promisify(exec);
const CLAUDE_PROJECTS_DIR = join(homedir(), ".claude", "projects");
const NOTES_DIR = join(homedir(), ".claude", "viewer-notes");
const IDLE_THRESHOLD_MS = 5 * 60 * 1000;
const CACHE_TTL_MS = 2000;

// Cost per million tokens (approximate for Claude models)
const COST_PER_M_INPUT = 3.0;
const COST_PER_M_OUTPUT = 15.0;
const COST_PER_M_CACHE_WRITE = 3.75;
const COST_PER_M_CACHE_READ = 0.30;

let cachedSessions: Session[] = [];
let lastScanTime = 0;

function cwdToProjectDirName(cwd: string): string {
  return cwd.replace(/[/.]/g, "-");
}

export async function getAllSessions(): Promise<Session[]> {
  const now = Date.now();
  if (now - lastScanTime < CACHE_TTL_MS && cachedSessions.length > 0) {
    return cachedSessions;
  }

  const aliveCwds = await detectAliveProcesses();

  if (aliveCwds.size === 0) {
    cachedSessions = [];
    lastScanTime = now;
    return [];
  }

  const sessions: Session[] = [];

  const scanPromises = [...aliveCwds].map(async (aliveCwd) => {
    const dirName = cwdToProjectDirName(aliveCwd);
    const projectDir = join(CLAUDE_PROJECTS_DIR, dirName);
    const projectSessions = await scanProjectDir(projectDir);

    if (projectSessions.length > 0) {
      projectSessions.sort(
        (a, b) =>
          new Date(b.lastActivityAt).getTime() -
          new Date(a.lastActivityAt).getTime()
      );
      const latest = projectSessions[0];
      latest.projectPath = aliveCwd;
      latest.status = deriveActiveStatus(latest);

      // Fetch git info for the CWD
      latest.gitInfo = await getGitInfo(aliveCwd);

      // Load notes
      latest.notes = await loadNotes(latest.id);

      return latest;
    }
    return null;
  });

  const results = await Promise.all(scanPromises);
  for (const s of results) {
    if (s) sessions.push(s);
  }

  sessions.sort(
    (a, b) =>
      new Date(b.lastActivityAt).getTime() -
      new Date(a.lastActivityAt).getTime()
  );

  cachedSessions = sessions;
  lastScanTime = now;
  return sessions;
}

function deriveActiveStatus(session: Session): SessionStatus {
  const lastActivityTime = session.lastActivityAt
    ? new Date(session.lastActivityAt).getTime()
    : 0;
  const timeSinceActivity = Date.now() - lastActivityTime;

  if (timeSinceActivity > IDLE_THRESHOLD_MS) return "idle";
  if (timeSinceActivity < 30_000) return "working";

  const lastActivity = session.recentActivity[session.recentActivity.length - 1];
  if (
    lastActivity &&
    (lastActivity.type === "tool_call" || lastActivity.type === "tool_result")
  ) {
    return "working";
  }
  return "waiting";
}

export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await getAllSessions();
  return sessions.find((s) => s.id === id) ?? null;
}

// ===== GIT INFO =====
async function getGitInfo(cwd: string): Promise<GitInfo> {
  const info: GitInfo = { branch: null, uncommittedChanges: 0, aheadBehind: null };
  try {
    const { stdout: branch } = await execAsync(
      "git rev-parse --abbrev-ref HEAD 2>/dev/null",
      { cwd }
    );
    info.branch = branch.trim();

    const { stdout: status } = await execAsync(
      "git status --porcelain 2>/dev/null",
      { cwd }
    );
    info.uncommittedChanges = status.trim().split("\n").filter(Boolean).length;

    try {
      const { stdout: ab } = await execAsync(
        "git rev-list --left-right --count HEAD...@{upstream} 2>/dev/null",
        { cwd }
      );
      const [ahead, behind] = ab.trim().split(/\s+/);
      if (ahead !== "0" || behind !== "0") {
        info.aheadBehind = `${ahead} ahead, ${behind} behind`;
      }
    } catch {
      // No upstream
    }
  } catch {
    // Not a git repo
  }
  return info;
}

// ===== NOTES =====
async function loadNotes(sessionId: string): Promise<SessionNote[]> {
  try {
    const data = await readFile(join(NOTES_DIR, `${sessionId}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveNote(sessionId: string, text: string): Promise<SessionNote[]> {
  await mkdir(NOTES_DIR, { recursive: true });
  const notes = await loadNotes(sessionId);
  notes.push({ text, createdAt: new Date().toISOString() });
  await writeFile(join(NOTES_DIR, `${sessionId}.json`), JSON.stringify(notes, null, 2));
  // Invalidate cache
  lastScanTime = 0;
  return notes;
}

export async function deleteNote(sessionId: string, index: number): Promise<SessionNote[]> {
  const notes = await loadNotes(sessionId);
  notes.splice(index, 1);
  await mkdir(NOTES_DIR, { recursive: true });
  await writeFile(join(NOTES_DIR, `${sessionId}.json`), JSON.stringify(notes, null, 2));
  lastScanTime = 0;
  return notes;
}

// ===== PROCESS DETECTION =====
async function detectAliveProcesses(): Promise<Set<string>> {
  try {
    const { stdout } = await execAsync("ps aux");
    const cwds = new Set<string>();
    const claudePids: string[] = [];

    for (const line of stdout.split("\n")) {
      const trimmed = line.trim();
      if (
        /\bclaude\s*$/.test(trimmed) &&
        !/grep/.test(trimmed) &&
        !/Claude\.app/.test(trimmed) &&
        !/Claude Helper/.test(trimmed) &&
        !/ShipIt/.test(trimmed) &&
        !/chrome-native/.test(trimmed) &&
        !/\/bin\/(ba)?sh/.test(trimmed)
      ) {
        const parts = trimmed.split(/\s+/);
        const pid = parts[1];
        if (pid && /^\d+$/.test(pid)) claudePids.push(pid);
      }
    }

    for (const pid of claudePids) {
      try {
        const { stdout: lsofOut } = await execAsync(`lsof -p ${pid} -Fn 2>/dev/null`);
        const lsofLines = lsofOut.split("\n");
        for (let i = 0; i < lsofLines.length; i++) {
          if (lsofLines[i] === "fcwd" && i + 1 < lsofLines.length) {
            const pathLine = lsofLines[i + 1];
            if (pathLine.startsWith("n")) cwds.add(pathLine.slice(1));
          }
        }
      } catch {}
    }
    return cwds;
  } catch {
    return new Set();
  }
}

// ===== SCANNING =====
async function scanProjectDir(projectDir: string): Promise<Session[]> {
  const sessions: Session[] = [];
  try {
    const entries = await readdir(projectDir);
    const jsonlFiles = entries.filter((e) => e.endsWith(".jsonl"));
    for (const file of jsonlFiles) {
      const session = await parseSessionFile(join(projectDir, file), projectDir);
      if (session) sessions.push(session);
    }
  } catch {}
  return sessions;
}

async function parseSessionFile(
  filePath: string,
  projectDir: string
): Promise<Session | null> {
  try {
    const entries = await tailReadJsonl(filePath);
    if (entries.length === 0) return null;

    let sessionId: string | null = null;
    let cwd: string | null = null;
    let gitBranch: string | null = null;
    let model: string | null = null;
    let version: string | null = null;
    let firstTimestamp: string | null = null;
    let lastTimestamp: string | null = null;
    let messageCount = 0;
    let toolCallCount = 0;
    let errorCount = 0;
    let lastMessage: MessagePreview | null = null;
    const recentActivity: Activity[] = [];
    const conversationPreview: MessagePreview[] = [];

    // Token tracking
    let inputTokens = 0;
    let outputTokens = 0;
    let cacheCreationTokens = 0;
    let cacheReadTokens = 0;

    for (const entry of entries) {
      if (entry.sessionId && !sessionId) sessionId = entry.sessionId;
      if (entry.cwd) cwd = entry.cwd;
      if (entry.gitBranch) gitBranch = entry.gitBranch;

      const timestamp = entry.timestamp;
      if (timestamp) {
        if (!firstTimestamp) firstTimestamp = timestamp;
        lastTimestamp = timestamp;
      }

      if (entry.type === "user" || entry.type === "assistant") {
        messageCount++;
      }

      // Token usage from assistant messages
      if (entry.type === "assistant" && entry.message?.usage) {
        const u = entry.message.usage;
        inputTokens += u.input_tokens || 0;
        outputTokens += u.output_tokens || 0;
        cacheCreationTokens += u.cache_creation_input_tokens || 0;
        cacheReadTokens += u.cache_read_input_tokens || 0;
      }

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
          content: content.slice(0, 300),
          timestamp: timestamp || "",
        };
        recentActivity.push({
          type: "user",
          summary: content.slice(0, 200),
          timestamp: timestamp || "",
        });
        conversationPreview.push({
          role: "user",
          content: content.slice(0, 500),
          timestamp: timestamp || "",
        });
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
            const toolSummary = `${toolUseBlock.name || "Tool"}: ${JSON.stringify(toolUseBlock.input || {}).slice(0, 100)}`;
            recentActivity.push({
              type: "tool_call",
              summary: toolSummary,
              timestamp: timestamp || "",
            });
          }
        } else if (typeof contentArr === "string") {
          text = contentArr;
        }
        if (text) {
          lastMessage = {
            role: "assistant",
            content: text.slice(0, 300),
            timestamp: timestamp || "",
          };
          recentActivity.push({
            type: "assistant",
            summary: text.slice(0, 200),
            timestamp: timestamp || "",
          });
          conversationPreview.push({
            role: "assistant",
            content: text.slice(0, 500),
            timestamp: timestamp || "",
          });
        }
      } else if (entry.type === "tool_result") {
        // Check for errors in tool results
        const isError = entry.is_error === true ||
          (typeof entry.content === "string" && /error|Error|ERROR|FAIL/.test(entry.content));
        if (isError) errorCount++;

        recentActivity.push({
          type: "tool_result",
          summary: isError
            ? `Error: ${(typeof entry.content === "string" ? entry.content : "Tool error").slice(0, 100)}`
            : "Tool result received",
          timestamp: timestamp || "",
          isError,
        });
      }
    }

    if (!sessionId) {
      const fileName = filePath.split("/").pop() || "";
      sessionId = fileName.replace(".jsonl", "");
    }
    if (!cwd) return null;

    const dirName = projectDir.split("/").pop() || "";
    const segments = dirName.split("-").filter(Boolean);
    const project = segments.length > 0 ? segments[segments.length - 1] : dirName;

    // Compute token costs
    const totalTokens = inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens;
    const estimatedCostUsd =
      (inputTokens / 1_000_000) * COST_PER_M_INPUT +
      (outputTokens / 1_000_000) * COST_PER_M_OUTPUT +
      (cacheCreationTokens / 1_000_000) * COST_PER_M_CACHE_WRITE +
      (cacheReadTokens / 1_000_000) * COST_PER_M_CACHE_READ;

    return {
      id: sessionId,
      project,
      projectPath: cwd,
      gitBranch,
      status: "waiting" as SessionStatus,
      model,
      version,
      startedAt: firstTimestamp || "",
      lastActivityAt: lastTimestamp || "",
      messageCount,
      toolCallCount,
      errorCount,
      lastMessage,
      recentActivity: recentActivity.slice(-30),
      conversationPreview: conversationPreview.slice(-10),
      tokenUsage: {
        inputTokens,
        outputTokens,
        cacheCreationTokens,
        cacheReadTokens,
        totalTokens,
        estimatedCostUsd: Math.round(estimatedCostUsd * 10000) / 10000,
      },
      gitInfo: { branch: gitBranch, uncommittedChanges: 0, aheadBehind: null },
      notes: [],
    };
  } catch {
    return null;
  }
}
