import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Flashcard from './Flashcard';

export default function FlashcardList({ flashcards, currentIndex, onChangeIndex }) {
  const totalCards = flashcards.length;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onChangeIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      onChangeIndex(currentIndex + 1);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, totalCards]);

  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[currentIndex];

  return (
    <div className="w-full flex flex-col items-center gap-6 mt-4">
      {/* 3D Flashcard */}
      <Flashcard 
        question={currentCard.question} 
        answer={currentCard.answer} 
        cardIndex={currentIndex} 
      />

      {/* Navigation Controls */}
      <div className="w-full max-w-xl flex items-center justify-between px-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          Prev
        </button>

        {/* Progress Bar / Dots indicator */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-mono text-slate-400">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <div className="flex items-center gap-1">
            {flashcards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onChangeIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-6 bg-violet-500' 
                    : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Go to card ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === totalCards - 1}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-30 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
        <span>💡 Hint: Use</span>
        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">←</kbd>
        <span>and</span>
        <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-300">→</kbd>
        <span>arrow keys to navigate cards</span>
      </p>
    </div>
  );
}
