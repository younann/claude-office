import type { Session } from "../../types";
import { formatRelativeTime } from "../../utils/formatTime";

const statusColors: Record<string, string> = {
  working: "bg-status-working",
  waiting: "bg-status-waiting",
  idle: "bg-status-idle",
  stopped: "bg-status-stopped",
};

const statusLabels: Record<string, string> = {
  working: "Working",
  waiting: "Waiting",
  idle: "Idle",
  stopped: "Stopped",
};

interface SessionItemProps {
  session: Session;
  isSelected: boolean;
  onClick: () => void;
}

export function SessionItem({
  session,
  isSelected,
  onClick,
}: SessionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-md p-2.5 transition-colors cursor-pointer ${
        isSelected
          ? "bg-accent/10 border-l-[3px] border-accent"
          : "bg-transparent hover:bg-bg-card"
      }`}
    >
      <div className="flex justify-between items-center">
        <span
          className={`text-[11px] font-medium ${isSelected ? "text-text-primary" : "text-text-secondary"}`}
        >
          {session.project}
        </span>
        <span
          className={`w-2 h-2 rounded-full ${statusColors[session.status]}`}
        />
      </div>
      <div className="text-text-muted text-[9px] mt-0.5">
        {statusLabels[session.status]} •{" "}
        {formatRelativeTime(session.lastActivityAt)}
      </div>
    </button>
  );
}
