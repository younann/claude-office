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
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #12132a, #1a1b2e, #1e1f35)" }}>
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-3xl">🏢</div>
          <div>
            <h1
              className="text-xl font-extrabold tracking-tight"
              style={{ color: "#e0e2f0" }}
            >
              The Office
            </h1>
            <p className="text-[11px] mt-0.5" style={{ color: "#555577" }}>
              {statusCounts.all} agents on the floor
              {statusCounts.working > 0 && (
                <> &middot; <span style={{ color: "#00b894" }}>{statusCounts.working} working</span></>
              )}
              {statusCounts.waiting > 0 && (
                <> &middot; <span style={{ color: "#fdcb6e" }}>{statusCounts.waiting} waiting</span></>
              )}
              {statusCounts.idle > 0 && (
                <> &middot; <span style={{ color: "#74b9ff" }}>{statusCounts.idle} napping</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div
            className="text-[11px]"
            style={{ fontFamily: "var(--font-mono)", color: "#444466" }}
          >
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00b894]" style={{ boxShadow: "0 0 4px #00b894" }} />
            <span className="text-[10px]" style={{ fontFamily: "var(--font-mono)", color: "#555577" }}>
              Synced {formatRelativeTime(lastUpdated.toISOString())}
            </span>
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #6c5ce722, #6c5ce711)",
              border: "1px solid #6c5ce744",
              color: "#a29bfe",
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Floor / grid of offices */}
      <main className="flex-1 px-8 pb-8 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm" style={{ color: "#555577" }}>
                Looking around the office...
              </p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-5xl mb-4">🏚️</div>
              <p className="text-lg font-semibold mb-1" style={{ color: "#555577" }}>
                Office is empty
              </p>
              <p className="text-xs" style={{ color: "#444466" }}>
                No active Claude sessions running
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
        />
      )}
    </div>
  );
}

export default App;
