import { notion } from "./notion";

async function testN3WithFilter() {
    const n3DatabaseId = "216fe404b3dc804a9130f21b2b3a0e54";
    
    try {
        console.log("Testing N3 database with 암기 filter...");
        
        const response = await notion.databases.query({
            database_id: n3DatabaseId,
            filter: {
                property: "암기",
                checkbox: {
                    equals: false
                }
            },
            page_size: 5
        });
        
        console.log(`SUCCESS: Retrieved ${response.results.length} unchecked pages from N3 database`);
        
        if (response.results.length > 0) {
            const page = response.results[0] as any;
            console.log("Sample page fields:");
            console.log("- 단어:", page.properties['단어']?.title?.[0]?.plain_text);
            console.log("- 뜻:", page.properties['뜻']?.rich_text?.[0]?.plain_text);
            console.log("- 독음:", page.properties['독음']?.rich_text?.[0]?.plain_text);
            console.log("- 암기:", page.properties['암기']?.checkbox);
        }
        
    } catch (error) {
        console.error("Error with filter:", error);
        
        // Try without filter
        console.log("Trying without filter...");
        try {
            const response2 = await notion.databases.query({
                database_id: n3DatabaseId,
                page_size: 5
            });
            
            console.log(`SUCCESS without filter: Retrieved ${response2.results.length} pages`);
        } catch (error2) {
            console.error("Error without filter:", error2);
        }
    }
}

testN3WithFilter().then(() => {
    console.log("Test complete");
    process.exit(0);
}).catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
