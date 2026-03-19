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

function getWorkerAppearance(sessionId: string) {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = (hash << 5) - hash + sessionId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  const skins = ["#f5cba7", "#e8b88a", "#d4a574", "#c49060", "#a0785a", "#fde3cd", "#dbb99b"];
  const shirts = ["#6c5ce7", "#00b894", "#e17055", "#0984e3", "#fd79a8", "#e84393", "#00cec9", "#a29bfe", "#55a3e8", "#2ecc71"];
  const hairs = ["#2d3436", "#5d4037", "#f9a825", "#d63031", "#b33939", "#1e272e", "#e8d5b7", "#784212"];
  const styles: Array<"short" | "long" | "spiky" | "bun"> = ["short", "long", "spiky", "bun"];
  const pants = ["#2d3436", "#34495e", "#2c3e50", "#1a1a2e", "#3d3d5c", "#2e4057"];

  return {
    skinColor: skins[hash % skins.length],
    shirtColor: shirts[(hash >> 4) % shirts.length],
    hairColor: hairs[(hash >> 8) % hairs.length],
    hairStyle: styles[(hash >> 12) % styles.length],
    pantsColor: pants[(hash >> 16) % pants.length],
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  working: { label: "Working", color: "#00b894" },
  waiting: { label: "Waiting", color: "#fdcb6e" },
  idle: { label: "Sleeping", color: "#74b9ff" },
  stopped: { label: "Gone", color: "#ff7675" },
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
      className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 group text-left"
      style={{
        animation: `card-enter 0.5s ease-out ${index * 100}ms both`,
        background: isSelected
          ? "linear-gradient(160deg, #282b55, #1e2045)"
          : "linear-gradient(160deg, #1f2142, #191b38)",
        border: isSelected ? `2px solid ${identity.accentColor}44` : "2px solid #2a2d5022",
        boxShadow: isSelected
          ? `0 12px 40px ${identity.accentColor}15, 0 0 0 1px ${identity.accentColor}11`
          : "0 4px 20px #00000040",
      }}
    >
      {/* ===== Room Scene ===== */}
      <div className="relative w-full h-52 overflow-hidden">

        {/* === WALL === */}
        <div className="absolute inset-0" style={{
          background: isIdle
            ? "linear-gradient(180deg, #13152c 0%, #181a34 50%, #1c1e3a 100%)"
            : "linear-gradient(180deg, #1e2148 0%, #22254c 50%, #262952 100%)",
        }} />

        {/* Wall texture — subtle horizontal lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 8px, #ffffff 8px, #ffffff 9px)",
        }} />

        {/* === WINDOW === */}
        <div className="absolute top-4 right-5 w-16 h-20 rounded-sm" style={{
          background: "#282b55",
          border: "3px solid #3a3d66",
          boxShadow: isIdle ? "none" : "inset 0 0 20px #5566aa15, 0 0 15px #5566aa08",
        }}>
          {/* Window frame cross */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2" style={{ background: "#3a3d66" }} />
          <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2" style={{ background: "#3a3d66" }} />

          {/* Sky / outside */}
          <div className="absolute inset-[2px]" style={{
            background: isIdle
              ? "linear-gradient(180deg, #0a0c22 0%, #141633 100%)"
              : "linear-gradient(180deg, #3a5088 0%, #5a7ab8 50%, #7a9ad8 100%)",
          }} />

          {isIdle ? (
            // Night sky with stars & moon
            <>
              <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-white/50" />
              <div className="absolute top-6 right-2 w-0.5 h-0.5 rounded-full bg-white/40" />
              <div className="absolute top-4 left-5 w-0.5 h-0.5 rounded-full bg-white/30" />
              <div className="absolute top-2 right-4 w-3 h-3 rounded-full bg-yellow-100/20" />
              <div className="absolute top-1.5 right-3.5 w-3 h-3 rounded-full bg-[#141633]" />
            </>
          ) : (
            // Daylight — clouds
            <>
              <div className="absolute top-3 left-1 w-4 h-1.5 rounded-full bg-white/15" />
              <div className="absolute top-5 right-1 w-3 h-1 rounded-full bg-white/10" />
            </>
          )}

          {/* Window sill */}
          <div className="absolute -bottom-1 -left-1 -right-1 h-2 rounded-b-sm" style={{ background: "#3a3d66" }} />
        </div>

        {/* === LAMP LIGHT (working) === */}
        {isWorking && (
          <>
            {/* Desk lamp cone of light */}
            <div className="absolute top-6 left-8 w-36 h-36 pointer-events-none" style={{
              background: "radial-gradient(ellipse at 30% 20%, #ffeaa718 0%, #ffeaa708 40%, transparent 70%)",
            }} />
            {/* Monitor glow on wall */}
            <div className="absolute top-8 left-10 w-20 h-16 pointer-events-none" style={{
              background: "radial-gradient(ellipse, #6c88cc0a 0%, transparent 70%)",
            }} />
          </>
        )}

        {/* === FLOOR === */}
        <div className="absolute bottom-0 left-0 right-0 h-20" style={{
          background: "linear-gradient(180deg, transparent 0%, #15172d 30%, #12142a 100%)",
        }} />
        {/* Floor boards — subtle */}
        <div className="absolute bottom-0 left-0 right-0 h-14 opacity-[0.04]" style={{
          backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 30px, #ffffff 30px, #ffffff 31px)",
        }} />

        {/* === WALL DECORATIONS === */}

        {/* Picture frame on wall */}
        <div className="absolute top-5 left-5 w-10 h-8 rounded-sm" style={{
          border: "2px solid #3a3d5e",
          background: "linear-gradient(135deg, #2a2d4e, #252850)",
        }}>
          {/* Abstract "art" inside */}
          <div className="absolute inset-1 overflow-hidden rounded-sm">
            <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: `${identity.gradientFrom}15` }} />
            <div className="absolute top-1 left-1 w-2 h-2 rounded-full" style={{ background: `${identity.gradientTo}20` }} />
          </div>
        </div>

        {/* Clock on wall */}
        <div className="absolute top-6 left-20">
          <div className="w-5 h-5 rounded-full" style={{ border: "1.5px solid #3a3d5e", background: "#222444" }}>
            <div className="absolute top-1/2 left-1/2 w-[1px] h-1.5 bg-white/30 -translate-x-1/2 origin-bottom" style={{ transform: "translateX(-50%) rotate(45deg)" }} />
            <div className="absolute top-1/2 left-1/2 w-[1px] h-1 bg-white/20 -translate-x-1/2 origin-bottom" style={{ transform: "translateX(-50%) rotate(180deg)" }} />
          </div>
        </div>

        {/* === DESK === */}
        <div className="absolute bottom-10 left-4 right-20">
          {/* Desktop surface — wood grain */}
          <div className="h-4 rounded-t-[3px] relative overflow-hidden" style={{
            background: "linear-gradient(90deg, #5a4d3a, #665840, #5a4d3a, #4e4232)",
            boxShadow: "0 2px 6px #00000055, inset 0 1px 0 #7a6a5233",
          }}>
            {/* Wood grain lines */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 12px, #00000020 12px, #00000020 13px)",
            }} />
          </div>
          {/* Front panel */}
          <div className="h-10 mx-1" style={{
            background: "linear-gradient(180deg, #4a3f2e, #3d3425)",
            boxShadow: "inset 0 1px 0 #5a4d3a44",
          }}>
            {/* Drawer handle */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full" style={{ background: "#6a5d48" }} />
          </div>
        </div>

        {/* === KEYBOARD === */}
        <div className="absolute bottom-16 left-14 w-14 h-4 rounded-sm" style={{
          background: "linear-gradient(180deg, #333, #2a2a2a)",
          boxShadow: "0 1px 2px #00000044",
        }}>
          {/* Key rows */}
          <div className="flex flex-wrap gap-[1px] p-[2px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-[3px] h-[3px] rounded-[0.5px]" style={{
                background: isWorking && i % 3 === Math.floor(Date.now() / 200) % 3 ? "#555" : "#3a3a3a",
              }} />
            ))}
          </div>
        </div>

        {/* === MOUSE === */}
        <div className="absolute bottom-15 left-30">
          <div className="w-2.5 h-3.5 rounded-full" style={{
            background: "linear-gradient(180deg, #444, #333)",
            boxShadow: "0 1px 2px #00000033",
          }} />
        </div>

        {/* === MONITOR === */}
        <div className="absolute bottom-17 left-10">
          {/* Screen bezel */}
          <div className="w-20 h-14 rounded-[3px] relative" style={{
            background: "#1a1a1a",
            border: "2px solid #2a2a2a",
            boxShadow: isWorking
              ? `0 0 20px ${identity.accentColor}11, 0 2px 8px #00000066`
              : "0 2px 8px #00000066",
          }}>
            {/* Screen */}
            <div className="absolute inset-[2px] rounded-[1px] overflow-hidden" style={{
              background: isIdle ? "#0a0a0a" : "#111827",
            }}>
              {isWorking && (
                <div className="p-1.5" style={{ animation: "screen-flicker 3s ease-in-out infinite" }}>
                  <div className="h-[1.5px] w-12 rounded mb-[3px]" style={{ background: "#4ade80", opacity: 0.4 }} />
                  <div className="h-[1.5px] w-8 rounded mb-[3px]" style={{ background: "#60a5fa", opacity: 0.3 }} />
                  <div className="h-[1.5px] w-14 rounded mb-[3px]" style={{ background: "#4ade80", opacity: 0.35 }} />
                  <div className="h-[1.5px] w-6 rounded mb-[3px]" style={{ background: "#c084fc", opacity: 0.3 }} />
                  <div className="h-[1.5px] w-10 rounded mb-[3px]" style={{ background: "#60a5fa", opacity: 0.25 }} />
                  <div className="h-[1.5px] w-4 rounded" style={{ background: "#fbbf24", opacity: 0.3 }} />
                </div>
              )}
              {isWaiting && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-5 rounded-sm" style={{ border: "1px solid #333", background: "#161616" }}>
                    <div className="w-full h-full flex items-center justify-center text-[5px]" style={{ color: "#444" }}>
                      ▶
                    </div>
                  </div>
                </div>
              )}
              {isIdle && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#333" }} />
                </div>
              )}
            </div>
            {/* Screen reflection */}
            <div className="absolute top-1 left-1 w-6 h-8 rounded-sm opacity-[0.03] bg-white rotate-12" />
          </div>
          {/* Monitor stand */}
          <div className="w-3 h-3 mx-auto" style={{ background: "#222" }} />
          <div className="w-8 h-1.5 mx-auto rounded-[2px]" style={{
            background: "linear-gradient(180deg, #2a2a2a, #222)",
          }} />
        </div>

        {/* === DESK LAMP === */}
        {isWorking && (
          <div className="absolute bottom-15 right-22">
            {/* Lamp base */}
            <div className="w-4 h-1 rounded-full mx-auto" style={{ background: "#444" }} />
            {/* Lamp arm */}
            <div className="w-[2px] h-8 mx-auto -mt-8" style={{ background: "#555", transform: "rotate(-15deg)" }} />
            {/* Lamp head */}
            <div className="w-5 h-2 rounded-t-full -mt-1 ml-1" style={{
              background: "linear-gradient(180deg, #666, #444)",
            }} />
            {/* Light glow */}
            <div className="w-8 h-3 -mt-0 -ml-0.5 rounded-b-full" style={{
              background: "radial-gradient(ellipse, #ffeaa730 0%, transparent 80%)",
            }} />
          </div>
        )}

        {/* === COFFEE MUG === */}
        {(isWorking || isWaiting) && (
          <div className="absolute bottom-14 right-24">
            <div className="relative">
              <div className="w-3.5 h-4 rounded-b-[3px]" style={{
                background: "linear-gradient(135deg, #e8e8e8, #ccc)",
                boxShadow: "0 1px 2px #00000033",
              }}>
                {/* Coffee fill */}
                <div className="absolute bottom-[2px] left-[2px] right-[2px] h-2 rounded-b-[2px]" style={{ background: "#3a2a1a" }} />
              </div>
              {/* Handle */}
              <div className="absolute right-[-4px] top-[3px] w-2.5 h-2.5 rounded-full" style={{ border: "1.5px solid #ccc", background: "transparent" }} />
              {/* Steam */}
              {isWorking && (
                <>
                  <div className="absolute -top-4 left-0.5 w-[2px] h-3 rounded-full" style={{
                    background: "white", opacity: 0.1,
                    animation: "steam 2.5s ease-out infinite",
                  }} />
                  <div className="absolute -top-3 left-2 w-[1.5px] h-2.5 rounded-full" style={{
                    background: "white", opacity: 0.08,
                    animation: "steam 2.5s ease-out infinite 0.7s",
                  }} />
                </>
              )}
            </div>
          </div>
        )}

        {/* === OFFICE CHAIR === */}
        <div className="absolute bottom-3 left-14">
          {/* Chair back */}
          <div className="w-12 h-12 rounded-t-xl -mb-1" style={{
            background: "linear-gradient(180deg, #4a4066, #3e3558)",
            boxShadow: "inset 0 1px 0 #5a507533",
          }} />
          {/* Seat */}
          <div className="w-14 h-3 rounded-[3px] -ml-1" style={{
            background: "linear-gradient(180deg, #4a4066, #3e3558)",
            boxShadow: "0 2px 4px #00000044",
          }} />
          {/* Chair stem */}
          <div className="w-[3px] h-4 mx-auto" style={{ background: "#333" }} />
          {/* Chair base — star shape simplified */}
          <div className="w-12 h-1.5 mx-auto rounded-full -ml-0" style={{ background: "#2a2a3a" }} />
          {/* Wheels */}
          <div className="flex justify-between w-10 mx-auto -mt-0">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#222" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#222" }} />
          </div>
        </div>

        {/* === WORKER (seated) === */}
        <div className="absolute bottom-12 left-12">
          <Worker
            status={session.status}
            skinColor={worker.skinColor}
            shirtColor={worker.shirtColor}
            hairColor={worker.hairColor}
            hairStyle={worker.hairStyle}
            pantsColor={worker.pantsColor}
          />
        </div>

        {/* === PLANT === */}
        <div className="absolute bottom-5 right-3">
          {/* Pot */}
          <div className="w-5 h-4 rounded-b-lg mx-auto" style={{
            background: "linear-gradient(135deg, #8b6b4a, #6b4f35)",
          }} />
          <div className="w-6 h-1.5 rounded-t-sm -mt-0 mx-auto" style={{ background: "#7a5c3e" }} />
          {/* Leaves */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <div className="w-5 h-5 rounded-full" style={{ background: "#2d6b3f", transform: "translateY(2px)" }} />
            <div className="w-4 h-4 rounded-full" style={{ background: "#348a4a", transform: "translate(-3px, -2px)" }} />
            <div className="w-4 h-4 rounded-full" style={{ background: "#3a9d55", transform: "translate(3px, -6px)" }} />
            <div className="w-3 h-3 rounded-full" style={{ background: "#45b560", transform: "translate(0px, -9px)" }} />
          </div>
        </div>

        {/* === BASEBOARD === */}
        <div className="absolute bottom-[3.2rem] left-0 right-0 h-[3px]" style={{ background: "#2a2d50" }} />
      </div>

      {/* ===== Info Bar ===== */}
      <div className="px-4 py-3 border-t border-[#2a2d50]/60" style={{ background: "#171930" }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-bold" style={{ color: "#e0e2f0" }}>
            {identity.displayName}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="w-2 h-2 rounded-full" style={{ background: status.color }} />
              {session.status === "working" && (
                <div className="absolute inset-0 w-2 h-2 rounded-full" style={{
                  background: status.color,
                  animation: "status-pulse 2s infinite",
                }} />
              )}
            </div>
            <span className="text-[10px] font-semibold" style={{ color: status.color }}>
              {status.label}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px]" style={{ fontFamily: "var(--font-mono)", color: "#555577" }}>
            {identity.codename}
          </span>
          <span className="text-[9px]" style={{ fontFamily: "var(--font-mono)", color: "#3d3d5c" }}>
            {formatRelativeTime(session.lastActivityAt)}
          </span>
        </div>
      </div>

      {/* Hover highlight */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
        background: `linear-gradient(180deg, ${identity.accentColor}05, transparent)`,
        boxShadow: `0 0 30px ${identity.accentColor}08`,
      }} />
    </button>
  );
}
