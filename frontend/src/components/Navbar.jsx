import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, LogOut, Bot, Shield, LayoutDashboard } from 'lucide-react';

export const Navbar = ({ onOpenChat }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isMentor = profile?.is_mentor;

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">Adaptive Learning</span>
            <span className="text-xs text-blue-400 block font-medium">AI Coach Engine</span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              location.pathname === '/dashboard' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            to="/subjects/select"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/subjects/select' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            My Subjects
          </Link>

          {isMentor && (
            <Link
              to="/mentor"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                location.pathname === '/mentor' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-amber-300 hover:bg-amber-900/30'
              }`}
            >
              <Shield className="w-4 h-4" />
              Mentor Portal
            </Link>
          )}

          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="px-3.5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all active:scale-95 ml-2"
            >
              <Bot className="w-4 h-4" />
              Ask AI Tutor
            </button>
          )}

          <div className="h-6 w-px bg-slate-800 mx-2" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-semibold uppercase">
                {user.username.slice(0, 2)}
              </div>
              <span className="hidden sm:inline font-medium text-slate-200">{user.first_name || user.username}</span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
