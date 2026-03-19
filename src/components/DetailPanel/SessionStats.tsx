import type { Session } from "../../types";
import { formatDuration, formatRelativeTime } from "../../utils/formatTime";

interface SessionStatsProps {
  session: Session;
}

export function SessionStats({ session }: SessionStatsProps) {
  const stats = [
    { label: "Duration", value: formatDuration(session.startedAt) },
    { label: "Messages", value: String(session.messageCount) },
    { label: "Tool Calls", value: String(session.toolCallCount) },
    {
      label: "Last Active",
      value: formatRelativeTime(session.lastActivityAt),
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-bg-card rounded-md p-3 text-center"
        >
          <div className="text-text-muted text-[8px] uppercase tracking-wider">
            {stat.label}
          </div>
          <div className="text-text-primary text-sm font-semibold mt-1">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
