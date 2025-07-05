import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, RotateCcw, Home } from "lucide-react";
import { Link } from "wouter";
import { GrammarFlashcard, InsertGrammarProgress } from "@shared/schema";
import GrammarFlashcardComponent from "@/components/grammar-flashcard";
import ProgressStats from "@/components/progress-stats";
import { apiRequest } from "@/lib/queryClient";

export default function GrammarFlashcardPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const queryClient = useQueryClient();

  // Fetch grammar flashcards
  const { data: flashcards = [], isLoading, error } = useQuery<GrammarFlashcard[]>({
    queryKey: ['/api/grammar-flashcards', { sort: sortDirection, level: 'N2' }],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch progress stats
  const { data: progressStats } = useQuery<{ known: number; unknown: number }>({
    queryKey: ['/api/grammar-progress/stats'],
    retry: 3,
  });

  // Record progress mutation
  const recordProgressMutation = useMutation({
    mutationFn: async (progress: InsertGrammarProgress) => {
      const response = await fetch('/api/grammar-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress),
      });
      if (!response.ok) {
        throw new Error('Failed to record progress');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/grammar-progress'] });
      queryClient.invalidateQueries({ queryKey: ['/api/grammar-progress/stats'] });
    },
  });

  const currentFlashcard = flashcards[currentIndex];
  const totalFlashcards = flashcards.length;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to first
    }
  };

  const handleMarkAsKnown = () => {
    if (currentFlashcard) {
      recordProgressMutation.mutate({
        grammarFlashcardId: currentFlashcard.id,
        known: true,
      });
      handleNext();
    }
  };

  const handleMarkAsUnknown = () => {
    if (currentFlashcard) {
      recordProgressMutation.mutate({
        grammarFlashcardId: currentFlashcard.id,
        known: false,
      });
      handleNext();
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  const handleSortToggle = () => {
    setSortDirection(prev => prev === "ascending" ? "descending" : "ascending");
    setCurrentIndex(0);
  };

  const progressPercentage = progressStats 
    ? Math.round((progressStats.known / (progressStats.known + progressStats.unknown)) * 100) || 0
    : 0;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">문법 카드를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-4">잠시 후 다시 시도해주세요.</p>
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">문법 카드 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">문법 카드가 없습니다</h2>
          <p className="text-gray-600 mb-4">아직 문법 카드가 준비되지 않았습니다.</p>
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ChevronLeft size={24} />
              <span className="text-lg">돌아가기</span>
            </button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-800">N2 문법</h1>
          
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Home size={24} />
              <span className="text-lg">홈</span>
            </button>
          </Link>
        </div>

        {/* Progress Stats */}
        {progressStats && (
          <ProgressStats
            knownCount={progressStats.known}
            unknownCount={progressStats.unknown}
            progressPercentage={progressPercentage}
          />
        )}

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
              처음부터
            </button>
            
            <button
              onClick={handleSortToggle}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              정렬: {sortDirection === "ascending" ? "오름차순" : "내림차순"}
            </button>
          </div>
          
          <div className="text-lg font-semibold text-gray-700">
            {currentIndex + 1} / {totalFlashcards}
          </div>
        </div>

        {/* Flashcard */}
        {currentFlashcard && (
          <GrammarFlashcardComponent
            flashcard={currentFlashcard}
            onMarkAsKnown={handleMarkAsKnown}
            onMarkAsUnknown={handleMarkAsUnknown}
          />
        )}
      </div>
    </div>
  );
}