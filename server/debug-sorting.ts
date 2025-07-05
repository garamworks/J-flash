import { notion } from "./notion";

async function debugSorting() {
  const grammarDatabaseId = "227fe404b3dc8040946ce0921f4d9550";
  
  try {
    console.log("Debugging Random field sorting...");
    
    // Get first 10 pages to check Random field values
    const response = await notion.databases.query({
      database_id: grammarDatabaseId,
      page_size: 10
    });
    
    console.log("\nFirst 10 pages in database order:");
    const pagesWithRandom = response.results.map((page: any, index: number) => {
      const properties = page.properties;
      const grammar = properties['문법']?.title?.[0]?.plain_text || "";
      const randomValue = properties['Random']?.formula?.number || 0;
      
      return {
        index: index + 1,
        grammar,
        randomValue
      };
    });
    
    pagesWithRandom.forEach(page => {
      console.log(`${page.index}. ${page.grammar} (Random: ${page.randomValue})`);
    });
    
    // Sort by Random field
    const sortedPages = [...pagesWithRandom].sort((a, b) => a.randomValue - b.randomValue);
    
    console.log("\nSame pages sorted by Random field:");
    sortedPages.forEach((page, index) => {
      console.log(`${index + 1}. ${page.grammar} (Random: ${page.randomValue})`);
    });
    
    // Check if sorting actually changes the order
    const originalOrder = pagesWithRandom.map(p => p.grammar).join(", ");
    const sortedOrder = sortedPages.map(p => p.grammar).join(", ");
    
    if (originalOrder !== sortedOrder) {
      console.log("\n✓ Sorting is working - order has changed");
    } else {
      console.log("\n⚠️  Sorting may not be working - order is the same");
    }
    
  } catch (error) {
    console.error("Error debugging sorting:", error);
  }
}

debugSorting();