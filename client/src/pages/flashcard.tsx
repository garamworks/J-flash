import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Flashcard } from "@shared/schema";
import FlashcardComponent from "@/components/flashcard";
import ProgressStats from "@/components/progress-stats";
import { apiRequest } from "@/lib/queryClient";

export default function FlashcardPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: allFlashcards, isLoading, error } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards"],
  });

  const { data: progressData } = useQuery<Array<{id: number, flashcardId: number, known: boolean}>>({
    queryKey: ["/api/progress"],
  });

  // Filter out flashcards that are marked as known (암기 = true)
  const flashcards = allFlashcards?.filter(card => {
    if (!progressData || !Array.isArray(progressData)) return true; // Show all cards if progress data not loaded yet
    
    const cardProgress = progressData.find(p => p.flashcardId === card.id);
    return !cardProgress?.known; // Only show cards that are not known
  });

  const recordProgressMutation = useMutation({
    mutationFn: async ({ flashcardId, known }: { flashcardId: number; known: boolean }) => {
      try {
        const response = await fetch(`/api/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flashcardId, known })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Progress recorded:', result);
        return result;
      } catch (error) {
        console.error('Error recording progress:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });

  const handleMarkAsKnown = () => {
    if (flashcards && flashcards[currentIndex]) {
      recordProgressMutation.mutate({
        flashcardId: flashcards[currentIndex].id,
        known: true
      });
    }
    setKnownCount(prev => prev + 1);
    nextCard();
  };

  const handleMarkAsUnknown = () => {
    if (flashcards && flashcards[currentIndex]) {
      recordProgressMutation.mutate({
        flashcardId: flashcards[currentIndex].id,
        known: false
      });
    }
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
