import type { Session } from "../../types";

const statusConfig: Record<string, { label: string; color: string }> = {
  working: {
    label: "Working",
    color: "bg-status-working/20 text-status-working",
  },
  waiting: {
    label: "Waiting",
    color: "bg-status-waiting/20 text-status-waiting",
  },
  idle: { label: "Idle", color: "bg-status-idle/20 text-status-idle" },
  stopped: {
    label: "Stopped",
    color: "bg-status-stopped/20 text-status-stopped",
  },
};

interface SessionHeaderProps {
  session: Session;
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const status = statusConfig[session.status];
  return (
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          {session.project}
        </h2>
        <p className="text-text-muted text-[10px] mt-1">
          {session.projectPath}
          {session.gitBranch && ` \u2022 ${session.gitBranch}`}
          {session.model && ` \u2022 ${session.model}`}
          {session.version && ` \u2022 v${session.version}`}
        </p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs ${status.color}`}>
        {status.label}
      </span>
    </div>
  );
}
