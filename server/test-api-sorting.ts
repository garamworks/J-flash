import { storage } from "./storage";

async function testApiSorting() {
  console.log("Testing API sorting through storage interface...");
  
  try {
    // Test the storage interface that the API uses
    console.log("\n1. Testing getAllGrammarFlashcards():");
    const flashcards = await storage.getAllGrammarFlashcards();
    
    console.log(`Retrieved ${flashcards.length} flashcards`);
    
    // Show first 10 flashcards
    console.log("\nFirst 10 flashcards from storage:");
    for (let i = 0; i < Math.min(10, flashcards.length); i++) {
      const card = flashcards[i];
      console.log(`${i + 1}. ${card.grammar} - ${card.problemSentence}`);
    }
    
    // Test descending sort
    console.log("\n2. Testing descending sort:");
    const flashcardsDesc = await storage.getAllGrammarFlashcards("descending");
    
    console.log("\nFirst 10 flashcards (descending):");
    for (let i = 0; i < Math.min(10, flashcardsDesc.length); i++) {
      const card = flashcardsDesc[i];
      console.log(`${i + 1}. ${card.grammar} - ${card.problemSentence}`);
    }
    
    // Check if the storage is using NotionStorage or MemStorage
    console.log("\n3. Storage type check:");
    console.log(`Storage type: ${storage.constructor.name}`);
    
  } catch (error) {
    console.error("Error testing API sorting:", error);
  }
}

testApiSorting();