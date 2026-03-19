export type SessionStatus = "working" | "waiting" | "approval" | "idle" | "stopped";

export interface MessagePreview {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Activity {
  type: "user" | "assistant" | "tool_call" | "tool_result";
  summary: string;
  timestamp: string;
  isError?: boolean;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface GitInfo {
  branch: string | null;
  uncommittedChanges: number;
  aheadBehind: string | null;
}

export interface SessionNote {
  text: string;
  createdAt: string;
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
  errorCount: number;
  lastMessage: MessagePreview | null;
  recentActivity: Activity[];
  tokenUsage: TokenUsage;
  gitInfo: GitInfo;
  notes: SessionNote[];
  conversationPreview: MessagePreview[];
}
