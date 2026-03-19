interface StatusCounts {
  all: number;
  working: number;
  waiting: number;
  idle: number;
  stopped: number;
}

interface StatusFilterProps {
  statusFilter: string[];
  statusCounts: StatusCounts;
  onFilterChange: (statuses: string[]) => void;
}

const filters = [
  { key: "all", label: "All", color: "bg-border-visible text-white" },
  {
    key: "working",
    label: "Working",
    color: "bg-status-working/20 text-status-working",
  },
  {
    key: "waiting",
    label: "Waiting",
    color: "bg-status-waiting/20 text-status-waiting",
  },
  { key: "idle", label: "Idle", color: "bg-status-idle/20 text-status-idle" },
];

export function StatusFilter({
  statusFilter,
  statusCounts,
  onFilterChange,
}: StatusFilterProps) {
  const isActive = (key: string) =>
    key === "all" ? statusFilter.length === 0 : statusFilter.includes(key);

  const handleClick = (key: string) => {
    if (key === "all") {
      onFilterChange([]);
    } else if (statusFilter.includes(key)) {
      onFilterChange(statusFilter.filter((s) => s !== key));
    } else {
      onFilterChange([...statusFilter, key]);
    }
  };

  return (
    <div className="px-3 py-2 border-b border-border-subtle">
      <div className="flex gap-1.5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => handleClick(f.key)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-opacity cursor-pointer ${
              f.color
            } ${isActive(f.key) ? "opacity-100" : "opacity-40"}`}
          >
            {f.label} {statusCounts[f.key as keyof StatusCounts]}
          </button>
        ))}
      </div>
    </div>
  );
}
