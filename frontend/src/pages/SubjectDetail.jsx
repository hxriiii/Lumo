import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ScoreHistoryChart } from '../components/ProgressCharts';
import { AIChatDrawer } from '../components/AIChatDrawer';
import { BookOpen, Play, Bot, ArrowLeft, History } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Subject...
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenChat={() => setChatOpen(true)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-white">{subject.name}</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">{subject.description}</p>
          </div>
        </div>

        {/* Topics & History Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics Navigation Column */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white mb-2">Topics Hierarchy</h3>
            {subject.topics?.map((topic) => {
              const isSelected = selectedTopic?.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h4 className="font-semibold text-sm">{topic.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{topic.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTopic(topic);
                        handleStartExam('easy');
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-sm"
                      title="Start Exam"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
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
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Active Topic</span>
                      <h2 className="text-2xl font-bold text-white mt-0.5">{selectedTopic.name}</h2>
                      <p className="text-slate-400 text-sm mt-1">{selectedTopic.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartExam('easy')}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                      >
                        <Play className="w-4 h-4 fill-current" /> Start Exam
                      </button>
                      <button
                        onClick={() => setChatOpen(true)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium rounded-xl flex items-center gap-2 transition-all"
                      >
                        <Bot className="w-4 h-4 text-blue-400" /> Ask AI
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-400" /> Assessment Score Progression
                    </h3>
                    <ScoreHistoryChart historyData={topicHistory} />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
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
