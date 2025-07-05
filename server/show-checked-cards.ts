import { notion } from "./notion";

async function showCheckedCards() {
  const grammarDatabaseId = "227fe404b3dc8040946ce0921f4d9550";
  
  try {
    console.log("Showing all checked cards with their Notion URLs...");
    
    const response = await notion.databases.query({
      database_id: grammarDatabaseId,
      filter: {
        property: '암기',
        checkbox: {
          equals: true
        }
      }
    });

    if (response.results.length === 0) {
      console.log("No checked cards found.");
      return;
    }

    console.log(`Found ${response.results.length} checked card(s):`);
    
    response.results.forEach((page: any, index: number) => {
      const properties = page.properties;
      const grammar = properties['문법']?.title?.[0]?.plain_text || "Unknown";
      const problemSentence = properties['문제풀이']?.rich_text?.[0]?.plain_text || "";
      const pageId = page.id;
      const notionUrl = `https://www.notion.so/${pageId.replace(/-/g, '')}`;
      
      console.log(`\n${index + 1}. Grammar: ${grammar}`);
      console.log(`   Problem: ${problemSentence}`);
      console.log(`   Notion URL: ${notionUrl}`);
      console.log(`   Page ID: ${pageId}`);
    });
    
  } catch (error) {
    console.error("Error showing checked cards:", error);
  }
}

showCheckedCards();