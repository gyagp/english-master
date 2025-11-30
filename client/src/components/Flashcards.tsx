import React, { useEffect, useState } from 'react';
import api from '../api';
import { ArrowLeft, ArrowRight, Check, RotateCw, Volume2, Sparkles } from 'lucide-react';

interface Word {
  id: number;
  word: string;
  phonetic: string;
  englishMeaning: string;
  chineseMeaning: string;
  example: string;
}

export const Flashcards: React.FC<{ unitId: number; lessonId: number }> = ({ unitId, lessonId }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      const res = await api.get(`/units/${unitId}/lessons/${lessonId}/words`);
      setWords(res.data);
      const progRes = await api.get('/progress');
      setCompletedWords(new Set(progRes.data.details.words));
    };
    fetchWords();
  }, [unitId, lessonId]);

  const displayedWords = showAll 
    ? words 
    : words.filter(w => !completedWords.has(w.id));

  useEffect(() => {
    if (currentIndex >= displayedWords.length) {
      setCurrentIndex(Math.max(0, displayedWords.length - 1));
    }
  }, [displayedWords.length, currentIndex]);

  const handleToggleCompleted = async (e: React.MouseEvent, wordId: number) => {
    e.stopPropagation();
    await api.post(`/words/${wordId}/toggle`);
    setCompletedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(wordId)) newSet.delete(wordId);
      else newSet.add(wordId);
      return newSet;
    });
  };

  if (words.length === 0) return (
    <div className="flex justify-center items-center h-96 text-slate-400">
      <div className="animate-spin mr-3"><RotateCw size={24} /></div>
      <span className="text-lg font-medium">Loading your words...</span>
    </div>
  );

  if (displayedWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
          <Check size={40} className="text-emerald-600" strokeWidth={3} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">All words completed!</h3>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Great job! You've mastered all words in this lesson.
        </p>
        <button 
          onClick={() => setShowAll(true)}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5"
        >
          Review All Words
        </button>
      </div>
    );
  }

  const currentWord = displayedWords[currentIndex];
  const isCompleted = completedWords.has(currentWord.id);

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto">
      {/* Controls Header */}
      <div className="w-full flex justify-end mb-4">
        <label className="flex items-center cursor-pointer gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
          <span className="text-sm font-medium text-slate-600">Show Completed</span>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </div>
        </label>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-8 flex items-center justify-between text-sm font-medium text-slate-500">
        <span>Word {currentIndex + 1} of {displayedWords.length}</span>
        <div className="flex-1 mx-6 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${((currentIndex + 1) / displayedWords.length) * 100}%` }}
          />
        </div>
        <span className="text-indigo-600 font-bold">{Math.round(((currentIndex + 1) / displayedWords.length) * 100)}%</span>
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full aspect-[16/10] cursor-pointer [perspective:1200px] group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 flex flex-col items-center justify-center [backface-visibility:hidden] p-10 border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-shadow duration-300">
            <div className="absolute top-6 right-6">
              <button 
                onClick={(e) => handleToggleCompleted(e, currentWord.id)}
                className={`p-3 rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400'}`}
                title={isCompleted ? "Marked as completed" : "Mark as completed"}
              >
                <Check size={24} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-6xl font-extrabold text-slate-800 mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-600">
                    {currentWord.word}
                </h2>
                <div className="flex items-center space-x-3 text-slate-500 bg-slate-50 px-6 py-3 rounded-full border border-slate-100">
                    <Volume2 size={20} className="text-indigo-500" />
                    <span className="text-2xl font-mono font-medium">{currentWord.phonetic}</span>
                </div>
            </div>
            
            <p className="text-sm text-slate-400 mt-auto flex items-center gap-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <RotateCw size={14} /> Click card to flip
            </p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-xl shadow-indigo-200 flex flex-col items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)] p-10 text-white border border-indigo-500/20">
            <div className="text-center space-y-8 max-w-xl w-full">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest">English Meaning</h3>
                <p className="text-2xl font-medium leading-relaxed">{currentWord.englishMeaning}</p>
              </div>
              
              <div className="w-20 h-1 bg-white/20 mx-auto rounded-full"></div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Chinese Meaning</h3>
                <p className="text-4xl font-bold tracking-wide">{currentWord.chineseMeaning}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 mt-4">
                <p className="text-indigo-50 italic font-serif text-xl leading-relaxed">"{currentWord.example}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-8 w-full">
        <button 
          onClick={() => {
              setCurrentIndex((prev) => (prev - 1 + displayedWords.length) % displayedWords.length);
              setIsFlipped(false);
          }}
          className="p-5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 transition-all text-slate-600 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={(e) => handleToggleCompleted(e, currentWord.id)}
          className={`flex items-center space-x-3 px-10 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform active:scale-95 hover:-translate-y-1
            ${isCompleted 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200 ring-4 ring-emerald-100' 
              : 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-300'
            }`}
        >
          {isCompleted ? <Check size={24} strokeWidth={3} /> : <Sparkles size={24} />}
          <span>{isCompleted ? 'Completed!' : 'Mark Completed'}</span>
        </button>

        <button 
          onClick={() => {
              setCurrentIndex((prev) => (prev + 1) % displayedWords.length);
              setIsFlipped(false);
          }}
          className="p-5 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 transition-all text-slate-600 group"
        >
          <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
