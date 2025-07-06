import { notion } from "./notion";

async function debugHiraganaFields() {
    const currentId = "215fe404b3dc8040bac6f54c99a949a8";
    
    try {
        console.log("Debugging Hiragana/Katakana field structure...");
        
        const response = await notion.databases.query({
            database_id: currentId,
            page_size: 5
        });
        
        console.log(`Retrieved ${response.results.length} pages`);
        
        // Check the first page in detail
        if (response.results.length > 0) {
            const page = response.results[0] as any;
            console.log("\nDetailed field analysis:");
            
            const properties = page.properties;
            
            // Check all possible character fields
            console.log("문자 field:");
            console.log("- Title:", properties['문자']?.title);
            console.log("- Rich text:", properties['문자']?.rich_text);
            console.log("- Select:", properties['문자']?.select);
            
            console.log("\n단어 field:");
            console.log("- Title:", properties['단어']?.title);
            console.log("- Rich text:", properties['단어']?.rich_text);
            
            console.log("\n단어뜻 field:");
            console.log("- Rich text:", properties['단어뜻']?.rich_text);
            
            console.log("\n발음 field:");
            console.log("- Rich text:", properties['발음']?.rich_text);
            
            console.log("\nAll properties keys:", Object.keys(properties));
        }
        
    } catch (error) {
        console.error("Error debugging fields:", error);
    }
}

debugHiraganaFields().then(() => {
    console.log("Debug complete");
    process.exit(0);
}).catch(error => {
    console.error("Debug failed:", error);
    process.exit(1);
});
