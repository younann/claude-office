import type { Activity } from "../../types";
import { ActivityItem } from "./ActivityItem";

interface ActivityLogProps {
  activities: Activity[];
  accentColor: string;
}

export function ActivityLog({ activities, accentColor }: ActivityLogProps) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden animate-fade-in-up"
      style={{
        animationDelay: "200ms",
        background: `linear-gradient(180deg, ${accentColor}06, transparent)`,
        border: `1px solid ${accentColor}15`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: accentColor,
              boxShadow: `0 0 4px ${accentColor}`,
            }}
          />
          <h3
            className="text-[9px] tracking-[0.2em] uppercase"
            style={{
              fontFamily: "var(--font-display)",
              color: accentColor,
              fontWeight: 600,
            }}
          >
            COMMS LOG
          </h3>
        </div>
        <span
          className="text-[8px] tracking-wider"
          style={{
            fontFamily: "var(--font-mono)",
            color: "#2a3448",
          }}
        >
          {activities.length} ENTRIES
        </span>
      </div>

      {/* Divider */}
      <div
        className="h-[1px] w-full mb-3"
        style={{
          background: `linear-gradient(90deg, ${accentColor}33, transparent)`,
        }}
      />

      {activities.length === 0 ? (
        <div className="py-6 text-center">
          <p
            className="text-[10px] tracking-wider"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#2a3448",
            }}
          >
            NO TRANSMISSIONS RECORDED
          </p>
        </div>
      ) : (
        <div className="flex flex-col max-h-[400px] overflow-y-auto">
          {[...activities].reverse().map((activity, i) => (
            <ActivityItem key={i} activity={activity} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
