import type { Session } from "../../types";
import { Worker } from "./Worker";
import { getAgentIdentity } from "../../utils/agentIdentity";
import { formatRelativeTime } from "../../utils/formatTime";

interface OfficeRoomProps {
  session: Session;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

// Deterministic worker appearance from session ID
function getWorkerAppearance(sessionId: string) {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash << 5) - hash + sessionId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const skins = ["#f5cba7", "#e8b88a", "#d4a574", "#c49060", "#a0785a", "#fde3cd"];
  const shirts = ["#6c5ce7", "#00b894", "#e17055", "#0984e3", "#fd79a8", "#e84393", "#00cec9", "#a29bfe"];
  const hairs = ["#2d3436", "#5d4037", "#f9a825", "#d63031", "#b33939", "#1e272e", "#e8d5b7"];
  const styles: Array<"short" | "long" | "spiky" | "bun"> = ["short", "long", "spiky", "bun"];

  return {
    skinColor: skins[hash % skins.length],
    shirtColor: shirts[(hash >> 4) % shirts.length],
    hairColor: hairs[(hash >> 8) % hairs.length],
    hairStyle: styles[(hash >> 12) % styles.length],
  };
}

const statusConfig: Record<string, { label: string; color: string; lightColor: string }> = {
  working: { label: "Working", color: "#00b894", lightColor: "#00b89433" },
  waiting: { label: "Waiting", color: "#fdcb6e", lightColor: "#fdcb6e33" },
  idle: { label: "Sleeping", color: "#74b9ff", lightColor: "#74b9ff33" },
  stopped: { label: "Gone", color: "#ff7675", lightColor: "#ff767533" },
};

export function OfficeRoom({ session, isSelected, onClick, index }: OfficeRoomProps) {
  const identity = getAgentIdentity(session.id, session.project);
  const worker = getWorkerAppearance(session.id);
  const status = statusConfig[session.status] || statusConfig.waiting;
  const isWorking = session.status === "working";
  const isIdle = session.status === "idle";

  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group"
      style={{
        animation: `card-enter 0.5s ease-out ${index * 80}ms both`,
        background: isSelected
          ? `linear-gradient(145deg, #252850, #1e2045)`
          : `linear-gradient(145deg, #1e2040, #1a1c38)`,
        border: isSelected ? `2px solid ${identity.accentColor}55` : "2px solid #2a2d5000",
        boxShadow: isSelected
          ? `0 8px 32px ${identity.accentColor}15, inset 0 1px 0 #ffffff08`
          : "0 4px 16px #00000033, inset 0 1px 0 #ffffff05",
      }}
    >
      {/* Room interior */}
      <div className="relative w-full h-44 overflow-hidden">
        {/* Wall */}
        <div
          className="absolute inset-0"
          style={{
            background: isIdle
              ? "linear-gradient(180deg, #15172e 0%, #1a1c38 100%)"
              : "linear-gradient(180deg, #1e2045 0%, #222550 60%, #252855 100%)",
          }}
        />

        {/* Window with light */}
        <div
          className="absolute top-3 right-4 w-14 h-16 rounded-sm"
          style={{
            background: isIdle
              ? "linear-gradient(180deg, #1a1c44 0%, #15172e 100%)"
              : "linear-gradient(180deg, #3d4580 0%, #2a2f60 50%, #4a50a0 100%)",
            border: "2px solid #333666",
            boxShadow: isIdle ? "none" : "0 0 20px #4a50a033",
          }}
        >
          {/* Window cross */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#333666] -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#333666] -translate-y-1/2" />
          {/* Stars if night (idle) */}
          {isIdle && (
            <>
              <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-white/40" />
              <div className="absolute top-5 right-3 w-0.5 h-0.5 rounded-full bg-white/30" />
              <div className="absolute top-3 left-6 w-0.5 h-0.5 rounded-full bg-white/20" />
            </>
          )}
        </div>

        {/* Desk lamp glow (working only) */}
        {isWorking && (
          <div
            className="absolute top-8 left-12 w-24 h-24 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, #ffeaa722 0%, transparent 70%)",
              animation: "lamp-glow 3s ease-in-out infinite",
            }}
          />
        )}

        {/* Floor */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{
            background: "linear-gradient(180deg, #1a1c3800, #16182e)",
          }}
        />

        {/* === Furniture === */}

        {/* Desk */}
        <div className="absolute bottom-8 left-6 right-16">
          {/* Desktop surface */}
          <div
            className="h-3 rounded-t-sm"
            style={{
              background: "linear-gradient(90deg, #4a3f2e, #5a4d3a, #4a3f2e)",
              boxShadow: "0 2px 4px #00000044",
            }}
          />
          {/* Desk legs */}
          <div className="flex justify-between px-1">
            <div className="w-1.5 h-6 bg-[#3d3425] rounded-b-sm" />
            <div className="w-1.5 h-6 bg-[#3d3425] rounded-b-sm" />
          </div>
        </div>

        {/* Monitor */}
        <div className="absolute bottom-14 left-8">
          {/* Screen */}
          <div
            className="w-16 h-10 rounded-sm relative overflow-hidden"
            style={{
              background: isIdle ? "#111" : "#1a2744",
              border: "2px solid #333",
              boxShadow: isWorking ? `0 0 12px ${identity.accentColor}22` : "none",
              animation: isWorking ? "screen-flicker 2s ease-in-out infinite" : "none",
            }}
          >
            {/* Screen content */}
            {isWorking && (
              <div className="p-1">
                <div className="h-[2px] w-10 bg-green-400/40 mb-1 rounded" />
                <div className="h-[2px] w-7 bg-blue-400/30 mb-1 rounded" />
                <div className="h-[2px] w-11 bg-green-400/30 mb-1 rounded" />
                <div className="h-[2px] w-5 bg-purple-400/30 rounded" />
              </div>
            )}
            {isIdle && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#222] border border-[#333]" />
              </div>
            )}
          </div>
          {/* Monitor stand */}
          <div className="w-3 h-2 bg-[#333] mx-auto" />
          <div className="w-6 h-1 bg-[#333] mx-auto rounded-sm" />
        </div>

        {/* Coffee mug (working) */}
        {isWorking && (
          <div className="absolute bottom-12 left-28">
            <div className="w-3 h-4 bg-white/80 rounded-b-sm relative">
              {/* Handle */}
              <div className="absolute right-[-3px] top-0.5 w-2 h-2 rounded-full border border-white/60" />
              {/* Steam */}
              <div
                className="absolute -top-3 left-0.5 w-1 h-3 rounded-full bg-white/20"
                style={{ animation: "steam 2s ease-out infinite" }}
              />
              <div
                className="absolute -top-2 left-1.5 w-0.5 h-2 rounded-full bg-white/15"
                style={{ animation: "steam 2s ease-out infinite 0.5s" }}
              />
            </div>
          </div>
        )}

        {/* Chair */}
        <div className="absolute bottom-2 left-12">
          {/* Seat */}
          <div className="w-10 h-2 bg-[#4a4066] rounded-t-lg" style={{ boxShadow: "0 -2px 4px #00000022" }} />
          {/* Chair back */}
          <div className="absolute -top-10 left-1 w-8 h-8 bg-[#4a4066] rounded-t-lg" />
          {/* Chair leg */}
          <div className="w-1 h-4 bg-[#333] mx-auto mt-0" />
          {/* Chair base */}
          <div className="w-8 h-1 bg-[#333] mx-auto rounded" />
        </div>

        {/* Worker character (seated at desk) */}
        <div className="absolute bottom-9 left-11">
          <Worker
            status={session.status}
            skinColor={worker.skinColor}
            shirtColor={worker.shirtColor}
            hairColor={worker.hairColor}
            hairStyle={worker.hairStyle}
          />
        </div>

        {/* Plant in corner */}
        <div className="absolute bottom-4 right-4">
          <div className="w-4 h-5 bg-[#4a3f2e] rounded-t-sm rounded-b-lg" />
          <div className="absolute -top-4 left-0 w-5 h-5 bg-green-800/60 rounded-full" />
          <div className="absolute -top-6 left-1 w-3 h-4 bg-green-700/50 rounded-full" />
        </div>

        {/* Bookshelf on wall */}
        <div className="absolute top-4 left-4">
          <div className="w-10 h-1 bg-[#4a3f2e] rounded-sm" />
          <div className="flex gap-0.5 -mt-3 ml-0.5">
            <div className="w-1.5 h-3 bg-[#6c5ce7]/40 rounded-t-sm" />
            <div className="w-1.5 h-2.5 bg-[#e17055]/40 rounded-t-sm" />
            <div className="w-1.5 h-3.5 bg-[#00b894]/40 rounded-t-sm" />
            <div className="w-1.5 h-2 bg-[#0984e3]/40 rounded-t-sm" />
          </div>
        </div>
      </div>

      {/* Room info bar */}
      <div className="px-4 py-3 border-t border-[#2a2d50]" style={{ background: "#1a1c38" }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "#e0e2f0" }}>
              {identity.displayName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: status.color }}
              />
              <div
                className="absolute inset-0 w-2 h-2 rounded-full"
                style={{
                  background: status.color,
                  animation: session.status === "working" ? "status-pulse 2s infinite" : "none",
                }}
              />
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{ color: status.color }}
            >
              {status.label}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-[9px]"
            style={{ fontFamily: "var(--font-mono)", color: "#555577" }}
          >
            {identity.codename}
          </span>
          <span
            className="text-[9px]"
            style={{ fontFamily: "var(--font-mono)", color: "#444466" }}
          >
            {formatRelativeTime(session.lastActivityAt)}
          </span>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px ${identity.accentColor}10, 0 0 20px ${identity.accentColor}08`,
        }}
      />
    </button>
  );
}
