import { notion } from "./notion";

async function testHiraganaVsN2() {
    const hiraganaKatakanaDatabaseId = "215fe404b3dc8040bac6f54c99a949a8";
    const n2DatabaseId = "213fe404b3dc802e8b1bd26d77f8cc84";
    
    try {
        console.log("Testing Hiragana/Katakana database...");
        
        const hiraganaResponse = await notion.databases.query({
            database_id: hiraganaKatakanaDatabaseId,
            page_size: 3
        });
        
        console.log("Hiragana database properties:", Object.keys(hiraganaResponse.results[0]?.properties || {}));
        
        if (hiraganaResponse.results.length > 0) {
            const page = hiraganaResponse.results[0] as any;
            console.log("Hiragana sample:");
            console.log("- 단어:", page.properties['단어']?.title?.[0]?.plain_text);
            console.log("- 문자:", page.properties['문자']?.title?.[0]?.plain_text);
            console.log("- 단어뜻:", page.properties['단어뜻']?.rich_text?.[0]?.plain_text);
            console.log("- 발음:", page.properties['발음']?.rich_text?.[0]?.plain_text);
        }
        
        console.log("\nTesting N2 database...");
        
        const n2Response = await notion.databases.query({
            database_id: n2DatabaseId,
            page_size: 3
        });
        
        console.log("N2 database properties:", Object.keys(n2Response.results[0]?.properties || {}));
        
        if (n2Response.results.length > 0) {
            const page = n2Response.results[0] as any;
            console.log("N2 sample:");
            console.log("- 단어:", page.properties['단어']?.title?.[0]?.plain_text);
            console.log("- 뜻:", page.properties['뜻']?.rich_text?.[0]?.plain_text);
            console.log("- 독음:", page.properties['독음']?.rich_text?.[0]?.plain_text);
        }
        
    } catch (error) {
        console.error("Error comparing databases:", error);
    }
}

testHiraganaVsN2().then(() => {
    console.log("Test complete");
    process.exit(0);
}).catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
