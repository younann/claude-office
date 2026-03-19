import type { Activity } from "../../types";
import { formatRelativeTime } from "../../utils/formatTime";

const typeConfig: Record<string, { icon: string; color: string }> = {
  user: { icon: "\ud83d\udc64", color: "bg-green-900/30 text-green-300" },
  assistant: { icon: "\ud83e\udd16", color: "bg-bg-card text-text-primary" },
  tool_call: { icon: "\ud83d\udd27", color: "bg-accent/10 text-purple-300" },
  tool_result: {
    icon: "\ud83d\udccb",
    color: "bg-bg-card text-text-secondary",
  },
};

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const config = typeConfig[activity.type] || typeConfig.assistant;
  return (
    <div className="flex gap-2 items-start">
      <span className="text-accent text-[9px] min-w-[36px] pt-0.5 shrink-0">
        {formatRelativeTime(activity.timestamp)}
      </span>
      <span
        className={`px-2 py-0.5 rounded text-[10px] ${config.color} leading-relaxed`}
      >
        {config.icon} {activity.summary}
      </span>
    </div>
  );
}
