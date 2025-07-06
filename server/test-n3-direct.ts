import { notion } from "./notion";

async function testN3DirectAccess() {
    const n3DatabaseId = "216fe404b3dc804a9130f21b2b3a0e54";
    
    try {
        console.log("Testing direct access to N3 database...");
        
        const response = await notion.databases.query({
            database_id: n3DatabaseId,
            page_size: 5
        });
        
        console.log(`SUCCESS: Retrieved ${response.results.length} pages from N3 database`);
        console.log("First page properties:", Object.keys(response.results[0]?.properties || {}));
        
    } catch (error) {
        console.error("Error accessing N3 database:", error);
    }
}

testN3DirectAccess().then(() => {
    console.log("Test complete");
    process.exit(0);
}).catch(error => {
    console.error("Test failed:", error);
    process.exit(1);
});
