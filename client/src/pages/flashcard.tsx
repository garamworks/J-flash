import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Flashcard } from "@shared/schema";
import FlashcardComponent from "@/components/flashcard";
import ProgressStats from "@/components/progress-stats";
import { apiRequest } from "@/lib/queryClient";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";

export default function FlashcardPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("N2");
  const [location] = useLocation();
  const [hiddenImages, setHiddenImages] = useState<{[key: number]: boolean}>({});

  // Extract level from URL parameters using window.location
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const levelParam = params.get('level');
    
    if (levelParam) {
      const decodedLevel = decodeURIComponent(levelParam);
      setSelectedLevel(decodedLevel);
      // Reset counts when level changes
      setCurrentIndex(0);
      setKnownCount(0);
      setUnknownCount(0);
    }
  }, [location]);
  const queryClient = useQueryClient();

  const { data: allFlashcards, isLoading, error } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards", sortDirection, selectedLevel],
    queryFn: async () => {
      const response = await fetch(`/api/flashcards?sort=${sortDirection}&level=${selectedLevel}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '데이터를 불러오는 중 오류가 발생했습니다.');
      }
      return response.json();
    },
  });

  const { data: progressData } = useQuery<Array<{id: number, flashcardId: number, known: boolean}>>({
    queryKey: ["/api/progress"],
  });

  // Store previous flashcards to prevent re-ordering when Notion's Random field changes
  const previousFlashcardsRef = useRef<Flashcard[]>([]);
  
  const flashcards = useMemo(() => {
    if (!allFlashcards) return [];
    
    // Create ID sequence strings to compare
    const newIdSequence = allFlashcards.map(f => f.id).join(',');
    const prevIdSequence = previousFlashcardsRef.current.map(f => f.id).join(',');
    
    // If ID sequence is the same, keep the previous array to avoid re-rendering
    if (newIdSequence === prevIdSequence && previousFlashcardsRef.current.length > 0) {
      return previousFlashcardsRef.current;
    }
    
    // Otherwise, update with new array
    previousFlashcardsRef.current = allFlashcards;
    return allFlashcards;
  }, [allFlashcards]);

  const recordProgressMutation = useMutation({
    mutationFn: async ({ flashcardId, known, notionPageId, level }: { flashcardId: number; known: boolean; notionPageId?: string; level?: string }) => {
      try {
        const payload: any = { flashcardId, known };
        if (notionPageId) payload.notionPageId = notionPageId;
        if (level) payload.level = level;
        
        console.log('Sending progress data:', payload);
        
        const response = await fetch(`/api/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
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

  const clearPromptMutation = useMutation({
    mutationFn: async (notionPageId: string) => {
      try {
        const response = await fetch(`/api/flashcards/clear-prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notionPageId })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error clearing prompt:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('Prompt cleared successfully');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });

  const handleMarkAsKnown = () => {
    if (flashcards && flashcards[currentIndex]) {
      recordProgressMutation.mutate({
        flashcardId: flashcards[currentIndex].id,
        known: true,
        notionPageId: (flashcards[currentIndex] as any).notionPageId,
        level: selectedLevel
      });
    }
    setKnownCount(prev => prev + 1);
    nextCard();
  };

  const handleMarkAsUnknown = () => {
    if (flashcards && flashcards[currentIndex]) {
      recordProgressMutation.mutate({
        flashcardId: flashcards[currentIndex].id,
        known: false,
        notionPageId: (flashcards[currentIndex] as any).notionPageId,
        level: selectedLevel
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

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setIsMenuOpen(false);
    // Reset to first card when switching levels
    setCurrentIndex(0);
    setKnownCount(0);
    setUnknownCount(0);
    // Update URL to reflect the new level
    window.location.href = `/flashcard?level=${encodeURIComponent(level)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-4 relative">
            <div className="flex items-center justify-between">
              <button
                onClick={handleMenuToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">J-Flash</h1>
              <div className="w-10"></div> {/* Placeholder for balance */}
            </div>
          </div>
        </header>
        {/* Sidebar Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50" 
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">레벨 선택</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-700" />
                  </button>
                </div>
              </div>
              <nav className="p-4">
                {['N2', 'N3', 'N4', 'N5'].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelSelect(level)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                      selectedLevel === level
                        ? 'bg-blue-100 text-blue-800 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
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
          <div className="max-w-md mx-auto px-4 py-4 relative">
            <div className="flex items-center justify-between">
              <button
                onClick={handleMenuToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">J-Flash</h1>
              <div className="w-10"></div>
            </div>
          </div>
        </header>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50" 
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">레벨 선택</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-700" />
                  </button>
                </div>
              </div>
              <nav className="p-4">
                {['N2', 'N3', 'N4', 'N5'].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleLevelSelect(level)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                      selectedLevel === level
                        ? 'bg-blue-100 text-blue-800 font-semibold'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
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
          <div className="max-w-md mx-auto px-4 py-4 relative">
            <div className="flex items-center justify-between">
              <button
                onClick={handleMenuToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">J-Flash</h1>
              <div className="w-10"></div>
            </div>
          </div>
        </header>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50" 
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">레벨 선택</h2>
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
                  onClick={() => {setSelectedLevel("Home"); window.location.href = '/';}}
                  className="w-full text-left p-3 rounded-lg mb-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
                >
                  Home
                </button>
                
                {/* 응용표현 */}
                <button
                  onClick={() => {setSelectedLevel("응용표현"); window.location.href = '/expression-flashcard';}}
                  className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
                >
                  응용표현
                </button>
                
                {/* N1 단어 및 문법 */}
                <button
                  onClick={() => handleLevelSelect("N1")}
                  className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                    selectedLevel === "N1" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  N1 단어
                </button>
                <button
                  onClick={() => {setSelectedLevel("N1 문법"); window.location.href = '/grammar-flashcard?level=N1';}}
                  className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
                >
                  N1 문법
                </button>
                
                {/* N2 단어 및 문법 */}
                <button
                  onClick={() => handleLevelSelect("N2")}
                  className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                    selectedLevel === "N2" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  N2 단어
                </button>
                <button
                  onClick={() => {setSelectedLevel("N2 문법"); window.location.href = '/grammar-flashcard';}}
                  className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
                >
                  N2 문법
                </button>
                
                {/* N3, N4, N5 단어 */}
                <button
                  onClick={() => handleLevelSelect("N3")}
                  className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                    selectedLevel === "N3" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  N3 단어
                </button>
                <button
                  onClick={() => handleLevelSelect("N4")}
                  className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                    selectedLevel === "N4" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  N4 단어
                </button>
                <button
                  onClick={() => handleLevelSelect("N5")}
                  className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                    selectedLevel === "N5" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  N5 단어
                </button>
                
                {/* 히라가나/가타가나 */}
                <button
                  onClick={() => handleLevelSelect("Hiragana/Katakana")}
                  className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                    selectedLevel === "Hiragana/Katakana" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  히라가나/가타가나
                </button>
              </nav>
            </div>
          </div>
        )}
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
        <div className="max-w-md mx-auto px-4 py-4 relative">
          <div className="flex items-center justify-between">
            <button
              onClick={handleMenuToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <h1 
                className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                onClick={handleTitleClick}
                title="순서 바꾸기"
              >
                J-Flash
              </h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium mt-0.5">
                {selectedLevel === "Hiragana/Katakana" ? "문자" : selectedLevel}
              </span>
            </div>
            <div className="text-lg font-semibold text-black mr-4">
              {totalCards ? totalCards - knownCount : 0}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
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
                <h2 className="text-lg font-semibold text-gray-900">J-Flash</h2>
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
                onClick={() => window.location.href = '/'}
                className="w-full text-left p-3 rounded-lg mb-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
              >
                Home
              </button>
              
              {/* 응용표현 */}
              <button
                onClick={() => window.location.href = '/expression-flashcard'}
                className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
              >
                응용표현
              </button>
              
              {/* N1 단어 및 문법 */}
              <button
                onClick={() => handleLevelSelect("N1")}
                className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                  selectedLevel === "N1" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                N1 단어
              </button>
              <button
                onClick={() => window.location.href = '/grammar-flashcard?level=N1'}
                className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
              >
                N1 문법
              </button>
              
              {/* N2 단어 및 문법 */}
              <button
                onClick={() => handleLevelSelect("N2")}
                className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                  selectedLevel === "N2" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                N2 단어
              </button>
              <button
                onClick={() => window.location.href = '/grammar-flashcard'}
                className="w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors hover:bg-gray-100 text-gray-700"
              >
                N2 문법
              </button>
              
              {/* N3, N4, N5 단어 */}
              <button
                onClick={() => handleLevelSelect("N3")}
                className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                  selectedLevel === "N3" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                N3 단어
              </button>
              <button
                onClick={() => handleLevelSelect("N4")}
                className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                  selectedLevel === "N4" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                N4 단어
              </button>
              <button
                onClick={() => handleLevelSelect("N5")}
                className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                  selectedLevel === "N5" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                N5 단어
              </button>
              
              {/* 히라가나/가타가나 */}
              <button
                onClick={() => handleLevelSelect("Hiragana/Katakana")}
                className={`w-full text-left py-2 px-3 rounded-lg mb-1 transition-colors ${
                  selectedLevel === "Hiragana/Katakana" ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                히라가나/가타가나
              </button>
            </nav>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto px-4 py-6">
        {currentCard ? (
          <FlashcardComponent 
            key={currentIndex}
            flashcard={hiddenImages[currentCard.id] ? {...currentCard, imageUrl: ""} : currentCard}
            onMarkAsKnown={handleMarkAsKnown}
            onMarkAsUnknown={handleMarkAsUnknown}
            level={selectedLevel}
            onClearPrompt={() => {
              const notionPageId = (currentCard as any).notionPageId;
              if (notionPageId && currentCard.id) {
                // 즉시 이미지 숨기기
                setHiddenImages(prev => ({...prev, [currentCard.id]: true}));
                // 노션 업데이트
                clearPromptMutation.mutate(notionPageId);
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
          </div>
        )}
      </main>
    </div>
  );
}
