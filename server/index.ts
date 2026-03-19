import express from "express";
import cors from "cors";
import {
  getAllSessions,
  getSessionById,
  saveNote,
  deleteNote,
} from "./services/sessionScanner.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /api/sessions — list all sessions (lighter payload)
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

    // Strip heavy fields for list endpoint
    const summary = filtered.map(
      ({ recentActivity, conversationPreview, ...rest }) => rest
    );
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

// POST /api/sessions/:id/notes — add a note
app.post("/api/sessions/:id/notes", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "text is required" });
      return;
    }
    const notes = await saveNote(req.params.id, text.slice(0, 500));
    res.json(notes);
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ error: "Failed to save note" });
  }
});

// DELETE /api/sessions/:id/notes/:index — delete a note
app.delete("/api/sessions/:id/notes/:index", async (req, res) => {
  try {
    const notes = await deleteNote(
      req.params.id,
      parseInt(req.params.index, 10)
    );
    res.json(notes);
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
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
