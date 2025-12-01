import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProgressSchema, insertGrammarProgressSchema, insertExpressionProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all flashcards
  app.get("/api/flashcards", async (req, res) => {
    try {
      const sortDirection = req.query.sort as "ascending" | "descending" | undefined;
      const level = req.query.level as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      const flashcards = await storage.getAllFlashcards(sortDirection, level, limit, offset);
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
      // Add cache prevention headers
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      const sortDirection = req.query.sort as "ascending" | "descending" | undefined;
      const level = req.query.level as string | undefined;
      const flashcards = await storage.getAllGrammarFlashcards(sortDirection, level);
      
      console.log(`Served ${flashcards.length} grammar flashcards`);
      console.log(`First flashcard: ID ${flashcards[0]?.id} - ${flashcards[0]?.grammar}`);
      
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
      const level = req.query.level as string | undefined;
      console.log(`Getting grammar progress stats for level: ${level || 'N2 (default)'}`);
      const stats = await storage.getGrammarProgressStats(level);
      res.json(stats);
    } catch (error) {
      console.error('Error getting grammar progress stats:', error);
      res.status(500).json({ message: "Failed to fetch grammar progress stats" });
    }
  });

  // Expression flashcard routes
  app.get("/api/expression-flashcards", async (req, res) => {
    try {
      const sortDirection = req.query.sort as "ascending" | "descending" | undefined;
      const flashcards = await storage.getAllExpressionFlashcards(sortDirection);
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expression flashcards" });
    }
  });

  app.get("/api/expression-flashcards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expression flashcard ID" });
      }
      
      const flashcard = await storage.getExpressionFlashcard(id);
      if (!flashcard) {
        return res.status(404).json({ message: "Expression flashcard not found" });
      }
      
      res.json(flashcard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expression flashcard" });
    }
  });

  // Record expression progress
  app.post("/api/expression-progress", async (req, res) => {
    try {
      const validatedData = insertExpressionProgressSchema.parse(req.body);
      const progress = await storage.recordExpressionProgress(validatedData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid expression progress data" });
    }
  });

  // Clear prompt field for a flashcard
  app.post("/api/flashcards/clear-prompt", async (req, res) => {
    try {
      const { notionPageId } = req.body;
      
      if (!notionPageId) {
        return res.status(400).json({ message: "notionPageId is required" });
      }
      
      const { clearPromptInNotion } = await import('./notion');
      await clearPromptInNotion(notionPageId);
      
      res.json({ success: true, message: "Prompt cleared successfully" });
    } catch (error) {
      console.error('Error clearing prompt:', error);
      res.status(500).json({ message: "Failed to clear prompt" });
    }
  });

  // Get all expression progress
  app.get("/api/expression-progress", async (req, res) => {
    try {
      const progress = await storage.getExpressionProgress();
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expression progress" });
    }
  });

  // Get expression progress statistics
  app.get("/api/expression-progress/stats", async (req, res) => {
    try {
      const stats = await storage.getExpressionProgressStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expression progress stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
