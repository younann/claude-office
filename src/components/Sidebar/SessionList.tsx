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
      <div className="px-4 py-12 text-center">
        <div
          className="text-2xl mb-3"
          style={{ color: "#1c2236" }}
        >
          ⬡
        </div>
        <p
          className="text-[10px] tracking-wider uppercase"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#2a3448",
          }}
        >
          NO AGENTS ONLINE
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 py-2 flex flex-col gap-1 overflow-y-auto flex-1">
      <div
        className="px-2 mb-1 text-[8px] tracking-[0.2em] uppercase"
        style={{
          fontFamily: "var(--font-mono)",
          color: "#2a3448",
        }}
      >
        AGENTS ({sessions.length})
      </div>
      {sessions.map((session, i) => (
        <SessionItem
          key={session.id}
          session={session}
          isSelected={session.id === selectedId}
          onClick={() => onSelectSession(session.id)}
          index={i}
        />
      ))}
    </div>
  );
}
