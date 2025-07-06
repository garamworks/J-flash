import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ExpressionFlashcard, InsertExpressionProgress } from '@/../../shared/schema';
import ExpressionFlashcardComponent from '@/components/expression-flashcard';

export default function ExpressionFlashcardPage() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const queryClient = useQueryClient();

  // Auto-focus on page load
  useEffect(() => {
    document.body.focus();
  }, []);

  // Fetch expression flashcards
  const { data: flashcards = [], isLoading, error } = useQuery<ExpressionFlashcard[]>({
    queryKey: ['/api/expression-flashcards', { sort: sortDirection }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort: sortDirection
      });
      const response = await fetch(`/api/expression-flashcards?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      }
      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch progress stats
  const { data: progressStats } = useQuery<{ known: number; unknown: number }>({
    queryKey: ['/api/expression-progress/stats'],
    queryFn: async () => {
      const response = await fetch('/api/expression-progress/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch expression progress stats');
      }
      return response.json();
    },
    retry: 3,
  });



  const handleSortToggle = () => {
    setSortDirection(prev => prev === "ascending" ? "descending" : "ascending");
    setCurrentIndex(0);
  };



  const handleNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(flashcards.length - 1);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        handlePrevCard();
      } else if (event.key === 'ArrowRight') {
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, flashcards.length]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">응용표현 카드를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-4">잠시 후 다시 시도해주세요.</p>
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">응용표현 카드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">응용표현 카드가 없습니다</h2>
          <p className="text-gray-600 mb-4">아직 학습할 수 있는 응용표현이 없습니다.</p>
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const currentFlashcard = flashcards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                onClick={handleSortToggle}
                title="순서 바꾸기"
              >
                Expression
              </h1>
            </div>
            <div className="text-lg font-semibold text-black mr-4">
              {progressStats?.unknown || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Flashcard */}
        <div className="mb-8">
          <ExpressionFlashcardComponent
            flashcard={currentFlashcard}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-8 mb-6">
          <button
            onClick={handlePrevCard}
            className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
            disabled={flashcards.length <= 1}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={handleNextCard}
            className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
            disabled={flashcards.length <= 1}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}