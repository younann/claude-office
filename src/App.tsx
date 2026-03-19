import { useSessions } from "./hooks/useSessions";
import { Header } from "./components/Header";
import { StatusFilter } from "./components/Sidebar/StatusFilter";
import { SessionList } from "./components/Sidebar/SessionList";
import { DetailPanel } from "./components/DetailPanel/DetailPanel";

function App() {
  const {
    sessions,
    selectedSession,
    selectedId,
    statusFilter,
    lastUpdated,
    isLoading,
    statusCounts,
    selectSession,
    setStatusFilter,
    refresh,
  } = useSessions();

  return (
    <div className="h-screen flex flex-col bg-bg-main relative">
      {/* Background noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <Header
          lastUpdated={lastUpdated}
          sessionCount={statusCounts.all}
          onRefresh={refresh}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-[280px] bg-bg-sidebar/80 backdrop-blur-sm border-r border-border-subtle flex flex-col shrink-0">
            <StatusFilter
              statusFilter={statusFilter}
              statusCounts={statusCounts}
              onFilterChange={setStatusFilter}
            />
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <div
                  className="text-[10px] tracking-wider uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#00f0ff",
                    animation: "typing-cursor 1s infinite",
                  }}
                >
                  SCANNING FOR AGENTS...
                </div>
              </div>
            ) : (
              <SessionList
                sessions={sessions}
                selectedId={selectedId}
                onSelectSession={selectSession}
              />
            )}
          </aside>
          {/* Detail */}
          <DetailPanel session={selectedSession} />
        </div>
      </div>
    </div>
  );
}

export default App;
