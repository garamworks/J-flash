import { ExpressionFlashcard } from "@/../../shared/schema";

interface ExpressionFlashcardProps {
  flashcard: ExpressionFlashcard;
}

export default function ExpressionFlashcardComponent({ 
  flashcard
}: ExpressionFlashcardProps) {
  // 응용표현 데이터 배열화
  const applications = [
    { japanese: flashcard.application1, korean: flashcard.application1Korean },
    { japanese: flashcard.application2, korean: flashcard.application2Korean },
    { japanese: flashcard.application3, korean: flashcard.application3Korean },
    { japanese: flashcard.application4, korean: flashcard.application4Korean },
    { japanese: flashcard.application5, korean: flashcard.application5Korean },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* 메인 표현 섹션 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {flashcard.mainExpression}
        </h2>
        <p className="text-lg text-gray-600">
          {flashcard.mainMeaning}
        </p>
      </div>

      {/* 응용표현 목록 */}
      <div className="space-y-4 mb-8">
        {applications.map((app, index) => (
          <div key={index} className="border-l-4 border-purple-300 pl-4 py-2">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {app.japanese}
            </div>
            <div className="text-sm text-gray-500">
              {app.korean}
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}