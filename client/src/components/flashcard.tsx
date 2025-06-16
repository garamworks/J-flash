import { useState } from "react";
import { Volume2 } from "lucide-react";
import { type Flashcard } from "@shared/schema";
import { useSpeech } from "@/hooks/use-speech";

interface FlashcardProps {
  flashcard: Flashcard;
  onMarkAsKnown: () => void;
  onMarkAsUnknown: () => void;
}

export default function FlashcardComponent({ flashcard }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { speak } = useSpeech();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if speaker button was clicked
    if ((e.target as HTMLElement).closest('.speaker-btn')) return;
    setIsFlipped(!isFlipped);
  };

  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(flashcard.sentence, 'ja-JP');
  };

  return (
    <div className="flashcard-container mb-6" onClick={handleCardClick}>
      <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Card Front */}
        <div className="flashcard-face flashcard-front">
          <div className="bg-white rounded-2xl shadow-lg p-6 relative cursor-pointer">
            {/* Square Image with Speaker Icon */}
            <div className="relative mb-6">
              <img
                src={flashcard.imageUrl}
                alt={flashcard.japanese}
                className="w-full aspect-square object-cover rounded-xl"
              />
              
              {/* Speaker Icon */}
              <button
                className="speaker-btn absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 shadow-md transition-all duration-200 hover:scale-110 active:scale-95"
                onClick={handleSpeakerClick}
              >
                <Volume2 className="text-primary text-xl" size={24} />
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
          <div className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer">
            {/* Furigana Reading */}
            <div className="text-center mb-6">
              <p className="text-3xl font-semibold text-gray-900">
                {flashcard.furigana}
              </p>
            </div>

            {/* Korean Translation */}
            <div className="text-center mb-6">
              <p className="text-2xl font-semibold text-gray-900">
                {flashcard.korean}
              </p>
            </div>

            {/* Korean Sentence Translation */}
            <div className="text-center">
              <p className="text-xl text-gray-700 leading-relaxed">
                {flashcard.sentenceKorean}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
