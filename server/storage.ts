import { flashcards, userProgress, type Flashcard, type InsertFlashcard, type UserProgress, type InsertUserProgress, users, type User, type InsertUser } from "@shared/schema";

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

export const storage = new MemStorage();
