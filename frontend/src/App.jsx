import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, HelpCircle, GraduationCap, RefreshCw, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import InputBox from './components/InputBox';
import FlashcardList from './components/FlashcardList';
import Quiz from './components/Quiz';
import QuizResult from './components/QuizResult';

export default function App() {
  // App States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null); // { flashcards: [], quiz: [] }
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'quiz'
  
  // Flashcards progress
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // Quiz progress
  const [originalQuiz, setOriginalQuiz] = useState([]); // Keeps original full quiz
  const [activeQuiz, setActiveQuiz] = useState([]);     // Keeps currently shown quiz (might be retry subset)
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);

  // Reference to track active request and prevent race conditions
  const requestIdRef = useRef(0);
  // Store last raw input for retry button on error state
  const [lastInput, setLastInput] = useState('');

  // Load session from LocalStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('study_session_data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setData(parsed.data);
        setOriginalQuiz(parsed.originalQuiz || parsed.data.quiz);
        setActiveQuiz(parsed.activeQuiz || parsed.data.quiz);
        setActiveTab(parsed.activeTab || 'flashcards');
        setCurrentCardIndex(parsed.currentCardIndex || 0);
        setQuizAnswers(parsed.quizAnswers || {});
        setQuizSubmitted(parsed.quizSubmitted || false);
        setIsRetryMode(parsed.isRetryMode || false);
        setLastInput(parsed.lastInput || '');
      }
    } catch (e) {
      console.error('Error loading session from localStorage:', e);
    }
  }, []);

  // Save session to LocalStorage on state changes
  useEffect(() => {
    if (data) {
      const sessionState = {
        data,
        originalQuiz,
        activeQuiz,
        activeTab,
        currentCardIndex,
        quizAnswers,
        quizSubmitted,
        isRetryMode,
        lastInput
      };
      localStorage.setItem('study_session_data', JSON.stringify(sessionState));
    } else {
      localStorage.removeItem('study_session_data');
    }
  }, [data, originalQuiz, activeQuiz, activeTab, currentCardIndex, quizAnswers, quizSubmitted, isRetryMode, lastInput]);

  // Request handler
  const handleGenerate = async (userInput) => {
    const currentRequestId = ++requestIdRef.current;
    
    setLoading(true);
    setError(null);
    setLastInput(userInput);

    try {
     const response = await fetch("https://study-assistant-ai-6dj4.onrender.com/generate", {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ input: userInput }),
});

if (!response.ok) {
  const errorBody = await response.json().catch(() => ({}));
  throw new Error(errorBody.error || `Server responded with status ${response.status}`);
}

const result = await response.json();

      // Race condition check: Ignore response if a new request has already been kicked off
      if (currentRequestId !== requestIdRef.current) {
        console.log('Ignored stale response for request ID:', currentRequestId);
        return;
      }

      setData(result);
      setOriginalQuiz(result.quiz);
      setActiveQuiz(result.quiz);
      
      // Reset progress states
      setCurrentCardIndex(0);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setIsRetryMode(false);
      setActiveTab('flashcards');

    } catch (err) {
      // Race condition check: Ignore error if a new request is running
      if (currentRequestId !== requestIdRef.current) return;
      
      console.error('Generation failed:', err);
      setError(err.message || 'An error occurred while generating study materials.');
    } finally {
      // Only disable loading if this is still the active request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Reset current session
  const handleResetSession = () => {
    if (window.confirm('Are you sure you want to clear your current study material and start over?')) {
      setData(null);
      setOriginalQuiz([]);
      setActiveQuiz([]);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setIsRetryMode(false);
      setCurrentCardIndex(0);
      setError(null);
      setLastInput('');
      localStorage.removeItem('study_session_data');
    }
  };

  // Quiz Handlers
  const handleSubmitQuiz = (answers) => {
    setQuizAnswers(answers);
    setQuizSubmitted(true);
  };

  const handleRetryIncorrect = (incorrectIndices) => {
    // incorrectIndices are original indices
    const retryQuestions = originalQuiz.filter((_, idx) => incorrectIndices.includes(idx));
    
    // Set active quiz to only show incorrect questions
    setActiveQuiz(retryQuestions);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setIsRetryMode(true);
  };

  const handleRestartQuiz = () => {
    // Reset back to original full quiz
    setActiveQuiz(originalQuiz);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setIsRetryMode(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px] animate-blob-1 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/15 rounded-full blur-[120px] animate-blob-2 pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-300 to-indigo-400 bg-clip-text text-transparent m-0 select-none">
                StudySphere AI
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider -mt-1 select-none">
                Intelligent Study Partner
              </p>
            </div>
          </div>

          {data && (
            <button
              onClick={handleResetSession}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-2 border border-slate-800 hover:border-rose-950/40 rounded-xl hover:bg-rose-950/10 transition-all cursor-pointer"
              title="Clear materials and enter new topic"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Topic</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 flex flex-col justify-start relative z-10">
        
        {/* Onboarding Input State */}
        {!data && !loading && !error && (
          <div className="flex-grow flex flex-col justify-center items-center py-8">
            <div className="text-center max-w-2xl mb-8 animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                Accelerate Your Learning with Structured AI Materials
              </h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                Paste your notes or enter a subject. Our system will generate tailored interactive flashcards and quizzes instantly.
              </p>
            </div>
            <InputBox onSubmit={handleGenerate} isLoading={loading} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex-grow flex flex-col justify-center items-center py-16 animate-pulse">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-violet-900/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-fuchsia-500 animate-spin"></div>
            </div>
            <h3 className="text-lg font-bold text-slate-200">Processing Study Materials...</h3>
            <p className="text-slate-500 text-sm mt-1">Analyzing content & creating customized quizzes & cards</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-grow flex flex-col justify-center items-center py-12 max-w-md mx-auto text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 animate-bounce">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Generation Failed</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6 leading-relaxed">
              {error}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleGenerate(lastInput)}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Request
              </button>
              <button
                onClick={() => { setError(null); setData(null); }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Back to Input
              </button>
            </div>
          </div>
        )}

        {/* Study Dashboard (Tabs + Components) */}
        {data && !loading && !error && (
          <div className="space-y-6 flex-grow flex flex-col">
            
            {/* Tab Controls */}
            <div className="flex justify-center">
              <div className="bg-slate-900/80 border border-slate-850 p-1 rounded-2xl flex gap-1.5 shadow-xl">
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'flashcards'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Flashcards
                  <span className="text-[10px] bg-slate-950/60 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {data.flashcards.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'quiz'
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  Practice Quiz
                  <span className="text-[10px] bg-slate-950/60 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
                    {originalQuiz.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Active Content */}
            <div className="flex-grow flex flex-col justify-start py-4">
              {activeTab === 'flashcards' && (
                <div className="space-y-2">
                  <div className="text-center max-w-md mx-auto mb-4">
                    <h3 className="text-xl font-extrabold text-slate-200">Study Flashcards</h3>
                    <p className="text-xs text-slate-400 mt-1">Review terminology and concepts. Click cards to reveal answers.</p>
                  </div>
                  <FlashcardList
                    flashcards={data.flashcards}
                    currentIndex={currentCardIndex}
                    onChangeIndex={setCurrentCardIndex}
                  />
                </div>
              )}

              {activeTab === 'quiz' && (
                <div>
                  {quizSubmitted ? (
                    <QuizResult
                      quiz={activeQuiz}
                      answers={quizAnswers}
                      onRetryIncorrect={handleRetryIncorrect}
                      onRestart={handleRestartQuiz}
                    />
                  ) : (
                    <div className="space-y-4">
                      {isRetryMode && (
                        <div className="w-full max-w-2xl mx-auto px-4 py-2.5 bg-violet-950/20 border border-violet-900/40 rounded-xl text-xs text-violet-300 flex items-center justify-between">
                          <span>🎯 Retrying only incorrect questions ({activeQuiz.length})</span>
                          <button
                            onClick={handleRestartQuiz}
                            className="font-bold underline text-violet-200 hover:text-violet-100"
                          >
                            Reset to Full Quiz
                          </button>
                        </div>
                      )}
                      <Quiz 
                        quiz={activeQuiz} 
                        onSubmitQuiz={handleSubmitQuiz} 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-600 bg-slate-950/40">
        <p>© 2026 StudySphere AI. Designed for visually stunning and interactive learning.</p>
      </footer>
    </div>
  );
}
