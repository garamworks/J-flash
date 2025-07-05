import { notion } from "./notion";

async function checkGrammarDatabase() {
  const grammarDatabaseId = "227fe404b3dc8040946ce0921f4d9550";
  
  try {
    console.log("Checking N2 grammar database structure...");
    
    // Get database info
    const database = await notion.databases.retrieve({
      database_id: grammarDatabaseId
    });
    
    console.log("Database title:", database.title);
    console.log("Available properties:");
    
    for (const [key, value] of Object.entries(database.properties)) {
      console.log(`- ${key}: ${value.type}`);
    }
    
    // Get a few sample pages to understand the data structure
    const response = await notion.databases.query({
      database_id: grammarDatabaseId,
      page_size: 3
    });
    
    console.log("\nSample pages:");
    response.results.forEach((page: any, index: number) => {
      console.log(`\nPage ${index + 1}:`);
      console.log(`ID: ${page.id}`);
      
      const properties = page.properties;
      for (const [key, value] of Object.entries(properties)) {
        let content = "N/A";
        
        if (value && typeof value === 'object') {
          const prop = value as any;
          
          if (prop.type === 'title' && prop.title && prop.title.length > 0) {
            content = prop.title[0].plain_text;
          } else if (prop.type === 'rich_text' && prop.rich_text && prop.rich_text.length > 0) {
            content = prop.rich_text[0].plain_text;
          } else if (prop.type === 'checkbox') {
            content = prop.checkbox ? "true" : "false";
          } else if (prop.type === 'select' && prop.select) {
            content = prop.select.name;
          } else if (prop.type === 'files' && prop.files && prop.files.length > 0) {
            content = `${prop.files.length} file(s)`;
          }
        }
        
        console.log(`  ${key}: ${content}`);
      }
    });
    
  } catch (error) {
    console.error("Error checking grammar database:", error);
  }
}

checkGrammarDatabase();