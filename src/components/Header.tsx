import { formatRelativeTime } from "../utils/formatTime";
import { useEffect, useState } from "react";

interface HeaderProps {
  lastUpdated: Date;
  sessionCount: number;
  onRefresh: () => void;
}

export function Header({ lastUpdated, sessionCount, onRefresh }: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-bg-card/80 backdrop-blur-sm border-b border-border-subtle flex items-center justify-between px-5 shrink-0 relative overflow-hidden">
      {/* Subtle gradient line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #00f0ff44, #ff3e8a44, transparent)",
        }}
      />

      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="relative">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: "linear-gradient(135deg, #00f0ff22, #ff3e8a22)",
              border: "1px solid #00f0ff33",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                color: "#00f0ff",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              C
            </span>
          </div>
          <div
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
            style={{
              background: "#00ff88",
              boxShadow: "0 0 6px #00ff88",
            }}
          />
        </div>

        <div>
          <h1
            className="text-xs tracking-[0.3em] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              color: "#00f0ff",
              fontWeight: 600,
            }}
          >
            Agent Control
          </h1>
          <div
            className="text-[9px] tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#5a6a82",
            }}
          >
            {sessionCount} ACTIVE AGENTS
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Live clock */}
        <div
          className="text-[10px] tracking-wider"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#5a6a82",
          }}
        >
          {time.toLocaleTimeString("en-US", { hour12: false })}
        </div>

        {/* Sync status */}
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "#00ff88",
              boxShadow: "0 0 4px #00ff88",
            }}
          />
          <span
            className="text-[9px] tracking-wider uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#5a6a82",
            }}
          >
            SYNCED {formatRelativeTime(lastUpdated.toISOString())}
          </span>
        </div>

        <button
          onClick={onRefresh}
          className="cursor-pointer px-3 py-1.5 rounded text-[9px] tracking-wider uppercase transition-all duration-300 hover:scale-105"
          style={{
            fontFamily: "var(--font-mono)",
            background: "linear-gradient(135deg, #00f0ff11, #00f0ff05)",
            border: "1px solid #00f0ff33",
            color: "#00f0ff",
          }}
        >
          RESYNC
        </button>
      </div>
    </header>
  );
}
