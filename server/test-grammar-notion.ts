import { NotionStorage } from "./storage";

async function testGrammarNotionIntegration() {
  console.log("Testing N2 grammar Notion integration...");
  
  const storage = new NotionStorage();
  
  try {
    // Test fetching grammar flashcards
    console.log("\n1. Fetching grammar flashcards from Notion...");
    const flashcards = await storage.getAllGrammarFlashcards();
    console.log(`✓ Retrieved ${flashcards.length} grammar flashcards`);
    
    if (flashcards.length > 0) {
      console.log("\nFirst flashcard:");
      console.log(`- Grammar: ${flashcards[0].grammar}`);
      console.log(`- Problem: ${flashcards[0].problemSentence}`);
      console.log(`- Example: ${flashcards[0].exampleSentence}`);
      console.log(`- Korean: ${flashcards[0].exampleKorean}`);
      console.log(`- Meaning: ${flashcards[0].meaning}`);
    }
    
    // Test progress stats
    console.log("\n2. Fetching grammar progress stats...");
    const stats = await storage.getGrammarProgressStats();
    console.log(`✓ Stats: ${stats.known} known, ${stats.unknown} unknown`);
    
    // Test individual flashcard retrieval
    console.log("\n3. Testing individual flashcard retrieval...");
    const firstCard = await storage.getGrammarFlashcard(1);
    if (firstCard) {
      console.log(`✓ Retrieved flashcard ID 1: ${firstCard.grammar}`);
    } else {
      console.log("✗ Could not retrieve flashcard ID 1");
    }
    
    console.log("\n✓ All tests completed successfully!");
    
  } catch (error) {
    console.error("✗ Error during testing:", error);
  }
}

testGrammarNotionIntegration();