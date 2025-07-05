import { notion, NOTION_PAGE_ID } from "./notion";

// List all databases accessible to the integration
async function listAccessibleDatabases() {
    try {
        console.log("Listing all accessible databases...");
        
        // Test the specific N2 database ID from the new URL
        const n2DatabaseId = "213fe404b3dc802e8b1bd26d77f8cc84";
        try {
            console.log("Testing direct access to N2 database...");
            const n2Database = await notion.databases.retrieve({ database_id: n2DatabaseId });
            console.log("SUCCESS: N2 database is accessible!");
            console.log("Title:", (n2Database as any).title?.[0]?.plain_text || 'Untitled');
        } catch (error) {
            console.log("Cannot access N2 database:", n2DatabaseId);
            console.log("Error:", (error as any).message);
        }
        
        // First, try to access the parent page
        try {
            const parentPage = await notion.pages.retrieve({ page_id: NOTION_PAGE_ID });
            console.log("Parent page accessed successfully:", NOTION_PAGE_ID);
        } catch (error) {
            console.log("Cannot access parent page:", NOTION_PAGE_ID);
            console.log("Error:", (error as any).message);
        }
        
        // Try to search for databases
        const searchResponse = await notion.search({
            filter: {
                property: "object",
                value: "database"
            }
        });
        
        console.log("\nAccessible databases found:");
        
        if (searchResponse.results.length === 0) {
            console.log("No databases found. This integration might not have access to any databases.");
            console.log("Make sure to share the database with your integration.");
        } else {
            for (const result of searchResponse.results) {
                if (result.object === 'database') {
                    const db = result as any;
                    console.log(`- Database ID: ${db.id}`);
                    console.log(`  Title: ${db.title?.[0]?.plain_text || 'Untitled'}`);
                    console.log(`  URL: https://www.notion.so/${db.id.replace(/-/g, '')}`);
                    console.log("");
                }
            }
        }
        
    } catch (error) {
        console.error("Error listing databases:", error);
    }
}

listAccessibleDatabases();