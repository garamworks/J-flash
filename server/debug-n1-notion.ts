import { notion } from './notion';

async function debugN1NotionConnection() {
  console.log("=== N1 Notion Database Debug ===");
  
  const n1DatabaseId = "216fe404b3dc80e49e28d68b149ce1bd";
  const n1DatabaseIdWithHyphens = "216fe404-b3dc-80e4-9e28-d68b149ce1bd";
  
  try {
    console.log(`Attempting to connect to N1 database: ${n1DatabaseId}`);
    
    // First, try to retrieve the database info
    const databaseInfo = await notion.databases.retrieve({
      database_id: n1DatabaseId
    });
    
    console.log("Database info retrieved successfully:");
    console.log("- Database ID:", databaseInfo.id);
    console.log("- Database Title:", databaseInfo.title);
    console.log("- Properties:", Object.keys(databaseInfo.properties));
    
    // Try to query the database
    const queryResponse = await notion.databases.query({
      database_id: n1DatabaseId,
      page_size: 5
    });
    
    console.log(`\nQuery successful! Found ${queryResponse.results.length} pages`);
    
    if (queryResponse.results.length > 0) {
      const firstPage = queryResponse.results[0] as any;
      console.log("\nFirst page properties:");
      console.log("- Page ID:", firstPage.id);
      console.log("- Properties:", Object.keys(firstPage.properties));
      
      // Check specific properties for N1 vocabulary
      const props = firstPage.properties;
      console.log("- Japanese:", props.Japanese?.title?.[0]?.plain_text || props['단어(일본어)']?.title?.[0]?.plain_text || "N/A");
      console.log("- Korean:", props.Korean?.rich_text?.[0]?.plain_text || props['뜻(한국어)']?.rich_text?.[0]?.plain_text || "N/A");
      console.log("- Furigana:", props.Furigana?.rich_text?.[0]?.plain_text || props['후리가나']?.rich_text?.[0]?.plain_text || "N/A");
    }
    
  } catch (error) {
    console.error("Error connecting to N1 database:", error);
    
    // Try with hyphenated ID
    try {
      console.log(`\nTrying with hyphenated ID: ${n1DatabaseIdWithHyphens}`);
      const databaseInfo = await notion.databases.retrieve({
        database_id: n1DatabaseIdWithHyphens
      });
      
      console.log("Hyphenated ID worked!");
      console.log("- Database ID:", databaseInfo.id);
      console.log("- Database Title:", databaseInfo.title);
      
    } catch (error2) {
      console.error("Hyphenated ID also failed:", error2);
    }
  }
}

// Run the debug
debugN1NotionConnection().then(() => {
  console.log("Debug complete");
  process.exit(0);
}).catch(error => {
  console.error("Debug failed:", error);
  process.exit(1);
});