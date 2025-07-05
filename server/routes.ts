import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema, insertGrammarProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all flashcards
  app.get("/api/flashcards", async (req, res) => {
    try {
      const sortDirection = req.query.sort as "ascending" | "descending" | undefined;
      const level = req.query.level as string | undefined;
      const flashcards = await storage.getAllFlashcards(sortDirection, level);
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
      console.log('Received progress data:', req.body);
      const validatedData = insertUserProgressSchema.parse(req.body);
      console.log('Validated data:', validatedData);
      const progress = await storage.recordProgress(validatedData);
      res.json(progress);
    } catch (error) {
      console.error('Progress validation error:', error);
      console.error('Request body:', req.body);
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  // Get all user progress
  app.get("/api/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
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

  // Grammar flashcard routes
  // Get all grammar flashcards
  app.get("/api/grammar-flashcards", async (req, res) => {
    try {
      const sortDirection = req.query.sort as "ascending" | "descending" | undefined;
      const level = req.query.level as string | undefined;
      const flashcards = await storage.getAllGrammarFlashcards(sortDirection, level);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grammar flashcards" });
    }
  });

  // Get a specific grammar flashcard
  app.get("/api/grammar-flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const flashcard = await storage.getGrammarFlashcard(id);
      if (!flashcard) {
        return res.status(404).json({ message: "Grammar flashcard not found" });
      }
      res.json(flashcard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grammar flashcard" });
    }
  });

  // Record grammar progress
  app.post("/api/grammar-progress", async (req, res) => {
    try {
      const validatedData = insertGrammarProgressSchema.parse(req.body);
      const progress = await storage.recordGrammarProgress(validatedData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid grammar progress data" });
    }
  });

  // Get all grammar progress
  app.get("/api/grammar-progress", async (req, res) => {
    try {
      const progress = await storage.getGrammarProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grammar progress" });
    }
  });

  // Get grammar progress statistics
  app.get("/api/grammar-progress/stats", async (req, res) => {
    try {
      const stats = await storage.getGrammarProgressStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grammar progress stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
