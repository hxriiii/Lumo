import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, User, LogOut, Bot, Shield, LayoutDashboard, Flame, Star, BookOpen } from 'lucide-react';

export const Navbar = ({ onOpenChat }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isMentor = profile?.is_mentor;

  return (
    <header className="bg-white border-b-2 border-slate-900 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#FFD12E] border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-[3px_3px_0px_0px_#1E293B] group-hover:rotate-6 transition-transform">
            <Sparkles className="w-6 h-6 fill-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-2xl text-slate-900 tracking-tight">Lumo</span>
              <span className="bg-[#38BDF8] text-slate-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-slate-900 shadow-[1px_1px_0px_0px_#1E293B]">
                AI Coach
              </span>
            </div>
            <span className="text-xs text-slate-500 font-semibold block">Personal Study Journey</span>
          </div>
        </Link>

        {/* Center / Right Nav Items */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-2 ${
              location.pathname === '/dashboard'
                ? 'bg-[#38BDF8] text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]'
                : 'bg-slate-100/80 text-slate-700 border-transparent hover:border-slate-900 hover:bg-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline">Dashboard</span>
          </Link>

          <Link
            to="/subjects/select"
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-2 ${
              location.pathname === '/subjects/select'
                ? 'bg-[#38BDF8] text-slate-900 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]'
                : 'bg-slate-100/80 text-slate-700 border-transparent hover:border-slate-900 hover:bg-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">My Subjects</span>
          </Link>

          {isMentor && (
            <Link
              to="/mentor"
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-2 ${
                location.pathname === '/mentor'
                  ? 'bg-[#FF6B6B] text-white border-slate-900 shadow-[2px_2px_0px_0px_#1E293B]'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:border-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Mentor Portal</span>
            </Link>
          )}

          {/* Quick Stats Pills */}
          <div className="hidden lg:flex items-center gap-2 ml-2">
            <div className="px-3 py-1.5 rounded-full bg-amber-100 border-2 border-slate-900 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#1E293B]">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>3 Day Streak</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-purple-100 border-2 border-slate-900 text-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#1E293B]">
              <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
              <span>450 XP</span>
            </div>
          </div>

          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#1E293B] transition-all flex items-center gap-2 ml-1"
            >
              <Bot className="w-4 h-4 text-slate-900" />
              <span>Ask AI Coach</span>
            </button>
          )}

          <div className="h-7 w-0.5 bg-slate-200 mx-1 hidden sm:block" />

          {/* User Profile Menu */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-1">
              <div className="w-10 h-10 rounded-2xl bg-[#34D399] border-2 border-slate-900 flex items-center justify-center text-slate-900 font-extrabold shadow-[2px_2px_0px_0px_#1E293B]">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden xl:inline font-extrabold text-sm text-slate-800">
                {user.first_name || user.username}
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Logout"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-slate-300"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

