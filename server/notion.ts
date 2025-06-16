import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET!,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw Error("Failed to extract page ID");
}

export const NOTION_PAGE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL!);

/**
 * Lists all child databases contained within NOTION_PAGE_ID
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of database objects with id and title
 */
export async function getNotionDatabases() {

    // Array to store the child databases
    const childDatabases = [];

    try {
        // Query all child blocks in the specified page
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: NOTION_PAGE_ID,
                start_cursor: startCursor,
            });

            // Process the results
            for (const block of response.results) {
                // Check if the block is a child database
                if (block.object === "block" && "type" in block && block.type === "child_database") {
                    const databaseId = block.id;

                    // Retrieve the database title
                    try {
                        const databaseInfo = await notion.databases.retrieve({
                            database_id: databaseId,
                        });

                        // Add the database to our list
                        childDatabases.push(databaseInfo);
                    } catch (error) {
                        console.error(`Error retrieving database ${databaseId}:`, error);
                    }
                }
            }

            // Check if there are more results to fetch
            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
        }

        return childDatabases;
    } catch (error) {
        console.error("Error listing child databases:", error);
        throw error;
    }
}

// Find get a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
    const databases = await getNotionDatabases();

    for (const db of databases) {
        if (db.object === "database") {
            const dbData = db as any;
            if (dbData.title && Array.isArray(dbData.title) && dbData.title.length > 0) {
                const dbTitle = dbData.title[0]?.plain_text?.toLowerCase() || "";
                if (dbTitle === title.toLowerCase()) {
                    return db;
                }
            }
        }
    }

    return null;
}

// Create a new database if one with a matching title does not exist
export async function createDatabaseIfNotExists(title: string, properties: any) {
    const existingDb = await findDatabaseByTitle(title);
    if (existingDb) {
        return existingDb;
    }
    return await notion.databases.create({
        parent: {
            type: "page_id",
            page_id: NOTION_PAGE_ID
        },
        title: [
            {
                type: "text",
                text: {
                    content: title
                }
            }
        ],
        properties
    });
}

// Get all flashcards from the existing Notion database
export async function getFlashcardsFromNotion(flashcardsDatabaseId: string) {
    try {
        const response = await notion.databases.query({
            database_id: flashcardsDatabaseId,
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            return {
                id: parseInt(page.id.replace(/-/g, '').slice(-8), 16), // Convert to number for compatibility
                japanese: properties['단어']?.title?.[0]?.plain_text || "",
                furigana: properties['독음']?.rich_text?.[0]?.plain_text || "",
                korean: properties['뜻']?.rich_text?.[0]?.plain_text || "",
                sentence: properties['예문']?.rich_text?.[0]?.plain_text || "",
                sentenceKorean: properties['예문 해석']?.rich_text?.[0]?.plain_text || "",
                imageUrl: "", // Will be empty for now
            };
        });
    } catch (error) {
        console.error("Error fetching flashcards from Notion:", error);
        throw new Error("Failed to fetch flashcards from Notion");
    }
}

// Update progress in existing Notion database using the "암기" checkbox field
export async function updateProgressInNotion(databaseId: string, pageId: string, isKnown: boolean) {
    try {
        await notion.pages.update({
            page_id: pageId,
            properties: {
                '암기': {
                    checkbox: isKnown
                }
            }
        });
    } catch (error) {
        console.error("Error updating progress in Notion:", error);
        throw new Error("Failed to update progress in Notion");
    }
}