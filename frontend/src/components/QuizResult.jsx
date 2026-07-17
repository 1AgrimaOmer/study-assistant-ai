import React, { useState } from 'react';
import { Award, RotateCcw, AlertCircle, CheckCircle2, XCircle, Filter } from 'lucide-react';

export default function QuizResult({ quiz, answers, onRetryIncorrect, onRestart }) {
  const [showOnlyWrong, setShowOnlyWrong] = useState(false);

  // Calculate results
  let correctCount = 0;
  const detailedResults = quiz.map((q, idx) => {
    const userAnswerIndex = answers[idx];
    const isCorrect = userAnswerIndex === q.correct;
    if (isCorrect) correctCount++;
    return {
      ...q,
      originalIndex: idx,
      userAnswerIndex,
      isCorrect
    };
  });

  const totalQuestions = quiz.length;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const wrongResults = detailedResults.filter(r => !r.isCorrect);

  const displayResults = showOnlyWrong ? wrongResults : detailedResults;

  // Visual text and color schemes based on score
  let feedbackMessage = '';
  let feedbackColor = '';
  if (scorePercentage === 100) {
    feedbackMessage = 'Perfect score! You have mastered this topic!';
    feedbackColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
  } else if (scorePercentage >= 80) {
    feedbackMessage = 'Excellent work! Almost perfect!';
    feedbackColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20';
  } else if (scorePercentage >= 50) {
    feedbackMessage = 'Good effort! A bit more study will lock this in.';
    feedbackColor = 'text-amber-400 border-amber-500/30 bg-amber-950/20';
  } else {
    feedbackMessage = 'Keep practicing! Review the flashcards and try again.';
    feedbackColor = 'text-rose-400 border-rose-500/30 bg-rose-950/20';
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in space-y-8">
      {/* Score overview */}
      <div className="flex flex-col items-center text-center">
        <div className="relative w-36 h-36 flex items-center justify-center mb-4">
          {/* Radial progress svg */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="60"
              className="stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="72"
              cy="72"
              r="60"
              className={`transition-all duration-1000 ${
                scorePercentage >= 80
                  ? 'stroke-emerald-500'
                  : scorePercentage >= 50
                  ? 'stroke-amber-500'
                  : 'stroke-rose-500'
              }`}
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - scorePercentage / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-white font-mono">{scorePercentage}%</span>
            <span className="text-xs text-slate-400 font-medium">Score</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Quiz Completed
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          You got <span className="font-bold text-slate-200">{correctCount}</span> out of <span className="font-bold text-slate-200">{totalQuestions}</span> questions correct.
        </p>

        <div className={`mt-4 px-4 py-2 border rounded-xl text-xs font-semibold ${feedbackColor}`}>
          {feedbackMessage}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        {wrongResults.length > 0 && (
          <button
            onClick={() => onRetryIncorrect(wrongResults.map(r => r.originalIndex))}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-violet-900/30 active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Incorrect ({wrongResults.length})
          </button>
        )}
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Restart Full Quiz
        </button>
      </div>

      {/* Review details */}
      <div className="space-y-4 pt-6 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Review Answers
          </h4>
          {wrongResults.length > 0 && (
            <button
              onClick={() => setShowOnlyWrong(!showOnlyWrong)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                showOnlyWrong
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {showOnlyWrong ? 'Showing Wrong Only' : 'Filter Incorrect'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {displayResults.map((result, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border transition-all ${
                result.isCorrect
                  ? 'bg-emerald-950/10 border-emerald-900/40'
                  : 'bg-rose-950/10 border-rose-900/40'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-3 flex-grow">
                  <p className="text-sm font-medium text-slate-200 leading-relaxed">
                    <span className="text-xs text-slate-500 font-mono mr-1">Q{result.originalIndex + 1}:</span>
                    {result.question}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.options.map((opt, oIdx) => {
                      const isUserChoice = result.userAnswerIndex === oIdx;
                      const isCorrectChoice = result.correct === oIdx;
                      
                      let optionStyle = 'bg-slate-950/40 border-slate-900 text-slate-400';
                      if (isCorrectChoice) {
                        optionStyle = 'bg-emerald-900/20 border-emerald-800 text-emerald-300 font-medium';
                      } else if (isUserChoice && !isCorrectChoice) {
                        optionStyle = 'bg-rose-900/20 border-rose-800/80 text-rose-300';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between ${optionStyle}`}
                        >
                          <span className="truncate">{opt}</span>
                          {isCorrectChoice && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase ml-2 shrink-0">Correct</span>}
                          {isUserChoice && !isCorrectChoice && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-bold uppercase ml-2 shrink-0">Your Pick</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {displayResults.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-sm flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-slate-600" />
              No questions to show under this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
