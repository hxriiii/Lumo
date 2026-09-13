import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Check, ArrowRight, BookOpen } from 'lucide-react';
import api from '../api/axios';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects/');
      setSubjects(res.data);
      // Preselect first 3 subjects by default
      if (res.data.length >= 3) {
        setSelectedSubjects([res.data[0].id, res.data[1].id, res.data[2].id]);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      setError('Please select at least 1 subject.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await register(username, email, password, firstName, lastName, selectedSubjects);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Registration failed. Username or email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#FFD12E] border-2 border-slate-900 flex items-center justify-center text-slate-900 mx-auto shadow-[4px_4px_0px_0px_#1E293B]">
          <Sparkles className="w-9 h-9 fill-slate-900" />
        </div>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Create Your Student Profile 🌟
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-600">
          Select 1–3 subjects to launch your dynamic AI study path!
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white border-2 border-slate-900 py-8 px-6 shadow-[6px_6px_0px_0px_#1E293B] rounded-3xl sm:px-10">
          {error && (
            <div className="mb-5 bg-rose-100 border-2 border-slate-900 text-rose-900 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm shadow-[2px_2px_0px_0px_#1E293B]">
              ⚠️ {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B]"
                  placeholder="Alex"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B]"
                  placeholder="Student"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B]"
                placeholder="alex_learner"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B]"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-slate-900 font-semibold text-sm focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B]"
                placeholder="••••••••"
              />
            </div>

            {/* Subject Selection Grid */}
            <div className="pt-2">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">
                Select 1–3 Subjects ({selectedSubjects.length}/3 selected):
              </label>
              <div className="grid grid-cols-2 gap-3">
                {subjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between shadow-[2px_2px_0px_0px_#1E293B] ${
                        isSelected
                          ? 'bg-[#FFD12E] border-slate-900 text-slate-900'
                          : 'bg-[#FAF8F5] border-slate-900 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-extrabold text-sm block text-slate-900">{sub.name}</span>
                        <span className="text-xs font-bold text-slate-600">{sub.topic_count || 3} topics</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center ${isSelected ? 'bg-slate-900 text-white' : 'bg-white'}`}>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 font-extrabold rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Setting up Profile...' : 'Complete Profile & Start Learning'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs font-bold text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 hover:text-sky-700 underline font-extrabold ml-1">
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
