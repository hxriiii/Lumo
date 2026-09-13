import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export const ExamPage = () => {
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get('topic_id');
  const difficulty = searchParams.get('difficulty') || 'easy';

  const [test, setTest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { question_id: selected_option }
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (topicId) {
      startExam();
    }
  }, [topicId, difficulty]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const startExam = async () => {
    try {
      const res = await api.post('/exams/start/', {
        topic_id: parseInt(topicId),
        difficulty: difficulty,
      });
      setTest(res.data);
    } catch (err) {
      console.error('Failed to start exam:', err);
      setError(err.response?.data?.error || 'Could not start exam for this topic.');
    }
  };

  const handleOptionSelect = (questionId, option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!test || submitting) return;
    setSubmitting(true);

    const answersPayload = Object.entries(userAnswers).map(([qId, option]) => ({
      question_id: parseInt(qId),
      selected_option: option,
    }));

    try {
      const res = await api.post(`/exams/${test.id}/submit/`, {
        answers: answersPayload,
        time_taken_seconds: seconds,
      });

      // Navigate to Evaluated Results Page
      navigate(`/result/${test.id}`, { state: { resultData: res.data } });
    } catch (err) {
      console.error('Failed to submit test:', err);
      setError('An error occurred submitting your test.');
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins}:${remainderSecs < 10 ? '0' : ''}${remainderSecs}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Unable to Start Exam</h3>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Preparing Exam Questions...
          </div>
        </div>
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Exam Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">{test.subject_name}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">{test.topic_name}</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">Assessment Exam</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-sm">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="font-mono text-white font-semibold">{formatTime(seconds)}</span>
            </div>

            <span
              className={`text-xs uppercase font-bold px-3 py-1.5 rounded-xl border ${
                test.difficulty === 'hard'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : test.difficulty === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}
            >
              {test.difficulty}
            </span>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium border-b border-slate-800/80 pb-4">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              {currentQuestion.concept_tag && (
                <span className="bg-slate-800 text-blue-300 px-2.5 py-1 rounded-md border border-slate-700">
                  Tag: {currentQuestion.concept_tag}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQuestion.text}
            </h3>

            {/* Options Grid */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options?.map((option, idx) => {
                const optionLetters = ['A', 'B', 'C', 'D'];
                const letter = optionLetters[idx] || `${idx + 1}`;
                const isSelected = userAnswers[currentQuestion.id] === option;

                return (
                  <div
                    key={idx}
                    onClick={() => handleOptionSelect(currentQuestion.id, option)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="font-medium text-sm sm:text-base flex-1">{option}</span>
                  </div>
                );
              })}
            </div>

            {/* Navigation & Submit Footer */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question Selector Dots */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-2">
          {questions.map((q, idx) => {
            const isAnswered = !!userAnswers[q.id];
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                  isCurrent
                    ? 'ring-2 ring-blue-500 bg-blue-600 text-white'
                    : isAnswered
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                    : 'bg-slate-950 text-slate-500 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};
