import { storage } from "./storage";

async function testGrammarData() {
  try {
    console.log("Getting grammar flashcards...");
    const cards = await storage.getAllGrammarFlashcards();
    
    console.log(`Total cards: ${cards.length}`);
    console.log("\nFirst 5 cards:");
    
    cards.slice(0, 5).forEach((card, index) => {
      console.log(`\nCard ${index + 1}:`);
      console.log(`  ID: ${card.id}`);
      console.log(`  Problem Sentence: "${card.problemSentence}"`);
      console.log(`  Grammar: "${card.grammar}"`);
      console.log(`  Example Sentence: "${card.exampleSentence}"`);
      console.log(`  Notion Page ID: ${card.notionPageId}`);
    });
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testGrammarData();