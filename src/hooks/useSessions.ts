import { useState, useEffect, useCallback, useRef } from "react";
import type { Session } from "../types";

const API_BASE = "/api";
const POLL_INTERVAL = 5000;

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    selectSession,
    setStatusFilter,
    refresh,
  };
}
