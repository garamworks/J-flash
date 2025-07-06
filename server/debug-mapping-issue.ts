import { NotionStorage } from "./storage";

async function testMappingIssue() {
    try {
        console.log("Testing database mapping...");
        
        const storage = new NotionStorage();
        
        // Test all level mappings
        const levels = ["N1", "N2", "N3", "N4", "Hiragana/Katakana"];
        
        for (const level of levels) {
            console.log(`\nTesting level: ${level}`);
            try {
                const flashcards = await storage.getAllFlashcards("ascending", level);
                console.log(`- ${level}: ${flashcards.length} flashcards loaded`);
                
                if (flashcards.length > 0) {
                    console.log(`- Sample: ${flashcards[0].japanese} -> ${flashcards[0].korean}`);
                }
            } catch (error) {
                console.log(`- ${level}: Error - ${(error as any).message}`);
            }
        }
        
    } catch (error) {
        console.error("Error in mapping test:", error);
    }
}

testMappingIssue().then(() => {
    console.log("\nTest complete");
    process.exit(0);
}).catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
