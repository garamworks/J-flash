import { Client } from "@notionhq/client";
import { notion, NOTION_PAGE_ID, createDatabaseIfNotExists, findDatabaseByTitle } from "./notion";

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

// Setup databases for J-Flash application
async function setupNotionDatabases() {
    console.log("Setting up Notion databases for J-Flash...");
    
    // Create Flashcards database
    await createDatabaseIfNotExists("J-Flash Flashcards", {
        Japanese: {
            title: {}
        },
        Furigana: {
            rich_text: {}
        },
        Korean: {
            rich_text: {}
        },
        ExampleJapanese: {
            rich_text: {}
        },
        ExampleKorean: {
            rich_text: {}
        }
    });

    // Create Progress database
    await createDatabaseIfNotExists("J-Flash Progress", {
        FlashcardId: {
            number: {}
        },
        IsKnown: {
            checkbox: {}
        },
        Timestamp: {
            date: {}
        }
    });

    console.log("Databases created successfully!");
}

async function createSampleFlashcards() {
    try {
        console.log("Adding sample flashcard data...");

        // Find the flashcards database
        const flashcardsDb = await findDatabaseByTitle("J-Flash Flashcards");

        if (!flashcardsDb) {
            throw new Error("Could not find the J-Flash Flashcards database.");
        }

        const flashcards = [
            {
                japanese: "茶道",
                furigana: "さどう",
                korean: "다도",
                exampleJapanese: "茶道を習っています。",
                exampleKorean: "다도를 배우고 있습니다."
            },
            {
                japanese: "図書館",
                furigana: "としょかん",
                korean: "도서관",
                exampleJapanese: "図書館で勉強します。",
                exampleKorean: "도서관에서 공부합니다."
            },
            {
                japanese: "友達",
                furigana: "ともだち",
                korean: "친구",
                exampleJapanese: "友達と映画を見ました。",
                exampleKorean: "친구와 영화를 봤습니다."
            },
            {
                japanese: "料理",
                furigana: "りょうり",
                korean: "요리",
                exampleJapanese: "母の料理はおいしいです。",
                exampleKorean: "어머니의 요리는 맛있습니다."
            },
            {
                japanese: "天気",
                furigana: "てんき",
                korean: "날씨",
                exampleJapanese: "今日は天気がいいです。",
                exampleKorean: "오늘은 날씨가 좋습니다."
            },
            {
                japanese: "電車",
                furigana: "でんしゃ",
                korean: "전차",
                exampleJapanese: "電車で学校に行きます。",
                exampleKorean: "전차로 학교에 갑니다."
            },
            {
                japanese: "買い物",
                furigana: "かいもの",
                korean: "쇼핑",
                exampleJapanese: "買い物に行きました。",
                exampleKorean: "쇼핑하러 갔습니다."
            },
            {
                japanese: "宿題",
                furigana: "しゅくだい",
                korean: "숙제",
                exampleJapanese: "宿題をしなければなりません。",
                exampleKorean: "숙제를 해야 합니다."
            },
            {
                japanese: "散歩",
                furigana: "さんぽ",
                korean: "산책",
                exampleJapanese: "公園で散歩しました。",
                exampleKorean: "공원에서 산책했습니다."
            },
            {
                japanese: "音楽",
                furigana: "おんがく",
                korean: "음악",
                exampleJapanese: "音楽を聞くのが好きです。",
                exampleKorean: "음악 듣는 것을 좋아합니다."
            }
        ];

        for (let flashcard of flashcards) {
            await notion.pages.create({
                parent: {
                    database_id: flashcardsDb.id
                },
                properties: {
                    Japanese: {
                        title: [
                            {
                                text: {
                                    content: flashcard.japanese
                                }
                            }
                        ]
                    },
                    Furigana: {
                        rich_text: [
                            {
                                text: {
                                    content: flashcard.furigana
                                }
                            }
                        ]
                    },
                    Korean: {
                        rich_text: [
                            {
                                text: {
                                    content: flashcard.korean
                                }
                            }
                        ]
                    },
                    ExampleJapanese: {
                        rich_text: [
                            {
                                text: {
                                    content: flashcard.exampleJapanese
                                }
                            }
                        ]
                    },
                    ExampleKorean: {
                        rich_text: [
                            {
                                text: {
                                    content: flashcard.exampleKorean
                                }
                            }
                        ]
                    }
                }
            });

            console.log(`Created flashcard: ${flashcard.japanese}`);
        }

        console.log("Sample flashcard data creation complete.");
    } catch (error) {
        console.error("Error creating sample flashcard data:", error);
    }
}

// Run the setup
setupNotionDatabases().then(() => {
    return createSampleFlashcards();
}).then(() => {
    console.log("J-Flash Notion setup complete!");
    process.exit(0);
}).catch(error => {
    console.error("Setup failed:", error);
    process.exit(1);
});