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
    <div className="h-screen flex flex-col bg-bg-main">
      <Header lastUpdated={lastUpdated} onRefresh={refresh} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[280px] bg-bg-sidebar border-r border-border-subtle flex flex-col shrink-0">
          <StatusFilter
            statusFilter={statusFilter}
            statusCounts={statusCounts}
            onFilterChange={setStatusFilter}
          />
          {isLoading ? (
            <div className="px-3 py-8 text-center text-text-muted text-xs">
              Loading sessions...
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
  );
}

export default App;
