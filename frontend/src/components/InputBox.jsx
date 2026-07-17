import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Trash2, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'JavaScript Promises', text: 'Explain JavaScript Promises, async/await, and microtask queue vs macrotask queue.' },
  { label: 'Cellular Respiration', text: 'Explain cellular respiration: Glycolysis, Krebs Cycle, and the Electron Transport Chain.' },
  { label: 'WWII Origins', text: 'Outline the primary causes, key alliances, and timeline of events leading to World War II.' },
  { label: 'CSS Flexbox vs Grid', text: 'Compare CSS Flexbox and Grid. When should I use one over the other?' }
];

export default function InputBox({ onSubmit, isLoading }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-expand textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim());
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
    // Focus the textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in">
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow decorative effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="study-notes" className="text-sm font-semibold text-slate-300 tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Enter study notes, key terms, or a topic:
            </label>
            <span className="text-xs text-slate-500 font-mono">
              {input.length} chars
            </span>
          </div>

          <div className="relative">
            <textarea
              id="study-notes"
              ref={textareaRef}
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your course notes or type a topic (e.g., 'Photosynthesis process overview' or 'The French Revolution summary')..."
              disabled={isLoading}
              className="w-full bg-slate-950/80 text-slate-100 border border-slate-800 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none min-h-[90px] max-h-[300px] text-sm md:text-base placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
            />
            {input && !isLoading && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
            {/* suggestions */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 mr-1">Suggestions:</span>
              {SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(sug.text)}
                  disabled={isLoading}
                  className="text-xs bg-slate-800/80 hover:bg-violet-950/40 border border-slate-700/60 hover:border-violet-800/80 text-slate-300 hover:text-violet-200 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sug.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  Generate Material
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
