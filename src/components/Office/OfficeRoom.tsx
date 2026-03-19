import { useEffect, useRef, useState } from "react";
import type { Session } from "../../types";
import { Worker } from "./Worker";
import { Pet } from "./Pet";
import { getAgentIdentity, getAgentMood, getTimeOfDay } from "../../utils/agentIdentity";
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

const statusConfig: Record<string, { label: string; color: string }> = {
  working: { label: "WORKING", color: "#34d399" },
  waiting: { label: "WAITING", color: "#fbbf24" },
  idle: { label: "SLEEPING", color: "#60a5fa" },
  stopped: { label: "OFFLINE", color: "#f87171" },
};

const TIME_WINDOWS: Record<string, { sky: string[]; light: string }> = {
  morning: { sky: ["#87CEEB", "#B0E0E6"], light: "#ffeebb33" },
  afternoon: { sky: ["#4A90D9", "#87CEEB"], light: "#fff8e022" },
  sunset: { sky: ["#FF6B6B", "#FFA07A", "#FFD700"], light: "#ffaa4422" },
  night: { sky: ["#0a0a28", "#151540"], light: "#0000" },
};

// Pixel art desk items
function DeskItem({ type }: { type: string }) {
  const items: Record<string, JSX.Element> = {
    duck: (
      <svg viewBox="0 0 10 10" width="10" height="10" style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="2" width="6" height="4" fill="#fcd34d" />
        <rect x="4" y="0" width="4" height="4" fill="#fcd34d" />
        <rect x="6" y="2" width="2" height="2" fill="#ff8800" />
        <rect x="4" y="2" width="2" height="2" fill="#111" />
      </svg>
    ),
    cactus: (
      <svg viewBox="0 0 8 12" width="8" height="12" style={{ imageRendering: "pixelated" }}>
        <rect x="3" y="2" width="2" height="8" fill="#2d8b4a" />
        <rect x="1" y="4" width="2" height="4" fill="#34a853" />
        <rect x="5" y="3" width="2" height="3" fill="#34a853" />
        <rect x="2" y="10" width="4" height="2" fill="#8b6b4a" />
      </svg>
    ),
    figure: (
      <svg viewBox="0 0 8 14" width="6" height="11" style={{ imageRendering: "pixelated" }}>
        <rect x="3" y="0" width="2" height="2" fill="#ff4466" />
        <rect x="2" y="2" width="4" height="4" fill="#4466ff" />
        <rect x="1" y="3" width="1" height="3" fill="#4466ff" />
        <rect x="6" y="3" width="1" height="3" fill="#4466ff" />
        <rect x="2" y="6" width="2" height="4" fill="#333" />
        <rect x="4" y="6" width="2" height="4" fill="#333" />
      </svg>
    ),
    pizza: (
      <svg viewBox="0 0 10 8" width="10" height="8" style={{ imageRendering: "pixelated" }}>
        <rect x="1" y="2" width="8" height="4" rx="1" fill="#e8a050" />
        <rect x="2" y="3" width="2" height="2" fill="#cc3333" />
        <rect x="5" y="3" width="2" height="2" fill="#cc3333" />
        <rect x="1" y="1" width="8" height="2" fill="#ffd34d" />
      </svg>
    ),
    headphones: (
      <svg viewBox="0 0 12 10" width="10" height="8" style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="8" height="2" fill="#333" />
        <rect x="0" y="2" width="3" height="4" fill="#333" />
        <rect x="9" y="2" width="3" height="4" fill="#333" />
        <rect x="0" y="3" width="2" height="2" fill="#666" />
        <rect x="10" y="3" width="2" height="2" fill="#666" />
      </svg>
    ),
    snack: (
      <svg viewBox="0 0 10 8" width="10" height="8" style={{ imageRendering: "pixelated" }}>
        <rect x="1" y="1" width="8" height="6" fill="#e84393" />
        <rect x="2" y="0" width="6" height="2" fill="#fd79a8" />
        <rect x="3" y="3" width="4" height="2" fill="#fff" />
      </svg>
    ),
    "stress-ball": (
      <svg viewBox="0 0 8 8" width="8" height="8" style={{ imageRendering: "pixelated" }}>
        <rect x="1" y="1" width="6" height="6" rx="3" fill="#ff6b6b" />
        <rect x="2" y="2" width="2" height="2" fill="#ff8888" />
      </svg>
    ),
    bobble: (
      <svg viewBox="0 0 8 14" width="6" height="11" style={{ imageRendering: "pixelated" }}>
        <rect x="2" y="0" width="4" height="4" fill="#fcd34d" />
        <rect x="3" y="1" width="1" height="1" fill="#111" />
        <rect x="3" y="4" width="2" height="2" fill="#fcd34d" />
        <rect x="1" y="6" width="6" height="6" fill="#4466cc" />
      </svg>
    ),
    photo: (
      <svg viewBox="0 0 12 10" width="10" height="8" style={{ imageRendering: "pixelated" }}>
        <rect x="0" y="0" width="12" height="10" fill="#8b6b4a" />
        <rect x="1" y="1" width="10" height="8" fill="#aaeeff" />
        <rect x="3" y="3" width="3" height="4" fill="#ff9999" />
        <rect x="6" y="5" width="4" height="3" fill="#66bb66" />
      </svg>
    ),
    "cat-mug": (
      <svg viewBox="0 0 10 10" width="10" height="10" style={{ imageRendering: "pixelated" }}>
        <rect x="1" y="2" width="6" height="6" fill="#e8e0d8" />
        <rect x="2" y="8" width="4" height="2" fill="#e8e0d8" />
        <rect x="7" y="3" width="2" height="3" fill="#e8e0d8" />
        <rect x="2" y="0" width="2" height="2" fill="#e8e0d8" />
        <rect x="4" y="0" width="2" height="2" fill="#e8e0d8" />
        <rect x="2" y="4" width="1" height="1" fill="#111" />
        <rect x="5" y="4" width="1" height="1" fill="#111" />
      </svg>
    ),
    "coffee2": (
      <svg viewBox="0 0 10 12" width="8" height="10" style={{ imageRendering: "pixelated" }}>
        <rect x="1" y="4" width="6" height="6" fill="#44aa44" />
        <rect x="2" y="10" width="4" height="2" fill="#44aa44" />
        <rect x="7" y="5" width="2" height="3" fill="#44aa44" />
        <rect x="3" y="6" width="2" height="2" fill="#fff" />
      </svg>
    ),
    plant: (
      <svg viewBox="0 0 8 12" width="8" height="12" style={{ imageRendering: "pixelated" }}>
        <rect x="3" y="4" width="2" height="6" fill="#2d8b4a" />
        <rect x="1" y="2" width="2" height="3" fill="#34a853" />
        <rect x="5" y="1" width="2" height="4" fill="#4cba6a" />
        <rect x="2" y="10" width="4" height="2" fill="#c8885a" />
      </svg>
    ),
  };
  return items[type] || items.duck;
}

export function OfficeRoom({ session, isSelected, onClick, index }: OfficeRoomProps) {
  const identity = getAgentIdentity(session.id, session.project);
  const worker = getWorkerAppearance(session.id);
  const mood = getAgentMood(session.toolCallCount, session.messageCount, session.status);
  const status = statusConfig[session.status] || statusConfig.waiting;
  const timeOfDay = getTimeOfDay();
  const timeWindow = TIME_WINDOWS[timeOfDay];
  const isWorking = session.status === "working";
  const isIdle = session.status === "idle";
  const prevStatusRef = useRef(session.status);
  const [showConfetti, setShowConfetti] = useState(false);

  // Confetti when going from working → waiting
  useEffect(() => {
    if (prevStatusRef.current === "working" && session.status === "waiting") {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = session.status;
  }, [session.status]);

  // Thought bubble — truncate last user message
  const lastUserMsg = session.lastMessage?.role === "user" ? session.lastMessage.content : null;
  const thoughtText = lastUserMsg
    ? (lastUserMsg.length > 25 ? lastUserMsg.slice(0, 25) + "..." : lastUserMsg)
    : null;

  // Plant size based on session duration
  const sessionAge = session.startedAt
    ? (Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60
    : 0;
  const plantScale = Math.min(1.5, 0.6 + sessionAge / 120);

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
      }}
    >
      {/* ===== Room Scene ===== */}
      <div className="relative w-full h-56 overflow-hidden scanlines">

        {/* Wall */}
        <div className="absolute inset-0" style={{
          background: timeOfDay === "night"
            ? "linear-gradient(180deg, #12122a, #181838)"
            : "linear-gradient(180deg, #252555, #2a2a5a)",
        }} />

        {/* Wallpaper dots */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }} />

        {/* === WINDOW with real time of day === */}
        <div className="absolute top-3 right-4 w-14 h-16" style={{
          background: "#0f0f23",
          border: "4px solid #3a3a6a",
          boxShadow: "inset -2px -2px 0 #0f0f23, inset 2px 2px 0 #4a4a8a",
        }}>
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2" style={{ background: "#3a3a6a" }} />
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2" style={{ background: "#3a3a6a" }} />

          <div className="absolute inset-1" style={{
            background: timeOfDay === "sunset"
              ? `linear-gradient(180deg, ${timeWindow.sky[0]}, ${timeWindow.sky[1]}, ${timeWindow.sky[2]})`
              : `linear-gradient(180deg, ${timeWindow.sky[0]}, ${timeWindow.sky[1]})`,
          }}>
            {timeOfDay === "night" && (
              <>
                <div className="absolute top-1 left-2 w-1 h-1" style={{ background: "#fff", opacity: 0.6 }} />
                <div className="absolute top-3 right-1 w-1 h-1" style={{ background: "#fff", opacity: 0.4 }} />
                <div className="absolute top-2 left-5 w-1 h-1" style={{ background: "#fcd34d", opacity: 0.5 }} />
                {/* Moon */}
                <div className="absolute top-1 right-2 w-3 h-3 rounded-full" style={{ background: "#ffeebb", opacity: 0.3 }} />
              </>
            )}
            {timeOfDay === "morning" && (
              <>
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full" style={{ background: "#fcd34d", opacity: 0.4 }} />
                <div className="absolute top-5 left-0 w-4 h-1" style={{ background: "#fff", opacity: 0.2 }} />
              </>
            )}
            {timeOfDay === "afternoon" && (
              <>
                <div className="absolute top-2 left-1 w-3 h-1" style={{ background: "#fff", opacity: 0.2 }} />
                <div className="absolute top-5 right-0 w-4 h-1" style={{ background: "#fff", opacity: 0.15 }} />
              </>
            )}
            {timeOfDay === "sunset" && (
              <div className="absolute bottom-0 left-0 right-0 h-4" style={{ background: "#FF6B6B33" }} />
            )}
          </div>

          {/* Window light cast */}
          {timeWindow.light !== "#0000" && (
            <div className="absolute -left-8 top-0 w-20 h-20 pointer-events-none" style={{
              background: `radial-gradient(ellipse at 80% 30%, ${timeWindow.light}, transparent 70%)`,
            }} />
          )}
        </div>

        {/* Lamp glow (working) */}
        {isWorking && (
          <div className="absolute top-6 left-10 w-28 h-28 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 40% 30%, #fcd34d15, transparent 60%)",
          }} />
        )}

        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-16" style={{ background: "#1a1535" }}>
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

        {/* === Wall art === */}
        <div className="absolute top-4 left-4 w-10 h-8" style={{
          background: identity.gradientFrom + "33",
          border: "3px solid #3a3a6a",
          boxShadow: "inset -2px -2px 0 #0f0f23",
        }}>
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: identity.gradientTo + "22" }} />
        </div>

        {/* === DESK === */}
        <div className="absolute bottom-10 left-2 right-14">
          <div className="h-4" style={{
            background: "linear-gradient(90deg, #8b6b4a, #a07850, #8b6b4a)",
            boxShadow: "inset -2px -2px 0 #5a4530, inset 2px 2px 0 #b8955e, 0 4px 0 #5a4530",
          }} />
          <div className="h-8" style={{
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
            <div className="absolute inset-1" style={{ background: isIdle ? "#0a0a0a" : "#0f1b2d" }}>
              {isWorking && (
                <div className="p-1" style={{ animation: "screen-glow 2s ease-in-out infinite" }}>
                  <div className="h-[2px] w-10 mb-1" style={{ background: "#4ade80", opacity: 0.5 }} />
                  <div className="h-[2px] w-6 mb-1" style={{ background: "#60a5fa", opacity: 0.4 }} />
                  <div className="h-[2px] w-12 mb-1" style={{ background: "#4ade80", opacity: 0.4 }} />
                  <div className="h-[2px] w-4 mb-1" style={{ background: "#c084fc", opacity: 0.3 }} />
                  <div className="h-[2px] w-8" style={{ background: "#fbbf24", opacity: 0.3 }} />
                </div>
              )}
            </div>
          </div>
          <div className="w-3 h-2 mx-auto" style={{ background: "#333" }} />
          <div className="w-6 h-1 mx-auto" style={{ background: "#333" }} />
        </div>

        {/* === DESK ITEM (random per agent) === */}
        <div className="absolute bottom-14 left-28">
          <DeskItem type={identity.deskItem.emoji} />
        </div>

        {/* === COFFEE (working only) === */}
        {isWorking && (
          <div className="absolute bottom-14 right-18">
            <div className="w-3 h-3" style={{
              background: "#e8e8e8",
              boxShadow: "inset -1px -1px 0 #aaa, inset 1px 1px 0 #fff",
            }}>
              <div className="absolute bottom-[2px] left-[2px] right-[2px] h-1.5" style={{ background: "#3a2a1a" }} />
            </div>
            <div className="absolute -top-2 left-0 w-1 h-1" style={{
              background: "#fff", opacity: 0.3,
              animation: "steam 2s steps(4) infinite",
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
            mood={mood}
            skinColor={worker.skinColor}
            shirtColor={worker.shirtColor}
            hairColor={worker.hairColor}
            pantsColor={worker.pantsColor}
          />
        </div>

        {/* === THOUGHT BUBBLE === */}
        {thoughtText && !isIdle && (
          <div className="absolute top-2 left-16 max-w-[120px]" style={{
            animation: "thought-appear 0.3s ease-out both",
          }}>
            <div className="px-2 py-1 rounded" style={{
              background: "#ffffffee",
              border: "2px solid #333",
              boxShadow: "2px 2px 0 #0f0f23",
            }}>
              <span style={{
                fontFamily: "var(--font-body)",
                fontSize: "10px",
                color: "#1a1a2e",
                lineHeight: "1.2",
                display: "block",
              }}>
                "{thoughtText}"
              </span>
            </div>
            {/* Bubble tail dots */}
            <div className="flex gap-1 ml-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#fff", border: "1px solid #333" }} />
              <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "#fff", border: "1px solid #333" }} />
            </div>
          </div>
        )}

        {/* === PET === */}
        <div className="absolute bottom-3 right-3">
          <Pet type={identity.petType} isAsleep={isIdle} />
        </div>

        {/* === GROWING PLANT === */}
        <div className="absolute bottom-3 right-14" style={{ transform: `scale(${plantScale})`, transformOrigin: "bottom center" }}>
          <div className="w-4 h-3" style={{
            background: "#8b6b4a",
            boxShadow: "inset -1px -1px 0 #5a4530, inset 1px 1px 0 #b8955e",
          }} />
          <div className="absolute -top-3 left-0 w-4 h-4" style={{ background: "#2d8b4a" }} />
          <div className="absolute -top-5 left-0.5 w-3 h-3" style={{ background: "#34a853" }} />
          {plantScale > 1 && (
            <div className="absolute -top-7 left-1 w-2 h-3" style={{ background: "#4cba6a" }} />
          )}
          {plantScale > 1.3 && (
            <>
              <div className="absolute -top-6 left-3 w-2 h-2" style={{ background: "#ff6b88" }} />
            </>
          )}
        </div>

        {/* === ERROR ALERT OVERLAY === */}
        {session.errorCount > 0 && (
          <div className="absolute top-2 left-2 px-2 py-1" style={{
            background: "#ff222288",
            border: "2px solid #ff4444",
            boxShadow: "2px 2px 0 #0a0a1a",
            animation: "status-blink 2s steps(2) infinite",
          }}>
            <span style={{ fontFamily: "var(--font-pixel)", fontSize: "5px", color: "#fff" }}>
              {session.errorCount} ERROR{session.errorCount > 1 ? "S" : ""}
            </span>
          </div>
        )}

        {/* === CONFETTI === */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5"
                style={{
                  background: ["#ff4466", "#fcd34d", "#4ade80", "#60a5fa", "#c084fc", "#ff8844"][i % 6],
                  left: `${10 + Math.random() * 80}%`,
                  top: "-4px",
                  animation: `confetti-fall ${1 + Math.random() * 1.5}s ease-out ${Math.random() * 0.5}s both`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== Info Bar ===== */}
      <div className="px-4 py-3" style={{
        background: "#12122a",
        borderTop: "4px solid #2e2e5e",
      }}>
        {/* Row 1: Name + Status */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "10px",
              color: "#e8e8f0",
              letterSpacing: "0.5px",
            }}>
              {identity.displayName}
            </span>
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              color: "#8888aa",
              marginLeft: "8px",
            }}>
              {identity.funnyName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm" style={{
              background: status.color,
              boxShadow: `0 0 6px ${status.color}`,
              animation: isWorking ? "status-blink 1s steps(2) infinite" : "none",
            }} />
            <span style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "8px",
              color: status.color,
              letterSpacing: "0.5px",
            }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Row 2: XP Bar */}
        <div className="flex items-center gap-2 mb-2">
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: "16px",
            color: mood === "happy" ? "#fcd34d" : mood === "stressed" ? "#ff4444" : mood === "tired" ? "#60a5fa" : "#a0a0c0",
          }}>
            {mood === "happy" ? ":)" : mood === "stressed" ? ">.<" : mood === "tired" ? "-_-" : mood === "focused" ? "o_o" : "~_~"}
          </span>
          <div className="flex-1 h-3 relative" style={{
            background: "#0f0f23",
            border: "2px solid #2e2e5e",
          }}>
            <div className="absolute inset-0" style={{
              background: status.color,
              width: isWorking ? "90%" : session.status === "waiting" ? "50%" : "20%",
              opacity: 0.6,
              transition: "width 0.5s",
            }} />
          </div>
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            color: "#8888aa",
          }}>
            {formatRelativeTime(session.lastActivityAt)}
          </span>
        </div>

        {/* Row 3: Stats chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cost chip */}
          {session.tokenUsage && session.tokenUsage.estimatedCostUsd > 0 && (
            <div className="flex items-center gap-1 px-2 py-1" style={{
              background: session.tokenUsage.estimatedCostUsd > 0.5 ? "#fbbf2422" : "#1e1e3f",
              border: `2px solid ${session.tokenUsage.estimatedCostUsd > 0.5 ? "#fbbf2444" : "#2e2e5e"}`,
            }}>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: "7px", color: "#fbbf24" }}>
                ${session.tokenUsage.estimatedCostUsd.toFixed(2)}
              </span>
            </div>
          )}

          {/* Tokens chip */}
          {session.tokenUsage && session.tokenUsage.totalTokens > 0 && (
            <div className="flex items-center gap-1 px-2 py-1" style={{
              background: "#1e1e3f",
              border: "2px solid #2e2e5e",
            }}>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: "7px", color: "#a78bfa" }}>
                {Math.round(session.tokenUsage.totalTokens / 1000)}K TKN
              </span>
            </div>
          )}

          {/* Tool calls chip */}
          {session.toolCallCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1" style={{
              background: "#1e1e3f",
              border: "2px solid #2e2e5e",
            }}>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: "7px", color: "#34d399" }}>
                {session.toolCallCount} TOOLS
              </span>
            </div>
          )}

          {/* Error chip */}
          {session.errorCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1" style={{
              background: "#ff444422",
              border: "2px solid #ff444444",
              animation: "status-blink 2s steps(2) infinite",
            }}>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: "7px", color: "#ff4444" }}>
                {session.errorCount} ERR
              </span>
            </div>
          )}

          {/* Git chip */}
          {session.gitInfo && session.gitInfo.branch && (
            <div className="flex items-center gap-1 px-2 py-1" style={{
              background: "#1e1e3f",
              border: "2px solid #2e2e5e",
            }}>
              <span style={{ fontFamily: "var(--font-pixel)", fontSize: "7px", color: "#7c3aed" }}>
                {session.gitInfo.branch.length > 12
                  ? session.gitInfo.branch.slice(0, 12) + ".."
                  : session.gitInfo.branch}
              </span>
              {session.gitInfo.uncommittedChanges > 0 && (
                <span style={{ fontFamily: "var(--font-pixel)", fontSize: "7px", color: "#fbbf24" }}>
                  +{session.gitInfo.uncommittedChanges}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Notes indicator */}
        {session.notes && session.notes.length > 0 && (
          <div className="mt-2 px-2 py-1" style={{
            background: "#fcd34d11",
            border: "1px solid #fcd34d33",
          }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#fcd34d" }}>
              📌 {session.notes[session.notes.length - 1].text.slice(0, 50)}{session.notes[session.notes.length - 1].text.length > 50 ? "..." : ""}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
