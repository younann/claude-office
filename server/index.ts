import express from "express";
import cors from "cors";
import { getAllSessions, getSessionById } from "./services/sessionScanner.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /api/sessions — list all sessions (without recentActivity)
app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await getAllSessions();
    const statusFilter = req.query.status
      ? (req.query.status as string).split(",")
      : null;

    let filtered = sessions;
    if (statusFilter) {
      filtered = sessions.filter((s) => statusFilter.includes(s.status));
    }

    // Strip recentActivity for list endpoint
    const summary = filtered.map(({ recentActivity, ...rest }) => rest);
    res.json(summary);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

// GET /api/sessions/:id — full session detail
app.get("/api/sessions/:id", async (req, res) => {
  try {
    const session = await getSessionById(req.params.id);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(session);
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

// GET /api/health
app.get("/api/health", async (_req, res) => {
  try {
    const sessions = await getAllSessions();
    res.json({
      ok: true,
      sessionCount: sessions.length,
      lastScan: new Date().toISOString(),
    });
  } catch {
    res.json({
      ok: false,
      sessionCount: 0,
      lastScan: new Date().toISOString(),
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `Claude Session Viewer API running on http://localhost:${PORT}`
  );
});
