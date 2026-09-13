import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { RecommendationCard } from '../components/RecommendationCard';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { TopicMasteryChart } from '../components/ProgressCharts';
import { BookOpen, Sparkles, Trophy, ChevronRight, Play, Bot, AlertTriangle, ShieldCheck, Flame, Star, Target, ArrowRight } from 'lucide-react';
import api from '../api/axios';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatTopic, setActiveChatTopic] = useState({ id: null, name: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/progress/');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (topicId, difficulty = 'easy') => {
    navigate(`/exam?topic_id=${topicId}&difficulty=${difficulty}`);
  };

  const handleOpenChatForTopic = (topicId, topicName) => {
    setActiveChatTopic({ id: topicId, name: topicName });
    setChatOpen(true);
  };

  const handleRequestMentor = async (topicId, topicName) => {
    try {
      await api.post('/mentor/request/', {
        topic_id: topicId,
        reason: 'Student initiated mentor request from dashboard.',
        attempts_summary: 'Targeted support requested for low performance.',
      });
      alert(`Mentor request submitted for ${topicName}. A mentor will contact you shortly!`);
    } catch (err) {
      console.error('Failed to submit mentor request:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-slate-800">
        <div className="flex items-center gap-3 bg-white border-2 border-slate-900 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_#1E293B]">
          <div className="w-7 h-7 border-4 border-[#FFD12E] border-t-slate-900 rounded-full animate-spin"></div>
          <span className="font-bold text-slate-900 text-sm">Preparing your Lumo Learning Dashboard...</span>
        </div>
      </div>
    );
  }

  const { overall_progress, subjects, latest_recommendation } = data || {};
  const allTopics = subjects?.flatMap((s) => s.topics) || [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col">
      <Navbar onOpenChat={() => handleOpenChatForTopic(null, '')} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner with Lumo Mascot */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-[6px_6px_0px_0px_#1E293B]">
          {/* Background Blob Accents */}
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#FFD12E]/30 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute right-32 -top-8 w-40 h-40 bg-[#38BDF8]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-3xl bg-[#FFD12E] border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-[4px_4px_0px_0px_#1E293B] shrink-0">
                <Sparkles className="w-9 h-9 fill-slate-900 animate-float" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 bg-[#38BDF8] px-3 py-1 rounded-full border border-slate-900 shadow-[1.5px_1.5px_0px_0px_#1E293B] uppercase mb-2">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> AI Adaptive Coach Engine
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {user?.first_name || user?.username}! 👋
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1 max-w-xl">
                  Your personalized study path continuously adapts after every quiz to maximize your mastery!
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 bg-[#FAF8F5] border-2 border-slate-900 p-4 rounded-2xl shrink-0 shadow-[3px_3px_0px_0px_#1E293B]">
              <div className="text-center px-2">
                <span className="text-xs text-slate-500 font-extrabold block uppercase">Mastery Score</span>
                <span className="font-display text-3xl font-extrabold text-slate-900">{overall_progress}%</span>
              </div>
              <div className="h-10 w-0.5 bg-slate-300"></div>
              <div className="text-center px-2">
                <span className="text-xs text-slate-500 font-extrabold block uppercase">Active Subjects</span>
                <span className="font-display text-3xl font-extrabold text-slate-900">{subjects?.length || 0}</span>
              </div>
              <div className="h-10 w-0.5 bg-slate-300"></div>
              <div className="text-center px-2">
                <span className="text-xs text-slate-500 font-extrabold block uppercase">Total Topics</span>
                <span className="font-display text-3xl font-extrabold text-slate-900">{allTopics.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grok AI Recommendation Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-amber-500" /> Current Grok AI Recommendation
            </h2>
          </div>
          <RecommendationCard
            decision={latest_recommendation}
            onStartExam={(diff) => {
              if (latest_recommendation?.topic) {
                handleStartExam(latest_recommendation.topic, diff);
              }
            }}
            onOpenChat={() => handleOpenChatForTopic(latest_recommendation?.topic, latest_recommendation?.topic_name)}
            onRequestMentor={() => handleRequestMentor(latest_recommendation?.topic, latest_recommendation?.topic_name)}
          />
        </div>

        {/* Subjects & Topic Progress Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-sky-500" /> Subjects & Topic Mastery Hierarchy
            </h2>
            <Link
              to="/subjects/select"
              className="text-xs sm:text-sm font-extrabold text-slate-900 bg-[#FFD12E] hover:bg-[#F0C21A] px-3.5 py-1.5 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] transition-all"
            >
              Manage Subjects →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {subjects?.map((sub, sIdx) => {
              const bgColors = ['bg-sky-50', 'bg-amber-50', 'bg-emerald-50'];
              const accentBg = bgColors[sIdx % bgColors.length];
              return (
                <div
                  key={sub.id}
                  className={`bg-white border-2 border-slate-900 rounded-3xl p-6 flex flex-col justify-between shadow-[5px_5px_0px_0px_#1E293B] transition-transform hover:-translate-y-1`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-xl font-bold text-slate-900">{sub.name}</h3>
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#FFD12E] text-slate-900 border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#1E293B]">
                        {sub.overall_mastery}% Mastery
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border-2 border-slate-900 mb-6 shadow-inner">
                      <div
                        className="bg-[#38BDF8] h-full transition-all duration-500"
                        style={{ width: `${sub.overall_mastery}%` }}
                      ></div>
                    </div>

                    {/* Topic Items */}
                    <div className="space-y-3">
                      {sub.topics?.map((topic) => (
                        <div
                          key={topic.id}
                          className="bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl p-3.5 flex items-center justify-between hover:bg-white transition-all shadow-[2px_2px_0px_0px_#1E293B] group"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                                {topic.name}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border border-slate-900 ${
                                  topic.difficulty === 'hard'
                                    ? 'bg-purple-200 text-purple-900'
                                    : topic.difficulty === 'medium'
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-emerald-200 text-emerald-900'
                                }`}
                              >
                                {topic.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold mt-1">
                              <span>Mastery: <strong className="text-slate-900">{topic.mastery}%</strong></span>
                              <span>•</span>
                              <span>Attempts: <strong className="text-slate-900">{topic.attempts}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartExam(topic.id, topic.difficulty)}
                              className="p-2 bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 border-2 border-slate-900 rounded-xl transition-all shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5"
                              title="Start Quiz"
                            >
                              <Play className="w-4 h-4 fill-slate-900" />
                            </button>
                            <button
                              onClick={() => handleOpenChatForTopic(topic.id, topic.name)}
                              className="p-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-xl transition-all shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5"
                              title="Ask Lumo AI"
                            >
                              <Bot className="w-4 h-4 text-amber-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analytics & Mastery Chart */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-7 shadow-[5px_5px_0px_0px_#1E293B]">
          <h3 className="font-display text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" /> Topic Mastery Analytics Overview
          </h3>
          <TopicMasteryChart topics={allTopics} />
        </div>
      </main>

      <AIChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        topicId={activeChatTopic.id}
        topicName={activeChatTopic.name}
      />
    </div>
  );
};

