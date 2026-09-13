import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { RecommendationCard } from '../components/RecommendationCard';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { CheckCircle2, XCircle, Trophy, Clock, ArrowRight, Bot, LayoutDashboard, Sparkles } from 'lucide-react';
import api from '../api/axios';

export const ResultPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!location.state?.resultData);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!result) {
      fetchResult();
    }
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await api.get(`/adaptive/latest/?topic_id=${id}`);
      setResult(res.data);
    } catch (err) {
      console.error('Failed to load result:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-slate-900 font-bold">
        <div className="flex items-center gap-3 bg-white border-2 border-slate-900 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_#1E293B]">
          <div className="w-6 h-6 border-4 border-[#FFD12E] border-t-slate-900 rounded-full animate-spin"></div>
          Evaluating Assessment Results...
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-600 font-bold">
          Result record not found.
        </div>
      </div>
    );
  }

  const { score, correct_count, total_count, time_taken_seconds, question_results, adaptive_decision, topic_name, difficulty } = result;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col">
      <Navbar onOpenChat={() => setChatOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Score Summary Header */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E293B] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 bg-[#34D399] px-3 py-1 rounded-full border border-slate-900 shadow-[1.5px_1.5px_0px_0px_#1E293B] uppercase mb-2">
                <Trophy className="w-3.5 h-3.5 fill-yellow-300 text-slate-900" /> Assessment Evaluated 🎉
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {topic_name || 'Assessment'} Quiz Result
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1">
                Difficulty Level: <strong className="uppercase text-slate-900 bg-[#FFD12E] px-2 py-0.5 rounded-md border border-slate-900 ml-1">{difficulty || 'Easy'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-5 bg-[#FAF8F5] border-2 border-slate-900 p-5 rounded-2xl shrink-0 shadow-[3px_3px_0px_0px_#1E293B]">
              <div className="text-center px-2">
                <span className="text-xs text-slate-500 font-extrabold block uppercase">Final Score</span>
                <span className={`font-display text-3xl sm:text-4xl font-extrabold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {score}%
                </span>
              </div>
              <div className="h-10 w-0.5 bg-slate-300"></div>
              <div className="text-center px-2">
                <span className="text-xs text-slate-500 font-extrabold block uppercase">Correct Answers</span>
                <span className="font-display text-2xl font-extrabold text-slate-900">{correct_count} / {total_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div className="space-y-3">
          <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-amber-500" /> Grok AI Adaptive Decision & Next Step
          </h3>
          <RecommendationCard
            decision={adaptive_decision}
            onStartExam={(diff) => {
              if (adaptive_decision?.topic) {
                navigate(`/exam?topic_id=${adaptive_decision.topic}&difficulty=${diff}`);
              } else {
                navigate('/dashboard');
              }
            }}
            onOpenChat={() => setChatOpen(true)}
            onRequestMentor={async () => {
              try {
                await api.post('/mentor/request/', {
                  topic_id: adaptive_decision?.topic,
                  reason: adaptive_decision?.reason,
                  attempts_summary: `Score: ${score}%. Weak concepts: ${adaptive_decision?.weak_areas?.join(', ')}`,
                });
                alert('Mentor request created successfully!');
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold text-slate-900">Question Breakdown & Explanations 💡</h3>
          <div className="space-y-4">
            {question_results?.map((q, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-900 rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#1E293B] space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {q.is_correct ? (
                      <div className="p-1 bg-emerald-100 border-2 border-slate-900 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      </div>
                    ) : (
                      <div className="p-1 bg-rose-100 border-2 border-slate-900 rounded-xl">
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      </div>
                    )}
                    <h4 className="font-display font-bold text-slate-900 text-lg">Question {idx + 1}</h4>
                  </div>

                  {q.concept_tag && (
                    <span className="text-xs bg-amber-100 text-slate-900 px-3 py-1 rounded-full border-2 border-slate-900 font-extrabold shadow-[1.5px_1.5px_0px_0px_#1E293B]">
                      Tag: {q.concept_tag}
                    </span>
                  )}
                </div>

                <p className="text-slate-900 font-extrabold text-sm sm:text-base leading-relaxed">{q.text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className={`p-3.5 rounded-2xl border-2 font-bold text-xs sm:text-sm shadow-[2px_2px_0px_0px_#1E293B] ${q.is_correct ? 'bg-emerald-50 border-slate-900 text-emerald-900' : 'bg-rose-50 border-slate-900 text-rose-900'}`}>
                    <span className="font-extrabold block text-slate-600 text-[11px] uppercase tracking-wider mb-0.5">Your Answer:</span>
                    {q.selected_option || 'Not Answered'}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-slate-900 font-bold text-xs sm:text-sm text-emerald-900 shadow-[2px_2px_0px_0px_#1E293B]">
                    <span className="font-extrabold block text-slate-600 text-[11px] uppercase tracking-wider mb-0.5">Correct Answer:</span>
                    {q.correct_answer}
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 font-medium">
                  <strong className="text-sky-600 font-extrabold block mb-1">Explanation:</strong>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 font-extrabold rounded-2xl border-2 border-slate-900 text-xs sm:text-sm shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" /> Return to Dashboard
          </button>
        </div>
      </main>

      <AIChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        topicId={adaptive_decision?.topic}
        topicName={topic_name}
      />
    </div>
  );
};

