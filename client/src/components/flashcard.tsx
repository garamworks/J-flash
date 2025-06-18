import { useState } from "react";
import { Volume2 } from "lucide-react";
import { Flashcard } from "@shared/schema";
import { useSpeech } from "@/hooks/use-speech";

// Function to add furigana to Japanese text
const addFurigana = (sentence: string, kanji: string, furigana: string): string => {
  if (!furigana || !kanji) return sentence;
  
  // Simple replacement - in a real app, you'd want more sophisticated parsing
  const furiganaHtml = `<ruby>${kanji}<rt>${furigana}</rt></ruby>`;
  return sentence.replace(kanji, furiganaHtml);
};

// Function to render furigana for display
const renderFurigana = (furigana: string) => {
  if (!furigana) return null;
  
  // Split furigana by common separators and create spans
  const parts = furigana.split(/[・、。]/);
  
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {parts.map((part, index) => (
        <span key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
          {part.trim()}
        </span>
      ))}
    </div>
  );
};

// More sophisticated furigana rendering function
const advancedRenderFurigana = (furigana: string) => {
  if (!furigana) return null;
  
  // Handle different furigana formats
  const patterns = [
    /([^（）]+)（([^）]+)）/g, // kanji(reading) format
    /([^【】]+)【([^】]+)】/g, // kanji【reading】 format
  ];
  
  let result = furigana;
  
  patterns.forEach(pattern => {
    result = result.replace(pattern, (match, kanji, reading) => {
      return `<ruby>${kanji}<rt>${reading}</rt></ruby>`;
    });
  });
  
  // If no patterns matched, return as is
  if (result === furigana) {
    return <span className="text-gray-600">{furigana}</span>;
  }
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

// Main function to process and render furigana
const processRuby = (text: string) => {
  if (!text) return text;
  
  const result = advancedRenderFurigana(text);
  
  return result;
};

interface FlashcardProps {
  flashcard: Flashcard;
  onMarkAsKnown: () => void;
  onMarkAsUnknown: () => void;
}

export default function FlashcardComponent({ flashcard, onMarkAsKnown, onMarkAsUnknown }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { speak } = useSpeech();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if speaker button was clicked
    if ((e.target as HTMLElement).closest('.speaker-btn')) return;
    setIsFlipped(!isFlipped);
  };

  const handleWordAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Play word audio from 단어발음 field
    if (flashcard.wordAudioUrl) {
      const audio = new Audio(flashcard.wordAudioUrl);
      audio.play().catch(error => {
        console.error('Error playing word audio:', error);
        // Fallback to TTS if audio file fails
        speak(flashcard.japanese, 'ja-JP');
      });
    } else {
      // Fallback to TTS for word
      speak(flashcard.japanese, 'ja-JP');
    }
  };

  const handlePronunciationAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Play pronunciation audio from 발음 field
    if (flashcard.pronunciationAudioUrl) {
      const audio = new Audio(flashcard.pronunciationAudioUrl);
      audio.play().catch(error => {
        console.error('Error playing pronunciation audio:', error);
        // Fallback to TTS if audio file fails
        speak(flashcard.sentence, 'ja-JP');
      });
    } else {
      // Fallback to TTS for sentence
      speak(flashcard.sentence, 'ja-JP');
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
    <div className="space-y-6">
      <div className="flashcard-container mb-6" onClick={handleCardClick}>
        <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''} ${isTransitioning ? 'transitioning' : ''}`}>
          {/* Card Front */}
          <div className="flashcard-face flashcard-front">
            <div className="bg-white rounded-2xl shadow-lg p-6 relative cursor-pointer">
              {/* Square Image with Speaker Icon */}
              <div className="relative mb-6">
                {flashcard.imageUrl ? (
                  <img
                    src={flashcard.imageUrl}
                    alt={flashcard.japanese}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                    <span className="text-gray-400 text-lg">이미지 없음</span>
                  </div>
                )}
                
                {/* Speaker Buttons - Left and Right */}
                <button
                  className="speaker-btn absolute bottom-3 left-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={handleWordAudioClick}
                  title="단어발음"
                >
                  <Volume2 className="text-blue-600 text-xl" size={24} />
                </button>
                
                <button
                  className="speaker-btn absolute bottom-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={handlePronunciationAudioClick}
                  title="발음"
                >
                  <Volume2 className="text-green-600 text-xl" size={24} />
                </button>
              </div>

              {/* Japanese Vocabulary */}
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-gray-900 leading-tight">
                  {flashcard.japanese}
                </p>
              </div>

              {/* Sample Sentence */}
              <div className="text-center">
                <p className="text-2xl text-gray-700 leading-relaxed">
                  {flashcard.sentence}
                </p>
              </div>
            </div>
          </div>

          {/* Card Back */}
          <div className="flashcard-face flashcard-back">
            <div className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer h-full flex flex-col justify-center relative">
              {/* Speaker Buttons - Left and Right */}
              <button
                className="speaker-btn absolute bottom-6 left-6 bg-blue-500 hover:bg-blue-600 rounded-full p-3 shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={handleWordAudioClick}
                title="단어발음"
              >
                <Volume2 className="text-white" size={24} />
              </button>
              
              <button
                className="speaker-btn absolute bottom-6 right-6 bg-green-500 hover:bg-green-600 rounded-full p-3 shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={handlePronunciationAudioClick}
                title="발음"
              >
                <Volume2 className="text-white" size={24} />
              </button>

              {/* Japanese Word (Kanji) */}
              <div className="text-center" style={{ marginBottom: '1.5rem' }}>
                <p className="text-4xl font-bold text-gray-900" style={{ lineHeight: '0.7' }}>
                  {flashcard.japanese}
                </p>
              </div>

              {/* Furigana Reading (Hiragana) */}
              <div className="text-center" style={{ marginBottom: '1.8rem' }}>
                <p className="text-3xl font-semibold text-gray-600" style={{ lineHeight: '0.7' }}>
                  {flashcard.furigana}
                </p>
              </div>

              {/* Korean Translation */}
              <div className="text-center" style={{ marginBottom: '3.0rem' }}>
                <p className="text-3xl font-semibold text-gray-900" style={{ lineHeight: '0.7' }}>
                  {flashcard.korean}
                </p>
              </div>

              {/* Japanese Example Sentence (without furigana) */}
              <div className="text-center" style={{ marginBottom: '0.64rem' }}>
                <p className="text-2xl text-gray-700 leading-relaxed" style={{ fontSize: '1.65em' }}>
                  {flashcard.sentence}
                </p>
              </div>

              {/* Korean Sentence Translation */}
              <div className="text-center">
                <p className="text-2xl text-gray-700 leading-relaxed" style={{ fontSize: '1.46rem' }}>
                  {flashcard.sentenceKorean}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-6 mb-8">
        <button
          onClick={() => handleButtonAction(onMarkAsKnown)}
          className="action-btn flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-3xl text-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          disabled={isTransitioning}
        >
          외움
        </button>
        <button
          onClick={() => handleButtonAction(onMarkAsUnknown)}
          className="action-btn flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-3xl text-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          disabled={isTransitioning}
        >
          모름
        </button>
      </div>
    </div>
  );
}