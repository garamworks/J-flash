import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, RotateCcw, Home, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { GrammarFlashcard, InsertGrammarProgress } from "@shared/schema";
import GrammarFlashcardComponent from "@/components/grammar-flashcard";
import ProgressStats from "@/components/progress-stats";
import { apiRequest } from "@/lib/queryClient";

export default function GrammarFlashcardPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch grammar flashcards
  const { data: flashcards = [], isLoading, error } = useQuery<GrammarFlashcard[]>({
    queryKey: ['/api/grammar-flashcards', { sort: sortDirection, level: 'N2' }],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort: sortDirection,
        level: 'N2'
      });
      const response = await fetch(`/api/grammar-flashcards?${params}`);
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
    queryKey: ['/api/grammar-progress/stats'],
    retry: 3,
  });

  // Record progress mutation
  const recordProgressMutation = useMutation({
    mutationFn: async (progress: InsertGrammarProgress) => {
      console.log('=== FRONTEND PROGRESS RECORDING ===');
      console.log('Sending progress data:', progress);
      console.log('Current flashcard displayed:', currentFlashcard?.grammar, currentFlashcard?.problemSentence?.substring(0, 30));
      console.log('User agent:', navigator.userAgent);
      console.log('Timestamp:', new Date().toISOString());
      
      const response = await fetch('/api/grammar-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress),
      });
      
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to record progress');
      }
      
      const result = await response.json();
      console.log('Response data:', result);
      console.log('=== FRONTEND RECORDING END ===');
      
      return result;
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
    if (currentFlashcard && currentFlashcard.notionPageId) {
      recordProgressMutation.mutate({
        grammarFlashcardId: currentFlashcard.id,
        notionPageId: currentFlashcard.notionPageId,
        known: true,
      });
      handleNext();
    }
  };

  const handleMarkAsUnknown = () => {
    if (currentFlashcard && currentFlashcard.notionPageId) {
      recordProgressMutation.mutate({
        grammarFlashcardId: currentFlashcard.id,
        notionPageId: currentFlashcard.notionPageId,
        known: false,
      });
      handleNext();
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSortDirection("ascending");
  };

  const handleSortToggle = () => {
    setSortDirection(prev => prev === "ascending" ? "descending" : "ascending");
    setCurrentIndex(0);
  };

  const handleLevelSelect = (level: string) => {
    setIsMenuOpen(false);
    if (level === "N2 문법") {
      // Stay on current page
    } else if (level === "Home") {
      window.location.href = '/';
    } else if (level === "N2 단어") {
      window.location.href = `/flashcard?level=N2`;
    } else {
      window.location.href = `/flashcard?level=${encodeURIComponent(level)}`;
    }
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <h1 
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                onClick={handleSortToggle}
                title="순서 바꾸기"
              >
                Grammar
              </h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium mt-0.5">
                N2
              </span>
            </div>
            <div className="text-lg font-semibold text-black mr-4">
              {totalFlashcards - (progressStats?.known || 0)}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Menu */}
      {isMenuOpen && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black bg-opacity-50" 
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Sidebar */}
              <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Grammar</h2>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-700" />
                    </button>
                  </div>
                </div>
                
                <nav className="p-4">
                  <button
                    onClick={() => handleLevelSelect("Home")}
                    className="w-full text-left p-3 rounded-lg mb-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
                  >
                    Home
                  </button>
                  {['N1', 'N3', 'N4', 'N5'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleLevelSelect(level)}
                      className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
                    >
                      {level}
                    </button>
                  ))}
                  
                  {/* N2 split into word and grammar */}
                  <button
                    onClick={() => handleLevelSelect("N2 단어")}
                    className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
                  >
                    N2 단어
                  </button>
                  <button
                    onClick={() => window.location.href = '/grammar-flashcard'}
                    className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors bg-blue-100 text-blue-800 font-semibold"
                  >
                    N2 문법
                  </button>
                  
                  <button
                    onClick={() => handleLevelSelect("히라가나/가타가나")}
                    className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors mt-2 hover:bg-gray-100 text-gray-700"
                  >
                    히라가나/가타가나
                  </button>
                </nav>
              </div>
            </div>
          )}

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Flashcard */}
        {currentFlashcard && (
          <GrammarFlashcardComponent
            flashcard={currentFlashcard}
            allFlashcards={flashcards}
            onMarkAsKnown={handleMarkAsKnown}
            onMarkAsUnknown={handleMarkAsUnknown}
          />
        )}
      </main>
    </div>
  );
}