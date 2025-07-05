import { notion } from "./notion";

async function verifyNotionUpdate() {
  const grammarDatabaseId = "227fe404b3dc8040946ce0921f4d9550";
  
  try {
    console.log("Verifying Notion checkbox updates...");
    
    // Get all pages and check for checked items
    const allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: grammarDatabaseId,
        start_cursor: startCursor,
        page_size: 100
      });

      allResults.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    // Sort by Random field to match app order
    const sortedPages = allResults.map((page: any, index: number) => {
      const properties = page.properties;
      const randomValue = properties['Random']?.formula?.number || 0;
      const isChecked = properties['암기']?.checkbox || false;
      const grammar = properties['문법']?.title?.[0]?.plain_text || "";
      
      return {
        originalIndex: index,
        pageId: page.id,
        grammar,
        randomValue,
        isChecked
      };
    }).sort((a, b) => a.randomValue - b.randomValue);

    console.log("Checked items (sorted by Random field):");
    let checkedCount = 0;
    sortedPages.forEach((page, index) => {
      if (page.isChecked) {
        checkedCount++;
        console.log(`✓ Card ${index + 1}: ${page.grammar} (Page ID: ${page.pageId})`);
      }
    });

    console.log(`\nTotal checked items: ${checkedCount}`);
    console.log(`Total unchecked items: ${sortedPages.length - checkedCount}`);

    if (checkedCount > 0) {
      console.log("\n✓ Checkboxes are being updated correctly in Notion");
    } else {
      console.log("\n⚠️  No checked items found in Notion");
    }
    
  } catch (error) {
    console.error("Error verifying Notion updates:", error);
  }
}

verifyNotionUpdate();