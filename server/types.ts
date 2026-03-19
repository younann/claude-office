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
