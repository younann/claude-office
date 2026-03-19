import type { Session } from "../../types";
import { getAgentIdentity } from "../../utils/agentIdentity";

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  working: {
    label: "ACTIVE",
    color: "#00ff88",
    bgColor: "#00ff8818",
  },
  waiting: {
    label: "STANDBY",
    color: "#ffaa00",
    bgColor: "#ffaa0018",
  },
  idle: {
    label: "DORMANT",
    color: "#4488ff",
    bgColor: "#4488ff18",
  },
  stopped: {
    label: "OFFLINE",
    color: "#ff2244",
    bgColor: "#ff224418",
  },
};

interface SessionHeaderProps {
  session: Session;
}

export function SessionHeader({ session }: SessionHeaderProps) {
  const identity = getAgentIdentity(session.id, session.project);
  const status = statusConfig[session.status];

  return (
    <div className="mb-6 animate-fade-in-up">
      {/* Agent hero */}
      <div className="flex items-start gap-4 mb-4">
        {/* Large avatar */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0 relative"
          style={{
            background: `linear-gradient(135deg, ${identity.gradientFrom}20, ${identity.gradientTo}10)`,
            border: `1px solid ${identity.gradientFrom}44`,
          }}
        >
          <span style={{ color: identity.gradientFrom }}>
            {identity.icon}
          </span>
          {/* Status ring */}
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: status.bgColor,
              border: `1px solid ${status.color}66`,
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: status.color,
                boxShadow: `0 0 8px ${status.color}`,
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2
              className="text-lg tracking-wider"
              style={{
                fontFamily: "var(--font-display)",
                color: identity.accentColor,
                fontWeight: 700,
              }}
            >
              {identity.displayName}
            </h2>
            <span
              className="px-2 py-0.5 rounded text-[9px] tracking-wider"
              style={{
                fontFamily: "var(--font-mono)",
                background: status.bgColor,
                color: status.color,
                border: `1px solid ${status.color}33`,
              }}
            >
              {status.label}
            </span>
          </div>

          <div
            className="text-[9px] tracking-wider mb-1"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#5a6a82",
            }}
          >
            CODENAME: {identity.codename}
          </div>

          <div
            className="text-[9px] leading-relaxed"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#2a3448",
            }}
          >
            {session.projectPath}
            {session.gitBranch && (
              <>
                {" "}
                <span style={{ color: "#5a6a82" }}>
                  [{session.gitBranch}]
                </span>
              </>
            )}
            {session.model && (
              <>
                {" "}
                <span style={{ color: identity.accentColor + "66" }}>
                  {session.model}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Divider with gradient */}
      <div
        className="h-[1px] w-full"
        style={{
          background: `linear-gradient(90deg, ${identity.gradientFrom}44, transparent)`,
        }}
      />
    </div>
  );
}
