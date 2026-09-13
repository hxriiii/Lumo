import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Lightbulb, RefreshCw, Smile, Zap, HelpCircle } from 'lucide-react';
import api from '../api/axios';

export const AIChatDrawer = ({ isOpen, onClose, topicId, topicName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen, topicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchChatHistory = async () => {
    try {
      const url = topicId ? `/chat/?topic_id=${topicId}` : '/chat/';
      const res = await api.get(url);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch chat history', err);
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setInput('');
    const tempUserMsg = { id: Date.now(), sender: 'student', text: query, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chat/', {
        message: query,
        topic_id: topicId || null,
      });

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.data.student_message,
        res.data.assistant_message,
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: 'Oops! I had a tiny glitch connecting to my study brain. Please ask again in a moment! ⚡',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "Explain this topic simply ✨",
    "Why did I miss a question? 🧐",
    "Give me a study tip 💡",
    "How can I advance to Hard? 🚀",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l-4 border-slate-900 flex flex-col shadow-2xl">
          {/* Lumo Companion Header */}
          <div className="p-4 bg-[#FFD12E] border-b-2 border-slate-900 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-900 flex items-center justify-center shadow-[2.5px_2.5px_0px_0px_#1E293B] relative">
                <Sparkles className="w-7 h-7 text-amber-500 fill-amber-400 animate-pulse" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-slate-900 text-lg">Lumo Gemini AI Companion</h3>
                  <span className="bg-[#A78BFA] text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-900 shadow-[1px_1px_0px_0px_#1E293B]">
                    GEMINI 2.5 FLASH
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-semibold">
                  {topicName ? `Topic: ${topicName}` : 'Your AI Study Tutor!'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center hover:bg-slate-100 shadow-[2px_2px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Pills */}
          <div className="p-3 bg-white border-b-2 border-slate-900 overflow-x-auto flex gap-2 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap text-xs font-bold bg-[#FAF8F5] hover:bg-[#FFD12E] text-slate-800 border-2 border-slate-900 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 shrink-0 shadow-[1.5px_1.5px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-400" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center py-10 px-4 bg-white border-2 border-slate-900 rounded-3xl shadow-[4px_4px_0px_0px_#1E293B]">
                <div className="w-16 h-16 rounded-2xl bg-[#38BDF8] border-2 border-slate-900 flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_0px_#1E293B]">
                  <Smile className="w-9 h-9 text-slate-900 fill-yellow-300" />
                </div>
                <h4 className="font-display font-bold text-slate-900 text-base mb-1">Hi there! I'm Lumo 👋</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Ask me anything about {topicName || 'your subjects'}! I can break down tricky concepts, share practice hints, or explain test answers!
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === 'student';
              return (
                <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-[#FFD12E] border-2 border-slate-900 text-slate-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1E293B] mt-0.5">
                      <Sparkles className="w-5 h-5 fill-slate-900" />
                    </div>
                  )}

                  <div
                    className={`max-w-[84%] rounded-2xl p-3.5 text-xs sm:text-sm font-medium leading-relaxed border-2 ${
                      isUser
                        ? 'bg-[#38BDF8] text-slate-900 border-slate-900 rounded-br-none shadow-[3px_3px_0px_0px_#1E293B]'
                        : 'bg-white text-slate-900 border-slate-900 rounded-bl-none shadow-[3px_3px_0px_0px_#1E293B]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-[#34D399] border-2 border-slate-900 text-slate-900 font-extrabold flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1E293B] mt-0.5 text-xs">
                      ME
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-9 h-9 rounded-2xl bg-[#FFD12E] border-2 border-slate-900 text-slate-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#1E293B]">
                  <Sparkles className="w-5 h-5 fill-slate-900 animate-spin" />
                </div>
                <div className="bg-white border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-700 shadow-[2px_2px_0px_0px_#1E293B] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  Lumo is gathering learning wisdom...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-white border-t-2 border-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={topicName ? `Ask Lumo about ${topicName}...` : 'Ask Lumo a question...'}
                className="flex-1 bg-[#FAF8F5] border-2 border-slate-900 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_#1E293B]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-[#FFD12E] hover:bg-[#F0C21A] disabled:opacity-50 text-slate-900 border-2 border-slate-900 px-4 py-2.5 rounded-2xl font-bold transition-all shadow-[3px_3px_0px_0px_#1E293B] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-slate-900" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

