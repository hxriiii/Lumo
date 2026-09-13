import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { RecommendationCard } from '../components/RecommendationCard';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { TopicMasteryChart } from '../components/ProgressCharts';
import { BookOpen, Sparkles, Trophy, ChevronRight, Play, Bot, AlertTriangle, ShieldCheck } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Loading Adaptive Dashboard...
        </div>
      </div>
    );
  }

  const { overall_progress, subjects, latest_recommendation } = data || {};
  const allTopics = subjects?.flatMap((s) => s.topics) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenChat={() => handleOpenChatForTopic(null, '')} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" /> Adaptive Learning Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.first_name || user?.username}!
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Your learning path adapts dynamically after every MCQ assessment.
              </p>
            </div>

            <div className="flex items-center gap-6 bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl shrink-0">
              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium block">Overall Progress</span>
                <span className="text-2xl font-extrabold text-blue-400">{overall_progress}%</span>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-center">
                <span className="text-xs text-slate-400 font-medium block">Active Subjects</span>
                <span className="text-2xl font-extrabold text-white">{subjects?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Grok AI Recommendation Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" /> Current AI Recommendation
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
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" /> Subjects & Mastery Hierarchy
            </h2>
            <Link
              to="/subjects/select"
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Manage Subjects →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {subjects?.map((sub) => (
              <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-base">{sub.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {sub.overall_mastery}% Mastery
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${sub.overall_mastery}%` }}
                    ></div>
                  </div>

                  {/* Topic Items */}
                  <div className="space-y-3">
                    {sub.topics?.map((topic) => (
                      <div
                        key={topic.id}
                        className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between hover:border-slate-700 transition-all group"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-slate-200 group-hover:text-blue-400 transition-colors">
                              {topic.name}
                            </span>
                            <span
                              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                                topic.difficulty === 'hard'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  : topic.difficulty === 'medium'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {topic.difficulty}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            <span>Mastery: <strong className="text-slate-200">{topic.mastery}%</strong></span>
                            <span>•</span>
                            <span>Attempts: <strong className="text-slate-200">{topic.attempts}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartExam(topic.id, topic.difficulty)}
                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
                            title="Start Exam"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleOpenChatForTopic(topic.id, topic.name)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                            title="Ask AI Tutor"
                          >
                            <Bot className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics & Mastery Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Topic Mastery Analytics
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
