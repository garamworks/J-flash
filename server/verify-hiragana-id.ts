import { notion } from "./notion";

async function verifyHiraganaId() {
    const currentId = "215fe404b3dc8040bac6f54c99a949a8";
    
    try {
        console.log("Verifying Hiragana/Katakana database ID:", currentId);
        
        const response = await notion.databases.query({
            database_id: currentId,
            page_size: 10
        });
        
        console.log(`Retrieved ${response.results.length} pages`);
        console.log("Properties:", Object.keys(response.results[0]?.properties || {}));
        
        // Check if this is really hiragana/katakana data
        console.log("\nSample entries:");
        response.results.slice(0, 5).forEach((page: any, index: number) => {
            const japanese = page.properties['문자']?.rich_text?.[0]?.plain_text || 
                           page.properties['단어']?.title?.[0]?.plain_text || 'N/A';
            const korean = page.properties['단어뜻']?.rich_text?.[0]?.plain_text || 
                         page.properties['뜻']?.rich_text?.[0]?.plain_text || 'N/A';
            console.log(`${index + 1}. Japanese: "${japanese}", Korean: "${korean}"`);
        });
        
    } catch (error) {
        console.error("Error verifying database:", error);
    }
}

verifyHiraganaId().then(() => {
    console.log("Verification complete");
    process.exit(0);
}).catch(error => {
    console.error("Verification failed:", error);
    process.exit(1);
});
