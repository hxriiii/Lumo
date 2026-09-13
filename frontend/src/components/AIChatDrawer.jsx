import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Sparkles, HelpCircle, Lightbulb, RefreshCw } from 'lucide-react';
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
          text: 'Sorry, I encountered an issue connecting to the AI Coach service. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "Explain this topic simply",
    "Why did I miss a question in my test?",
    "Give me a quick practice hint",
    "What should I focus on to advance?",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Grok AI Tutor</h3>
                <p className="text-xs text-slate-400">
                  {topicName ? `Context: ${topicName}` : 'Personalized Learning Coach'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto flex gap-2 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap text-xs bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 text-slate-300 hover:text-blue-300 border border-slate-700/60 px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center py-12 px-4 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-500/20">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h4 className="text-white font-medium text-sm mb-1">How can I help you today?</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Ask me questions about concepts, explanations for wrong answers, or practice hints for {topicName || 'your subjects'}.
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === 'student';
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-800 border border-slate-700/60 rounded-2xl px-4 py-2 text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  Grok AI is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
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
                placeholder={topicName ? `Ask about ${topicName}...` : 'Type your question...'}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
