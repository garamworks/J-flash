import { useState } from "react";
import { Volume2 } from "lucide-react";
import { GrammarFlashcard } from "@shared/schema";
import { useSpeech } from "@/hooks/use-speech";

interface GrammarFlashcardProps {
  flashcard: GrammarFlashcard;
  allFlashcards: GrammarFlashcard[];
  onMarkAsKnown: () => void;
  onMarkAsUnknown: () => void;
}

export default function GrammarFlashcardComponent({ flashcard, allFlashcards, onMarkAsKnown, onMarkAsUnknown }: GrammarFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const { speak } = useSpeech();

  // Generate multiple choice options
  const generateChoices = () => {
    // Remove ~ prefix from grammar patterns
    const cleanGrammar = (grammar: string) => grammar.replace(/^〜/, '');
    
    const correctAnswer = cleanGrammar(flashcard.grammar);
    
    // Safety check for allFlashcards
    if (!allFlashcards || allFlashcards.length < 3) {
      return {
        choices: [correctAnswer],
        correctIndex: 0
      };
    }
    
    // Get two random incorrect options from other flashcards
    const otherFlashcards = allFlashcards.filter(f => f.id !== flashcard.id);
    const shuffled = otherFlashcards.sort(() => Math.random() - 0.5);
    const wrongChoices = shuffled.slice(0, 2).map(f => cleanGrammar(f.grammar));
    
    // Combine and shuffle all choices
    const allChoices = [correctAnswer, ...wrongChoices];
    const shuffledChoices = allChoices.sort(() => Math.random() - 0.5);
    
    return {
      choices: shuffledChoices,
      correctIndex: shuffledChoices.indexOf(correctAnswer)
    };
  };

  const { choices, correctIndex } = generateChoices();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if speaker button or choice button was clicked
    if ((e.target as HTMLElement).closest('.speaker-btn, .choice-btn')) return;
    setIsFlipped(!isFlipped);
  };

  const handleChoiceClick = (choiceIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChoice(choiceIndex);
    // Automatically flip to show answer after selection
    setTimeout(() => setIsFlipped(true), 500);
  };

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Manual visual feedback for mobile
    const button = e.currentTarget as HTMLElement;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
    
    // Play audio or fallback to TTS
    if (flashcard.audioUrl) {
      const audio = new Audio(flashcard.audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        // Fallback to TTS for example sentence
        speak(flashcard.exampleSentence, 'ja-JP');
      });
    } else {
      // Fallback to TTS for example sentence
      speak(flashcard.exampleSentence, 'ja-JP');
    }
  };

  const handleButtonAction = (action: () => void) => {
    if (isFlipped) {
      // If card is flipped, first flip back to front with animation
      setIsTransitioning(true);
      setIsFlipped(false);
      
      // After animation completes, execute the action
      setTimeout(() => {
        setIsTransitioning(false);
        action();
      }, 300); // Match CSS transition duration
    } else {
      // If card is already on front, execute action immediately
      action();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card Container with flexible height */}
      <div className="flashcard-container" onClick={handleCardClick} style={{ minHeight: '400px', marginBottom: '0px' }}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''} ${isTransitioning ? 'transitioning' : ''}`}>
          {/* Card Front - Problem Sentence with Multiple Choice */}
          <div className="flashcard-face flashcard-front">
            <div className="bg-white rounded-2xl shadow-lg px-4 py-6 relative cursor-pointer min-h-[400px] flex flex-col justify-center">
              {/* Problem Sentence with blanks */}
              <div className="text-center flex items-center justify-center flex-1 pb-4">
                <p className="text-3xl font-bold text-gray-900 leading-relaxed">
                  {flashcard.problemSentence}
                </p>
              </div>
              
              {/* Multiple Choice Options */}
              {allFlashcards && allFlashcards.length > 0 && (
                <div className="flex flex-col gap-3 px-4 pb-8">
                  {choices.map((choice, index) => (
                    <button
                      key={index}
                      className={`choice-btn py-3 px-6 rounded-xl text-lg font-medium transition-all duration-200 ${
                        selectedChoice === index
                          ? index === correctIndex
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      onClick={(e) => handleChoiceClick(index, e)}
                      disabled={selectedChoice !== null}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Speaker Button - Bottom Right */}
              <button
                className="speaker-btn absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 rounded-full shadow-md flex items-center justify-center"
                onClick={handleAudioClick}
                title="읽어주기"
                style={{ touchAction: 'manipulation' }}
              >
                <Volume2 className="text-white" size={28} />
              </button>
            </div>
          </div>

          {/* Card Back - Answer */}
          <div className="flashcard-face flashcard-back">
            <div className="bg-white rounded-2xl shadow-lg px-4 py-6 cursor-pointer min-h-[400px] flex flex-col justify-center relative">
              <div className="flex-1 flex flex-col justify-center pb-12">
                {/* Example Sentence (Complete) */}
                <div className="text-center mb-2">
                  <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                    {flashcard.exampleSentence}
                  </p>
                </div>

                {/* Korean Translation */}
                <div className="text-center mb-12">
                  <p className="text-xl text-gray-800 leading-relaxed">
                    {flashcard.exampleKorean}
                  </p>
                </div>

                {/* Grammar Pattern */}
                <div className="text-center mb-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {flashcard.grammar}
                  </p>
                </div>

                {/* Meaning */}
                <div className="text-center">
                  <p className="text-xl text-gray-800">
                    {flashcard.meaning}
                  </p>
                </div>
              </div>
              
              {/* Speaker Button - Bottom Right, below content */}
              <button
                className="speaker-btn absolute bottom-2 right-4 bg-blue-500 hover:bg-blue-600 rounded-full shadow-md flex items-center justify-center"
                onClick={handleAudioClick}
                title="읽어주기"
                style={{ touchAction: 'manipulation' }}
              >
                <Volume2 className="text-white" size={28} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed position below card */}
      <div className="flex gap-6 justify-center w-full mt-6">
        <button
          onClick={() => handleButtonAction(onMarkAsKnown)}
          className="action-btn flex-1 text-white font-semibold py-4 px-6 rounded-3xl text-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          style={{ 
            backgroundColor: '#4CAF50'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
          disabled={isTransitioning}
        >
          외움
        </button>
        <button
          onClick={() => handleButtonAction(onMarkAsUnknown)}
          className="action-btn flex-1 text-white font-semibold py-4 px-6 rounded-3xl text-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          style={{ 
            backgroundColor: '#E53E3E'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#C53030'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E53E3E'}
          disabled={isTransitioning}
        >
          모름
        </button>
      </div>
    </div>
  );
}