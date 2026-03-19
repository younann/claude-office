interface StatusCounts {
  all: number;
  working: number;
  waiting: number;
  idle: number;
}

interface StatusFilterProps {
  statusFilter: string[];
  statusCounts: StatusCounts;
  onFilterChange: (statuses: string[]) => void;
}

const filters = [
  {
    key: "all",
    label: "ALL",
    color: "#c8d6e5",
    bg: "#c8d6e510",
    borderColor: "#c8d6e533",
  },
  {
    key: "working",
    label: "ACTIVE",
    color: "#00ff88",
    bg: "#00ff8815",
    borderColor: "#00ff8844",
  },
  {
    key: "waiting",
    label: "STANDBY",
    color: "#ffaa00",
    bg: "#ffaa0015",
    borderColor: "#ffaa0044",
  },
  {
    key: "idle",
    label: "DORMANT",
    color: "#4488ff",
    bg: "#4488ff15",
    borderColor: "#4488ff44",
  },
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
    <div className="px-3 py-3 border-b border-border-subtle">
      <div
        className="text-[8px] tracking-[0.2em] uppercase mb-2"
        style={{
          fontFamily: "var(--font-mono)",
          color: "#5a6a82",
        }}
      >
        FILTER BY STATUS
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {filters.map((f) => {
          const active = isActive(f.key);
          return (
            <button
              key={f.key}
              onClick={() => handleClick(f.key)}
              className="px-2.5 py-1 rounded text-[9px] tracking-wider cursor-pointer transition-all duration-200"
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 500,
                background: active ? f.bg : "transparent",
                border: `1px solid ${active ? f.borderColor : "#1c223600"}`,
                color: active ? f.color : "#2a3448",
              }}
            >
              {f.label}{" "}
              <span style={{ opacity: 0.6 }}>
                {statusCounts[f.key as keyof StatusCounts]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
