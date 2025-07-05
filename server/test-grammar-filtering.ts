import { storage } from "./storage";

async function testGrammarFiltering() {
  console.log("Testing grammar flashcard filtering...");
  
  try {
    // Get all grammar flashcards (should only return unchecked ones)
    const flashcards = await storage.getAllGrammarFlashcards();
    console.log(`Found ${flashcards.length} unchecked grammar flashcards`);
    
    // Get progress stats
    const stats = await storage.getGrammarProgressStats();
    console.log(`Progress stats: ${stats.known} known, ${stats.unknown} unknown`);
    
    // Total should be known + unknown
    const total = stats.known + stats.unknown;
    console.log(`Total cards in database: ${total}`);
    console.log(`Cards returned by API: ${flashcards.length}`);
    
    if (flashcards.length === stats.unknown) {
      console.log("✓ Filtering is working correctly - only unchecked cards are returned");
    } else {
      console.log("⚠️  Filtering may not be working - mismatch between API results and stats");
    }
    
    // Show first few cards for verification
    console.log("\nFirst 3 flashcards:");
    flashcards.slice(0, 3).forEach((card, index) => {
      console.log(`${index + 1}. ${card.grammar}: ${card.problemSentence}`);
    });
    
  } catch (error) {
    console.error("Error testing grammar filtering:", error);
  }
}

testGrammarFiltering();