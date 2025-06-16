import { notion, NOTION_PAGE_ID } from "./notion";

async function checkNotionStructure() {
    try {
        console.log("Checking Notion structure...");
        console.log("Page ID:", NOTION_PAGE_ID);
        
        // First, try to get the page/database info
        try {
            const pageInfo = await notion.pages.retrieve({ page_id: NOTION_PAGE_ID });
            console.log("Found page:", pageInfo);
        } catch (pageError) {
            console.log("Not a page, trying as database...");
            try {
                const dbInfo = await notion.databases.retrieve({ database_id: NOTION_PAGE_ID });
                console.log("Found database:", JSON.stringify(dbInfo, null, 2));
                
                // If it's already a database, let's check its structure
                const dbData = dbInfo as any;
                if (dbData.title && Array.isArray(dbData.title)) {
                    const title = dbData.title.map((t: any) => t.plain_text).join("");
                    console.log("Database title:", title);
                }
                
                if (dbData.properties) {
                    console.log("Database properties:", Object.keys(dbData.properties));
                }
                
                // Try to query some entries
                const entries = await notion.databases.query({ 
                    database_id: NOTION_PAGE_ID,
                    page_size: 5
                });
                console.log("Sample entries:", entries.results.length);
                
                if (entries.results.length > 0) {
                    const firstEntry = entries.results[0] as any;
                    console.log("First entry properties:", Object.keys(firstEntry.properties || {}));
                }
                
            } catch (dbError) {
                console.error("Error accessing as database:", dbError);
            }
        }
        
    } catch (error) {
        console.error("Error checking Notion structure:", error);
    }
}

checkNotionStructure().then(() => {
    console.log("Check complete!");
    process.exit(0);
}).catch(error => {
    console.error("Check failed:", error);
    process.exit(1);
});