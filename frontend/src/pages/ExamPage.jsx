import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, AlertCircle, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-8 max-w-md text-center shadow-[6px_6px_0px_0px_#1E293B]">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Unable to Start Quiz</h3>
            <p className="text-slate-600 text-sm font-semibold mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 font-extrabold rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B]"
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
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-white border-2 border-slate-900 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_#1E293B]">
            <div className="w-6 h-6 border-4 border-[#FFD12E] border-t-slate-900 rounded-full animate-spin"></div>
            <span className="font-bold text-slate-900 text-sm">Preparing Assessment Questions...</span>
          </div>
        </div>
      </div>
    );
  }

  const questions = test.questions || [];
  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Exam Header */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4 shadow-[5px_5px_0px_0px_#1E293B]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-sky-600 font-extrabold uppercase tracking-wider">{test.subject_name}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-700 font-extrabold">{test.topic_name}</span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">MCQ Assessment Quiz 📝</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#FFD12E] border-2 border-slate-900 px-3.5 py-1.5 rounded-2xl text-slate-900 shadow-[2px_2px_0px_0px_#1E293B]">
              <Clock className="w-4 h-4 text-slate-900" />
              <span className="font-mono text-slate-900 font-extrabold text-sm">{formatTime(seconds)}</span>
            </div>

            <span
              className={`text-xs uppercase font-extrabold px-3 py-1.5 rounded-2xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1E293B] ${
                test.difficulty === 'hard'
                  ? 'bg-purple-200 text-purple-900'
                  : test.difficulty === 'medium'
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-emerald-200 text-emerald-900'
              }`}
            >
              {test.difficulty}
            </span>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E293B] space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold border-b-2 border-slate-200 pb-4">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              {currentQuestion.concept_tag && (
                <span className="bg-[#FAF8F5] text-slate-800 px-3 py-1 rounded-full border-2 border-slate-900 shadow-[1.5px_1.5px_0px_0px_#1E293B]">
                  Tag: {currentQuestion.concept_tag}
                </span>
              )}
            </div>

            <h3 className="font-display text-lg sm:text-2xl font-bold text-slate-900 leading-relaxed">
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
                    className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 shadow-[3px_3px_0px_0px_#1E293B] ${
                      isSelected
                        ? 'bg-[#38BDF8] border-slate-900 text-slate-900'
                        : 'bg-[#FAF8F5] border-slate-900 text-slate-800 hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border-2 border-slate-900 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-[1.5px_1.5px_0px_0px_#1E293B] ${
                        isSelected ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                      }`}
                    >
                      {letter}
                    </div>
                    <span className="font-extrabold text-sm sm:text-base flex-1">{option}</span>
                  </div>
                );
              })}
            </div>

            {/* Navigation & Submit Footer */}
            <div className="pt-6 border-t-2 border-slate-200 flex items-center justify-between gap-4">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-slate-100 disabled:opacity-40 text-slate-900 border-2 border-slate-900 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-[#FAF8F5] hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-[#34D399] hover:bg-emerald-400 text-slate-900 rounded-2xl text-xs sm:text-sm font-extrabold border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 transition-all"
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
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-4 flex flex-wrap items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#1E293B]">
          {questions.map((q, idx) => {
            const isAnswered = !!userAnswers[q.id];
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-xl font-extrabold text-xs border-2 border-slate-900 transition-all shadow-[1.5px_1.5px_0px_0px_#1E293B] ${
                  isCurrent
                    ? 'bg-[#FFD12E] text-slate-900 scale-105'
                    : isAnswered
                    ? 'bg-[#38BDF8] text-slate-900'
                    : 'bg-[#FAF8F5] text-slate-700 hover:bg-white'
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

