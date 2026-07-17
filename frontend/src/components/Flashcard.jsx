import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle, RefreshCcw } from 'lucide-react';

export default function Flashcard({ question, answer, cardIndex }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when moving to a different card
  useEffect(() => {
    setIsFlipped(false);
  }, [question, answer]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      onClick={handleFlip}
      className="w-full max-w-xl mx-auto h-72 perspective-1000 cursor-pointer group"
    >
      <div 
        className={`relative w-full h-full preserve-3d transition-transform-3d duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE (Question) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 md:p-8 flex flex-col justify-between shadow-2xl group-hover:border-violet-600/50 transition-all duration-300">
          {/* Top Row */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-violet-400 tracking-wider uppercase flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Question {cardIndex + 1}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Click to Flip
            </span>
          </div>

          {/* Question Text */}
          <div className="flex-grow flex items-center justify-center py-4">
            <p className="text-lg md:text-xl text-slate-200 text-center font-medium leading-relaxed">
              {question}
            </p>
          </div>

          {/* Bottom Flip Cues */}
          <div className="flex justify-center items-center gap-1.5 text-xs text-slate-400 border-t border-slate-800/50 pt-3">
            <RefreshCcw className="w-3 h-3 text-violet-400 group-hover:rotate-180 transition-all duration-500" />
            Reveal Answer
          </div>
        </div>

        {/* BACK SIDE (Answer) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-violet-950/80 to-slate-900 border border-violet-900/60 p-6 md:p-8 flex flex-col justify-between shadow-2xl group-hover:border-violet-500/70 transition-all duration-300">
          {/* Top Row */}
          <div className="flex items-center justify-between border-b border-violet-900/40 pb-3">
            <span className="text-xs font-bold text-fuchsia-400 tracking-wider uppercase flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Answer
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Click to Flip
            </span>
          </div>

          {/* Answer Text */}
          <div className="flex-grow flex items-center justify-center overflow-y-auto py-4">
            <p className="text-base md:text-lg text-slate-200 text-center leading-relaxed">
              {answer}
            </p>
          </div>

          {/* Bottom Flip Cues */}
          <div className="flex justify-center items-center gap-1.5 text-xs text-slate-400 border-t border-violet-900/40 pt-3">
            <RefreshCcw className="w-3 h-3 text-fuchsia-400" />
            Show Question
          </div>
        </div>

      </div>
    </div>
  );
}
