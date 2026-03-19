import type { Activity } from "../../types";
import { formatRelativeTime } from "../../utils/formatTime";

const typeConfig: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  user: { icon: "\u25B6", color: "#00ff88", label: "USR" },
  assistant: { icon: "\u25C6", color: "#00f0ff", label: "AGT" },
  tool_call: { icon: "\u2699", color: "#ff3e8a", label: "CMD" },
  tool_result: { icon: "\u25C8", color: "#ffaa00", label: "RES" },
};

interface ActivityItemProps {
  activity: Activity;
  index: number;
}

export function ActivityItem({ activity, index }: ActivityItemProps) {
  const config = typeConfig[activity.type] || typeConfig.assistant;

  return (
    <div
      className="flex gap-3 items-start py-1.5 animate-fade-in-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Timestamp */}
      <span
        className="text-[9px] min-w-[44px] pt-0.5 shrink-0 text-right"
        style={{
          fontFamily: "var(--font-mono)",
          color: "#2a3448",
        }}
      >
        {formatRelativeTime(activity.timestamp)}
      </span>

      {/* Type badge */}
      <span
        className="text-[8px] tracking-wider px-1.5 py-0.5 rounded shrink-0 min-w-[32px] text-center"
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          color: config.color,
          background: `${config.color}15`,
          border: `1px solid ${config.color}22`,
        }}
      >
        {config.label}
      </span>

      {/* Content */}
      <span
        className="text-[10px] leading-relaxed break-all"
        style={{
          fontFamily: "var(--font-mono)",
          color: "#5a6a82",
        }}
      >
        <span style={{ color: config.color, opacity: 0.5 }}>
          {config.icon}
        </span>{" "}
        {activity.summary}
      </span>
    </div>
  );
}
