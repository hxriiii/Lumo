import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Check, BookOpen, Save, ArrowLeft, Sparkles } from 'lucide-react';
import api from '../api/axios';

export const SubjectSelection = () => {
  const { profile, updateSelectedSubjects } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
    if (profile?.selected_subjects) {
      setSelectedSubjects(profile.selected_subjects.map((s) => s.id));
    }
  }, [profile]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects/');
      setSubjects(res.data);
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const toggleSubject = (id) => {
    if (selectedSubjects.includes(id)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== id));
    } else {
      if (selectedSubjects.length >= 3) {
        setError('You can select up to 3 subjects.');
        return;
      }
      setError('');
      setSelectedSubjects([...selectedSubjects, id]);
    }
  };

  const handleSave = async () => {
    if (selectedSubjects.length === 0) {
      setError('Please select at least 1 subject.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await updateSelectedSubjects(selectedSubjects);
      setMessage('Subjects updated successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError('Failed to update subjects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 hover:text-sky-600 bg-white border-2 border-slate-900 px-4 py-2 rounded-2xl shadow-[2px_2px_0px_0px_#1E293B] transition-all active:translate-x-0.5 active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E293B]">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="p-3 rounded-2xl bg-[#FFD12E] border-2 border-slate-900 text-slate-900 shadow-[3px_3px_0px_0px_#1E293B]">
              <Sparkles className="w-7 h-7 fill-slate-900" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Select Your Study Subjects 📚</h1>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold">Choose 1 to 3 subjects to power your adaptive learning journey</p>
            </div>
          </div>

          {error && <div className="mt-4 p-3.5 bg-rose-100 border-2 border-slate-900 text-rose-900 text-xs sm:text-sm font-bold rounded-2xl shadow-[2px_2px_0px_0px_#1E293B]">{error}</div>}
          {message && <div className="mt-4 p-3.5 bg-emerald-100 border-2 border-slate-900 text-emerald-900 text-xs sm:text-sm font-bold rounded-2xl shadow-[2px_2px_0px_0px_#1E293B]">{message}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {subjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`cursor-pointer p-5 rounded-3xl border-2 transition-all flex items-start justify-between shadow-[3px_3px_0px_0px_#1E293B] ${
                    isSelected
                      ? 'bg-[#FFD12E] border-slate-900 text-slate-900'
                      : 'bg-[#FAF8F5] border-slate-900 text-slate-800 hover:bg-white'
                  }`}
                >
                  <div className="pr-4">
                    <span className="font-display font-bold text-lg block text-slate-900">{sub.name}</span>
                    <p className="text-xs font-semibold text-slate-700 mt-1 line-clamp-2">{sub.description}</p>
                    <span className="inline-block mt-3 text-xs text-slate-900 font-extrabold bg-white px-2.5 py-0.5 rounded-full border border-slate-900 shadow-[1px_1px_0px_0px_#1E293B]">
                      📖 {sub.topic_count || 3} Core Topics
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-slate-900 text-white' : 'bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-slate-200">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-[#FAF8F5] hover:bg-slate-100 text-slate-900 border-2 border-slate-900 font-bold rounded-2xl text-xs sm:text-sm shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 font-extrabold rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 text-xs sm:text-sm transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

