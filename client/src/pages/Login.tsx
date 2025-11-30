import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-200/30 blur-3xl"></div>
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-3xl"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 relative z-10">
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200 mb-6 transform rotate-3">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 mt-2 font-medium">Sign in to continue your mastery</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm text-center font-bold animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Username</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User size={20} />
                </div>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    placeholder="Enter your username"
                    required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={20} />
                </div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                    placeholder="Enter your password"
                    required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group mt-2"
            >
              <span>Sign In</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
        <div className="bg-slate-50/80 p-6 text-center border-t border-slate-100 backdrop-blur-sm">
          <p className="text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
