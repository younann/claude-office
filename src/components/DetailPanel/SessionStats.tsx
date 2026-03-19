import type { Session } from "../../types";
import { formatDuration, formatRelativeTime } from "../../utils/formatTime";
import { getAgentIdentity } from "../../utils/agentIdentity";

interface SessionStatsProps {
  session: Session;
}

export function SessionStats({ session }: SessionStatsProps) {
  const identity = getAgentIdentity(session.id, session.project);

  const stats = [
    {
      label: "UPTIME",
      value: formatDuration(session.startedAt),
      icon: "\u25F7", // ◷
    },
    {
      label: "MESSAGES",
      value: String(session.messageCount),
      icon: "\u25C8", // ◈
    },
    {
      label: "TOOL OPS",
      value: String(session.toolCallCount),
      icon: "\u2699", // ⚙
    },
    {
      label: "LAST SIGNAL",
      value: formatRelativeTime(session.lastActivityAt),
      icon: "\u25CE", // ◎
    },
  ];

  return (
    <div
      className="grid grid-cols-4 gap-2 mb-5 animate-fade-in-up"
      style={{ animationDelay: "100ms" }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="rounded-lg p-3 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${identity.gradientFrom}08, transparent)`,
            border: `1px solid ${identity.gradientFrom}15`,
            animationDelay: `${i * 50 + 100}ms`,
          }}
        >
          {/* Icon */}
          <div
            className="text-lg mb-1"
            style={{ color: identity.gradientFrom + "33" }}
          >
            {stat.icon}
          </div>
          <div
            className="text-[8px] tracking-[0.15em] uppercase mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#5a6a82",
            }}
          >
            {stat.label}
          </div>
          <div
            className="text-base"
            style={{
              fontFamily: "var(--font-display)",
              color: "#c8d6e5",
              fontWeight: 600,
            }}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
