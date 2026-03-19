import { formatRelativeTime } from "../utils/formatTime";

interface HeaderProps {
  lastUpdated: Date;
  onRefresh: () => void;
}

export function Header({ lastUpdated, onRefresh }: HeaderProps) {
  return (
    <header className="h-12 bg-bg-card border-b border-border-subtle flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-accent text-lg font-bold">⬡</span>
        <span className="text-text-primary text-sm font-semibold">
          Claude Viewer
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-text-muted text-xs">
          Updated {formatRelativeTime(lastUpdated.toISOString())}
        </span>
        <button
          onClick={onRefresh}
          className="bg-bg-card border border-border-visible text-text-secondary text-xs px-3 py-1 rounded hover:bg-border-subtle transition-colors cursor-pointer"
        >
          ↻ Refresh
        </button>
      </div>
    </header>
  );
}
