import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { ExpressionFlashcard, InsertExpressionProgress } from '@/../../shared/schema';
import ExpressionFlashcardComponent from '@/components/expression-flashcard';

export default function ExpressionFlashcardPage() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleLevelSelect = (level: string) => {
    setIsMenuOpen(false);
    if (level === "Home") {
      setLocation("/");
    } else if (level === "N2 단어") {
      setLocation("/flashcard");
    } else if (level === "N2 문법") {
      setLocation("/grammar-flashcard");
    } else if (level === "응용표현") {
      setLocation("/expression-flashcard");
    } else {
      setLocation(`/flashcard?level=${level}`);
    }
  };



  const handleNextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  // 전체 문장을 순차적으로 읽는 함수
  const handleReadAllSentences = () => {
    const currentFlashcard = flashcards[currentIndex];
    if (!currentFlashcard || !('speechSynthesis' in window)) return;

    // 이전 음성 중단
    window.speechSynthesis.cancel();

    const sentences = [
      currentFlashcard.mainExpression,
      currentFlashcard.application1,
      currentFlashcard.application2,
      currentFlashcard.application3,
      currentFlashcard.application4,
      currentFlashcard.application5,
    ];

    let currentSentenceIndex = 0;

    const speakNextSentence = () => {
      if (currentSentenceIndex >= sentences.length) return;

      const sentence = sentences[currentSentenceIndex];
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;

      utterance.onend = () => {
        currentSentenceIndex++;
        if (currentSentenceIndex < sentences.length) {
          // 문장 길이에 따라 딜레이 조정 (최소 800ms, 최대 1500ms)
          const delay = Math.max(800, Math.min(1500, sentence.length * 50));
          setTimeout(speakNextSentence, delay);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
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
                Expression
              </h1>
            </div>
            <div className="text-lg font-semibold text-black mr-4">
              {flashcards.length}
            </div>
          </div>
        </div>
      </header>

      {/* Slide-out Menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`fixed left-0 top-0 h-full w-80 bg-white transform transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">Expression</h2>
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
              onClick={() => handleLevelSelect("N2 문법")}
              className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
            >
              N2 문법
            </button>
            <button
              onClick={() => handleLevelSelect("응용표현")}
              className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors bg-purple-100 text-purple-800 font-semibold"
            >
              응용표현
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Flashcard */}
        <div className="mb-8">
          <ExpressionFlashcardComponent
            flashcard={currentFlashcard}
            onTitleClick={handleReadAllSentences}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between mb-6">
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