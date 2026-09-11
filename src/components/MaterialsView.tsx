import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Search, 
  Tag, 
  Layers, 
  CheckCircle,
  Sparkles,
  BookOpen,
  Download
} from 'lucide-react';
import { CourseDocument, DocumentChunk } from '../types';
import { chunkText, DEFAULT_MATERIALS } from '../data/defaultMaterials';

interface MaterialsViewProps {
  materials: CourseDocument[];
  onAddMaterial: (doc: CourseDocument) => void;
  onDeleteMaterial: (id: string) => void;
  onResetDefaults: () => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  onAddMaterial,
  onDeleteMaterial,
  onResetDefaults
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'upload' | 'manual'>('list');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDoc, setViewingDoc] = useState<CourseDocument | null>(null);
  const [viewingChunks, setViewingChunks] = useState<DocumentChunk[] | null>(null);

  // Manual Form State
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState('Operating Systems');
  const [manualTags, setManualTags] = useState('Lecture Notes, Exam Review');
  const [manualContent, setManualContent] = useState('');

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = ['All', ...Array.from(new Set(materials.map(m => m.subject)))];

  const filteredMaterials = materials.filter(m => {
    const matchesSub = selectedSubject === 'All' || m.subject === selectedSubject;
    const matchesSearch = !searchQuery || 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSub && matchesSearch;
  });

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const docId = `doc_${Date.now()}`;
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      // Detect subject or default
      const detectedSubject = title.toLowerCase().includes('learn') || title.toLowerCase().includes('ml') 
        ? 'Machine Learning' 
        : title.toLowerCase().includes('data') || title.toLowerCase().includes('tree') || title.toLowerCase().includes('graph')
        ? 'Data Structures & Algorithms'
        : 'Operating Systems';

      const chunks = chunkText(text, docId, title, detectedSubject);

      const newDoc: CourseDocument = {
        id: docId,
        title,
        subject: detectedSubject,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        rawText: text,
        chunks,
        tags: ['Student Upload', detectedSubject, 'Exam Material'],
        isDefault: false
      };

      onAddMaterial(newDoc);
      setActiveSubTab('list');
      setViewingDoc(newDoc);
    };

    reader.readAsText(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualContent.trim()) return;

    const docId = `doc_${Date.now()}`;
    const tagsArray = manualTags.split(',').map(t => t.trim()).filter(Boolean);
    const chunks = chunkText(manualContent, docId, manualTitle, manualSubject);

    const newDoc: CourseDocument = {
      id: docId,
      title: manualTitle,
      subject: manualSubject,
      fileName: `${manualTitle.toLowerCase().replace(/\s+/g, '_')}.txt`,
      fileSize: new Blob([manualContent]).size,
      uploadedAt: new Date().toISOString(),
      rawText: manualContent,
      chunks,
      tags: tagsArray.length ? tagsArray : [manualSubject],
      isDefault: false
    };

    onAddMaterial(newDoc);
    setManualTitle('');
    setManualContent('');
    setActiveSubTab('list');
    setViewingDoc(newDoc);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Course Materials & RAG Knowledge Base
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload syllabi, lecture notes, or textbooks. StudyMate AI extracts text and breaks it into semantic chunks for grounded Q&A and quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab(activeSubTab === 'upload' ? 'list' : 'upload')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-md shadow-indigo-600/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <button
            onClick={() => setActiveSubTab(activeSubTab === 'manual' ? 'list' : 'manual')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Paste Notes</span>
          </button>
        </div>
      </div>

      {/* Upload Box Modal/Section */}
      {activeSubTab === 'upload' && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              Upload Course Material File
            </h2>
            <button
              onClick={() => setActiveSubTab('list')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept=".txt,.md,.pdf,.doc,.json"
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white mb-1">
              Drag & drop notes file here, or browse
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Supports .txt, .md, and lecture notes. Automatically splits into paragraphs and generates semantic search chunks.
            </p>
          </div>
        </div>
      )}

      {/* Manual Paste Section */}
      {activeSubTab === 'manual' && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Paste Course Notes or Syllabus Content
            </h2>
            <button
              onClick={() => setActiveSubTab('list')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Consensus Notes"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  placeholder="e.g. Operating Systems, ML, DSA"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={manualTags}
                onChange={(e) => setManualTags(e.target.value)}
                placeholder="Unit 1, Exam, High Priority"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Raw Content / Notes Text</label>
              <textarea
                rows={7}
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                placeholder="Paste the chapter text, key definitions, formulas, or syllabus breakdown..."
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('list')}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                Index & Save Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {doc.subject}
                </span>
                <span className="text-[11px] text-slate-400">
                  {(doc.fileSize / 1024).toFixed(1)} KB
                </span>
              </div>

              <h3 className="font-bold text-sm text-white mb-1.5 group-hover:text-indigo-300 transition-colors">
                {doc.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  {doc.chunks.length} RAG Chunks
                </span>
                <span>•</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {doc.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewingDoc(doc)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                  title="Read raw document"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read</span>
                </button>
                <button
                  onClick={() => setViewingChunks(doc.chunks)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 text-xs font-medium transition-colors flex items-center gap-1"
                  title="View chunk breakdown"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Chunks</span>
                </button>
              </div>

              {!doc.isDefault && (
                <button
                  onClick={() => onDeleteMaterial(doc.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col text-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <h3 className="text-base font-bold text-white">{viewingDoc.title}</h3>
                <p className="text-xs text-slate-400">{viewingDoc.subject} • {viewingDoc.chunks.length} chunks</p>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-slate-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs leading-relaxed whitespace-pre-wrap bg-slate-950/40 text-slate-300">
              {viewingDoc.rawText}
            </div>
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <span className="text-xs text-slate-400">Indexed for Retrieval-Augmented Generation</span>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chunks Inspector Modal */}
      {viewingChunks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl flex flex-col text-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">RAG Chunks Inspector ({viewingChunks.length})</h3>
              </div>
              <button
                onClick={() => setViewingChunks(null)}
                className="text-slate-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {viewingChunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-300">Chunk #{chunk.chunkIndex}</span>
                    <div className="flex items-center gap-1">
                      {chunk.keywords.map((kw, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setViewingChunks(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
