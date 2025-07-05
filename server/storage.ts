import { flashcards, userProgress, grammarFlashcards, grammarProgress, type Flashcard, type InsertFlashcard, type GrammarFlashcard, type InsertGrammarFlashcard, type UserProgress, type InsertUserProgress, type GrammarProgress, type InsertGrammarProgress, users, type User, type InsertUser } from "@shared/schema";
import { getFlashcardsFromNotion, updateProgressInNotion, notion, findDatabaseByTitle } from "./notion";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Flashcard methods
  getAllFlashcards(sortDirection?: "ascending" | "descending", level?: string): Promise<Flashcard[]>;
  getFlashcard(id: number): Promise<Flashcard | undefined>;
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  
  // Grammar flashcard methods
  getAllGrammarFlashcards(sortDirection?: "ascending" | "descending", level?: string): Promise<GrammarFlashcard[]>;
  getGrammarFlashcard(id: number): Promise<GrammarFlashcard | undefined>;
  createGrammarFlashcard(flashcard: InsertGrammarFlashcard): Promise<GrammarFlashcard>;
  
  // Progress methods
  getUserProgress(): Promise<UserProgress[]>;
  recordProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getProgressStats(): Promise<{ known: number; unknown: number }>;
  
  // Grammar progress methods
  getGrammarProgress(): Promise<GrammarProgress[]>;
  recordGrammarProgress(progress: InsertGrammarProgress): Promise<GrammarProgress>;
  getGrammarProgressStats(): Promise<{ known: number; unknown: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private flashcards: Map<number, Flashcard>;
  private grammarFlashcards: Map<number, GrammarFlashcard>;
  private userProgress: Map<number, UserProgress>;
  private grammarProgress: Map<number, GrammarProgress>;
  private currentUserId: number;
  private currentFlashcardId: number;
  private currentGrammarFlashcardId: number;
  private currentProgressId: number;
  private currentGrammarProgressId: number;

  constructor() {
    this.users = new Map();
    this.flashcards = new Map();
    this.grammarFlashcards = new Map();
    this.userProgress = new Map();
    this.grammarProgress = new Map();
    this.currentUserId = 1;
    this.currentFlashcardId = 1;
    this.currentGrammarFlashcardId = 1;
    this.currentProgressId = 1;
    this.currentGrammarProgressId = 1;
    
    this.initializeFlashcards();
    this.initializeGrammarFlashcards();
  }

  private initializeFlashcards() {
    // Sample flashcards for development
    const sampleFlashcards: Flashcard[] = [
      {
        id: 1,
        japanese: "こんにちは",
        furigana: "こんにちは",
        korean: "안녕하세요",
        exampleSentence: "こんにちは、お元気ですか？",
        exampleKorean: "안녕하세요, 잘 지내세요?",
        imageUrl: null,
        wordAudioUrl: null,
        pronunciationAudioUrl: null,
        notionPageId: null
      }
    ];

    sampleFlashcards.forEach(flashcard => {
      this.flashcards.set(flashcard.id, flashcard);
    });
  }

  private initializeGrammarFlashcards() {
    // Sample grammar flashcards for development
    const sampleGrammarFlashcards: GrammarFlashcard[] = [
      {
        id: 1,
        problemSentence: "雨が降って______、外出できません。",
        exampleSentence: "雨が降っているので、外出できません。",
        exampleKorean: "비가 내리고 있어서 외출할 수 없습니다.",
        grammar: "ているので",
        meaning: "~고 있어서",
        audioUrl: null,
        notionPageId: null
      }
    ];

    sampleGrammarFlashcards.forEach(flashcard => {
      this.grammarFlashcards.set(flashcard.id, flashcard);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllFlashcards(sortDirection?: "ascending" | "descending", level?: string): Promise<Flashcard[]> {
    const allFlashcards = Array.from(this.flashcards.values());
    
    if (sortDirection === "descending") {
      return allFlashcards.reverse();
    }
    
    return allFlashcards;
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentFlashcardId++;
    const flashcard: Flashcard = { 
      ...insertFlashcard, 
      id,
      notionPageId: insertFlashcard.notionPageId || null
    };
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
    const progressArray = Array.from(this.userProgress.values());
    const known = progressArray.filter(p => p.known).length;
    const unknown = progressArray.filter(p => !p.known).length;
    return { known, unknown };
  }

  async getAllGrammarFlashcards(sortDirection?: "ascending" | "descending", level?: string): Promise<GrammarFlashcard[]> {
    const allGrammarFlashcards = Array.from(this.grammarFlashcards.values());
    
    if (sortDirection === "descending") {
      return allGrammarFlashcards.reverse();
    }
    
    return allGrammarFlashcards;
  }

  async getGrammarFlashcard(id: number): Promise<GrammarFlashcard | undefined> {
    return this.grammarFlashcards.get(id);
  }

  async createGrammarFlashcard(insertGrammarFlashcard: InsertGrammarFlashcard): Promise<GrammarFlashcard> {
    const id = this.currentGrammarFlashcardId++;
    const grammarFlashcard: GrammarFlashcard = { 
      ...insertGrammarFlashcard, 
      id,
      notionPageId: insertGrammarFlashcard.notionPageId || null
    };
    this.grammarFlashcards.set(id, grammarFlashcard);
    return grammarFlashcard;
  }

  async getGrammarProgress(): Promise<GrammarProgress[]> {
    return Array.from(this.grammarProgress.values());
  }

  async recordGrammarProgress(insertProgress: InsertGrammarProgress): Promise<GrammarProgress> {
    const id = this.currentGrammarProgressId++;
    const progress: GrammarProgress = { ...insertProgress, id };
    this.grammarProgress.set(id, progress);
    return progress;
  }

  async getGrammarProgressStats(): Promise<{ known: number; unknown: number }> {
    const progressArray = Array.from(this.grammarProgress.values());
    const known = progressArray.filter(p => p.known).length;
    const unknown = progressArray.filter(p => !p.known).length;
    return { known, unknown };
  }
}

export class NotionStorage implements IStorage {
  private flashcardsDatabaseId: string = "213fe404b3dc802e8b1bd26d77f8cc84"; // N2 database ID from user's link
  private grammarDatabaseId: string = "227fe404b3dc8040946ce0921f4d9550"; // N2 grammar database ID
  private databaseIds: Map<string, string> = new Map();
  private n3DatabaseId: string = "216fe404b3dc804a9130f21b2b3a0e54"; // N3 database ID
  private n4DatabaseId: string = "215fe404b3dc8099b972e96296fc14af"; // N4 database ID
  private hiraganaKatakanaDatabaseId: string = "215fe404b3dc8040bac6f54c99a949a8"; // Hiragana/Katakana database ID

  constructor() {
    this.initializeDatabases();
  }

  private async initializeDatabases() {
    // Initialize the database mapping
    this.databaseIds.set("N2", this.flashcardsDatabaseId);
    this.databaseIds.set("N3", this.n3DatabaseId);
    this.databaseIds.set("N4", this.n4DatabaseId);
    this.databaseIds.set("Hiragana/Katakana", this.hiraganaKatakanaDatabaseId);
  }

  async getUser(id: number): Promise<User | undefined> {
    // Users are not stored in Notion for now
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Users are not stored in Notion for now
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Users are not stored in Notion for now
    throw new Error("User creation not implemented for Notion storage");
  }

  async getAllFlashcards(sortDirection: "ascending" | "descending" = "ascending", level: string = "N2"): Promise<Flashcard[]> {
    try {
      const databaseId = this.databaseIds.get(level) || this.flashcardsDatabaseId;
      return await getFlashcardsFromNotion(databaseId, sortDirection);
    } catch (error) {
      console.error("Error fetching flashcards from Notion:", error);
      throw error;
    }
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    // For now, we'll fetch all flashcards and find the one with matching ID
    const flashcards = await this.getAllFlashcards();
    return flashcards.find(f => f.id === id);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    // Creating new flashcards in Notion is not implemented yet
    throw new Error("Flashcard creation not implemented for Notion storage");
  }

  async getUserProgress(): Promise<UserProgress[]> {
    // Progress is stored in Notion database checkboxes
    return [];
  }

  async recordProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    try {
      // Update the progress in Notion using the updateProgressInNotion function
      await updateProgressInNotion(this.flashcardsDatabaseId, insertProgress.flashcardId.toString(), insertProgress.known);
      
      return {
        id: Date.now(), // Generate a temporary ID
        flashcardId: insertProgress.flashcardId,
        known: insertProgress.known
      };
    } catch (error) {
      console.error("Error recording progress:", error);
      throw error;
    }
  }

  async getProgressStats(): Promise<{ known: number; unknown: number }> {
    // This would require fetching all flashcards and counting their progress
    return { known: 0, unknown: 0 };
  }

  async getAllGrammarFlashcards(sortDirection?: "ascending" | "descending", level?: string): Promise<GrammarFlashcard[]> {
    try {
      // Get ONLY unchecked pages from the grammar database
      const allResults: any[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      while (hasMore) {
        const response = await notion.databases.query({
          database_id: this.grammarDatabaseId,
          start_cursor: startCursor,
          page_size: 100,
          filter: {
            property: '암기',
            checkbox: {
              equals: false
            }
          }
        });

        allResults.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
      }

      // Create flashcards with Random field for sorting
      const flashcardsWithRandom = allResults.map((page: any, index: number) => {
        const properties = page.properties;
        const randomValue = properties['Random']?.formula?.number || 0;
        
        return {
          originalIndex: index,
          page,
          randomValue
        };
      });

      // Sort by Random field, then by original index for stable sort
      flashcardsWithRandom.sort((a, b) => {
        if (a.randomValue !== b.randomValue) {
          return a.randomValue - b.randomValue;
        }
        return a.originalIndex - b.originalIndex;
      });

      // Map to GrammarFlashcard format
      const grammarFlashcards = flashcardsWithRandom.map((entry, index) => {
        const { page } = entry;
        const properties = page.properties;
        
        return {
          id: index + 1, // Sequential ID starting from 1
          problemSentence: properties['문제문']?.rich_text?.[0]?.plain_text || "",
          exampleSentence: properties['예문']?.rich_text?.[0]?.plain_text || "",
          exampleKorean: properties['예문해석']?.rich_text?.[0]?.plain_text || "",
          grammar: properties['문법']?.title?.[0]?.plain_text || "",
          meaning: properties['뜻']?.rich_text?.[0]?.plain_text || "",
          audioUrl: properties['스피커']?.url || null,
          notionPageId: page.id
        };
      });

      return grammarFlashcards;
    } catch (error) {
      console.error("Error fetching grammar flashcards from Notion:", error);
      throw error;
    }
  }

  async getGrammarFlashcard(id: number): Promise<GrammarFlashcard | undefined> {
    const flashcards = await this.getAllGrammarFlashcards();
    return flashcards.find(f => f.id === id);
  }

  async createGrammarFlashcard(insertGrammarFlashcard: InsertGrammarFlashcard): Promise<GrammarFlashcard> {
    throw new Error("Grammar flashcard creation not implemented for Notion storage");
  }

  async getGrammarProgress(): Promise<GrammarProgress[]> {
    return [];
  }

  async recordGrammarProgress(insertProgress: InsertGrammarProgress): Promise<GrammarProgress> {
    try {
      console.log('Recording grammar progress for flashcard:', insertProgress.grammarFlashcardId, 'Known:', insertProgress.known);
      
      // First, get the current flashcards as shown to the user to find the target page ID
      const currentFlashcards = await this.getAllGrammarFlashcards();
      
      // Find the flashcard with the matching ID
      const targetFlashcard = currentFlashcards.find(f => f.id === insertProgress.grammarFlashcardId);
      
      if (!targetFlashcard) {
        console.log(`No flashcard found with ID ${insertProgress.grammarFlashcardId}`);
        throw new Error(`Flashcard with ID ${insertProgress.grammarFlashcardId} not found`);
      }
      
      if (!targetFlashcard.notionPageId) {
        console.log(`No Notion page ID found for flashcard ${insertProgress.grammarFlashcardId}`);
        throw new Error(`No Notion page ID found for flashcard ${insertProgress.grammarFlashcardId}`);
      }
      
      console.log(`Target flashcard: ${targetFlashcard.grammar} - ${targetFlashcard.problemSentence}`);
      console.log(`Target page ID: ${targetFlashcard.notionPageId}`);
      
      // Update the '암기' checkbox in Notion using the correct page ID
      await notion.pages.update({
        page_id: targetFlashcard.notionPageId,
        properties: {
          '암기': {
            checkbox: insertProgress.known
          }
        }
      });
      
      console.log(`Updated grammar progress in Notion for page ${targetFlashcard.notionPageId}`);
      console.log(`Grammar pattern: ${targetFlashcard.grammar}`);

      return {
        id: Date.now(),
        grammarFlashcardId: insertProgress.grammarFlashcardId,
        known: insertProgress.known
      };
    } catch (error) {
      console.error("Error recording grammar progress:", error);
      throw error;
    }
  }

  async getGrammarProgressStats(): Promise<{ known: number; unknown: number }> {
    try {
      // Get all pages from the grammar database 
      const allResults: any[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      while (hasMore) {
        const response = await notion.databases.query({
          database_id: this.grammarDatabaseId,
          start_cursor: startCursor,
          page_size: 100
        });

        allResults.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
      }

      // Count known and unknown
      let known = 0;
      let unknown = 0;

      allResults.forEach((page: any) => {
        const isKnown = page.properties['암기']?.checkbox || false;
        if (isKnown) {
          known++;
        } else {
          unknown++;
        }
      });

      return { known, unknown };
    } catch (error) {
      console.error("Error getting grammar progress stats:", error);
      throw error;
    }
  }
}

export const storage = process.env.N2_NOTION_INTEGRATION_SECRET && process.env.N2_NOTION_PAGE_URL 
  ? new NotionStorage() 
  : new MemStorage();