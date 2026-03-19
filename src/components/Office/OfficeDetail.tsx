import type { Session, Activity } from "../../types";
import { getAgentIdentity } from "../../utils/agentIdentity";
import { formatRelativeTime, formatDuration } from "../../utils/formatTime";
import { Worker } from "./Worker";

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

function ActivityLine({ activity, index }: { activity: Activity; index: number }) {
  const config = typeConfig[activity.type] || typeConfig.assistant;
  return (
    <div className="flex gap-2 items-start py-1.5" style={{
      borderBottom: "1px solid #1a1a35",
      animation: `card-enter 0.2s ease-out ${index * 30}ms both`,
    }}>
      <span style={{
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        color: "#404060",
        minWidth: "44px",
        textAlign: "right",
      }}>
        {formatRelativeTime(activity.timestamp)}
      </span>
      <span style={{
        fontFamily: "var(--font-pixel)",
        fontSize: "6px",
        color: config.color,
        background: config.color + "22",
        padding: "2px 4px",
        minWidth: "28px",
        textAlign: "center",
        lineHeight: "14px",
      }}>
        {config.label}
      </span>
      <span style={{
        fontFamily: "var(--font-body)",
        fontSize: "14px",
        color: "#a0a0c0",
        lineHeight: "1.3",
        wordBreak: "break-all",
      }}>
        {activity.summary}
      </span>
    </div>
  );
}

interface OfficeDetailProps {
  session: Session;
  onClose: () => void;
}

export function OfficeDetail({ session, onClose }: OfficeDetailProps) {
  const identity = getAgentIdentity(session.id, session.project);
  const worker = getWorkerAppearance(session.id);

  const statusColors: Record<string, string> = {
    working: "#34d399", waiting: "#fbbf24", idle: "#60a5fa", stopped: "#f87171",
  };
  const statusLabels: Record<string, string> = {
    working: "WORKING HARD", waiting: "WAITING FOR INPUT", idle: "TAKING A NAP", stopped: "LEFT THE OFFICE",
  };

  const stats = [
    { label: "TIME", value: formatDuration(session.startedAt), color: "#fcd34d" },
    { label: "MSGS", value: String(session.messageCount), color: "#a78bfa" },
    { label: "TOOLS", value: String(session.toolCallCount), color: "#f87171" },
    { label: "LAST", value: formatRelativeTime(session.lastActivityAt), color: "#34d399" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: "#000000cc" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        style={{
          background: "#1a1a2e",
          border: "4px solid #3a3a6a",
          boxShadow: "8px 8px 0 #0a0a1a, inset -2px -2px 0 #0f0f23, inset 2px 2px 0 #2a2a5a",
          animation: "bounce-in 0.3s ease-out both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar — game window style */}
        <div className="flex items-center justify-between px-4 py-2" style={{
          background: "#7c3aed",
          boxShadow: "inset -2px -2px 0 #5b2db8, inset 2px 2px 0 #9d5cf5",
        }}>
          <span style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "8px",
            color: "#fff",
            letterSpacing: "1px",
          }}>
            AGENT: {identity.displayName}
          </span>
          <button
            onClick={onClose}
            className="cursor-pointer"
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "8px",
              color: "#fff",
              background: "#e74c3c",
              width: "20px",
              height: "20px",
              border: "none",
              boxShadow: "inset -2px -2px 0 #c0392b, inset 2px 2px 0 #ff6b6b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            X
          </button>
        </div>

        {/* Agent profile */}
        <div className="flex items-center gap-4 px-5 py-4" style={{
          borderBottom: "2px solid #2e2e5e",
        }}>
          {/* Worker sprite */}
          <div className="shrink-0" style={{
            background: "#12122a",
            padding: "8px",
            border: "2px solid #2e2e5e",
            boxShadow: "inset -2px -2px 0 #0a0a1a",
          }}>
            <Worker
              status={session.status}
              skinColor={worker.skinColor}
              shirtColor={worker.shirtColor}
              hairColor={worker.hairColor}
              pantsColor={worker.pantsColor}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "10px",
                color: "#e8e8f0",
              }}>
                {identity.codename}
              </span>
              <span style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "6px",
                color: statusColors[session.status],
                background: statusColors[session.status] + "22",
                padding: "3px 6px",
                letterSpacing: "0.5px",
              }}>
                {statusLabels[session.status]}
              </span>
            </div>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "15px",
              color: "#606080",
            }}>
              {session.projectPath}
              {session.gitBranch && <span style={{ color: "#7c3aed" }}> [{session.gitBranch}]</span>}
            </div>
            {session.model && (
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                color: "#404060",
                marginTop: "2px",
              }}>
                Model: {session.model}
              </div>
            )}
          </div>
        </div>

        {/* Stats bar — RPG style */}
        <div className="grid grid-cols-4 gap-0" style={{ borderBottom: "2px solid #2e2e5e" }}>
          {stats.map((stat) => (
            <div key={stat.label} className="px-3 py-3 text-center" style={{
              borderRight: "1px solid #2e2e5e",
            }}>
              <div style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "6px",
                color: "#606080",
                letterSpacing: "1px",
                marginBottom: "4px",
              }}>
                {stat.label}
              </div>
              <div style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "10px",
                color: stat.color,
                textShadow: `0 0 8px ${stat.color}44`,
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Activity log */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="mb-2" style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "7px",
            color: "#606080",
            letterSpacing: "1px",
          }}>
            ACTIVITY LOG [{(session.recentActivity || []).length}]
          </div>
          {(session.recentActivity || []).length === 0 ? (
            <div className="py-8 text-center" style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              color: "#404060",
            }}>
              No recent activity recorded
            </div>
          ) : (
            <div>
              {[...(session.recentActivity || [])].reverse().map((a, i) => (
                <ActivityLine key={i} activity={a} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
