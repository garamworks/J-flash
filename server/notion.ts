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

// Get all flashcards from the Notion database
export async function getFlashcardsFromNotion(flashcardsDatabaseId: string) {
    try {
        const response = await notion.databases.query({
            database_id: flashcardsDatabaseId,
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            return {
                id: parseInt(page.id.replace(/-/g, '').slice(-8), 16), // Convert to number for compatibility
                notionId: page.id,
                japanese: properties.Japanese?.title?.[0]?.plain_text || "",
                furigana: properties.Furigana?.rich_text?.[0]?.plain_text || "",
                korean: properties.Korean?.rich_text?.[0]?.plain_text || "",
                exampleJapanese: properties.ExampleJapanese?.rich_text?.[0]?.plain_text || "",
                exampleKorean: properties.ExampleKorean?.rich_text?.[0]?.plain_text || "",
            };
        });
    } catch (error) {
        console.error("Error fetching flashcards from Notion:", error);
        throw new Error("Failed to fetch flashcards from Notion");
    }
}

// Get user progress from the Notion database
export async function getProgressFromNotion(progressDatabaseId: string) {
    try {
        const response = await notion.databases.query({
            database_id: progressDatabaseId,
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            return {
                id: parseInt(page.id.replace(/-/g, '').slice(-8), 16),
                notionId: page.id,
                flashcardId: properties.FlashcardId?.number || 0,
                isKnown: properties.IsKnown?.checkbox || false,
                timestamp: properties.Timestamp?.date?.start 
                    ? new Date(properties.Timestamp.date.start)
                    : new Date(),
            };
        });
    } catch (error) {
        console.error("Error fetching progress from Notion:", error);
        throw new Error("Failed to fetch progress from Notion");
    }
}

// Record progress in Notion
export async function recordProgressInNotion(progressDatabaseId: string, flashcardId: number, isKnown: boolean) {
    try {
        await notion.pages.create({
            parent: {
                database_id: progressDatabaseId
            },
            properties: {
                FlashcardId: {
                    number: flashcardId
                },
                IsKnown: {
                    checkbox: isKnown
                },
                Timestamp: {
                    date: {
                        start: new Date().toISOString()
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error recording progress in Notion:", error);
        throw new Error("Failed to record progress in Notion");
    }
}