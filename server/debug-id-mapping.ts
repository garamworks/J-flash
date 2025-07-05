import { storage } from "./storage";

async function debugIdMapping() {
  try {
    console.log("=== ID 매핑 문제 디버깅 ===");
    
    // 현재 표시되는 카드들 가져오기
    const displayedCards = await storage.getAllGrammarFlashcards();
    
    console.log(`\n총 표시되는 카드 수: ${displayedCards.length}`);
    
    console.log("\n처음 10개 카드의 매핑:");
    displayedCards.slice(0, 10).forEach((card, index) => {
      console.log(`ID ${card.id}: ${card.grammar} - 페이지 ID: ${card.notionPageId?.substring(0, 8)}...`);
      console.log(`  문제: ${card.problemSentence.substring(0, 30)}...`);
    });
    
    // 각 ID에 대해 올바른 매핑 확인
    console.log("\n=== ID 1~5 매핑 검증 ===");
    for (let i = 1; i <= 5; i++) {
      const card = displayedCards.find(c => c.id === i);
      if (card) {
        console.log(`\nID ${i}:`);
        console.log(`  문법: ${card.grammar}`);
        console.log(`  문제: ${card.problemSentence}`);
        console.log(`  Notion ID: ${card.notionPageId}`);
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

debugIdMapping();