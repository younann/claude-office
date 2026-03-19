import { useState, useEffect, useCallback, useRef } from "react";
import type { Session } from "../types";
import { getAgentIdentity } from "../utils/agentIdentity";

const API_BASE = "/api";
const POLL_INTERVAL = 5000;

// Request notification permission on load
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function sendNotification(title: string, body: string, tag: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    const n = new Notification(title, {
      body,
      tag, // prevents duplicate notifications for same event
      icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' fill='%237c3aed'/><text x='8' y='24' font-size='22' fill='white'>C</text></svg>",
      silent: false,
    });
    // Auto-close after 8 seconds
    setTimeout(() => n.close(), 8000);
  }
}

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevSessionsRef = useRef<Map<string, Session>>(new Map());
  const isFirstLoadRef = useRef(true);

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Check for status changes and send notifications
  const checkNotifications = useCallback(
    (newSessions: Session[]) => {
      if (!notificationsEnabled || isFirstLoadRef.current) {
        // Build initial map on first load, don't notify
        const map = new Map<string, Session>();
        for (const s of newSessions) map.set(s.id, s);
        prevSessionsRef.current = map;
        isFirstLoadRef.current = false;
        return;
      }

      const prevMap = prevSessionsRef.current;

      for (const session of newSessions) {
        const prev = prevMap.get(session.id);
        if (!prev) continue;

        const identity = getAgentIdentity(session.id, session.project);

        // Agent went from working → waiting (needs your input)
        if (prev.status === "working" && session.status === "waiting") {
          sendNotification(
            `${identity.funnyName} needs you!`,
            `${identity.displayName} is waiting for your input`,
            `waiting-${session.id}`
          );
        }

        // New errors detected
        if (session.errorCount > (prev.errorCount || 0)) {
          const newErrors = session.errorCount - (prev.errorCount || 0);
          sendNotification(
            `${identity.funnyName} hit an error!`,
            `${newErrors} new error${newErrors > 1 ? "s" : ""} in ${identity.displayName}`,
            `error-${session.id}-${session.errorCount}`
          );
        }

        // Agent went idle (sleeping)
        if (prev.status !== "idle" && session.status === "idle") {
          sendNotification(
            `${identity.funnyName} fell asleep`,
            `${identity.displayName} has been idle for 5+ minutes`,
            `idle-${session.id}`
          );
        }
      }

      // Update map
      const map = new Map<string, Session>();
      for (const s of newSessions) map.set(s.id, s);
      prevSessionsRef.current = map;
    },
    [notificationsEnabled]
  );

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (res.ok) {
        const data: Session[] = await res.json();
        checkNotifications(data);
        setSessions(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [checkNotifications]);

  const fetchSessionDetail = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/sessions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSession(data);
      }
    } catch (err) {
      console.error("Failed to fetch session detail:", err);
    }
  }, []);

  const selectSession = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (id) {
        fetchSessionDetail(id);
      } else {
        setSelectedSession(null);
      }
    },
    [fetchSessionDetail]
  );

  const refresh = useCallback(() => {
    fetchSessions();
    if (selectedId) {
      fetchSessionDetail(selectedId);
    }
  }, [fetchSessions, fetchSessionDetail, selectedId]);

  // Initial fetch + polling
  useEffect(() => {
    fetchSessions();

    intervalRef.current = setInterval(fetchSessions, POLL_INTERVAL);

    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        fetchSessions();
        intervalRef.current = setInterval(fetchSessions, POLL_INTERVAL);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchSessions]);

  // Re-fetch detail when selectedId changes
  useEffect(() => {
    if (selectedId) {
      fetchSessionDetail(selectedId);
    }
  }, [selectedId, fetchSessionDetail]);

  // Filter sessions
  const filteredSessions =
    statusFilter.length === 0
      ? sessions
      : sessions.filter((s) => statusFilter.includes(s.status));

  // Status counts
  const statusCounts = {
    all: sessions.length,
    working: sessions.filter((s) => s.status === "working").length,
    waiting: sessions.filter((s) => s.status === "waiting").length,
    idle: sessions.filter((s) => s.status === "idle").length,
    stopped: sessions.filter((s) => s.status === "stopped").length,
  };

  return {
    sessions: filteredSessions,
    selectedSession,
    selectedId,
    statusFilter,
    lastUpdated,
    isLoading,
    statusCounts,
    notificationsEnabled,
    selectSession,
    setStatusFilter,
    setNotificationsEnabled,
    refresh,
  };
}
