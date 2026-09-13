import React from 'react';
import { ArrowRight, Bot, AlertTriangle, CheckCircle2, RefreshCw, UserCheck } from 'lucide-react';

export const RecommendationCard = ({ decision, onStartExam, onOpenChat, onRequestMentor }) => {
  if (!decision) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 text-center">
        <Bot className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-80" />
        <h4 className="font-medium text-white text-base">No AI Recommendations Yet</h4>
        <p className="text-slate-400 text-sm mt-1">Take an Easy MCQ test on any topic to generate your personalized learning plan.</p>
      </div>
    );
  }

  const { decision: type, next_difficulty, reason, weak_areas, recommended_action, topic_name } = decision;

  let theme = {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/30',
    bg: 'from-amber-950/20 to-slate-900',
    title: 'REINFORCE NEEDED',
    icon: RefreshCw,
  };

  if (type === 'advance') {
    theme = {
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      border: 'border-emerald-500/30',
      bg: 'from-emerald-950/20 to-slate-900',
      title: 'READY TO ADVANCE',
      icon: CheckCircle2,
    };
  } else if (type === 'mentor') {
    theme = {
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      border: 'border-rose-500/30',
      bg: 'from-rose-950/20 to-slate-900',
      title: 'HUMAN MENTOR REFERRAL',
      icon: AlertTriangle,
    };
  }

  const IconComp = theme.icon;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.bg} p-6 shadow-xl`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${theme.badge}`}>
            <IconComp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${theme.badge}`}>
                {theme.title}
              </span>
              {topic_name && <span className="text-xs text-slate-400 font-medium">• {topic_name}</span>}
            </div>
            <h3 className="text-lg font-bold text-white mt-1 capitalize">
              {type === 'advance' ? `Upgrade to ${next_difficulty.toUpperCase()} Level` : type === 'mentor' ? '1-on-1 Guidance Recommended' : `Targeted Practice (${next_difficulty.toUpperCase()})`}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {type === 'mentor' ? (
            <button
              onClick={onRequestMentor}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              Connect with Mentor
            </button>
          ) : (
            <button
              onClick={() => onStartExam && onStartExam(next_difficulty)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              Start {next_difficulty.toUpperCase()} Exam
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenChat}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm flex items-center gap-2 transition-all"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            Ask AI Coach
          </button>
        </div>
      </div>

      <p className="text-slate-300 text-sm leading-relaxed mb-3">{reason}</p>

      {weak_areas && weak_areas.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Identified Weak Areas:</span>
          {weak_areas.map((tag, idx) => (
            <span key={idx} className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-700">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
