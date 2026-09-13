import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ScoreHistoryChart } from '../components/ProgressCharts';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { BookOpen, Play, Bot, ArrowLeft, History, Sparkles } from 'lucide-react';
import api from '../api/axios';

export const SubjectDetail = () => {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicHistory, setTopicHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubject();
  }, [id]);

  const fetchSubject = async () => {
    try {
      const res = await api.get(`/subjects/${id}/`);
      setSubject(res.data);
      if (res.data.topics?.length > 0) {
        setSelectedTopic(res.data.topics[0]);
        fetchTopicHistory(res.data.topics[0].id);
      }
    } catch (err) {
      console.error('Failed to load subject details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicHistory = async (topicId) => {
    try {
      const res = await api.get(`/progress/topics/${topicId}/history/`);
      setTopicHistory(res.data);
    } catch (err) {
      console.error('Failed to load topic history:', err);
    }
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    fetchTopicHistory(topic.id);
  };

  const handleStartExam = (difficulty = 'easy') => {
    if (selectedTopic) {
      navigate(`/exam?topic_id=${selectedTopic.id}&difficulty=${difficulty}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-slate-800 font-bold">
        <div className="flex items-center gap-3 bg-white border-2 border-slate-900 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_#1E293B]">
          <div className="w-6 h-6 border-4 border-[#FFD12E] border-t-slate-900 rounded-full animate-spin"></div>
          Loading Subject Topics...
        </div>
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col">
      <Navbar onOpenChat={() => setChatOpen(true)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 hover:text-sky-600 bg-white border-2 border-slate-900 px-4 py-2 rounded-2xl shadow-[2px_2px_0px_0px_#1E293B] transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[5px_5px_0px_0px_#1E293B]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-[#FFD12E] border-2 border-slate-900 text-slate-900 shadow-[3px_3px_0px_0px_#1E293B]">
                <BookOpen className="w-7 h-7" />
              </div>
              <h1 className="font-display text-3xl font-extrabold text-slate-900">{subject.name}</h1>
            </div>
            <p className="text-slate-600 text-sm font-semibold max-w-2xl">{subject.description}</p>
          </div>
        </div>

        {/* Topics & History Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics Navigation Column */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Topics Hierarchy</h3>
            {subject.topics?.map((topic) => {
              const isSelected = selectedTopic?.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`cursor-pointer p-4 rounded-3xl border-2 transition-all flex items-center justify-between shadow-[3px_3px_0px_0px_#1E293B] ${
                    isSelected
                      ? 'bg-[#FFD12E] border-slate-900 text-slate-900'
                      : 'bg-white border-slate-900 text-slate-800 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{topic.name}</h4>
                    <p className="text-xs font-semibold text-slate-700 mt-1 line-clamp-1">{topic.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTopic(topic);
                        handleStartExam('easy');
                      }}
                      className="p-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-xl transition-all shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5"
                      title="Start Quiz"
                    >
                      <Play className="w-4 h-4 fill-slate-900" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main Topic Detail & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTopic ? (
              <>
                <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-7 shadow-[5px_5px_0px_0px_#1E293B]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <span className="bg-[#38BDF8] text-slate-900 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-slate-900 shadow-[1px_1px_0px_0px_#1E293B]">
                        Active Topic
                      </span>
                      <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">{selectedTopic.name}</h2>
                      <p className="text-slate-600 text-sm font-medium mt-1">{selectedTopic.description}</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleStartExam('easy')}
                        className="px-4 py-2.5 bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 text-xs sm:text-sm font-extrabold rounded-2xl border-2 border-slate-900 flex items-center gap-2 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        <Play className="w-4 h-4 fill-slate-900" /> Start Assessment
                      </button>
                      <button
                        onClick={() => setChatOpen(true)}
                        className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-white text-slate-900 border-2 border-slate-900 text-xs sm:text-sm font-extrabold rounded-2xl flex items-center gap-2 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" /> Ask Lumo AI
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-slate-200">
                    <h3 className="font-display text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <History className="w-5 h-5 text-sky-500" /> Assessment Score Progression
                    </h3>
                    <ScoreHistoryChart historyData={topicHistory} />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white border-2 border-slate-900 rounded-3xl p-12 text-center text-slate-500 font-bold shadow-[4px_4px_0px_0px_#1E293B]">
                Select a topic to view assessment details.
              </div>
            )}
          </div>
        </div>
      </main>

      <AIChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        topicId={selectedTopic?.id}
        topicName={selectedTopic?.name}
      />
    </div>
  );
};

