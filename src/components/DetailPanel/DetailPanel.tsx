import type { Session } from "../../types";
import { SessionHeader } from "./SessionHeader";
import { SessionStats } from "./SessionStats";
import { ActivityLog } from "./ActivityLog";

interface DetailPanelProps {
  session: Session | null;
}

export function DetailPanel({ session }: DetailPanelProps) {
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-main">
        <div className="text-center">
          <div className="text-text-muted text-3xl mb-2">⬡</div>
          <p className="text-text-muted text-sm">
            Select a session to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-bg-main p-4">
      <SessionHeader session={session} />
      <SessionStats session={session} />
      <ActivityLog activities={session.recentActivity || []} />
    </div>
  );
}
