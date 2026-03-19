import type { Session } from "../../types";
import { SessionItem } from "./SessionItem";

interface SessionListProps {
  sessions: Session[];
  selectedId: string | null;
  onSelectSession: (id: string) => void;
}

export function SessionList({
  sessions,
  selectedId,
  onSelectSession,
}: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-text-muted text-xs">
        No sessions found
      </div>
    );
  }

  return (
    <div className="px-2 py-1 flex flex-col gap-0.5 overflow-y-auto">
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          isSelected={session.id === selectedId}
          onClick={() => onSelectSession(session.id)}
        />
      ))}
    </div>
  );
}
