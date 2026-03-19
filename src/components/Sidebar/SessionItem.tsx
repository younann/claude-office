import type { Session } from "../../types";
import { formatRelativeTime } from "../../utils/formatTime";
import { getAgentIdentity } from "../../utils/agentIdentity";

const statusConfig: Record<
  string,
  { label: string; color: string; animation: string }
> = {
  working: {
    label: "ACTIVE",
    color: "#00ff88",
    animation: "animate-pulse-working",
  },
  waiting: {
    label: "STANDBY",
    color: "#ffaa00",
    animation: "animate-pulse-waiting",
  },
  idle: {
    label: "DORMANT",
    color: "#4488ff",
    animation: "animate-pulse-idle",
  },
  stopped: { label: "OFFLINE", color: "#ff2244", animation: "" },
};

interface SessionItemProps {
  session: Session;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function SessionItem({
  session,
  isSelected,
  onClick,
  index,
}: SessionItemProps) {
  const identity = getAgentIdentity(session.id, session.project);
  const status = statusConfig[session.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg p-3 transition-all duration-300 cursor-pointer group animate-fade-in-up"
      style={{
        animationDelay: `${index * 60}ms`,
        background: isSelected
          ? `linear-gradient(135deg, ${identity.gradientFrom}12, ${identity.gradientTo}08)`
          : "transparent",
        border: isSelected
          ? `1px solid ${identity.gradientFrom}44`
          : "1px solid transparent",
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* Agent avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm transition-transform duration-300 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${identity.gradientFrom}22, ${identity.gradientTo}11)`,
            border: `1px solid ${identity.gradientFrom}33`,
            color: identity.gradientFrom,
          }}
        >
          {identity.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] tracking-wider truncate"
              style={{
                fontFamily: "var(--font-display)",
                color: isSelected ? identity.accentColor : "#c8d6e5",
                fontWeight: isSelected ? 600 : 500,
              }}
            >
              {identity.displayName}
            </span>

            {/* Status dot */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-1.5 h-1.5 rounded-full ${status.animation}`}
                style={{
                  background: status.color,
                  boxShadow: `0 0 6px ${status.color}88`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-0.5">
            <span
              className="text-[8px] tracking-wider"
              style={{
                fontFamily: "var(--font-mono)",
                color: status.color,
                opacity: 0.7,
              }}
            >
              {status.label}
            </span>
            <span
              className="text-[8px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "#2a3448",
              }}
            >
              {formatRelativeTime(session.lastActivityAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
