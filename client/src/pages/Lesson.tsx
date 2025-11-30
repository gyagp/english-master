import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flashcards } from '../components/Flashcards';
import { Practice } from '../components/Practice';
import { ArrowLeft, BookOpen, PenTool, ChevronRight, Home, Trophy, RotateCcw, History } from 'lucide-react';
import api from '../api';

interface LessonHistory {
    id: number;
    completedAt: string;
}

export const Lesson: React.FC = () => {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const [activeTab, setActiveTab] = useState<'words' | 'practice'>('words');
  const [isCompleted, setIsCompleted] = useState(false);
  const [history, setHistory] = useState<LessonHistory[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
      const fetchStatus = async () => {
          try {
              const [progRes, histRes] = await Promise.all([
                  api.get('/progress'),
                  api.get(`/lessons/${unitId}/${lessonId}/history`)
              ]);
              
              const lessonProgress = progRes.data.details.lessons.find(
                  (l: any) => l.unitId === Number(unitId) && l.lessonId === Number(lessonId)
              );
              setIsCompleted(lessonProgress?.isCompleted || false);
              setHistory(histRes.data);
          } catch (error) {
              console.error("Failed to fetch lesson status", error);
          }
      };
      fetchStatus();
  }, [unitId, lessonId, refreshKey]);

  const handleReview = async () => {
      if (!window.confirm("This will reset your progress for this lesson so you can practice again. Are you sure?")) return;
      
      try {
          await api.post(`/lessons/${unitId}/${lessonId}/reset`);
          setRefreshKey(prev => prev + 1);
          setIsCompleted(false);
      } catch (error) {
          console.error("Failed to reset lesson", error);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4">
            <div className="flex items-center text-sm text-slate-500 mb-1">
                <Link to="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <Home size={14} />
                    Dashboard
                </Link>
                <ChevronRight size={14} className="mx-1" />
                <span>Unit {unitId}</span>
                <ChevronRight size={14} className="mx-1" />
                <span className="text-slate-800 font-medium">Lesson {lessonId}</span>
            </div>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">
                    Unit {unitId} • Lesson {lessonId}
                </h1>
                <div className="flex items-center gap-4">
                    {isCompleted && (
                        <button 
                            onClick={handleReview}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-bold hover:bg-indigo-200 transition-colors text-sm"
                        >
                            <RotateCcw size={16} />
                            Review Lesson
                        </button>
                    )}
                    <Link 
                        to="/" 
                        className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </Link>
                </div>
            </div>
        </div>
      </nav>
      
      <div className="flex-1 container mx-auto px-6 py-8 max-w-5xl">
        {isCompleted && (
            <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-200 flex items-center justify-between animate-in slide-in-from-top-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy size={32} className="text-yellow-300" />
                        <h2 className="text-3xl font-bold">Lesson Completed!</h2>
                    </div>
                    <p className="text-emerald-100 text-lg">You've mastered all words and practices in this lesson.</p>
                </div>
                <button 
                    onClick={handleReview}
                    className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold shadow-md hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95"
                >
                    Start Review
                </button>
            </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex relative">
            <button
              className={`relative z-10 flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-300
                ${activeTab === 'words' 
                  ? 'text-indigo-600 shadow-sm bg-indigo-50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              onClick={() => setActiveTab('words')}
            >
              <BookOpen className={`w-5 h-5 mr-2 transition-transform duration-300 ${activeTab === 'words' ? 'scale-110' : ''}`} />
              Learn Words
            </button>
            <button
              className={`relative z-10 flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-300
                ${activeTab === 'practice' 
                  ? 'text-indigo-600 shadow-sm bg-indigo-50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              onClick={() => setActiveTab('practice')}
            >
              <PenTool className={`w-5 h-5 mr-2 transition-transform duration-300 ${activeTab === 'practice' ? 'scale-110' : ''}`} />
              Practice
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'words' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Flashcards key={`words-${refreshKey}`} unitId={Number(unitId)} lessonId={Number(lessonId)} />
              </div>
          )}
          {activeTab === 'practice' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Practice key={`practice-${refreshKey}`} unitId={Number(unitId)} lessonId={Number(lessonId)} />
              </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
            <div className="mt-16 border-t border-slate-200 pt-10">
                <div className="flex items-center gap-2 mb-6 text-slate-400">
                    <History size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Completion History</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {history.map((h) => (
                        <div key={h.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <span className="text-slate-600 font-medium">Completed</span>
                            <span className="text-sm text-slate-400 font-mono">
                                {new Date(h.completedAt).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
