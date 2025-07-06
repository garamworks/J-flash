import { getHiraganaKatakanaFlashcardsFromNotion } from "./notion";

async function testHiraganaFunction() {
    const hiraganaKatakanaDatabaseId = "215fe404b3dc8040bac6f54c99a949a8";
    
    try {
        console.log("Testing Hiragana/Katakana function...");
        
        const flashcards = await getHiraganaKatakanaFlashcardsFromNotion(hiraganaKatakanaDatabaseId, "ascending");
        
        console.log(`SUCCESS: Retrieved ${flashcards.length} hiragana/katakana flashcards`);
        
        if (flashcards.length > 0) {
            console.log("First few flashcards:");
            flashcards.slice(0, 5).forEach((card, index) => {
                console.log(`${index + 1}. Japanese: "${card.japanese}", Korean: "${card.korean}", Furigana: "${card.furigana}"`);
            });
        }
        
    } catch (error) {
        console.error("Error testing hiragana function:", error);
    }
}

testHiraganaFunction().then(() => {
    console.log("Test complete");
    process.exit(0);
}).catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
