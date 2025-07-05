import { storage } from "./storage";

async function testMappingIssue() {
  console.log("Testing ID mapping between getAllGrammarFlashcards and recordGrammarProgress...");
  
  try {
    // Get the flashcards as shown to user
    const flashcards = await storage.getAllGrammarFlashcards();
    console.log(`\nFirst 5 flashcards shown to user:`);
    flashcards.slice(0, 5).forEach((card, index) => {
      console.log(`ID ${card.id}: ${card.grammar} - ${card.problemSentence}`);
    });
    
    // Test what happens when we record progress for ID 1
    console.log(`\n=== Testing progress recording for flashcard ID 1 ===`);
    await storage.recordGrammarProgress({ grammarFlashcardId: 1, known: false }); // Use false to avoid actually checking it
    
  } catch (error) {
    console.error("Error testing mapping:", error);
  }
}

testMappingIssue();