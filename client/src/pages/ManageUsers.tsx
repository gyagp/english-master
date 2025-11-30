import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, User, Calendar, Trophy, BookOpen, CheckCircle } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  createdAt: string;
  _count: {
    wordProgress: number;
    lessonProgress: number;
    practiceProgress: number;
  }
}

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <h1 className="text-xl font-bold text-slate-800">Manage Users</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">All Users ({users.length})</h2>
            <button 
              onClick={loadUsers}
              disabled={loading}
              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>
          
          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-center">Progress</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{user.username}</div>
                            <div className="text-xs text-slate-400">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-4">
                          <div className="flex flex-col items-center" title="Completed Lessons">
                            <div className="flex items-center gap-1 text-emerald-600 font-bold">
                              <CheckCircle className="w-4 h-4" />
                              {user._count.lessonProgress}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase">Lessons</span>
                          </div>
                          <div className="flex flex-col items-center" title="Completed Words">
                            <div className="flex items-center gap-1 text-blue-600 font-bold">
                              <BookOpen className="w-4 h-4" />
                              {user._count.wordProgress}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase">Words</span>
                          </div>
                          <div className="flex flex-col items-center" title="Completed Practices">
                            <div className="flex items-center gap-1 text-violet-600 font-bold">
                              <Trophy className="w-4 h-4" />
                              {user._count.practiceProgress}
                            </div>
                            <span className="text-[10px] text-slate-400 uppercase">Practices</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
