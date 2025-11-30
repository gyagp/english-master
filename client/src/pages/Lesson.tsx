import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flashcards } from '../components/Flashcards';
import { Practice } from '../components/Practice';
import { ArrowLeft, BookOpen, PenTool, ChevronRight, Home } from 'lucide-react';

export const Lesson: React.FC = () => {
  const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
  const [activeTab, setActiveTab] = useState<'words' | 'practice'>('words');

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
                <Link 
                    to="/" 
                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>
            </div>
        </div>
      </nav>
      
      <div className="flex-1 container mx-auto px-6 py-8 max-w-5xl">
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
                  <Flashcards unitId={Number(unitId)} lessonId={Number(lessonId)} />
              </div>
          )}
          {activeTab === 'practice' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Practice unitId={Number(unitId)} lessonId={Number(lessonId)} />
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
