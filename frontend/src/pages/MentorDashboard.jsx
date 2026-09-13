import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Shield, CheckCircle2, Clock, MessageSquare, AlertTriangle, Save } from 'lucide-react';
import api from '../api/axios';

export const MentorDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/mentor/request/');
      setRequests(res.data);
      if (res.data.length > 0) {
        setSelectedReq(res.data[0]);
        setNotes(res.data[0].mentor_notes || '');
        setStatus(res.data[0].status || 'pending');
      }
    } catch (err) {
      console.error('Failed to fetch mentor requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReq = (req) => {
    setSelectedReq(req);
    setNotes(req.mentor_notes || '');
    setStatus(req.status || 'pending');
  };

  const handleSaveNotes = async () => {
    if (!selectedReq) return;
    setSaving(true);
    try {
      const res = await api.patch(`/mentor/request/${selectedReq.id}/`, {
        mentor_notes: notes,
        status: status,
      });
      setRequests(requests.map((r) => (r.id === res.data.id ? res.data : r)));
      setSelectedReq(res.data);
      alert('Mentor review saved successfully!');
    } catch (err) {
      console.error('Failed to save mentor notes:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading Mentor Requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mentor Referral Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Review student struggle histories and provide 1-on-1 guidance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requests List */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white mb-2">Student Referral Requests</h3>
            {requests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-sm">
                No mentor requests currently open.
              </div>
            ) : (
              requests.map((req) => {
                const isSelected = selectedReq?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectReq(req)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-amber-600/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{req.student_name || req.student_username}</span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${
                          req.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : req.status === 'in_review'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Topic: <strong className="text-slate-200">{req.topic_name}</strong> ({req.subject_name})
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Request Detail & Intervention Notes */}
          <div className="lg:col-span-2 space-y-6">
            {selectedReq ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Student: {selectedReq.student_name || selectedReq.student_username}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Subject: {selectedReq.subject_name} • Topic: <strong>{selectedReq.topic_name}</strong>
                    </p>
                  </div>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Referral Details */}
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Reason for Referral
                    </span>
                    <p className="text-slate-200 text-sm leading-relaxed">{selectedReq.reason}</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                      Attempt & Struggle History
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedReq.attempts_summary}</p>
                  </div>
                </div>

                {/* Mentor Response / Intervention Notes */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Mentor Feedback & Study Plan Notes:
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter personalized feedback, key concepts for the student to review, or scheduled meeting details..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={saving}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving Feedback...' : 'Save Feedback'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                Select a referral request to view details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
