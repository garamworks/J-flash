import { notion } from "./notion";

async function testN4Access() {
    const n4DatabaseId = "215fe404b3dc8099b972e96296fc14af";
    
    try {
        console.log("Testing N4 database access...");
        
        const response = await notion.databases.query({
            database_id: n4DatabaseId,
            page_size: 5
        });
        
        console.log(`SUCCESS: Retrieved ${response.results.length} pages from N4 database`);
        console.log("Database properties:", Object.keys(response.results[0]?.properties || {}));
        
        if (response.results.length > 0) {
            const page = response.results[0] as any;
            console.log("Sample page fields:");
            console.log("- 단어:", page.properties['단어']?.title?.[0]?.plain_text);
            console.log("- 뜻:", page.properties['뜻']?.rich_text?.[0]?.plain_text);
            console.log("- 독음:", page.properties['독음']?.rich_text?.[0]?.plain_text);
            console.log("- 암기:", page.properties['암기']?.checkbox);
        }
        
    } catch (error) {
        console.error("Error accessing N4 database:", error);
    }
}

testN4Access().then(() => {
    console.log("Test complete");
    process.exit(0);
}).catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
