import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Flashcard } from "@shared/schema";
import FlashcardComponent from "@/components/flashcard";
import ProgressStats from "@/components/progress-stats";

export default function FlashcardPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);

  const { data: flashcards, isLoading, error } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards"],
  });

  const handleMarkAsKnown = () => {
    setKnownCount(prev => prev + 1);
    nextCard();
  };

  const handleMarkAsUnknown = () => {
    setUnknownCount(prev => prev + 1);
    nextCard();
  };

  const nextCard = () => {
    if (flashcards && currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-center text-gray-900">J-Flash</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading flashcards...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-center text-gray-900">J-Flash</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Failed to load flashcards</div>
          </div>
        </main>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-center text-gray-900">J-Flash</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">No flashcards available</div>
          </div>
        </main>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;
  const completedCards = knownCount + unknownCount;
  const progressPercentage = Math.round((completedCards / totalCards) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 pl-2">J-Flash</h1>
          <div className="text-lg font-semibold text-black pr-2">
            {totalCards - knownCount}/{knownCount}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <FlashcardComponent 
          flashcard={currentCard}
          onMarkAsKnown={handleMarkAsKnown}
          onMarkAsUnknown={handleMarkAsUnknown}
        />

        {/* Action Buttons */}
        <div className="flex gap-6 mb-8 mt-6">
          <button
            onClick={handleMarkAsKnown}
            className="action-btn flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-3xl text-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            외움
          </button>
          <button
            onClick={handleMarkAsUnknown}
            className="action-btn flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-3xl text-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            모름
          </button>
        </div>
      </main>
    </div>
  );
}
