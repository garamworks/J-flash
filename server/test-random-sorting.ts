import { NotionStorage } from "./storage";

async function testRandomSorting() {
  console.log("Testing Random field sorting...");
  
  const storage = new NotionStorage();
  
  try {
    // Test fetching grammar flashcards (should be sorted by Random field)
    console.log("\nFetching grammar flashcards with Random field sorting...");
    const flashcards = await storage.getAllGrammarFlashcards();
    
    console.log(`Retrieved ${flashcards.length} grammar flashcards`);
    
    // Show first 5 flashcards to verify sorting
    console.log("\nFirst 5 flashcards (sorted by Random field):");
    for (let i = 0; i < Math.min(5, flashcards.length); i++) {
      const card = flashcards[i];
      console.log(`${i + 1}. ${card.grammar} - ${card.problemSentence}`);
    }
    
    // Test descending sort
    console.log("\nTesting descending sort...");
    const flashcardsDesc = await storage.getAllGrammarFlashcards("descending");
    console.log("\nFirst 5 flashcards (descending order):");
    for (let i = 0; i < Math.min(5, flashcardsDesc.length); i++) {
      const card = flashcardsDesc[i];
      console.log(`${i + 1}. ${card.grammar} - ${card.problemSentence}`);
    }
    
    // Verify the orders are different
    if (flashcards[0].grammar !== flashcardsDesc[0].grammar) {
      console.log("\n✓ Sorting is working correctly - ascending and descending orders are different");
    } else {
      console.log("\n⚠️  Sorting may not be working - first items are the same");
    }
    
  } catch (error) {
    console.error("Error testing Random field sorting:", error);
  }
}

testRandomSorting();