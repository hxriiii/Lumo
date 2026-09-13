import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Check, BookOpen, Save, ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Select Your Subjects</h1>
              <p className="text-slate-400 text-sm">Choose 1 to 3 subjects to feature on your dashboard</p>
            </div>
          </div>

          {error && <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl">{error}</div>}
          {message && <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl">{message}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            {subjects.map((sub) => {
              const isSelected = selectedSubjects.includes(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => toggleSubject(sub.id)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all flex items-start justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="pr-4">
                    <span className="font-bold text-base block text-white">{sub.name}</span>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sub.description}</p>
                    <span className="inline-block mt-3 text-xs text-blue-400 font-medium">
                      {sub.topic_count || 3} Core Topics
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
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
