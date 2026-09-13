import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Shield, CheckCircle2, Clock, MessageSquare, AlertTriangle, Save, User } from 'lucide-react';
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
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-slate-800 font-bold">
        <div className="flex items-center gap-3 bg-white border-2 border-slate-900 px-6 py-4 rounded-2xl shadow-[4px_4px_0px_0px_#1E293B]">
          <div className="w-6 h-6 border-4 border-[#FF6B6B] border-t-slate-900 rounded-full animate-spin"></div>
          Loading Mentor Referral Portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-8">
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-[6px_6px_0px_0px_#1E293B]">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#FF6B6B] border-2 border-slate-900 text-white shadow-[3px_3px_0px_0px_#1E293B]">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Mentor Referral Portal 🎓</h1>
              <p className="text-slate-600 text-xs sm:text-sm font-semibold mt-1">Review student learning struggles and guide them with personalized support plans</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Requests List */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Referral Requests</h3>
            {requests.length === 0 ? (
              <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 text-center text-slate-500 text-xs sm:text-sm font-bold shadow-[4px_4px_0px_0px_#1E293B]">
                No student referral requests open at present.
              </div>
            ) : (
              requests.map((req) => {
                const isSelected = selectedReq?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectReq(req)}
                    className={`cursor-pointer p-4 rounded-3xl border-2 transition-all shadow-[3px_3px_0px_0px_#1E293B] ${
                      isSelected
                        ? 'bg-[#FFD12E] border-slate-900 text-slate-900'
                        : 'bg-white border-slate-900 text-slate-800 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">{req.student_name || req.student_username}</span>
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border border-slate-900 ${
                          req.status === 'resolved'
                            ? 'bg-emerald-200 text-emerald-900'
                            : req.status === 'in_review'
                            ? 'bg-[#38BDF8] text-slate-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-semibold">
                      Topic: <strong className="text-slate-900">{req.topic_name}</strong> ({req.subject_name})
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Request Detail & Intervention Notes */}
          <div className="lg:col-span-2 space-y-6">
            {selectedReq ? (
              <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#1E293B] space-y-6">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      Student: {selectedReq.student_name || selectedReq.student_username}
                    </h2>
                    <p className="text-slate-600 text-xs sm:text-sm font-semibold">
                      Subject: {selectedReq.subject_name} • Topic: <strong>{selectedReq.topic_name}</strong>
                    </p>
                  </div>

                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-[#FAF8F5] border-2 border-slate-900 text-slate-900 font-extrabold rounded-2xl px-3 py-2 text-xs sm:text-sm focus:outline-none shadow-[2px_2px_0px_0px_#1E293B]"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Referral Details */}
                <div className="space-y-4">
                  <div className="bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl p-4 shadow-[2px_2px_0px_0px_#1E293B]">
                    <span className="text-xs font-extrabold text-rose-600 uppercase tracking-wider block mb-1">
                      Reason for Referral
                    </span>
                    <p className="text-slate-900 text-xs sm:text-sm font-semibold leading-relaxed">{selectedReq.reason}</p>
                  </div>

                  <div className="bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl p-4 shadow-[2px_2px_0px_0px_#1E293B]">
                    <span className="text-xs font-extrabold text-sky-600 uppercase tracking-wider block mb-1">
                      Attempt & Performance History
                    </span>
                    <p className="text-slate-900 text-xs sm:text-sm font-semibold leading-relaxed">{selectedReq.attempts_summary}</p>
                  </div>
                </div>

                {/* Mentor Response / Intervention Notes */}
                <div className="pt-4 border-t-2 border-slate-200 space-y-3">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Mentor Feedback & Action Plan Notes:
                  </label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter personalized guidance, key concepts to review, or scheduled study session info..."
                    className="w-full bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl p-4 text-slate-900 font-semibold text-xs sm:text-sm focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B]"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveNotes}
                      disabled={saving}
                      className="px-6 py-3 bg-[#FF6B6B] hover:bg-rose-500 text-white font-extrabold rounded-2xl border-2 border-slate-900 text-xs sm:text-sm shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 flex items-center gap-2 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving Feedback...' : 'Save Mentor Feedback'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-slate-900 rounded-3xl p-12 text-center text-slate-500 font-bold shadow-[4px_4px_0px_0px_#1E293B]">
                Select a referral request to view details.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

