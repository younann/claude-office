import { useSessions } from "./hooks/useSessions";
import { OfficeRoom } from "./components/Office/OfficeRoom";
import { OfficeDetail } from "./components/Office/OfficeDetail";
import { formatRelativeTime } from "./utils/formatTime";
import { useEffect, useState } from "react";

function App() {
  const {
    sessions,
    selectedSession,
    selectedId,
    statusCounts,
    lastUpdated,
    isLoading,
    selectSession,
    refresh,
  } = useSessions();

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0f0f23" }}>
      {/* ===== GAME HEADER ===== */}
      <header className="px-6 py-4 flex items-center justify-between" style={{
        background: "#12122a",
        borderBottom: "4px solid #2e2e5e",
        boxShadow: "0 4px 0 #0a0a1a",
      }}>
        <div className="flex items-center gap-4">
          {/* Logo — pixel building */}
          <div className="w-10 h-10 relative" style={{
            background: "#7c3aed",
            boxShadow: "inset -3px -3px 0 #5b2db8, inset 3px 3px 0 #9d5cf5, 4px 4px 0 #0f0f23",
          }}>
            {/* Windows on building */}
            <div className="absolute top-1 left-1 w-2 h-2" style={{ background: "#fcd34d" }} />
            <div className="absolute top-1 right-1 w-2 h-2" style={{ background: "#fcd34d" }} />
            <div className="absolute bottom-2 left-1 w-2 h-2" style={{ background: "#fcd34d" }} />
            <div className="absolute bottom-2 right-1 w-2 h-2" style={{ background: "#0f0f23" }} />
          </div>

          <div>
            <h1 style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "12px",
              color: "#fcd34d",
              letterSpacing: "1px",
              textShadow: "2px 2px 0 #0f0f23",
            }}>
              CLAUDE OFFICE
            </h1>
            <div style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "#606080",
              marginTop: "2px",
            }}>
              {statusCounts.all} agents on floor
              {statusCounts.working > 0 && (
                <span style={{ color: "#34d399" }}> &bull; {statusCounts.working} active</span>
              )}
              {statusCounts.waiting > 0 && (
                <span style={{ color: "#fbbf24" }}> &bull; {statusCounts.waiting} idle</span>
              )}
              {statusCounts.idle > 0 && (
                <span style={{ color: "#60a5fa" }}> &bull; {statusCounts.idle} asleep</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* Game clock */}
          <div style={{
            fontFamily: "var(--font-body)",
            fontSize: "18px",
            color: "#a0a0c0",
          }}>
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </div>

          {/* Sync indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2" style={{
              background: "#34d399",
              boxShadow: "0 0 6px #34d399",
            }} />
            <span style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "#606080",
            }}>
              {formatRelativeTime(lastUpdated.toISOString())}
            </span>
          </div>

          <button
            onClick={refresh}
            className="cursor-pointer transition-transform duration-100 active:translate-y-0.5"
            style={{
              fontFamily: "var(--font-pixel)",
              fontSize: "8px",
              color: "#e8e8f0",
              background: "#7c3aed",
              padding: "8px 16px",
              border: "none",
              boxShadow: "inset -2px -2px 0 #5b2db8, inset 2px 2px 0 #9d5cf5, 4px 4px 0 #0f0f23",
              letterSpacing: "1px",
            }}
          >
            REFRESH
          </button>
        </div>
      </header>

      {/* ===== OFFICE FLOOR ===== */}
      <main className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 76px)" }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "10px",
                color: "#fcd34d",
                animation: "status-blink 1s steps(2) infinite",
              }}>
                SCANNING OFFICES...
              </div>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="mb-4" style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "24px",
                color: "#2e2e5e",
              }}>
                ?
              </div>
              <div style={{
                fontFamily: "var(--font-pixel)",
                fontSize: "10px",
                color: "#606080",
              }}>
                NO AGENTS FOUND
              </div>
              <div style={{
                fontFamily: "var(--font-body)",
                fontSize: "16px",
                color: "#404060",
                marginTop: "8px",
              }}>
                Start a Claude session to see workers here
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {sessions.map((session, i) => (
              <OfficeRoom
                key={session.id}
                session={session}
                isSelected={session.id === selectedId}
                onClick={() => selectSession(session.id)}
                index={i}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selectedSession && (
        <OfficeDetail
          session={selectedSession}
          onClose={() => selectSession(null)}
          onRefresh={() => { refresh(); if (selectedId) selectSession(selectedId); }}
        />
      )}
    </div>
  );
}

export default App;
