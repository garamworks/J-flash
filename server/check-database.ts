import { notion } from "./notion";

// Check what properties are available in the N2 database
async function checkDatabaseProperties() {
    const databaseId = "213fe404b3dc802e8b1bd26d77f8cc84"; // N2 database ID
    
    try {
        console.log("Checking database properties for N2 database...");
        
        // Get database schema
        const database = await notion.databases.retrieve({
            database_id: databaseId
        });
        
        console.log("Database title:", database.title);
        console.log("Available properties:");
        
        const properties = database.properties;
        for (const [key, value] of Object.entries(properties)) {
            console.log(`- ${key}: ${(value as any).type}`);
        }
        
        // Also check some actual pages to see their properties
        console.log("\nChecking first few pages...");
        const pages = await notion.databases.query({
            database_id: databaseId,
            page_size: 3
        });
        
        for (const page of pages.results) {
            console.log(`\nPage ID: ${page.id}`);
            console.log("Properties:", Object.keys((page as any).properties));
        }
        
    } catch (error) {
        console.error("Error checking database:", error);
    }
}

checkDatabaseProperties();