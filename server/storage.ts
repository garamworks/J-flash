import { flashcards, userProgress, grammarFlashcards, grammarProgress, expressionFlashcards, expressionProgress, type Flashcard, type InsertFlashcard, type GrammarFlashcard, type InsertGrammarFlashcard, type ExpressionFlashcard, type InsertExpressionFlashcard, type UserProgress, type InsertUserProgress, type GrammarProgress, type InsertGrammarProgress, type ExpressionProgress, type InsertExpressionProgress, users, type User, type InsertUser } from "@shared/schema";
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
  getGrammarProgressStats(level?: string): Promise<{ known: number; unknown: number }>;
  
  // Expression flashcard methods
  getAllExpressionFlashcards(sortDirection?: "ascending" | "descending"): Promise<ExpressionFlashcard[]>;
  getExpressionFlashcard(id: number): Promise<ExpressionFlashcard | undefined>;
  createExpressionFlashcard(flashcard: InsertExpressionFlashcard): Promise<ExpressionFlashcard>;
  
  // Expression progress methods
  getExpressionProgress(): Promise<ExpressionProgress[]>;
  recordExpressionProgress(progress: InsertExpressionProgress): Promise<ExpressionProgress>;
  getExpressionProgressStats(): Promise<{ known: number; unknown: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private flashcards: Map<number, Flashcard>;
  private grammarFlashcards: Map<number, GrammarFlashcard>;
  private expressionFlashcards: Map<number, ExpressionFlashcard>;
  private userProgress: Map<number, UserProgress>;
  private grammarProgress: Map<number, GrammarProgress>;
  private expressionProgress: Map<number, ExpressionProgress>;
  private currentUserId: number;
  private currentFlashcardId: number;
  private currentGrammarFlashcardId: number;
  private currentExpressionFlashcardId: number;
  private currentProgressId: number;
  private currentGrammarProgressId: number;
  private currentExpressionProgressId: number;

  constructor() {
    this.users = new Map();
    this.flashcards = new Map();
    this.grammarFlashcards = new Map();
    this.expressionFlashcards = new Map();
    this.userProgress = new Map();
    this.grammarProgress = new Map();
    this.expressionProgress = new Map();
    this.currentUserId = 1;
    this.currentFlashcardId = 1;
    this.currentGrammarFlashcardId = 1;
    this.currentExpressionFlashcardId = 1;
    this.currentProgressId = 1;
    this.currentGrammarProgressId = 1;
    this.currentExpressionProgressId = 1;
    
    this.initializeFlashcards();
    this.initializeGrammarFlashcards();
    this.initializeExpressionFlashcards();
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

  private initializeExpressionFlashcards() {
    const sampleExpressionFlashcards: ExpressionFlashcard[] = [
      {
        id: 1,
        mainExpression: "お疲れ様",
        mainMeaning: "수고하셨습니다",
        application1: "お疲れ様でした",
        application1Korean: "수고하셨습니다 (정중한 표현)",
        application2: "お疲れ様です",
        application2Korean: "수고하고 계십니다",
        application3: "お疲れ",
        application3Korean: "수고했어 (친근한 표현)",
        application4: "お疲れ様でございます",
        application4Korean: "수고하셨습니다 (매우 정중한 표현)",
        application5: "今日もお疲れ様でした",
        application5Korean: "오늘도 수고하셨습니다",
        notionPageId: null
      }
    ];

    sampleExpressionFlashcards.forEach(flashcard => {
      this.expressionFlashcards.set(flashcard.id, flashcard);
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

  async getGrammarProgressStats(level?: string): Promise<{ known: number; unknown: number }> {
    const progressArray = Array.from(this.grammarProgress.values());
    const known = progressArray.filter(p => p.known).length;
    const unknown = progressArray.filter(p => !p.known).length;
    return { known, unknown };
  }

  // Expression flashcard methods
  async getAllExpressionFlashcards(sortDirection?: "ascending" | "descending"): Promise<ExpressionFlashcard[]> {
    const allExpressionFlashcards = Array.from(this.expressionFlashcards.values());
    
    if (sortDirection === "descending") {
      return allExpressionFlashcards.reverse();
    }
    
    return allExpressionFlashcards;
  }

  async getExpressionFlashcard(id: number): Promise<ExpressionFlashcard | undefined> {
    return this.expressionFlashcards.get(id);
  }

  async createExpressionFlashcard(insertExpressionFlashcard: InsertExpressionFlashcard): Promise<ExpressionFlashcard> {
    const id = this.currentExpressionFlashcardId++;
    const expressionFlashcard: ExpressionFlashcard = { 
      ...insertExpressionFlashcard, 
      id,
      notionPageId: insertExpressionFlashcard.notionPageId || null
    };
    this.expressionFlashcards.set(id, expressionFlashcard);
    return expressionFlashcard;
  }

  // Expression progress methods
  async getExpressionProgress(): Promise<ExpressionProgress[]> {
    return Array.from(this.expressionProgress.values());
  }

  async recordExpressionProgress(insertProgress: InsertExpressionProgress): Promise<ExpressionProgress> {
    const id = this.currentExpressionProgressId++;
    const progress: ExpressionProgress = { ...insertProgress, id };
    this.expressionProgress.set(id, progress);
    return progress;
  }

  async getExpressionProgressStats(): Promise<{ known: number; unknown: number }> {
    const progressArray = Array.from(this.expressionProgress.values());
    const known = progressArray.filter(p => p.known).length;
    const unknown = progressArray.filter(p => !p.known).length;
    return { known, unknown };
  }
}

export class NotionStorage implements IStorage {
  private flashcardsDatabaseId: string = "213fe404b3dc802e8b1bd26d77f8cc84"; // N2 database ID from user's link
  private grammarDatabaseId: string = "227fe404b3dc8040946ce0921f4d9550"; // N2 grammar database ID
  private expressionDatabaseId: string = "228fe404b3dc803786b5fea02dcf9913"; // Expression database ID
  private databaseIds: Map<string, string> = new Map();
  private grammarDatabaseIds: Map<string, string> = new Map();
  private n1DatabaseId: string = "216fe404b3dc80e49e28d68b149ce1bd"; // N1 database ID
  private n1GrammarDatabaseId: string = "228fe404b3dc80dc9694fbf032d6491f"; // N1 grammar database ID
  private n3DatabaseId: string = "216fe404b3dc804a9130f21b2b3a0e54"; // N3 database ID
  private n4DatabaseId: string = "215fe404b3dc8099b972e96296fc14af"; // N4 database ID - updated URL
  private hiraganaKatakanaDatabaseId: string = "215fe404b3dc8040bac6f54c99a949a8"; // Hiragana/Katakana database ID

  constructor() {
    this.initializeDatabases();
  }

  private async initializeDatabases() {
    // Initialize the database mapping for flashcards (vocabulary)
    this.databaseIds.set("N1", this.n1DatabaseId);
    this.databaseIds.set("N2", this.flashcardsDatabaseId);
    this.databaseIds.set("N3", this.n3DatabaseId);
    this.databaseIds.set("N4", this.n4DatabaseId);
    this.databaseIds.set("Hiragana/Katakana", this.hiraganaKatakanaDatabaseId);
    
    // Initialize the grammar database mapping
    this.grammarDatabaseIds.set("N1", this.n1GrammarDatabaseId);
    this.grammarDatabaseIds.set("N2", this.grammarDatabaseId);
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
      
      // Use N1-specific function for N1 database
      if (level === "N1") {
        const { getN1FlashcardsFromNotion } = await import('./notion');
        return await getN1FlashcardsFromNotion(databaseId, sortDirection);
      } else {
        return await getFlashcardsFromNotion(databaseId, sortDirection);
      }
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
      // First, get all flashcards to find the target one
      const allFlashcards = await this.getAllFlashcards();
      const targetFlashcard = allFlashcards.find(f => f.id === insertProgress.flashcardId);
      
      if (!targetFlashcard) {
        throw new Error(`Flashcard with ID ${insertProgress.flashcardId} not found`);
      }
      
      if (!targetFlashcard.notionPageId) {
        throw new Error(`No Notion page ID found for flashcard ${insertProgress.flashcardId}`);
      }
      
      console.log(`Recording progress for flashcard ${insertProgress.flashcardId}, Notion page ID: ${targetFlashcard.notionPageId}`);
      
      // Update the progress in Notion using the actual Notion page ID
      await updateProgressInNotion(this.flashcardsDatabaseId, targetFlashcard.notionPageId, insertProgress.known);
      
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
      // Determine which grammar database to use based on level
      const grammarDatabaseId = this.grammarDatabaseIds.get(level || "N2") || this.grammarDatabaseId;
      
      // Get ONLY unchecked pages from the grammar database
      const allResults: any[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      while (hasMore) {
        const response = await notion.databases.query({
          database_id: grammarDatabaseId,
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

      // Sort by Random field, then by page ID for completely stable sort
      flashcardsWithRandom.sort((a, b) => {
        if (a.randomValue !== b.randomValue) {
          return a.randomValue - b.randomValue;
        }
        // Use page ID as secondary sort key for complete stability
        return a.page.id.localeCompare(b.page.id);
      });

      // Map to GrammarFlashcard format
      const grammarFlashcards = flashcardsWithRandom.map((entry, index) => {
        const { page } = entry;
        const properties = page.properties;
        
        // Handle different field names for different levels
        const problemField = "문제풀이"; // Both N1 and N2 use 문제풀이 field
        
        return {
          id: index + 1, // Sequential ID starting from 1
          problemSentence: properties[problemField]?.rich_text?.[0]?.plain_text || "",
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
      console.log('=== PROGRESS RECORDING START ===');
      console.log('Recording grammar progress for flashcard:', insertProgress.grammarFlashcardId, 'Known:', insertProgress.known);
      console.log('Request timestamp:', new Date().toISOString());
      
      let targetPageId: string;
      
      // Check if notionPageId is provided directly (new method)
      if ((insertProgress as any).notionPageId) {
        targetPageId = (insertProgress as any).notionPageId;
        console.log(`Using provided Notion page ID: ${targetPageId}`);
      } else {
        // Fallback to old method (find by ID)
        console.log('Fallback: Finding flashcard by ID...');
        const currentFlashcards = await this.getAllGrammarFlashcards();
        console.log(`Total flashcards available: ${currentFlashcards.length}`);
        
        const targetFlashcard = currentFlashcards.find(f => f.id === insertProgress.grammarFlashcardId);
        
        if (!targetFlashcard || !targetFlashcard.notionPageId) {
          console.log(`ERROR: Could not find flashcard or page ID for ID ${insertProgress.grammarFlashcardId}`);
          throw new Error(`Flashcard with ID ${insertProgress.grammarFlashcardId} not found`);
        }
        
        targetPageId = targetFlashcard.notionPageId;
        console.log(`Found flashcard: ${targetFlashcard.grammar} - Page ID: ${targetPageId}`);
      }
      
      // Update the '암기' checkbox in Notion using the correct page ID
      await notion.pages.update({
        page_id: targetPageId,
        properties: {
          '암기': {
            checkbox: insertProgress.known
          }
        }
      });
      
      console.log(`SUCCESS: Updated grammar progress in Notion for page ${targetPageId}`);
      console.log('=== PROGRESS RECORDING END ===');

      return {
        id: Date.now(),
        grammarFlashcardId: insertProgress.grammarFlashcardId,
        known: insertProgress.known
      };
    } catch (error) {
      console.error("ERROR in recordGrammarProgress:", error);
      throw error;
    }
  }

  async getGrammarProgressStats(level?: string): Promise<{ known: number; unknown: number }> {
    try {
      // Determine which grammar database to use based on level
      const grammarDatabaseId = this.grammarDatabaseIds.get(level || "N2") || this.grammarDatabaseId;
      
      // Get all pages from the grammar database 
      const allResults: any[] = [];
      let hasMore = true;
      let startCursor: string | undefined = undefined;

      while (hasMore) {
        const response = await notion.databases.query({
          database_id: grammarDatabaseId,
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

      console.log(`Grammar progress stats for ${level || "N2"}:`);
      console.log(`Total entries: ${allResults.length}`);
      console.log(`Known: ${known}, Unknown: ${unknown}`);

      return { known, unknown };
    } catch (error) {
      console.error("Error getting grammar progress stats:", error);
      throw error;
    }
  }

  // Expression flashcard methods using Notion database
  async getAllExpressionFlashcards(sortDirection: "ascending" | "descending" = "ascending"): Promise<ExpressionFlashcard[]> {
    try {
      const { notion } = await import('./notion');
      
      let hasMore = true;
      let startCursor: string | undefined = undefined;
      const allResults: any[] = [];

      while (hasMore) {
        const response = await notion.databases.query({
          database_id: this.expressionDatabaseId,
          start_cursor: startCursor,
          sorts: [
            {
              property: "Random",
              direction: Math.random() > 0.5 ? "ascending" : "descending"
            }
          ]
        });

        allResults.push(...response.results);
        hasMore = response.has_more;
        startCursor = response.next_cursor || undefined;
      }

      console.log(`Retrieved ${allResults.length} expression flashcards from Notion`);

      // Shuffle the results for random order
      const shuffledResults = allResults.sort(() => Math.random() - 0.5);

      return shuffledResults.map((page: any, index: number) => {
        const properties = page.properties;

        return {
          id: index + 1,
          notionPageId: page.id,
          mainExpression: properties['표현(일본어)']?.title?.[0]?.plain_text || "",
          mainMeaning: properties['뜻(한국어)']?.rich_text?.[0]?.plain_text || "",
          application1: properties['응용1J']?.rich_text?.[0]?.plain_text || "",
          application1Korean: properties['응용1K']?.rich_text?.[0]?.plain_text || "",
          application2: properties['응용2J']?.rich_text?.[0]?.plain_text || "",
          application2Korean: properties['응용2K']?.rich_text?.[0]?.plain_text || "",
          application3: properties['응용3J']?.rich_text?.[0]?.plain_text || "",
          application3Korean: properties['응용3K']?.rich_text?.[0]?.plain_text || "",
          application4: properties['응용4J']?.rich_text?.[0]?.plain_text || "",
          application4Korean: properties['응용4K']?.rich_text?.[0]?.plain_text || "",
          application5: properties['응용5J']?.rich_text?.[0]?.plain_text || "",
          application5Korean: properties['응용5K']?.rich_text?.[0]?.plain_text || "",
        };
      });
    } catch (error) {
      console.error("Error fetching expression flashcards from Notion:", error);
      // Fallback to MemStorage if Notion access fails
      console.log("Falling back to MemStorage for expression flashcards");
      return this.memStorage.getAllExpressionFlashcards(sortDirection);
    }
  }

  async getExpressionFlashcard(id: number): Promise<ExpressionFlashcard | undefined> {
    const flashcards = await this.getAllExpressionFlashcards();
    return flashcards.find(card => card.id === id);
  }

  async createExpressionFlashcard(flashcard: InsertExpressionFlashcard): Promise<ExpressionFlashcard> {
    // For now, return a mock implementation since we're reading from Notion
    const id = Date.now();
    return {
      id,
      notionPageId: null,
      ...flashcard,
    };
  }

  // Expression progress methods (using in-memory for now since Notion doesn't have progress tracking)
  private memStorage = new MemStorage();

  async getExpressionProgress(): Promise<ExpressionProgress[]> {
    return this.memStorage.getExpressionProgress();
  }

  async recordExpressionProgress(progress: InsertExpressionProgress): Promise<ExpressionProgress> {
    return this.memStorage.recordExpressionProgress(progress);
  }

  async getExpressionProgressStats(): Promise<{ known: number; unknown: number }> {
    return this.memStorage.getExpressionProgressStats();
  }
}

export const storage = process.env.N2_NOTION_INTEGRATION_SECRET && process.env.N2_NOTION_PAGE_URL 
  ? new NotionStorage() 
  : new MemStorage();