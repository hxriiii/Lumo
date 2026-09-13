import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Check, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-white">
          Create Student Profile
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          Select 1–3 subjects to initialize your adaptive learning path
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Alex"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Student"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="alex_learner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/* Subject Selection Grid */}
            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select 1–3 Subjects: ({selectedSubjects.length}/3 selected)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {subjects.map((sub) => {
                  const isSelected = selectedSubjects.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-sm block text-white">{sub.name}</span>
                        <span className="text-xs text-slate-400">{sub.topic_count || 3} topics</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-slate-700'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? 'Setting up Profile...' : 'Complete Profile & Start Learning'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
