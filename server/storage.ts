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
    
    // Initialize with sample flashcards
    this.initializeFlashcards();
    this.initializeGrammarFlashcards();
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

  private initializeGrammarFlashcards() {
    const sampleGrammarFlashcards: InsertGrammarFlashcard[] = [
      {
        problemSentence: "日本に来て___、日本語が上手になりました。",
        exampleSentence: "日本に来てから、日本語が上手になりました。",
        exampleKorean: "일본에 와서부터 일본어가 능숙해졌습니다.",
        grammar: "～てから",
        meaning: "～한 후에, ～하고 나서"
      },
      {
        problemSentence: "雨が降って___、試合が中止になった。",
        exampleSentence: "雨が降ったため、試合が中止になった。",
        exampleKorean: "비가 내렸기 때문에 경기가 중지되었다.",
        grammar: "～ため",
        meaning: "～때문에, ～으로 인해"
      }
    ];

    sampleGrammarFlashcards.forEach(flashcard => {
      this.createGrammarFlashcard(flashcard);
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

  async getAllFlashcards(sortDirection?: "ascending" | "descending", level?: string): Promise<Flashcard[]> {
    return Array.from(this.flashcards.values());
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    return this.flashcards.get(id);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    const id = this.currentFlashcardId++;
    const flashcard: Flashcard = { 
      ...insertFlashcard, 
      id,
      audioUrl: insertFlashcard.audioUrl ?? null,
      wordAudioUrl: insertFlashcard.wordAudioUrl ?? null,
      pronunciationAudioUrl: insertFlashcard.pronunciationAudioUrl ?? null
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
    const progress = Array.from(this.userProgress.values());
    const known = progress.filter(p => p.known).length;
    const unknown = progress.filter(p => !p.known).length;
    return { known, unknown };
  }

  // Grammar flashcard methods
  async getAllGrammarFlashcards(sortDirection?: "ascending" | "descending", level?: string): Promise<GrammarFlashcard[]> {
    return Array.from(this.grammarFlashcards.values());
  }

  async getGrammarFlashcard(id: number): Promise<GrammarFlashcard | undefined> {
    return this.grammarFlashcards.get(id);
  }

  async createGrammarFlashcard(insertGrammarFlashcard: InsertGrammarFlashcard): Promise<GrammarFlashcard> {
    const id = this.currentGrammarFlashcardId++;
    const grammarFlashcard: GrammarFlashcard = { 
      ...insertGrammarFlashcard, 
      id,
      audioUrl: insertGrammarFlashcard.audioUrl ?? null
    };
    this.grammarFlashcards.set(id, grammarFlashcard);
    return grammarFlashcard;
  }

  // Grammar progress methods
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
    const progress = Array.from(this.grammarProgress.values());
    const known = progress.filter(p => p.known).length;
    const unknown = progress.filter(p => !p.known).length;
    return { known, unknown };
  }
}

// Notion-based storage implementation
export class NotionStorage implements IStorage {
  private flashcardsDatabaseId: string = "213fe404b3dc802e8b1bd26d77f8cc84"; // N2 database ID from user's link
  private grammarDatabaseId: string = "227fe404b3dc8040946ce0921f4d9550"; // N2 grammar database ID
  private databaseIds: Map<string, string> = new Map();
  private n3DatabaseId: string = "216fe404b3dc804a9130f21b2b3a0e54"; // N3 database ID
  private n4DatabaseId: string = "215fe404b3dc8099b972e96296fc14af"; // N4 database ID
  private hiraganaKatakanaDatabaseId: string = "215fe404b3dc8040bac6f54c99a949a8"; // Hiragana/Katakana database ID

  private async initializeDatabases() {
    // Set up database IDs for different levels
    if (!this.databaseIds.has("N2")) {
      // Use main database for N2
      this.databaseIds.set("N2", this.flashcardsDatabaseId);
      
      // Use specific database for N3
      this.databaseIds.set("N3", this.n3DatabaseId);
      
      // Use specific database for N4
      this.databaseIds.set("N4", this.n4DatabaseId);
      
      // Use specific database for Hiragana/Katakana
      this.databaseIds.set("히라가나/가타가나", this.hiraganaKatakanaDatabaseId);
      
      // For N1, N5 - use main database for now
      this.databaseIds.set("N1", this.flashcardsDatabaseId);
      this.databaseIds.set("N5", this.flashcardsDatabaseId);
    }
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
  async getAllFlashcards(sortDirection: "ascending" | "descending" = "ascending", level: string = "N2"): Promise<Flashcard[]> {
    await this.initializeDatabases();
    
    // Get the database ID for the requested level
    const databaseId = this.databaseIds.get(level) || this.flashcardsDatabaseId;
    
    if (!databaseId) {
      throw new Error(`Database for level ${level} not found. Please run setup first.`);
    }

    return await getFlashcardsFromNotion(databaseId, sortDirection);
  }

  async getFlashcard(id: number): Promise<Flashcard | undefined> {
    const flashcards = await this.getAllFlashcards();
    return flashcards.find(f => f.id === id);
  }

  async createFlashcard(insertFlashcard: InsertFlashcard): Promise<Flashcard> {
    // This would require creating a new page in Notion
    throw new Error("Creating flashcards through the app is not implemented yet. Please add them directly to Notion.");
  }

  // Progress methods - using the existing "암기" field in Notion
  async getUserProgress(): Promise<UserProgress[]> {
    await this.initializeDatabases();
    
    const progressData: UserProgress[] = [];
    
    // Get progress from Notion database directly
    const response = await notion.databases.query({
      database_id: this.flashcardsDatabaseId,
    });

    response.results.forEach((page: any, index: number) => {
      const properties = page.properties;
      const isKnown = properties['암기']?.checkbox || false;
      
      progressData.push({
        id: index + 1,
        flashcardId: parseInt(page.id.replace(/-/g, '').slice(-8), 16),
        known: isKnown
      });
    });

    return progressData;
  }

  async recordProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    await this.initializeDatabases();
    
    console.log('Recording progress for flashcard:', insertProgress.flashcardId, 'Known:', insertProgress.known);
    
    // Search across all databases to find the flashcard
    let targetPage: any = null;
    let targetDatabaseId: string = "";
    
    for (const [level, databaseId] of Array.from(this.databaseIds.entries())) {
      console.log(`Searching in ${level} database (${databaseId})`);
      
      const allResults: any[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      // Fetch all pages without filter to find the target page
      while (hasMore) {
        const response = await notion.databases.query({
          database_id: databaseId,
          start_cursor: startCursor,
          page_size: 100
        });

        allResults.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
      }

      targetPage = allResults.find((page: any) => {
        const pageId = parseInt(page.id.replace(/-/g, '').slice(-8), 16);
        return pageId === insertProgress.flashcardId;
      });

      if (targetPage) {
        targetDatabaseId = databaseId;
        console.log(`Found target page in ${level} database`);
        break;
      }
    }

    if (targetPage) {
      console.log('Found target page, updating Notion...');
      await updateProgressInNotion(targetDatabaseId, targetPage.id, insertProgress.known);
      console.log('Notion update completed');
    } else {
      console.error('Target page not found for flashcard ID:', insertProgress.flashcardId);
    }
    
    return {
      id: Date.now(),
      flashcardId: insertProgress.flashcardId,
      known: insertProgress.known
    };
  }

  async getProgressStats(): Promise<{ known: number; unknown: number }> {
    const progress = await this.getUserProgress();
    
    let known = 0;
    let unknown = 0;
    
    for (const p of progress) {
      if (p.known) {
        known++;
      } else {
        unknown++;
      }
    }
    
    return { known, unknown };
  }

  // Grammar flashcard methods - fetch from Notion database
  async getAllGrammarFlashcards(sortDirection?: "ascending" | "descending", level?: string): Promise<GrammarFlashcard[]> {
    try {
      const allResults: any[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      // Fetch all pages from the grammar database
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

      // Transform Notion pages to GrammarFlashcard format with Random field
      const flashcardsWithRandom = allResults.map((page: any, index: number) => {
        const properties = page.properties;
        
        const grammar = properties['문법']?.title?.[0]?.plain_text || "";
        const problemSentence = properties['문제풀이']?.rich_text?.[0]?.plain_text || "";
        const exampleSentence = properties['예문']?.rich_text?.[0]?.plain_text || "";
        const exampleKorean = properties['예문해석']?.rich_text?.[0]?.plain_text || "";
        const meaning = properties['뜻']?.rich_text?.[0]?.plain_text || "";
        const randomValue = properties['Random']?.formula?.number || 0;
        
        return {
          id: index + 1,
          problemSentence,
          exampleSentence,
          exampleKorean,
          grammar,
          meaning,
          audioUrl: null,
          randomValue // Store random value for sorting
        };
      });

      // Sort by Random field value
      flashcardsWithRandom.sort((a, b) => {
        if (sortDirection === "descending") {
          return b.randomValue - a.randomValue;
        } else {
          return a.randomValue - b.randomValue;
        }
      });

      // Remove randomValue from final result and reassign sequential IDs
      const flashcards: GrammarFlashcard[] = flashcardsWithRandom.map((card, index) => {
        const { randomValue, ...flashcard } = card;
        return {
          ...flashcard,
          id: index + 1 // Reassign sequential IDs after sorting
        };
      });

      return flashcards;
    } catch (error) {
      console.error("Error fetching grammar flashcards from Notion:", error);
      throw new Error("Failed to fetch grammar flashcards from Notion");
    }
  }

  async getGrammarFlashcard(id: number): Promise<GrammarFlashcard | undefined> {
    const flashcards = await this.getAllGrammarFlashcards();
    return flashcards.find(f => f.id === id);
  }

  async createGrammarFlashcard(insertGrammarFlashcard: InsertGrammarFlashcard): Promise<GrammarFlashcard> {
    return {
      id: Date.now(),
      ...insertGrammarFlashcard,
      audioUrl: insertGrammarFlashcard.audioUrl ?? null
    };
  }

  // Grammar progress methods - fetch from Notion database
  async getGrammarProgress(): Promise<GrammarProgress[]> {
    try {
      const progressData: GrammarProgress[] = [];
      
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

      // Create the same sorted mapping as in getAllGrammarFlashcards
      const flashcardsWithRandom = allResults.map((page: any, index: number) => {
        const properties = page.properties;
        const randomValue = properties['Random']?.formula?.number || 0;
        const isKnown = properties['암기']?.checkbox || false;
        
        return {
          originalIndex: index,
          page,
          randomValue,
          isKnown
        };
      });

      // Sort by Random field value (ascending by default)
      flashcardsWithRandom.sort((a, b) => a.randomValue - b.randomValue);

      // Create progress data with sorted order
      flashcardsWithRandom.forEach((entry, index) => {
        progressData.push({
          id: index + 1,
          grammarFlashcardId: index + 1, // Using sorted index as flashcard ID
          known: entry.isKnown
        });
      });

      return progressData;
    } catch (error) {
      console.error("Error fetching grammar progress from Notion:", error);
      return [];
    }
  }

  async recordGrammarProgress(insertProgress: InsertGrammarProgress): Promise<GrammarProgress> {
    try {
      console.log('Recording grammar progress for flashcard:', insertProgress.grammarFlashcardId, 'Known:', insertProgress.known);
      
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

      // Create the same sorted mapping as in getAllGrammarFlashcards
      const flashcardsWithRandom = allResults.map((page: any, index: number) => {
        const properties = page.properties;
        const randomValue = properties['Random']?.formula?.number || 0;
        
        return {
          originalIndex: index,
          page,
          randomValue
        };
      });

      // Sort by Random field value (ascending by default)
      flashcardsWithRandom.sort((a, b) => a.randomValue - b.randomValue);

      // Find the page that corresponds to this flashcard ID (after sorting)
      const targetEntry = flashcardsWithRandom[insertProgress.grammarFlashcardId - 1]; // flashcard ID is 1-based
      
      if (targetEntry) {
        // Update the '암기' checkbox in Notion
        await notion.pages.update({
          page_id: targetEntry.page.id,
          properties: {
            '암기': {
              checkbox: insertProgress.known
            }
          }
        });
        
        console.log(`Updated grammar progress in Notion for page ${targetEntry.page.id}`);
      } else {
        console.log(`No page found for flashcard ID ${insertProgress.grammarFlashcardId}`);
      }

      return {
        id: Date.now(),
        grammarFlashcardId: insertProgress.grammarFlashcardId,
        known: insertProgress.known
      };
    } catch (error) {
      console.error("Error recording grammar progress:", error);
      throw new Error("Failed to record grammar progress");
    }
  }

  async getGrammarProgressStats(): Promise<{ known: number; unknown: number }> {
    try {
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

      let known = 0;
      let unknown = 0;

      allResults.forEach((page: any) => {
        const properties = page.properties;
        const isKnown = properties['암기']?.checkbox || false;
        
        if (isKnown) {
          known++;
        } else {
          unknown++;
        }
      });

      return { known, unknown };
    } catch (error) {
      console.error("Error fetching grammar progress stats:", error);
      return { known: 0, unknown: 0 };
    }
  }
}

// Use Notion storage if secrets are available, otherwise fallback to memory storage
// Use Notion storage if N2-specific secrets are available, otherwise fallback to memory storage
export const storage = process.env.N2_NOTION_INTEGRATION_SECRET && process.env.N2_NOTION_PAGE_URL 
  ? new NotionStorage() 
  : new MemStorage();
