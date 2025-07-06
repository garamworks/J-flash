import { NotionStorage } from "./storage";

async function testN3Full() {
    try {
        console.log("Testing full N3 flashcard retrieval...");
        
        const storage = new NotionStorage();
        const flashcards = await storage.getAllFlashcards("ascending", "N3");
        
        console.log(`SUCCESS: Retrieved ${flashcards.length} N3 flashcards`);
        if (flashcards.length > 0) {
            console.log("First flashcard:", {
                id: flashcards[0].id,
                japanese: flashcards[0].japanese,
                korean: flashcards[0].korean,
                furigana: flashcards[0].furigana
            });
        }
        
    } catch (error) {
        console.error("Error in full N3 test:", error);
    }
}

testN3Full().then(() => {
    console.log("Test complete");
    process.exit(0);
}).catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
