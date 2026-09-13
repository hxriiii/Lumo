import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { 
  FileText, 
  UploadCloud, 
  Trash2, 
  Sparkles, 
  BrainCircuit, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Plus,
  HelpCircle,
  Zap,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { 
  getSubjects, 
  getTopics, 
  getDocuments, 
  uploadDocument, 
  deleteDocument, 
  generateQuestionsFromRAG 
} from '../api/rag';

export const AdminRAG = () => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  // Upload form state
  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'text'

  // Question generation state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [count, setCount] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);


  // Modal inspection state
  const [inspectDoc, setInspectDoc] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject);
    } else {
      setTopics([]);
      setSelectedTopic('');
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchDocs();
  }, [selectedSubject, selectedTopic]);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].id);
      }
    } catch (err) {
      showToast('Failed to load subjects', 'error');
    }
  };

  const fetchTopics = async (subjectId) => {
    try {
      const data = await getTopics(subjectId);
      setTopics(data);
      if (data.length > 0) {
        setSelectedTopic(data[0].id);
      } else {
        setSelectedTopic('');
      }
    } catch (err) {
      showToast('Failed to load topics', 'error');
    }
  };

  const fetchDocs = async () => {
    setLoadingDocs(true);
    try {
      const params = {};
      if (selectedTopic) params.topic_id = selectedTopic;
      else if (selectedSubject) params.subject_id = selectedSubject;

      const data = await getDocuments(params);
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedTopic) {
      showToast('Please select a Topic first!', 'error');
      return;
    }

    if (activeTab === 'file' && !selectedFile) {
      showToast('Please select a PDF or TXT file to upload', 'error');
      return;
    }

    if (activeTab === 'text' && !rawText.trim()) {
      showToast('Please enter note text to ingest', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('topic_id', selectedTopic);
      if (docTitle) formData.append('title', docTitle);
      
      if (activeTab === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('raw_text', rawText);
      }

      const res = await uploadDocument(formData);
      showToast(`Successfully ingested "${res.title}" into ${res.chunk_count} RAG chunks!`);
      
      // Reset form
      setDocTitle('');
      setSelectedFile(null);
      setRawText('');
      fetchDocs();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to ingest document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" and its RAG chunks?`)) return;

    try {
      await deleteDocument(id);
      showToast(`Deleted "${title}" successfully`);
      fetchDocs();
    } catch (err) {
      showToast('Failed to delete document', 'error');
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedTopic) {
      showToast('Please select a topic to generate questions for', 'error');
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      const res = await generateQuestionsFromRAG(selectedTopic, difficulty, count, searchQuery);
      setGeneratedQuestions(res.questions || []);
      showToast(res.message || 'Generated questions successfully!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Question generation failed', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <Navbar />

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-24 right-6 z-50 px-5 py-3 rounded-2xl border-2 font-bold text-sm shadow-[4px_4px_0px_0px_#000] flex items-center gap-3 transition-all animate-bounce ${
          toastMessage.type === 'error'
            ? 'bg-rose-500 text-white border-slate-900'
            : 'bg-[#34D399] text-slate-900 border-slate-900'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Hero Section */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-[6px_6px_0px_0px_#0F172A]">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BrainCircuit className="w-64 h-64 text-indigo-400" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" /> RAG Knowledge Base & Assessment Engine
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-2">
              Document Note Ingestion & Admin Portal
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base">
              Upload PDF study guides, lecture notes, or textbooks. The RAG engine chunks and indexes your documents, empowering AI-driven generation of <strong className="text-amber-300">Easy</strong>, <strong className="text-sky-300">Medium</strong>, and <strong className="text-rose-400">Hard</strong> assessment questions.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{documents.length}</div>
                  <div className="text-xs text-slate-400 font-semibold">Uploaded Notes</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-400/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{totalChunks}</div>
                  <div className="text-xs text-slate-400 font-semibold">Ingested Chunks</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{subjects.length}</div>
                  <div className="text-xs text-slate-400 font-semibold">Active Subjects</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-400/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{topics.length}</div>
                  <div className="text-xs text-slate-400 font-semibold">Topics Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Filter Bar: Subject & Topic Selection */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-64">
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none transition-colors"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-64">
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Select Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={topics.length === 0}
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm font-bold text-white outline-none disabled:opacity-50 transition-colors"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchDocs}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors self-end"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDocs ? 'animate-spin' : ''}`} />
            <span>Refresh Docs</span>
          </button>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Upload / Ingest Document (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-[4px_4px_0px_0px_#0F172A]">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 font-bold">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Ingest Study Notes</h2>
                  <p className="text-xs text-slate-400">PDF or Text format note chunker</p>
                </div>
              </div>

              {/* Tab Selector: Upload File vs Raw Text */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'file' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Upload PDF / TXT
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === 'text' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Paste Raw Text Notes
                </button>
              </div>

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Chapter 4 - Faraday's Law Summary"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none"
                  />
                </div>

                {activeTab === 'file' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Select Document File (.pdf, .txt)
                    </label>
                    <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <FileText className="w-8 h-8 text-indigo-400 mx-auto mb-2 opacity-80" />
                      {selectedFile ? (
                        <div className="text-sm font-bold text-amber-300 flex items-center justify-center gap-1.5">
                          <FileCheck className="w-4 h-4 text-emerald-400" />
                          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-slate-300">Click or drag PDF / TXT file here</p>
                          <p className="text-[11px] text-slate-500 mt-1">Supports full text chunking</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Paste Study Notes Content
                    </label>
                    <textarea
                      rows={6}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="Paste textbook excerpts, definitions, formulas, or lecture notes here..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-sm text-white placeholder-slate-600 outline-none resize-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || !selectedTopic}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Extracting & Chunking...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Ingest into RAG Knowledge Base</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Ingested Documents List & MCQ Generation (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Document Library Listing */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-[4px_4px_0px_0px_#0F172A]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Ingested Document Library</h2>
                    <p className="text-xs text-slate-400">Available context chunks for assessment generation</p>
                  </div>
                </div>
                <span className="bg-slate-800 text-slate-300 text-xs font-extrabold px-3 py-1 rounded-full border border-slate-700">
                  {documents.length} Docs
                </span>
              </div>

              {loadingDocs ? (
                <div className="py-8 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading document notes...
                </div>
              ) : documents.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-slate-400">No notes ingested for this topic yet</p>
                  <p className="text-xs text-slate-500 mt-1">Upload a PDF or paste notes on the left to get started!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black uppercase shrink-0 ${
                          doc.file_type === 'pdf' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {doc.file_type || 'txt'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white truncate">{doc.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span className="font-semibold text-indigo-400">{doc.topic_name}</span>
                            <span>•</span>
                            <span className="text-amber-300 font-bold">{doc.chunk_count} RAG chunks</span>
                            <span>•</span>
                            <span className="text-slate-500">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setInspectDoc(doc)}
                          title="View parsed RAG chunks"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id, doc.title)}
                          title="Delete document"
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MCQ Generation Control Panel */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border-2 border-indigo-900/60 rounded-3xl p-6 shadow-[4px_4px_0px_0px_#0F172A]">
              <div className="flex items-center gap-3 mb-5 border-b border-indigo-900/50 pb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-400 border border-slate-900 flex items-center justify-center text-slate-900 font-bold shadow-[2px_2px_0px_0px_#000]">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">RAG MCQ Question Generator</h2>
                  <p className="text-xs text-indigo-300">Generate Easy, Medium, Hard MCQs grounded in document notes</p>
                </div>
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    RAG Search Query / Focus Concept (Optional)
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Faraday induction rate, Ohm's law, Binary Tree depth..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-bold text-white placeholder-slate-600 outline-none"
                  />
                  <p className="text-[11px] text-indigo-300/80 mt-1">
                    Queries vector/text RAG chunks first, then passes matching context to LLM for target questions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Target Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none"
                    >
                      <option value="all">All Difficulties (Easy, Medium, Hard)</option>
                      <option value="easy">Easy Only</option>
                      <option value="medium">Medium Only</option>
                      <option value="hard">Hard Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Question Count per Difficulty
                    </label>
                    <select
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none"
                    >
                      <option value={1}>1 Question</option>
                      <option value={3}>3 Questions</option>
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                    </select>
                  </div>
                </div>
              </div>


              <button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !selectedTopic}
                className="w-full py-3.5 px-4 bg-[#FFD12E] hover:bg-[#F0C21A] text-slate-900 font-black rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-900" />
                    <span>Synthesizing MCQs from RAG Context...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-slate-900" />
                    <span>Generate MCQs from Document Notes</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Generated Questions Live Preview Section */}
        {generatedQuestions.length > 0 && (
          <div className="mt-10 bg-slate-900 border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Generated Assessment Questions ({generatedQuestions.length})</h3>
                  <p className="text-xs text-slate-400">Added to database & available for learner tests</p>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase px-3 py-1 rounded-full border border-emerald-500/30">
                Ready in Exam Pool
              </span>
            </div>

            <div className="space-y-6">
              {generatedQuestions.map((q, idx) => (
                <div key={q.id || idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Question #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        q.difficulty === 'easy'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : q.difficulty === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {q.difficulty}
                      </span>
                      {q.concept_tag && (
                        <span className="bg-indigo-500/20 text-indigo-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                          {q.concept_tag}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-base font-bold text-white leading-relaxed">{q.text}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options?.map((opt, oIdx) => {
                      const isCorrect = opt === q.correct_answer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300">
                    <strong className="text-amber-300 font-extrabold">RAG Explanation: </strong>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chunk Inspection Modal */}
        {inspectDoc && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{inspectDoc.title}</h3>
                  <p className="text-xs text-slate-400">RAG Chunk Inspection ({inspectDoc.chunk_count} chunks)</p>
                </div>
                <button
                  onClick={() => setInspectDoc(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                {inspectDoc.chunks?.map((c, i) => (
                  <div key={c.id || i} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-indigo-400 font-extrabold">
                      <span>Chunk #{c.chunk_index + 1}</span>
                      <span className="text-slate-500 font-semibold">{c.word_count} words</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminRAG;
