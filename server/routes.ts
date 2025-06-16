import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all flashcards
  app.get("/api/flashcards", async (req, res) => {
    try {
      const flashcards = await storage.getAllFlashcards();
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  // Get a specific flashcard
  app.get("/api/flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const flashcard = await storage.getFlashcard(id);
      if (!flashcard) {
        return res.status(404).json({ message: "Flashcard not found" });
      }
      res.json(flashcard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flashcard" });
    }
  });

  // Record user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.recordProgress(validatedData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  // Get progress statistics
  app.get("/api/progress/stats", async (req, res) => {
    try {
      const stats = await storage.getProgressStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
