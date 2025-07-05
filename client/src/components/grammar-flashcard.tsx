import { useState } from "react";
import { Volume2 } from "lucide-react";
import { GrammarFlashcard } from "@shared/schema";
import { useSpeech } from "@/hooks/use-speech";

interface GrammarFlashcardProps {
  flashcard: GrammarFlashcard;
  onMarkAsKnown: () => void;
  onMarkAsUnknown: () => void;
}

export default function GrammarFlashcardComponent({ flashcard, onMarkAsKnown, onMarkAsUnknown }: GrammarFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { speak } = useSpeech();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if speaker button was clicked
    if ((e.target as HTMLElement).closest('.speaker-btn')) return;
    setIsFlipped(!isFlipped);
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
      {/* Card Container with fixed height */}
      <div className="flashcard-container" onClick={handleCardClick} style={{ height: '520px', marginBottom: '8px' }}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''} ${isTransitioning ? 'transitioning' : ''}`}>
          {/* Card Front - Problem Sentence */}
          <div className="flashcard-face flashcard-front">
            <div className="bg-white rounded-2xl shadow-lg px-4 py-10 relative cursor-pointer h-full">
              {/* Problem Sentence with blanks */}
              <div className="text-center flex items-center justify-center h-full pb-16 pt-8">
                <p className="text-3xl font-bold text-gray-900 leading-relaxed">
                  {flashcard.problemSentence}
                </p>
              </div>
              
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
            <div className="bg-white rounded-2xl shadow-lg px-4 py-10 cursor-pointer h-full flex flex-col justify-center relative">
              <div className="pb-24 pt-8">
                {/* Example Sentence (Complete) */}
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-gray-900 leading-relaxed">
                    {flashcard.exampleSentence}
                  </p>
                </div>

                {/* Korean Translation */}
                <div className="text-center mb-6">
                  <p className="text-xl text-gray-800 leading-relaxed">
                    {flashcard.exampleKorean}
                  </p>
                </div>

                {/* Grammar Pattern */}
                <div className="text-center mb-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {flashcard.grammar}
                  </p>
                </div>

                {/* Meaning */}
                <div className="text-center pb-4">
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
      <div className="flex gap-6 justify-center w-full">
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