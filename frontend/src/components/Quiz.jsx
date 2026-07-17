import React, { useState } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Quiz({ quiz, onSubmitQuiz }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores { questionIndex: selectedOptionIndex }

  const currentQuestion = quiz[currentIndex];
  const isAnswered = (idx) => answers[idx] !== undefined;

  const handleSelectOption = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentIndex]: optionIndex
    });
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const allAnswered = quiz.every((_, idx) => answers[idx] !== undefined);

  const handleSubmit = () => {
    if (!allAnswered) return;
    onSubmitQuiz(answers);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 mb-6 gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wide">
            Practice Quiz
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Question {currentIndex + 1} of {quiz.length}
        </span>
      </div>

      {/* Progress Indicators */}
      <div className="flex items-center gap-1.5 mb-6">
        {quiz.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2 flex-grow rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? 'bg-violet-500'
                : isAnswered(idx)
                ? 'bg-emerald-500/75'
                : 'bg-slate-800'
            }`}
            title={`Go to question ${idx + 1}`}
          />
        ))}
      </div>

      {/* Question Box */}
      <div className="mb-6">
        <h4 className="text-base md:text-lg text-slate-100 font-medium leading-relaxed mb-4">
          {currentQuestion.question}
        </h4>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = answers[currentIndex] === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm md:text-base font-medium flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600/20 border-violet-500 text-violet-200 ring-1 ring-violet-500'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <span>{option}</span>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0 ml-3" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-8">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {currentIndex === quiz.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 disabled:text-slate-500 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
