import { notion } from "./notion";

async function testHiraganaAccess() {
    const hiraganaKatakanaDatabaseId = "215fe404b3dc8040bac6f54c99a949a8";
    
    try {
        console.log("Testing Hiragana/Katakana database access...");
        
        const response = await notion.databases.query({
            database_id: hiraganaKatakanaDatabaseId,
            page_size: 10
        });
        
        console.log(`SUCCESS: Retrieved ${response.results.length} pages from Hiragana/Katakana database`);
        console.log("Database properties:", Object.keys(response.results[0]?.properties || {}));
        
        if (response.results.length > 0) {
            console.log("Sample entries:");
            response.results.slice(0, 5).forEach((page: any, index: number) => {
                console.log(`${index + 1}. 단어: ${page.properties['단어']?.title?.[0]?.plain_text || 'N/A'}, 뜻: ${page.properties['뜻']?.rich_text?.[0]?.plain_text || 'N/A'}, 독음: ${page.properties['독음']?.rich_text?.[0]?.plain_text || 'N/A'}, 암기: ${page.properties['암기']?.checkbox}`);
            });
        }
        
    } catch (error) {
        console.error("Error accessing Hiragana/Katakana database:", error);
    }
}

testHiraganaAccess().then(() => {
    console.log("Test complete");
    process.exit(0);
}).catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
