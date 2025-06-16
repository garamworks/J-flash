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
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const queryClient = useQueryClient();

  const { data: allFlashcards, isLoading, error } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards", sortDirection],
    queryFn: () => fetch(`/api/flashcards?sort=${sortDirection}`).then(res => res.json()),
  });

  const { data: progressData } = useQuery<Array<{id: number, flashcardId: number, known: boolean}>>({
    queryKey: ["/api/progress"],
  });

  // Now using server-side filtering for unchecked '암기' cards only
  const flashcards = allFlashcards || [];

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
      // Don't invalidate flashcards to prevent automatic card switching
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

  const handleTitleClick = () => {
    // Toggle sort direction
    const newDirection = sortDirection === "ascending" ? "descending" : "ascending";
    setSortDirection(newDirection);
    // Reset to first card
    setCurrentIndex(0);
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
          <h1 
            className="text-2xl font-bold text-gray-900 pl-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
            onClick={handleTitleClick}
            title="순서 바꾸기"
          >
            J-Flash
          </h1>
          <div className="text-lg font-semibold text-black pr-2">
            {totalCards - knownCount}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <FlashcardComponent 
          key={currentIndex}
          flashcard={currentCard}
          onMarkAsKnown={handleMarkAsKnown}
          onMarkAsUnknown={handleMarkAsUnknown}
        />
      </main>
    </div>
  );
}
