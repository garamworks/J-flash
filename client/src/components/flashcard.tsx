import { useState } from "react";
import { Volume2 } from "lucide-react";
import { type Flashcard } from "@shared/schema";
import { useSpeech } from "@/hooks/use-speech";

// Function to add furigana to Japanese text
const addFurigana = (sentence: string, japanese: string, furigana: string) => {
  // Start with the main word's reading - this takes priority
  const kanjiMap: { [key: string]: string } = {};
  
  // First, add the main flashcard word with its exact furigana
  if (japanese && furigana) {
    kanjiMap[japanese] = furigana;
  }
  
  // Then add other common kanji readings
  const commonReadings: { [key: string]: string } = {
    '母': 'はは',
    '茶': 'ちゃ', 
    '道': 'どう',
    '習': 'なら',
    '桜': 'さくら',
    '春': 'はる',
    '咲': 'さ',
    '寿司': 'すし',
    '今日': 'きょう',
    '食': 'た'
  };
  
  // Add common readings only if they don't conflict with main word
  Object.entries(commonReadings).forEach(([kanji, reading]) => {
    if (!kanjiMap[kanji]) {
      kanjiMap[kanji] = reading;
    }
  });

  // Replace kanji with ruby tags, prioritizing longer matches first
  let result = sentence;
  const sortedEntries = Object.entries(kanjiMap).sort((a, b) => b[0].length - a[0].length);
  
  sortedEntries.forEach(([kanji, reading]) => {
    if (result.includes(kanji)) {
      result = result.replace(new RegExp(kanji, 'g'), `<ruby>${kanji}<rt>${reading}</rt></ruby>`);
    }
  });
  
  return result;
};

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
          <div className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer h-full flex flex-col justify-center">
            {/* Japanese Word (Kanji) */}
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-gray-900">
                {flashcard.japanese}
              </p>
            </div>

            {/* Furigana Reading */}
            <div className="text-center mb-6">
              <p className="text-4xl font-semibold text-gray-900">
                {flashcard.furigana}
              </p>
            </div>

            {/* Korean Translation */}
            <div className="text-center mb-6">
              <p className="text-3xl font-semibold text-gray-900">
                {flashcard.korean}
              </p>
            </div>

            {/* Japanese Example Sentence */}
            <div className="text-center mb-4">
              <p 
                className="text-2xl text-gray-700 leading-relaxed" 
                style={{ fontSize: '1.5em' }}
                dangerouslySetInnerHTML={{ 
                  __html: addFurigana(flashcard.sentence, flashcard.japanese, flashcard.furigana) 
                }}
              />
            </div>

            {/* Korean Sentence Translation */}
            <div className="text-center">
              <p className="text-2xl text-gray-700 leading-relaxed">
                {flashcard.sentenceKorean}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
