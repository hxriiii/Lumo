import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { RecommendationCard } from '../components/RecommendationCard';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { CheckCircle2, XCircle, Trophy, Clock, ArrowRight, Bot, LayoutDashboard } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Assessment Results...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Result not found.
        </div>
      </div>
    );
  }

  const { score, correct_count, total_count, time_taken_seconds, question_results, adaptive_decision, topic_name, difficulty } = result;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenChat={() => setChatOpen(true)} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Score Summary Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Evaluation Completed</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {topic_name || 'Assessment'} Result
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Level: <strong className="uppercase text-slate-200">{difficulty || 'Easy'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-6 bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl shrink-0">
              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium block">Final Score</span>
                <span className={`text-3xl font-extrabold ${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {score}%
                </span>
              </div>
              <div className="h-10 w-px bg-slate-800"></div>
              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium block">Correct</span>
                <span className="text-2xl font-extrabold text-white">{correct_count} / {total_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" /> Grok Adaptive Decision
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
          <h3 className="text-lg font-bold text-white">Question Breakdown & Explanations</h3>
          <div className="space-y-4">
            {question_results?.map((q, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {q.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <h4 className="font-bold text-white text-base">Question {idx + 1}</h4>
                  </div>

                  {q.concept_tag && (
                    <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                      {q.concept_tag}
                    </span>
                  )}
                </div>

                <p className="text-slate-200 font-medium text-sm sm:text-base">{q.text}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className={`p-3 rounded-xl border text-xs sm:text-sm ${q.is_correct ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/20 border-rose-500/30 text-rose-300'}`}>
                    <span className="font-semibold block text-slate-400 text-[11px] uppercase mb-0.5">Your Answer:</span>
                    {q.selected_option || 'Not Answered'}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-emerald-400">
                    <span className="font-semibold block text-slate-400 text-[11px] uppercase mb-0.5">Correct Answer:</span>
                    {q.correct_answer}
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 text-xs sm:text-sm text-slate-300">
                  <strong className="text-blue-400 block mb-1">Explanation:</strong>
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
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm flex items-center gap-2 transition-colors"
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
