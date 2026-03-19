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

  const skins = ["#f5cba7", "#e8b88a", "#d4a574", "#c49060", "#fde3cd", "#dbb99b"];
  const shirts = ["#6c5ce7", "#00b894", "#e17055", "#0984e3", "#fd79a8", "#00cec9", "#a29bfe", "#e84393", "#2ecc71", "#f39c12"];
  const hairs = ["#2d3436", "#5d4037", "#f9a825", "#d63031", "#1e272e", "#e8d5b7", "#784212", "#b33939"];
  const pants = ["#2d3436", "#34495e", "#2c3e50", "#1a1a2e", "#2e4057"];

  return {
    skinColor: skins[hash % skins.length],
    shirtColor: shirts[(hash >> 4) % shirts.length],
    hairColor: hairs[(hash >> 8) % hairs.length],
    pantsColor: pants[(hash >> 16) % pants.length],
  };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  working: { label: "WORKING", color: "#34d399", bg: "#34d39922" },
  waiting: { label: "WAITING", color: "#fbbf24", bg: "#fbbf2422" },
  idle: { label: "SLEEPING", color: "#60a5fa", bg: "#60a5fa22" },
  stopped: { label: "OFFLINE", color: "#f87171", bg: "#f8717122" },
};

export function OfficeRoom({ session, isSelected, onClick, index }: OfficeRoomProps) {
  const identity = getAgentIdentity(session.id, session.project);
  const worker = getWorkerAppearance(session.id);
  const status = statusConfig[session.status] || statusConfig.waiting;
  const isWorking = session.status === "working";
  const isWaiting = session.status === "waiting";
  const isIdle = session.status === "idle";

  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden cursor-pointer transition-all duration-200 group text-left"
      style={{
        animation: `card-enter 0.3s ease-out ${index * 80}ms both`,
        background: "#1a1a2e",
        border: isSelected ? `4px solid ${identity.accentColor}` : "4px solid #2e2e5e",
        boxShadow: isSelected
          ? `8px 8px 0px #0f0f23, inset 0 0 30px ${identity.accentColor}11`
          : "6px 6px 0px #0f0f23",
        imageRendering: "auto",
      }}
    >
      {/* ===== Room Scene ===== */}
      <div className="relative w-full h-48 overflow-hidden scanlines">

        {/* Wall */}
        <div className="absolute inset-0" style={{
          background: isIdle
            ? "linear-gradient(180deg, #12122a, #181838)"
            : "linear-gradient(180deg, #252555, #2a2a5a)",
        }} />

        {/* Wallpaper pattern — pixel dots */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }} />

        {/* Window */}
        <div className="absolute top-3 right-4 w-14 h-16" style={{
          background: "#0f0f23",
          border: "4px solid #3a3a6a",
          boxShadow: "inset -2px -2px 0 #0f0f23, inset 2px 2px 0 #4a4a8a",
        }}>
          {/* Window cross */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2" style={{ background: "#3a3a6a" }} />
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2" style={{ background: "#3a3a6a" }} />

          {/* Sky */}
          <div className="absolute inset-1" style={{
            background: isIdle
              ? "linear-gradient(180deg, #0a0a20, #151535)"
              : "linear-gradient(180deg, #4a7ab8, #7ab4e8)",
          }}>
            {isIdle && (
              <>
                <div className="absolute top-1 left-2 w-1 h-1" style={{ background: "#fff", opacity: 0.6 }} />
                <div className="absolute top-3 right-1 w-1 h-1" style={{ background: "#fff", opacity: 0.4 }} />
                <div className="absolute top-2 left-4 w-1 h-1" style={{ background: "#fcd34d", opacity: 0.5 }} />
              </>
            )}
            {!isIdle && (
              <>
                <div className="absolute top-2 left-0 w-4 h-2" style={{ background: "#fff", opacity: 0.3 }} />
                <div className="absolute top-5 right-0 w-3 h-1" style={{ background: "#fff", opacity: 0.2 }} />
              </>
            )}
          </div>
        </div>

        {/* Warm lamp glow (working) */}
        {isWorking && (
          <div className="absolute top-6 left-10 w-28 h-28 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 40% 30%, #fcd34d15, transparent 60%)",
          }} />
        )}

        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-16" style={{
          background: "#1a1535",
        }}>
          {/* Floor tiles — checkerboard */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `
              linear-gradient(45deg, #2a2555 25%, transparent 25%),
              linear-gradient(-45deg, #2a2555 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #2a2555 75%),
              linear-gradient(-45deg, transparent 75%, #2a2555 75%)
            `,
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
          }} />
        </div>

        {/* Baseboard */}
        <div className="absolute bottom-14 left-0 right-0 h-2" style={{ background: "#3a3a6a" }} />

        {/* === Wall Art (pixel frame) === */}
        <div className="absolute top-4 left-4 w-10 h-8" style={{
          background: identity.gradientFrom + "33",
          border: "3px solid #3a3a6a",
          boxShadow: "inset -2px -2px 0 #0f0f23",
        }}>
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: identity.gradientTo + "22" }} />
        </div>

        {/* === DESK === */}
        <div className="absolute bottom-10 left-2 right-14">
          {/* Surface */}
          <div className="h-4" style={{
            background: "linear-gradient(90deg, #8b6b4a, #a07850, #8b6b4a)",
            boxShadow: "inset -2px -2px 0 #5a4530, inset 2px 2px 0 #b8955e, 0 4px 0 #5a4530",
          }} />
          {/* Front */}
          <div className="h-8 mx-0" style={{
            background: "#6b5232",
            boxShadow: "inset -2px -2px 0 #4a3822, inset 2px 0 0 #8b6b4a",
          }} />
        </div>

        {/* === MONITOR === */}
        <div className="absolute bottom-16 left-6">
          <div className="w-18 h-12 relative" style={{
            background: "#222",
            border: "3px solid #333",
            boxShadow: isWorking
              ? `0 0 12px ${identity.accentColor}33, inset -2px -2px 0 #111, inset 2px 2px 0 #444`
              : "inset -2px -2px 0 #111, inset 2px 2px 0 #444",
          }}>
            {/* Screen content */}
            <div className="absolute inset-1" style={{
              background: isIdle ? "#0a0a0a" : "#0f1b2d",
            }}>
              {isWorking && (
                <div className="p-1" style={{ animation: "screen-glow 2s ease-in-out infinite" }}>
                  <div className="h-[2px] w-10 mb-1" style={{ background: "#4ade80", opacity: 0.5 }} />
                  <div className="h-[2px] w-6 mb-1" style={{ background: "#60a5fa", opacity: 0.4 }} />
                  <div className="h-[2px] w-12 mb-1" style={{ background: "#4ade80", opacity: 0.4 }} />
                  <div className="h-[2px] w-4 mb-1" style={{ background: "#c084fc", opacity: 0.3 }} />
                  <div className="h-[2px] w-8" style={{ background: "#fbbf24", opacity: 0.3 }} />
                </div>
              )}
              {isWaiting && (
                <div className="w-full h-full flex items-center justify-center text-[6px]" style={{ color: "#333" }}>
                  &gt;_
                </div>
              )}
            </div>
          </div>
          {/* Stand */}
          <div className="w-3 h-2 mx-auto" style={{ background: "#333" }} />
          <div className="w-6 h-1 mx-auto" style={{ background: "#333" }} />
        </div>

        {/* === COFFEE === */}
        {isWorking && (
          <div className="absolute bottom-14 left-28">
            <div className="w-3 h-3" style={{
              background: "#e8e8e8",
              boxShadow: "inset -1px -1px 0 #aaa, inset 1px 1px 0 #fff",
            }}>
              <div className="absolute bottom-[2px] left-[2px] right-[2px] h-1.5" style={{ background: "#3a2a1a" }} />
            </div>
            {/* Steam pixels */}
            <div className="absolute -top-2 left-0 w-1 h-1" style={{
              background: "#fff", opacity: 0.3,
              animation: "steam 2s steps(4) infinite",
            }} />
            <div className="absolute -top-1 left-1.5 w-1 h-1" style={{
              background: "#fff", opacity: 0.2,
              animation: "steam 2s steps(4) infinite 0.5s",
            }} />
          </div>
        )}

        {/* === CHAIR === */}
        <div className="absolute bottom-2 left-10">
          <div className="w-12 h-8 -mb-1" style={{
            background: "#4a3a6e",
            boxShadow: "inset -2px -2px 0 #2a1a4e, inset 2px 2px 0 #6a5a8e",
          }} />
          <div className="w-14 h-3" style={{
            background: "#4a3a6e",
            boxShadow: "inset -2px -2px 0 #2a1a4e, inset 2px 2px 0 #6a5a8e, 0 2px 0 #2a1a4e",
          }} />
          {/* Wheels */}
          <div className="flex justify-between px-1 mt-1">
            <div className="w-2 h-2" style={{ background: "#222" }} />
            <div className="w-1 h-3" style={{ background: "#333" }} />
            <div className="w-2 h-2" style={{ background: "#222" }} />
          </div>
        </div>

        {/* === WORKER === */}
        <div className="absolute bottom-12 left-10">
          <Worker
            status={session.status}
            skinColor={worker.skinColor}
            shirtColor={worker.shirtColor}
            hairColor={worker.hairColor}
            pantsColor={worker.pantsColor}
          />
        </div>

        {/* === PLANT === */}
        <div className="absolute bottom-3 right-3">
          <div className="w-4 h-3" style={{
            background: "#8b6b4a",
            boxShadow: "inset -1px -1px 0 #5a4530, inset 1px 1px 0 #b8955e",
          }} />
          <div className="absolute -top-3 left-0 w-4 h-4" style={{ background: "#2d8b4a" }} />
          <div className="absolute -top-5 left-0.5 w-3 h-3" style={{ background: "#34a853" }} />
          <div className="absolute -top-6 left-1 w-2 h-2" style={{ background: "#4cba6a" }} />
        </div>
      </div>

      {/* ===== Info Bar (pixel style) ===== */}
      <div className="px-3 py-2.5" style={{
        background: "#12122a",
        borderTop: "4px solid #2e2e5e",
      }}>
        <div className="flex items-center justify-between mb-1.5">
          <span style={{
            fontFamily: "var(--font-pixel)",
            fontSize: "8px",
            color: "#e8e8f0",
            letterSpacing: "0.5px",
          }}>
            {identity.displayName}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2" style={{
              background: status.color,
              boxShadow: `0 0 4px ${status.color}`,
              animation: session.status === "working" ? "status-blink 1s steps(2) infinite" : "none",
            }} />
            <span style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "6px",
              color: status.color,
              letterSpacing: "0.5px",
            }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* XP bar style for activity */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 relative" style={{
            background: "#0f0f23",
            border: "1px solid #2e2e5e",
          }}>
            <div className="absolute inset-0" style={{
              background: status.color,
              width: session.status === "working" ? "90%" : session.status === "waiting" ? "50%" : "20%",
              opacity: 0.6,
              transition: "width 0.5s",
            }} />
          </div>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: "#606080",
          }}>
            {formatRelativeTime(session.lastActivityAt)}
          </span>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{
        boxShadow: `inset 0 0 20px ${identity.accentColor}15`,
      }} />
    </button>
  );
}
