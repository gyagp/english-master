import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, BookOpen, Trophy, Upload, FileJson } from 'lucide-react';

interface Word {
  id: number;
  word: string;
  phonetic: string;
  englishMeaning: string;
  chineseMeaning: string;
  example: string;
}

interface Practice {
  id: number;
  practice: string;
  answer: string;
}

export const ManageContent: React.FC = () => {
  const [unitId, setUnitId] = useState<number>(1);
  const [lessonId, setLessonId] = useState<number>(1);
  const [words, setWords] = useState<Word[]>([]);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for new items
  const [newWord, setNewWord] = useState<Partial<Word>>({});
  const [newPractice, setNewPractice] = useState<Partial<Practice>>({});

  // Editing states
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);

  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'words' | 'practices'>('words');
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');

  const loadContent = async () => {
    setLoading(true);
    try {
      const [wordsRes, practicesRes] = await Promise.all([
        api.get(`/units/${unitId}/lessons/${lessonId}/words`),
        api.get(`/units/${unitId}/lessons/${lessonId}/practices`)
      ]);
      setWords(wordsRes.data);
      setPractices(practicesRes.data);
    } catch (error) {
      console.error("Failed to load content", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [unitId, lessonId]);

  const handleAddWord = async () => {
    try {
      await api.post('/words', { ...newWord, unitId, lessonId });
      setNewWord({});
      loadContent();
    } catch (error) {
      console.error("Failed to add word", error);
    }
  };

  const handleUpdateWord = async () => {
    if (!editingWord) return;
    try {
      await api.put(`/words/${editingWord.id}`, editingWord);
      setEditingWord(null);
      loadContent();
    } catch (error) {
      console.error("Failed to update word", error);
    }
  };

  const handleDeleteWord = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/words/${id}`);
      loadContent();
    } catch (error) {
      console.error("Failed to delete word", error);
    }
  };

  const handleAddPractice = async () => {
    try {
      await api.post('/practices', { ...newPractice, unitId, lessonId });
      setNewPractice({});
      loadContent();
    } catch (error) {
      console.error("Failed to add practice", error);
    }
  };

  const handleUpdatePractice = async () => {
    if (!editingPractice) return;
    try {
      await api.put(`/practices/${editingPractice.id}`, editingPractice);
      setEditingPractice(null);
      loadContent();
    } catch (error) {
      console.error("Failed to update practice", error);
    }
  };

  const handleDeletePractice = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/practices/${id}`);
      loadContent();
    } catch (error) {
      console.error("Failed to delete practice", error);
    }
  };

  const handleImport = async () => {
    setImportError('');
    try {
      const data = JSON.parse(importJson);
      if (!Array.isArray(data)) {
        setImportError('JSON must be an array of objects');
        return;
      }

      if (importType === 'words') {
        await api.post('/words/bulk', { unitId, lessonId, words: data });
      } else {
        await api.post('/practices/bulk', { unitId, lessonId, practices: data });
      }
      
      setShowImportModal(false);
      setImportJson('');
      loadContent();
    } catch (error) {
      console.error("Import failed", error);
      setImportError('Invalid JSON format or server error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FileJson className="w-6 h-6 text-indigo-600" />
                Import {importType === 'words' ? 'Words' : 'Practices'}
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Paste your JSON array below. 
                {importType === 'words' ? (
                  <span className="block mt-1 bg-slate-50 p-2 rounded border border-slate-200 font-mono text-xs">
                    [&#123; "word": "Apple", "phonetic": "/.../", "englishMeaning": "...", "chineseMeaning": "...", "example": "..." &#125;]
                  </span>
                ) : (
                  <span className="block mt-1 bg-slate-50 p-2 rounded border border-slate-200 font-mono text-xs">
                    [&#123; "practice": "I eat an ___.", "answer": "apple" &#125;]
                  </span>
                )}
              </p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full h-64 p-4 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Paste JSON here..."
              />
              {importError && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                  {importError}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Import
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <h1 className="text-xl font-bold text-slate-800">Manage Content</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Selectors */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Unit ID</label>
            <input 
              type="number" 
              value={unitId} 
              onChange={(e) => setUnitId(parseInt(e.target.value) || 0)}
              className="w-32 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Lesson ID</label>
            <input 
              type="number" 
              value={lessonId} 
              onChange={(e) => setLessonId(parseInt(e.target.value) || 0)}
              className="w-32 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={loadContent}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Words Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Words</h2>
              </div>
              <button 
                onClick={() => { setImportType('words'); setShowImportModal(true); }}
                className="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <FileJson className="w-4 h-4" /> Import JSON
              </button>
            </div>

            {/* Add Word Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">Add New Word</h3>
              <div className="space-y-4">
                <input 
                  placeholder="Word" 
                  value={newWord.word || ''} 
                  onChange={e => setNewWord({...newWord, word: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  placeholder="Phonetic" 
                  value={newWord.phonetic || ''} 
                  onChange={e => setNewWord({...newWord, phonetic: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  placeholder="English Meaning" 
                  value={newWord.englishMeaning || ''} 
                  onChange={e => setNewWord({...newWord, englishMeaning: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  placeholder="Chinese Meaning" 
                  value={newWord.chineseMeaning || ''} 
                  onChange={e => setNewWord({...newWord, chineseMeaning: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea 
                  placeholder="Example Sentence" 
                  value={newWord.example || ''} 
                  onChange={e => setNewWord({...newWord, example: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleAddWord}
                  className="w-full py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Word
                </button>
              </div>
            </div>

            {/* Words List */}
            <div className="space-y-4">
              {words.map(word => (
                <div key={word.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  {editingWord?.id === word.id ? (
                    <div className="space-y-3">
                      <input 
                        value={editingWord.word} 
                        onChange={e => setEditingWord({...editingWord, word: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                      <input 
                        value={editingWord.phonetic} 
                        onChange={e => setEditingWord({...editingWord, phonetic: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                      <input 
                        value={editingWord.englishMeaning} 
                        onChange={e => setEditingWord({...editingWord, englishMeaning: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                      <input 
                        value={editingWord.chineseMeaning} 
                        onChange={e => setEditingWord({...editingWord, chineseMeaning: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                      <textarea 
                        value={editingWord.example} 
                        onChange={e => setEditingWord({...editingWord, example: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleUpdateWord} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                        <button onClick={() => setEditingWord(null)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-sm flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-lg text-slate-800">{word.word}</h4>
                          <p className="text-slate-500 text-sm">{word.phonetic}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingWord(word)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteWord(word.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-1"><span className="font-medium text-slate-400 text-xs uppercase mr-2">EN</span>{word.englishMeaning}</p>
                      <p className="text-slate-600 text-sm mb-2"><span className="font-medium text-slate-400 text-xs uppercase mr-2">CN</span>{word.chineseMeaning}</p>
                      <p className="text-slate-500 text-sm italic bg-slate-50 p-2 rounded-lg">"{word.example}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Practices Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                  <Trophy className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Practices</h2>
              </div>
              <button 
                onClick={() => { setImportType('practices'); setShowImportModal(true); }}
                className="text-sm text-violet-600 font-medium hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <FileJson className="w-4 h-4" /> Import JSON
              </button>
            </div>

            {/* Add Practice Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">Add New Practice</h3>
              <div className="space-y-4">
                <textarea 
                  placeholder="Practice Sentence (use ___ for blank)" 
                  value={newPractice.practice || ''} 
                  onChange={e => setNewPractice({...newPractice, practice: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input 
                  placeholder="Answer" 
                  value={newPractice.answer || ''} 
                  onChange={e => setNewPractice({...newPractice, answer: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button 
                  onClick={handleAddPractice}
                  className="w-full py-2 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Practice
                </button>
              </div>
            </div>

            {/* Practices List */}
            <div className="space-y-4">
              {practices.map(practice => (
                <div key={practice.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  {editingPractice?.id === practice.id ? (
                    <div className="space-y-3">
                      <textarea 
                        value={editingPractice.practice} 
                        onChange={e => setEditingPractice({...editingPractice, practice: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                      <input 
                        value={editingPractice.answer} 
                        onChange={e => setEditingPractice({...editingPractice, answer: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleUpdatePractice} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                        <button onClick={() => setEditingPractice(null)} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-sm flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-slate-800">{practice.practice}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingPractice(practice)} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeletePractice(practice.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">Answer: <span className="font-bold text-violet-600">{practice.answer}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
