import React from 'react';
import { ArrowRight, Sparkles, AlertTriangle, CheckCircle2, RefreshCw, UserCheck, Bot } from 'lucide-react';

export const RecommendationCard = ({ decision, onStartExam, onOpenChat, onRequestMentor }) => {
  if (!decision) {
    return (
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-[4px_4px_0px_0px_#1E293B]">
        <div className="w-14 h-14 rounded-2xl bg-[#FFD12E] border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_0px_#1E293B]">
          <Sparkles className="w-8 h-8 text-slate-900 fill-slate-900" />
        </div>
        <h4 className="font-display font-bold text-slate-900 text-lg">No AI Recommendations Yet! 🌟</h4>
        <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto font-medium">
          Take your first Easy MCQ test on any topic to generate your personalized, AI-powered learning path!
        </p>
      </div>
    );
  }

  const { decision: type, next_difficulty, reason, weak_areas, recommended_action, topic_name } = decision;

  let theme = {
    badge: 'bg-[#FFD12E] text-slate-900 border-slate-900',
    title: 'REINFORCE & STRENGTHEN',
    subtitle: `Targeted Practice (${next_difficulty?.toUpperCase() || 'EASY'})`,
    btnBg: 'bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900',
    icon: RefreshCw,
  };

  if (type === 'advance') {
    theme = {
      badge: 'bg-[#34D399] text-slate-900 border-slate-900',
      title: 'READY TO ADVANCE! 🚀',
      subtitle: `Upgrade to ${next_difficulty?.toUpperCase() || 'MEDIUM'} Level`,
      btnBg: 'bg-[#38BDF8] hover:bg-[#0284C7] text-slate-900',
      icon: CheckCircle2,
    };
  } else if (type === 'mentor') {
    theme = {
      badge: 'bg-[#FF6B6B] text-white border-slate-900',
      title: '1-ON-1 MENTOR REFERRAL 🎓',
      subtitle: 'Personalized Human Guidance Recommended',
      btnBg: 'bg-[#FF6B6B] hover:bg-rose-600 text-white',
      icon: AlertTriangle,
    };
  }

  const IconComp = theme.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-slate-900 bg-white p-6 sm:p-7 shadow-[5px_5px_0px_0px_#1E293B]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-5">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`p-3 rounded-2xl border-2 border-slate-900 shadow-[2.5px_2.5px_0px_0px_#1E293B] ${theme.badge}`}>
            <IconComp className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#1E293B] uppercase ${theme.badge}`}>
                {theme.title}
              </span>
              {topic_name && (
                <span className="text-xs text-slate-600 font-bold bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">
                  Topic: {topic_name}
                </span>
              )}
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 capitalize">
              {theme.subtitle}
            </h3>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {type === 'mentor' ? (
            <button
              onClick={onRequestMentor}
              className="px-5 py-3 rounded-2xl bg-[#FF6B6B] hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              Connect with Mentor
            </button>
          ) : (
            <button
              onClick={() => onStartExam && onStartExam(next_difficulty)}
              className={`px-5 py-3 rounded-2xl ${theme.btnBg} font-extrabold text-xs sm:text-sm flex items-center gap-2 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all`}
            >
              <span>Start {next_difficulty?.toUpperCase()} Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenChat}
            className="px-4 py-3 rounded-2xl bg-[#FAF8F5] hover:bg-white text-slate-900 border-2 border-slate-900 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Ask Lumo AI</span>
          </button>
        </div>
      </div>

      <div className="bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl p-4 mb-4">
        <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
          {reason}
        </p>
      </div>

      {weak_areas && weak_areas.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Identified Focus Areas:</span>
          {weak_areas.map((tag, idx) => (
            <span key={idx} className="bg-amber-100 text-slate-900 font-bold text-xs px-3 py-1 rounded-full border-2 border-slate-900 shadow-[1px_1px_0px_0px_#1E293B]">
              🎯 {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

