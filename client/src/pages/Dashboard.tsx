import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, CheckCircle, Trophy, LogOut, GraduationCap, Flame, ChevronRight, Settings } from 'lucide-react';

interface Lesson {
  lessonId: number;
  totalWords: number;
  completedWords: number;
  totalPractices: number;
  completedPractices: number;
}

interface Structure {
  unitId: number;
  lessons: Lesson[];
}

interface Progress {
  completedWords: number;
  completedLessons: number;
  completedPractices: number;
  details: {
      words: number[];
      lessons: { unitId: number, lessonId: number }[];
      practices: number[];
  }
}

export const Dashboard: React.FC = () => {
  const [structure, setStructure] = useState<Structure[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const structRes = await api.get('/structure');
      setStructure(structRes.data);
      const progRes = await api.get('/progress');
      setProgress(progRes.data);
    };
    fetchData();
  }, []);

  const getLessonProgress = (lesson: Lesson) => {
    const total = lesson.totalWords + lesson.totalPractices;
    if (total === 0) return 0;
    const completed = lesson.completedWords + lesson.completedPractices;
    return Math.round((completed / total) * 100);
  };

  const getUnitProgress = (unit: Structure) => {
      if (!unit.lessons.length) return 0;
      // Calculate average progress of all lessons
      const totalProgress = unit.lessons.reduce((acc, lesson) => acc + getLessonProgress(lesson), 0);
      return Math.round(totalProgress / unit.lessons.length);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">English Master</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-orange-500 font-bold bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                <Flame className="w-5 h-5 fill-orange-500" />
                <span>3 Day Streak</span>
            </div>
            <Link 
                to="/manage" 
                className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors duration-200 font-medium"
            >
                <Settings className="w-5 h-5" />
            </Link>
            <button 
                onClick={logout} 
                className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors duration-200 font-medium"
            >
                <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-10 max-w-6xl">
        {/* Hero Section */}
        <div className="mb-12">
            <h2 className="text-4xl font-extrabold text-slate-800 mb-2">Welcome back! 👋</h2>
            <p className="text-slate-500 text-lg">Continue your journey to fluency.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
                { label: 'Lessons Completed', value: progress?.completedLessons || 0, icon: CheckCircle, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
                { label: 'Words Completed', value: progress?.completedWords || 0, icon: BookOpen, color: 'blue', gradient: 'from-blue-500 to-indigo-600' },
                { label: 'Practices Completed', value: progress?.completedPractices || 0, icon: Trophy, color: 'violet', gradient: 'from-violet-500 to-purple-600' }
            ].map((stat, idx) => (
                <div key={idx} className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-xl shadow-${stat.color}-200 transition-transform hover:-translate-y-1 duration-300 bg-gradient-to-br ${stat.gradient}`}>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-white/80 font-medium mb-2 text-sm uppercase tracking-wider">{stat.label}</p>
                            <p className="text-5xl font-bold tracking-tight">{stat.value}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                            <stat.icon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute top-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                </div>
            ))}
        </div>

        {/* Units Section */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-800">Your Curriculum</h3>
            <span className="text-slate-400 text-sm font-medium">{structure.length} Units Available</span>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {structure.map((unit) => {
                const unitProgress = getUnitProgress(unit);
                return (
                    <div key={unit.unitId} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-inner">
                                    {unit.unitId}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-1">Unit {unit.unitId}</h4>
                                    <p className="text-slate-500 text-sm">{unit.lessons.length} Lessons • General English</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                        <span>PROGRESS</span>
                                        <span>{unitProgress}%</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${unitProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-8 bg-slate-50/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {unit.lessons.map((lesson) => {
                                    const progressPercent = getLessonProgress(lesson);
                                    const isCompleted = progressPercent === 100;
                                    
                                    return (
                                    <Link
                                        key={lesson.lessonId}
                                        to={`/units/${unit.unitId}/lessons/${lesson.lessonId}`}
                                        className={`group relative p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col gap-4 hover:-translate-y-1
                                        ${isCompleted 
                                            ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100' 
                                            : 'bg-white border-slate-100 hover:border-indigo-300 hover:shadow-indigo-100'
                                        } shadow-sm`}
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                                    ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'}
                                                `}>
                                                    {lesson.lessonId}
                                                </div>
                                                <span className={`font-semibold ${isCompleted ? 'text-emerald-800' : 'text-slate-600 group-hover:text-indigo-900'}`}>
                                                    Lesson
                                                </span>
                                            </div>
                                            {isCompleted ? (
                                                <div className="bg-emerald-500 rounded-full p-1">
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                </div>
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400" />
                                            )}
                                        </div>

                                        <div className="w-full space-y-2">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Words</span>
                                                <span className="font-medium">{lesson.completedWords}/{lesson.totalWords}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 rounded-full"
                                                    style={{ width: `${(lesson.completedWords / (lesson.totalWords || 1)) * 100}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Practice</span>
                                                <span className="font-medium">{lesson.completedPractices}/{lesson.totalPractices}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-violet-500 rounded-full"
                                                    style={{ width: `${(lesson.completedPractices / (lesson.totalPractices || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
