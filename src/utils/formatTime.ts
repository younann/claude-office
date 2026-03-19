export function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return "\u2014";
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

export function formatDuration(startTimestamp: string): string {
  if (!startTimestamp) return "\u2014";
  const now = Date.now();
  const start = new Date(startTimestamp).getTime();
  const diffMs = now - start;
  const diffMin = Math.floor(diffMs / 1000 / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffMin < 60) return `${diffMin}m`;
  return `${diffHour}h ${diffMin % 60}m`;
}
