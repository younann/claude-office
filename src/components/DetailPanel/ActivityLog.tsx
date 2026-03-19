import type { Activity } from "../../types";
import { ActivityItem } from "./ActivityItem";

interface ActivityLogProps {
  activities: Activity[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <div className="bg-bg-card rounded-lg p-3">
      <h3 className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider mb-3">
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <p className="text-text-muted text-xs">No recent activity</p>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto">
          {[...activities].reverse().map((activity, i) => (
            <ActivityItem key={i} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
