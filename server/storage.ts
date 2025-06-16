import { flashcards, userProgress, type Flashcard, type InsertFlashcard, type UserProgress, type InsertUserProgress, users, type User, type InsertUser } from "@shared/schema";
import { getFlashcardsFromNotion, updateProgressInNotion, notion } from "./notion";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Flashcard methods
  getAllFlashcards(): Promise<Flashcard[]>;
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  
  // Progress methods
  getUserProgress(): Promise<UserProgress[]>;
  recordProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getProgressStats(): Promise<{ known: number; unknown: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private flashcards: Map<number, Flashcard>;
  private userProgress: Map<number, UserProgress>;
  private currentUserId: number;
  private currentFlashcardId: number;
  private currentProgressId: number;

  constructor() {
    this.users = new Map();
    this.flashcards = new Map();
    this.userProgress = new Map();
    this.currentUserId = 1;
    this.currentFlashcardId = 1;
    this.currentProgressId = 1;
    
    // Initialize with sample flashcards
    this.initializeFlashcards();
  }

  private initializeFlashcards() {
    const sampleFlashcards: InsertFlashcard[] = [
      {
        japanese: "茶道",
        furigana: "さどう",
        korean: "차도 (다도)",
        sentence: "母は茶道を習っています。",
        sentenceKorean: "어머니는 다도를 배우고 계십니다.",
        imageUrl: "https://images.unsplash.com/photo-1545048702-79362596cdc9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
      },
      {
        japanese: "桜",
        furigana: "さくら",
        korean: "벚꽃",
        sentence: "春になると桜が咲きます。",
        sentenceKorean: "봄이 되면 벚꽃이 핍니다.",
        imageUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
      },
      {
        japanese: "寿司",
        furigana: "すし",
        korean: "초밥",
        sentence: "今日は寿司を食べました。",
        sentenceKorean: "오늘은 초밥을 먹었습니다.",
        imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400"
      }
    ];

    sampleFlashcards.forEach(flashcard => {
      this.createFlashcard(flashcard);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllFlashcards(): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values());
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentFlashcardId++;
    const flashcard: Flashcard = { ...insertFlashcard, id };
    this.flashcards.set(id, flashcard);
    return flashcard;
  }

  async getUserProgress(): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values());
  }

  async recordProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentProgressId++;
    const progress: UserProgress = { ...insertProgress, id };
    this.userProgress.set(id, progress);
    return progress;
  }

  async getProgressStats(): Promise<{ known: number; unknown: number }> {
    const progress = Array.from(this.userProgress.values());
    const known = progress.filter(p => p.known).length;
    const unknown = progress.filter(p => !p.known).length;
    return { known, unknown };
  }
}

// Notion-based storage implementation
export class NotionStorage implements IStorage {
  private flashcardsDatabaseId: string = process.env.NOTION_PAGE_URL?.match(/([a-f0-9]{32})(?:[?#]|$)/i)?.[1] || "";

  private async initializeDatabases() {
    // Database ID is already set from the URL
  }

  // User methods - using default user for now
  async getUser(id: number): Promise<User | undefined> {
    return { id: 1, username: "user", password: "default" };
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return { id: 1, username: "user", password: "default" };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return { id: 1, username: insertUser.username, password: "default" };
  }

  // Flashcard methods
  async getAllFlashcards(): Promise<Flashcard[]> {
    await this.initializeDatabases();
    
    if (!this.flashcardsDatabaseId) {
      throw new Error("J-Flash Flashcards database not found. Please run setup first.");
    }

    return await getFlashcardsFromNotion(this.flashcardsDatabaseId);
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    const flashcards = await this.getAllFlashcards();
    return flashcards.find(f => f.id === id);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    // This would require creating a new page in Notion
    throw new Error("Creating flashcards through the app is not implemented yet. Please add them directly to Notion.");
  }

  // Progress methods
  async getUserProgress(): Promise<UserProgress[]> {
    await this.initializeDatabases();
    
    if (!this.progressDatabaseId) {
      return []; // Return empty if progress database doesn't exist yet
    }

    return await getProgressFromNotion(this.progressDatabaseId);
  }

  async recordProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    await this.initializeDatabases();
    
    if (!this.progressDatabaseId) {
      throw new Error("J-Flash Progress database not found. Please run setup first.");
    }

    await recordProgressInNotion(this.progressDatabaseId, insertProgress.flashcardId, insertProgress.isKnown);
    
    // Return the progress record
    const progress: UserProgress = {
      id: Date.now(), // Simple ID generation
      ...insertProgress,
      timestamp: new Date()
    };
    
    return progress;
  }

  async getProgressStats(): Promise<{ known: number; unknown: number }> {
    const progress = await this.getUserProgress();
    
    // Get the latest progress for each flashcard
    const latestProgress = new Map<number, boolean>();
    
    // Sort by timestamp descending to get latest first
    progress.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    for (const p of progress) {
      if (!latestProgress.has(p.flashcardId)) {
        latestProgress.set(p.flashcardId, p.isKnown);
      }
    }
    
    let known = 0;
    let unknown = 0;
    
    for (const isKnown of latestProgress.values()) {
      if (isKnown) {
        known++;
      } else {
        unknown++;
      }
    }
    
    return { known, unknown };
  }
}

// Use Notion storage if secrets are available, otherwise fallback to memory storage
export const storage = process.env.NOTION_INTEGRATION_SECRET && process.env.NOTION_PAGE_URL 
  ? new NotionStorage() 
  : new MemStorage();
