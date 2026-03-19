import { useState } from "react";
import type { Session, Activity, MessagePreview } from "../../types";
import { getAgentIdentity } from "../../utils/agentIdentity";
import { formatRelativeTime, formatDuration } from "../../utils/formatTime";
import { Worker } from "./Worker";
import { getAgentMood } from "../../utils/agentIdentity";

function getWorkerAppearance(sessionId: string) {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash << 5) - hash + sessionId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  const skins = ["#f5cba7", "#e8b88a", "#d4a574", "#c49060", "#fde3cd", "#dbb99b"];
  const shirts = ["#6c5ce7", "#00b894", "#e17055", "#0984e3", "#fd79a8", "#00cec9", "#a29bfe", "#e84393", "#2ecc71", "#f39c12"];
  const hairs = ["#2d3436", "#5d4037", "#f9a825", "#d63031", "#1e272e", "#e8d5b7", "#784212", "#b33939"];
  const pants = ["#2d3436", "#34495e", "#2c3e50", "#1a1a2e", "#2e4057"];
  return {
    skinColor: skins[hash % skins.length],
    shirtColor: shirts[(hash >> 4) % shirts.length],
    hairColor: hairs[(hash >> 8) % hairs.length],
    pantsColor: pants[(hash >> 16) % pants.length],
  };
}

const typeConfig: Record<string, { color: string; label: string }> = {
  user: { color: "#34d399", label: "YOU" },
  assistant: { color: "#a78bfa", label: "AGT" },
  tool_call: { color: "#f87171", label: "CMD" },
  tool_result: { color: "#fbbf24", label: "RES" },
};

type Tab = "activity" | "conversation" | "notes";

function ActivityLine({ activity, index }: { activity: Activity; index: number }) {
  const config = typeConfig[activity.type] || typeConfig.assistant;
  return (
    <div className="flex gap-2 items-start py-1.5" style={{
      borderBottom: "1px solid #1a1a35",
      animation: `card-enter 0.2s ease-out ${index * 20}ms both`,
      background: activity.isError ? "#ff222211" : "transparent",
    }}>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#404060", minWidth: "44px", textAlign: "right" }}>
        {formatRelativeTime(activity.timestamp)}
      </span>
      <span style={{
        fontFamily: "var(--font-pixel)", fontSize: "6px", color: activity.isError ? "#ff4444" : config.color,
        background: (activity.isError ? "#ff4444" : config.color) + "22",
        padding: "2px 4px", minWidth: "28px", textAlign: "center", lineHeight: "14px",
      }}>
        {activity.isError ? "ERR" : config.label}
      </span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: activity.isError ? "#ff6666" : "#a0a0c0", lineHeight: "1.3", wordBreak: "break-all" }}>
        {activity.summary}
      </span>
    </div>
  );
}

function ConversationBubble({ msg, index }: { msg: MessagePreview; index: number }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`} style={{
      animation: `card-enter 0.2s ease-out ${index * 30}ms both`,
    }}>
      <div className="max-w-[80%] px-3 py-2 rounded" style={{
        background: isUser ? "#7c3aed33" : "#1a1a35",
        border: `2px solid ${isUser ? "#7c3aed55" : "#2e2e5e"}`,
        boxShadow: "2px 2px 0 #0a0a1a",
      }}>
        <div style={{ fontFamily: "var(--font-pixel)", fontSize: "6px", color: isUser ? "#a78bfa" : "#34d399", marginBottom: "4px" }}>
          {isUser ? "YOU" : "AGENT"}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#c0c0d8", lineHeight: "1.4" }}>
          {msg.content}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#404060", marginTop: "4px" }}>
          {formatRelativeTime(msg.timestamp)}
        </div>
      </div>
    </div>
  );
}

interface OfficeDetailProps {
  session: Session;
  onClose: () => void;
  onRefresh: () => void;
}

export function OfficeDetail({ session, onClose, onRefresh }: OfficeDetailProps) {
  const identity = getAgentIdentity(session.id, session.project);
  const worker = getWorkerAppearance(session.id);
  const mood = getAgentMood(session.toolCallCount, session.messageCount, session.status);
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const statusColors: Record<string, string> = {
    working: "#34d399", waiting: "#fbbf24", approval: "#ff44ff", idle: "#60a5fa", stopped: "#f87171",
  };
  const statusLabels: Record<string, string> = {
    working: "WORKING HARD", waiting: "WAITING", approval: "NEEDS APPROVAL!", idle: "NAPPING", stopped: "OFFLINE",
  };

  const token = session.tokenUsage;
  const git = session.gitInfo;

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setIsSaving(true);
    try {
      await fetch(`/api/sessions/${session.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText }),
      });
      setNoteText("");
      onRefresh();
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (index: number) => {
    try {
      await fetch(`/api/sessions/${session.id}/notes/${index}`, { method: "DELETE" });
      onRefresh();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "activity", label: "LOG" },
    { key: "conversation", label: "CHAT" },
    { key: "notes", label: `NOTES${session.notes?.length ? ` (${session.notes.length})` : ""}` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000cc" }} onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" style={{
        background: "#1a1a2e", border: "4px solid #3a3a6a",
        boxShadow: "8px 8px 0 #0a0a1a, inset -2px -2px 0 #0f0f23, inset 2px 2px 0 #2a2a5a",
        animation: "bounce-in 0.3s ease-out both",
      }} onClick={(e) => e.stopPropagation()}>

        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 shrink-0" style={{
          background: "#7c3aed", boxShadow: "inset -2px -2px 0 #5b2db8, inset 2px 2px 0 #9d5cf5",
        }}>
          <span style={{ fontFamily: "var(--font-pixel)", fontSize: "8px", color: "#fff", letterSpacing: "1px" }}>
            AGENT: {identity.funnyName}
          </span>
          <button onClick={onClose} className="cursor-pointer" style={{
            fontFamily: "var(--font-pixel)", fontSize: "8px", color: "#fff", background: "#e74c3c",
            width: "20px", height: "20px", border: "none",
            boxShadow: "inset -2px -2px 0 #c0392b, inset 2px 2px 0 #ff6b6b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>X</button>
        </div>

        {/* Agent profile + stats */}
        <div className="flex gap-4 px-4 py-3 shrink-0" style={{ borderBottom: "2px solid #2e2e5e" }}>
          {/* Worker sprite */}
          <div className="shrink-0" style={{ background: "#12122a", padding: "6px", border: "2px solid #2e2e5e" }}>
            <Worker status={session.status} mood={mood}
              skinColor={worker.skinColor} shirtColor={worker.shirtColor}
              hairColor={worker.hairColor} pantsColor={worker.pantsColor} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: "9px", color: "#e8e8f0" }}>
                {identity.displayName}
              </span>
              <span style={{
                fontFamily: "var(--font-pixel)", fontSize: "6px",
                color: statusColors[session.status], background: statusColors[session.status] + "22",
                padding: "2px 6px",
              }}>
                {statusLabels[session.status]}
              </span>
              {session.errorCount > 0 && (
                <span style={{
                  fontFamily: "var(--font-pixel)", fontSize: "6px", color: "#ff4444", background: "#ff444422", padding: "2px 6px",
                }}>
                  {session.errorCount} ERRORS
                </span>
              )}
            </div>

            <div style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#606080", wordBreak: "break-all" }}>
              {session.projectPath}
            </div>

            {/* Git info */}
            {git && (
              <div className="flex gap-3 mt-1 flex-wrap">
                {git.branch && (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#7c3aed" }}>
                    [{git.branch}]
                  </span>
                )}
                {git.uncommittedChanges > 0 && (
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: "6px", color: "#fbbf24", background: "#fbbf2422", padding: "2px 5px" }}>
                    {git.uncommittedChanges} CHANGES
                  </span>
                )}
                {git.aheadBehind && (
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#606080" }}>
                    {git.aheadBehind}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-6 gap-0 shrink-0" style={{ borderBottom: "2px solid #2e2e5e" }}>
          {[
            { label: "TIME", value: formatDuration(session.startedAt), color: "#fcd34d" },
            { label: "MSGS", value: String(session.messageCount), color: "#a78bfa" },
            { label: "TOOLS", value: String(session.toolCallCount), color: "#f87171" },
            { label: "TOKENS", value: token ? `${Math.round(token.totalTokens / 1000)}K` : "—", color: "#34d399" },
            { label: "COST", value: token ? `$${token.estimatedCostUsd.toFixed(3)}` : "—", color: "#fbbf24" },
            { label: "MOOD", value: mood === "happy" ? ":)" : mood === "stressed" ? ">.<" : mood === "tired" ? "-_-" : mood === "focused" ? "o_o" : "~_~",
              color: mood === "happy" ? "#fcd34d" : mood === "stressed" ? "#ff4444" : "#60a5fa" },
          ].map((stat) => (
            <div key={stat.label} className="px-2 py-2 text-center" style={{ borderRight: "1px solid #2e2e5e" }}>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: "5px", color: "#606080", letterSpacing: "0.5px", marginBottom: "3px" }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: "8px", color: stat.color, textShadow: `0 0 6px ${stat.color}44` }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex shrink-0" style={{ borderBottom: "2px solid #2e2e5e" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 cursor-pointer transition-colors"
              style={{
                fontFamily: "var(--font-pixel)", fontSize: "7px", letterSpacing: "0.5px",
                color: activeTab === tab.key ? "#fcd34d" : "#606080",
                background: activeTab === tab.key ? "#1e1e3f" : "transparent",
                borderBottom: activeTab === tab.key ? "2px solid #fcd34d" : "2px solid transparent",
                border: "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Activity log tab */}
          {activeTab === "activity" && (
            <>
              {(session.recentActivity || []).length === 0 ? (
                <div className="py-8 text-center" style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "#404060" }}>
                  No recent activity
                </div>
              ) : (
                [...(session.recentActivity || [])].reverse().map((a, i) => (
                  <ActivityLine key={i} activity={a} index={i} />
                ))
              )}
            </>
          )}

          {/* Conversation preview tab */}
          {activeTab === "conversation" && (
            <>
              {(session.conversationPreview || []).length === 0 ? (
                <div className="py-8 text-center" style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "#404060" }}>
                  No conversation data
                </div>
              ) : (
                (session.conversationPreview || []).map((msg, i) => (
                  <ConversationBubble key={i} msg={msg} index={i} />
                ))
              )}
            </>
          )}

          {/* Notes tab */}
          {activeTab === "notes" && (
            <>
              {/* Add note form */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                  placeholder="Add a sticky note..."
                  className="flex-1 px-3 py-2 rounded outline-none"
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "15px",
                    background: "#12122a", border: "2px solid #2e2e5e",
                    color: "#e8e8f0",
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={isSaving || !noteText.trim()}
                  className="cursor-pointer relative"
                  style={{
                    fontFamily: "var(--font-pixel)", fontSize: "8px",
                    color: "#fff", background: isSaving ? "#5b2db8" : "#7c3aed",
                    padding: "8px 16px", border: "none",
                    boxShadow: isSaving ? "none" : "inset -2px -2px 0 #5b2db8, inset 2px 2px 0 #9d5cf5, 3px 3px 0 #0a0a1a",
                    opacity: !noteText.trim() ? 0.4 : 1,
                    transition: "all 0.15s",
                    transform: isSaving ? "translateY(2px)" : "none",
                  }}
                >
                  {isSaving ? (
                    <span style={{ animation: "status-blink 0.5s steps(2) infinite" }}>SAVING..</span>
                  ) : "ADD"}
                </button>
              </div>

              {/* Notes list */}
              {(session.notes || []).length === 0 ? (
                <div className="py-8 text-center" style={{ fontFamily: "var(--font-body)", fontSize: "16px", color: "#404060" }}>
                  No notes yet — add one above
                </div>
              ) : (
                (session.notes || []).map((note, i) => (
                  <div key={i} className="mb-2 px-3 py-2 flex items-start justify-between gap-2" style={{
                    background: "#fcd34d18",
                    border: "2px solid #fcd34d33",
                    boxShadow: "2px 2px 0 #0a0a1a",
                    animation: `card-enter 0.2s ease-out ${i * 50}ms both`,
                  }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "15px", color: "#e8e8f0" }}>
                        {note.text}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#606080", marginTop: "2px" }}>
                        {formatRelativeTime(note.createdAt)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(i)}
                      className="cursor-pointer shrink-0"
                      style={{
                        fontFamily: "var(--font-pixel)", fontSize: "6px",
                        color: "#ff6666", background: "transparent",
                        border: "1px solid #ff444444", padding: "2px 4px",
                      }}
                    >
                      DEL
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
