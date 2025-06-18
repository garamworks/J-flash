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
export async function getFlashcardsFromNotion(flashcardsDatabaseId: string, sortDirection: "ascending" | "descending" = "ascending") {
    try {
        const allResults: any[] = [];
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        // Fetch all pages using pagination
        while (hasMore) {
            try {
                // First try with Random sorting
                const response = await notion.databases.query({
                    database_id: flashcardsDatabaseId,
                    filter: {
                        property: "암기",
                        checkbox: {
                            equals: false
                        }
                    },
                    sorts: [
                        {
                            property: "Random",
                            direction: sortDirection
                        }
                    ],
                    start_cursor: startCursor,
                    page_size: 100 // Maximum allowed by Notion API
                });

                allResults.push(...response.results);
                hasMore = response.has_more;
                startCursor = response.next_cursor || undefined;
            } catch (error: any) {
                // If Random property doesn't exist, try without sorting
                if (error.code === 'validation_error' && error.message?.includes('Random')) {
                    console.log('Random property not found, fetching without sorting');
                    try {
                        const response = await notion.databases.query({
                            database_id: flashcardsDatabaseId,
                            filter: {
                                property: "암기",
                                checkbox: {
                                    equals: false
                                }
                            },
                            start_cursor: startCursor,
                            page_size: 100 // Maximum allowed by Notion API
                        });

                        allResults.push(...response.results);
                        hasMore = response.has_more;
                        startCursor = response.next_cursor || undefined;
                    } catch (filterError: any) {
                        // If "암기" property doesn't exist either, fetch all pages without filter
                        if (filterError.code === 'validation_error' && filterError.message?.includes('암기')) {
                            console.log('암기 property not found, fetching all pages');
                            const response = await notion.databases.query({
                                database_id: flashcardsDatabaseId,
                                start_cursor: startCursor,
                                page_size: 100 // Maximum allowed by Notion API
                            });

                            allResults.push(...response.results);
                            hasMore = response.has_more;
                            startCursor = response.next_cursor || undefined;
                        } else {
                            throw filterError;
                        }
                    }
                } else {
                    throw error;
                }
            }
        }

        console.log(`Loaded ${allResults.length} flashcards from Notion database`);

        return allResults.map((page: any) => {
            const properties = page.properties;

            // Extract image URL from files field
            let imageUrl = "";
            if (properties['img']?.files && properties['img'].files.length > 0) {
                const imageFile = properties['img'].files[0];
                if (imageFile.type === 'external') {
                    imageUrl = imageFile.external.url;
                } else if (imageFile.type === 'file') {
                    imageUrl = imageFile.file.url;
                }
            }

            // Extract audio URL from 오디오(예문) field
            let audioUrl = "";
            if (properties['오디오(예문)']?.files && properties['오디오(예문)'].files.length > 0) {
                const audioFile = properties['오디오(예문)'].files[0];
                if (audioFile.type === 'external') {
                    audioUrl = audioFile.external.url;
                } else if (audioFile.type === 'file') {
                    audioUrl = audioFile.file.url;
                }
            }

            // Check if this is hiragana/katakana database or vocabulary database
            const isHiraganaKatakana = properties['문자'] || properties['파일명_히라가나'];
            
            if (isHiraganaKatakana) {
                // Hiragana/Katakana database mapping
                const character = properties['문자']?.title?.[0]?.plain_text || properties['문자']?.rich_text?.[0]?.plain_text || "";
                const hiraganaFilename = properties['파일명_히라가나']?.rich_text?.[0]?.plain_text || "";
                const word = properties['단어']?.rich_text?.[0]?.plain_text || "";
                const wordMeaning = properties['단어 뜻']?.rich_text?.[0]?.plain_text || "";
                
                return {
                    id: parseInt(page.id.replace(/-/g, '').slice(-8), 16),
                    japanese: character,
                    furigana: hiraganaFilename,
                    korean: wordMeaning,
                    sentence: word,
                    sentenceKorean: wordMeaning,
                    imageUrl: imageUrl || "",
                    audioUrl: audioUrl || null,
                };
            } else {
                // Regular vocabulary database mapping
                return {
                    id: parseInt(page.id.replace(/-/g, '').slice(-8), 16),
                    japanese: properties['단어']?.title?.[0]?.plain_text || "",
                    furigana: properties['독음']?.rich_text?.[0]?.plain_text || "",
                    korean: properties['뜻']?.rich_text?.[0]?.plain_text || "",
                    sentence: properties['예문']?.rich_text?.[0]?.plain_text || "",
                    sentenceKorean: properties['예문 해석']?.rich_text?.[0]?.plain_text || "",
                    imageUrl: imageUrl || "",
                    audioUrl: audioUrl || null,
                };
            }
        });
    } catch (error) {
        console.error("Error fetching flashcards from Notion:", error);
        throw new Error("Failed to fetch flashcards from Notion");
    }
}

// Update progress in existing Notion database using the "암기" checkbox field
export async function updateProgressInNotion(databaseId: string, pageId: string, isKnown: boolean) {
    try {
        console.log('Attempting to update Notion page:', pageId, 'with checkbox value:', isKnown);
        
        const updateResult = await notion.pages.update({
            page_id: pageId,
            properties: {
                '암기': {
                    checkbox: isKnown
                }
            }
        });
        
        console.log('Notion update successful:', updateResult.id);
    } catch (error) {
        console.error("Error updating progress in Notion:", error);
        console.error("Page ID:", pageId);
        console.error("Checkbox value:", isKnown);
        throw new Error("Failed to update progress in Notion");
    }
}