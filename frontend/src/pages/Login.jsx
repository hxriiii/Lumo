import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, KeyRound, UserCheck, Smile } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = () => {
    setUsername('alex');
    setPassword('password123');
  };

  const handleDemoMentor = () => {
    setUsername('mentor_prof');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#FFD12E] border-2 border-slate-900 flex items-center justify-center text-slate-900 mx-auto shadow-[4px_4px_0px_0px_#1E293B]">
          <Sparkles className="w-9 h-9 fill-slate-900" />
        </div>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Welcome to Lumo 👋
        </h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          Your AI-Powered Personalized Adaptive Learning Coach
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border-2 border-slate-900 py-8 px-6 shadow-[6px_6px_0px_0px_#1E293B] rounded-3xl sm:px-10">
          {error && (
            <div className="mb-5 bg-rose-100 border-2 border-slate-900 text-rose-900 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm shadow-[2px_2px_0px_0px_#1E293B]">
              ⚠️ {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl px-4 py-3 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:bg-white text-sm shadow-[2px_2px_0px_0px_#1E293B]"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl px-4 py-3 text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:bg-white text-sm shadow-[2px_2px_0px_0px_#1E293B]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 font-extrabold rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In & Learn'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 border-t-2 border-slate-200 pt-6">
            <p className="text-[11px] text-slate-500 font-extrabold mb-3 text-center uppercase tracking-wider">
              ⚡ Quick Demo Shortcuts
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDemoStudent}
                className="px-3 py-2.5 bg-[#38BDF8] hover:bg-sky-400 text-slate-900 border-2 border-slate-900 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <KeyRound className="w-4 h-4" />
                Demo Student
              </button>
              <button
                type="button"
                onClick={handleDemoMentor}
                className="px-3 py-2.5 bg-[#FF6B6B] hover:bg-rose-400 text-white border-2 border-slate-900 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                Demo Mentor
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs font-bold text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-sky-600 hover:text-sky-700 underline font-extrabold ml-1">
              Create student profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

