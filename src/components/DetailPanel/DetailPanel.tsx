import type { Session } from "../../types";
import { getAgentIdentity } from "../../utils/agentIdentity";
import { SessionHeader } from "./SessionHeader";
import { SessionStats } from "./SessionStats";
import { ActivityLog } from "./ActivityLog";

interface DetailPanelProps {
  session: Session | null;
}

export function DetailPanel({ session }: DetailPanelProps) {
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-main relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(#00f0ff 1px, transparent 1px),
              linear-gradient(90deg, #00f0ff 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="text-center relative z-10">
          <div
            className="text-5xl mb-4 opacity-10"
            style={{ color: "#00f0ff" }}
          >
            ⬡
          </div>
          <p
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              color: "#1c2236",
            }}
          >
            SELECT AN AGENT
          </p>
          <p
            className="text-[9px] mt-2 tracking-wider"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#141824",
            }}
          >
            AWAITING TARGET SELECTION
          </p>
        </div>
      </div>
    );
  }

  const identity = getAgentIdentity(session.id, session.project);

  return (
    <div className="flex-1 overflow-y-auto bg-bg-main p-5 relative">
      {/* Accent gradient at top */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${identity.gradientFrom}06, transparent)`,
        }}
      />

      <div className="relative z-10">
        <SessionHeader session={session} />
        <SessionStats session={session} />
        <ActivityLog
          activities={session.recentActivity || []}
          accentColor={identity.accentColor}
        />
      </div>
    </div>
  );
}
