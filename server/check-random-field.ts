import { notion } from "./notion";

async function checkRandomField() {
  const grammarDatabaseId = "227fe404b3dc8040946ce0921f4d9550";
  
  try {
    console.log("Checking Random field in grammar database...");
    
    // Get a few sample pages to see the Random field structure
    const response = await notion.databases.query({
      database_id: grammarDatabaseId,
      page_size: 5
    });
    
    console.log("Sample Random field values:");
    response.results.forEach((page: any, index: number) => {
      const properties = page.properties;
      const randomValue = properties['Random'];
      
      console.log(`Page ${index + 1}:`);
      console.log(`  Random field type: ${randomValue?.type}`);
      console.log(`  Random value:`, randomValue?.formula || randomValue?.number || randomValue);
      console.log(`  Grammar: ${properties['문법']?.title?.[0]?.plain_text || 'N/A'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error("Error checking Random field:", error);
  }
}

checkRandomField();