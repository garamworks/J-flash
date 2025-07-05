import { notion } from "./notion";

async function debugNotionFields() {
  try {
    console.log("Fetching first page from grammar database...");
    
    const response = await notion.databases.query({
      database_id: "227fe404b3dc8040946ce0921f4d9550",
      page_size: 1
    });
    
    if (response.results.length > 0) {
      const page = response.results[0] as any;
      
      console.log("Available properties:");
      Object.keys(page.properties).forEach(key => {
        const prop = page.properties[key];
        console.log(`  ${key}: ${prop.type} = ${JSON.stringify(prop, null, 2)}`);
      });
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

debugNotionFields();