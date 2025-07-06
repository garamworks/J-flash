import { notion } from './notion';

async function debugExpressionNotionConnection() {
  console.log("=== Expression Notion Database Debug ===");
  
  const expressionDatabaseId = "228fe404b3dc803786b5fea02dcf9913";
  
  try {
    console.log(`Attempting to connect to Expression database: ${expressionDatabaseId}`);
    
    // First, try to retrieve the database info
    const databaseInfo = await notion.databases.retrieve({
      database_id: expressionDatabaseId
    });
    
    console.log("Database info retrieved successfully:");
    console.log("- Database ID:", databaseInfo.id);
    console.log("- Database Title:", databaseInfo.title);
    console.log("- Properties:", Object.keys(databaseInfo.properties));
    
    // Try to query the database
    const queryResponse = await notion.databases.query({
      database_id: expressionDatabaseId,
      page_size: 5
    });
    
    console.log(`\nQuery successful! Found ${queryResponse.results.length} pages`);
    
    if (queryResponse.results.length > 0) {
      const firstPage = queryResponse.results[0] as any;
      console.log("\nFirst page properties:");
      console.log("- Page ID:", firstPage.id);
      console.log("- Properties:", Object.keys(firstPage.properties));
      
      // Check specific properties
      const props = firstPage.properties;
      console.log("- MainExpression:", props.MainExpression?.title?.[0]?.plain_text || "N/A");
      console.log("- MainMeaning:", props.MainMeaning?.rich_text?.[0]?.plain_text || "N/A");
      console.log("- Application1:", props.Application1?.rich_text?.[0]?.plain_text || "N/A");
    }
    
  } catch (error) {
    console.error("Error connecting to Expression database:", error);
  }
}

// Run the debug
debugExpressionNotionConnection().then(() => {
  console.log("Debug complete");
  process.exit(0);
}).catch(error => {
  console.error("Debug failed:", error);
  process.exit(1);
});