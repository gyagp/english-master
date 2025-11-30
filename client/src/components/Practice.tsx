import React, { useEffect, useState } from 'react';
import api from '../api';
import { CheckCircle, XCircle, HelpCircle, Check, ArrowRight } from 'lucide-react';

interface PracticeItem {
  id: number;
  practice: string;
  answer: string;
}

export const Practice: React.FC<{ unitId: number; lessonId: number }> = ({ unitId, lessonId }) => {
  const [practices, setPractices] = useState<PracticeItem[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [results, setResults] = useState<{ [key: number]: boolean | null }>({});
  const [completedPractices, setCompletedPractices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [practicesRes, progressRes] = await Promise.all([
          api.get(`/units/${unitId}/lessons/${lessonId}/practices`),
          api.get('/progress')
        ]);
        setPractices(practicesRes.data);
        setCompletedPractices(new Set(progressRes.data.details.practices));
      } catch (error) {
        console.error("Failed to fetch practice data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [unitId, lessonId]);

  const handleCheck = async (id: number, correctAnswer: string) => {
    const userAnswer = answers[id]?.trim().toLowerCase();
    const isCorrect = userAnswer === correctAnswer.toLowerCase();
    
    setResults(prev => ({ ...prev, [id]: isCorrect }));

    if (isCorrect) {
        if (!completedPractices.has(id)) {
            try {
                await api.post(`/practices/${id}/complete`);
                setCompletedPractices(prev => {
                    const newSet = new Set(prev);
                    newSet.add(id);
                    return newSet;
                });
            } catch (error) {
                console.error("Failed to mark practice as complete", error);
            }
        }
    }
  };

  const handleToggleComplete = async (id: number) => {
      try {
        await api.post(`/practices/${id}/toggle`);
        setCompletedPractices(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
      } catch (error) {
          console.error("Failed to toggle practice completion", error);
      }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-96 text-slate-400">
            <div className="animate-spin mr-3 w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full"></div>
            <span className="text-lg font-medium">Loading practice...</span>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {practices.map((p, index) => {
        const isCorrect = results[p.id] === true;
        const isIncorrect = results[p.id] === false;
        const isCompleted = completedPractices.has(p.id);

        return (
          <div 
            key={p.id} 
            className={`relative overflow-hidden bg-white p-8 rounded-3xl shadow-sm border transition-all duration-500 group
              ${isCompleted 
                ? 'border-emerald-100 shadow-emerald-50/50' 
                : isIncorrect 
                  ? 'border-red-100 shadow-red-50/50' 
                  : 'border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50'
              }
            `}
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-bl-full opacity-10 transition-colors duration-500
                ${isCompleted ? 'from-emerald-400 to-teal-500' : 'from-indigo-400 to-purple-500'}
            `}></div>

            <div className="flex items-start gap-6 relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg transition-all duration-500 shadow-sm
                  ${isCompleted 
                    ? 'bg-emerald-100 text-emerald-600 rotate-0' 
                    : 'bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                  }
              `}>
                {isCompleted ? <Check size={24} strokeWidth={3} /> : index + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-8">
                    <p className="text-2xl text-slate-800 font-medium leading-relaxed tracking-tight">{p.practice}</p>
                    <button
                        onClick={() => handleToggleComplete(p.id)}
                        className={`ml-4 p-2 rounded-full transition-all duration-300 flex-shrink-0 opacity-0 group-hover:opacity-100
                            ${isCompleted ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                        `}
                        title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                    >
                        <Check size={20} />
                    </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                  <div className="relative flex-1 group/input">
                    <input
                      type="text"
                      value={answers[p.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [p.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheck(p.id, p.answer)}
                      className={`w-full px-6 py-4 rounded-2xl border-2 outline-none transition-all font-medium text-lg
                        ${isCorrect || isCompleted
                          ? 'border-emerald-200 bg-emerald-50/30 text-emerald-800' 
                          : isIncorrect 
                            ? 'border-red-200 bg-red-50/30 text-red-800' 
                            : 'border-slate-200 bg-slate-50/50 focus:border-indigo-400 focus:bg-white focus:shadow-lg focus:shadow-indigo-100/50'
                        }
                      `}
                      placeholder="Type your answer here..."
                      disabled={isCorrect || isCompleted}
                    />
                    {(isCorrect || isCompleted) && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-300">
                            <CheckCircle size={24} />
                        </div>
                    )}
                    {isIncorrect && !isCompleted && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 animate-in zoom-in duration-300">
                            <XCircle size={24} />
                        </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleCheck(p.id, p.answer)}
                    disabled={isCorrect || isCompleted || !answers[p.id]}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95 flex items-center gap-2
                      ${isCorrect || isCompleted
                        ? 'bg-emerald-100 text-emerald-600 cursor-default' 
                        : !answers[p.id]
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {isCorrect || isCompleted ? (
                        <>Correct <Check size={20} strokeWidth={3} /></>
                    ) : (
                        <>Check <ArrowRight size={20} strokeWidth={3} /></>
                    )}
                  </button>
                </div>

                {isIncorrect && !isCompleted && (
                  <div className="mt-4 flex items-center gap-3 text-red-600 bg-red-50/80 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
                    <HelpCircle size={20} />
                    <span className="font-medium">Not quite right. Try again!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
