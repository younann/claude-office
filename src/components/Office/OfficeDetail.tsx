import type { Session, Activity } from "../../types";
import { getAgentIdentity } from "../../utils/agentIdentity";
import { formatRelativeTime, formatDuration } from "../../utils/formatTime";

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  user: { icon: "\ud83d\udcac", color: "#00b894", label: "You" },
  assistant: { icon: "\ud83e\udd16", color: "#6c5ce7", label: "Agent" },
  tool_call: { icon: "\ud83d\udee0", color: "#e17055", label: "Tool" },
  tool_result: { icon: "\ud83d\udccb", color: "#fdcb6e", label: "Result" },
};

function ActivityLine({ activity, index }: { activity: Activity; index: number }) {
  const config = typeConfig[activity.type] || typeConfig.assistant;
  return (
    <div
      className="flex gap-3 items-start py-2 border-b border-[#2a2d50]/50 last:border-0"
      style={{ animation: `card-enter 0.3s ease-out ${index * 40}ms both` }}
    >
      <span
        className="text-[9px] min-w-[40px] pt-1 text-right shrink-0"
        style={{ fontFamily: "var(--font-mono)", color: "#444466" }}
      >
        {formatRelativeTime(activity.timestamp)}
      </span>
      <span
        className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
        style={{
          color: config.color,
          background: `${config.color}15`,
        }}
      >
        {config.icon} {config.label}
      </span>
      <span
        className="text-[11px] leading-relaxed"
        style={{ fontFamily: "var(--font-mono)", color: "#8888aa" }}
      >
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

  const statusColors: Record<string, string> = {
    working: "#00b894",
    waiting: "#fdcb6e",
    idle: "#74b9ff",
    stopped: "#ff7675",
  };

  const statusLabels: Record<string, string> = {
    working: "Working hard",
    waiting: "Waiting for you",
    idle: "Taking a nap",
    stopped: "Left the office",
  };

  const stats = [
    { icon: "\u23f1", label: "Uptime", value: formatDuration(session.startedAt) },
    { icon: "\ud83d\udcac", label: "Messages", value: String(session.messageCount) },
    { icon: "\ud83d\udee0", label: "Tools Used", value: String(session.toolCallCount) },
    { icon: "\ud83d\udd53", label: "Last Active", value: formatRelativeTime(session.lastActivityAt) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-8"
      style={{ background: "#000000aa", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(180deg, #1e2045, #1a1c38)",
          border: `1px solid ${identity.accentColor}33`,
          boxShadow: `0 24px 64px #000000aa, 0 0 40px ${identity.accentColor}11`,
          animation: "card-enter 0.3s ease-out both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2d50] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{
                background: `linear-gradient(135deg, ${identity.gradientFrom}22, ${identity.gradientTo}11)`,
                border: `1px solid ${identity.gradientFrom}44`,
                color: identity.gradientFrom,
              }}
            >
              {identity.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold" style={{ color: "#e0e2f0" }}>
                  {identity.displayName}
                </h2>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: statusColors[session.status],
                    background: `${statusColors[session.status]}20`,
                  }}
                >
                  {statusLabels[session.status]}
                </span>
              </div>
              <div
                className="text-[10px] mt-0.5"
                style={{ fontFamily: "var(--font-mono)", color: "#555577" }}
              >
                {identity.codename} &middot; {session.projectPath}
                {session.gitBranch && <> &middot; <span style={{ color: "#6c5ce7" }}>{session.gitBranch}</span></>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-[#2a2d50]"
            style={{ color: "#555577", border: "1px solid #2a2d50" }}
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="px-6 py-4 grid grid-cols-4 gap-3 border-b border-[#2a2d50]">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 text-center"
              style={{ background: "#16182e" }}
            >
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-base font-bold" style={{ color: "#e0e2f0" }}>
                {stat.value}
              </div>
              <div className="text-[9px] mt-0.5" style={{ color: "#555577" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Activity log */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3
            className="text-[10px] tracking-wider uppercase font-bold mb-3"
            style={{ color: "#555577" }}
          >
            Activity Log — {(session.recentActivity || []).length} entries
          </h3>
          {(session.recentActivity || []).length === 0 ? (
            <div className="py-8 text-center" style={{ color: "#444466" }}>
              <div className="text-2xl mb-2">🤫</div>
              <div className="text-xs">No recent activity</div>
            </div>
          ) : (
            <div>
              {[...(session.recentActivity || [])].reverse().map((activity, i) => (
                <ActivityLine key={i} activity={activity} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
