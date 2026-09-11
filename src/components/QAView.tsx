import React, { useState, useRef, useEffect } from 'react';
import { 
  HelpCircle, 
  Send, 
  Sparkles, 
  BookOpen, 
  Bookmark, 
  Layers, 
  CornerDownRight, 
  Loader2, 
  RotateCcw,
  CheckCircle,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, CourseDocument, LearningMemory, ActiveTab } from '../types';
import { retrieveRelevantChunks, buildCitations } from '../utils/ragEngine';

interface QAViewProps {
  materials: CourseDocument[];
  memory: LearningMemory;
  messages: ChatMessage[];
  onSendMessage: (userText: string, subject: string) => Promise<void>;
  onClearChat: () => void;
  onOpenExplainer: (subject: string, topic: string) => void;
  onLaunchQuizForTopic: (subject: string, topic: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

const SAMPLE_QUESTIONS: { subject: string; q: string }[] = [
  { subject: 'Operating Systems', q: "What are Coffman's four conditions for deadlock and how can they be prevented?" },
  { subject: 'Operating Systems', q: "Why does FIFO page replacement suffer from Belady's Anomaly while LRU does not?" },
  { subject: 'Machine Learning', q: "Explain the Bias-Variance tradeoff and how L1/L2 regularization addresses overfitting." },
  { subject: 'Machine Learning', q: "When should we prefer Recall over Precision in medical or spam diagnostics?" },
  { subject: 'Data Structures & Algorithms', q: "How do AVL tree rotations restore balance in the Left-Right (LR) case?" },
  { subject: 'Data Structures & Algorithms', q: "Explain Dijkstra's shortest path algorithm relaxation step and why it fails with negative weights." }
];

export const QAView: React.FC<QAViewProps> = ({
  materials,
  memory,
  messages,
  onSendMessage,
  onClearChat,
  onOpenExplainer,
  onLaunchQuizForTopic,
  setActiveTab
}) => {
  const subjects = ['All', ...Array.from(new Set(materials.map(m => m.subject)))];
  const [selectedSubject, setSelectedSubject] = useState<string>('Operating Systems');
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const text = inputText;
    setInputText('');
    setIsSubmitting(true);
    try {
      await onSendMessage(text, selectedSubject === 'All' ? 'Operating Systems' : selectedSubject);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSampleClick = (q: string, sub: string) => {
    setSelectedSubject(sub);
    setInputText(q);
  };

  return (
    <div className="space-y-4 pb-8 flex flex-col h-[calc(100vh-140px)] min-h-[580px]">
      {/* Top bar controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Ask a Question</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                RAG Grounded
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Answers are strictly grounded in your course materials with cited source excerpts</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={onClearChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset Chat History"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat messages feed */}
      <div className="flex-1 overflow-y-auto bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ask Anything from Your Course Material</h2>
              <p className="text-xs text-slate-400 mt-1">
                StudyMate AI inspects your notes, retrieves the most relevant knowledge chunks, and cites verified excerpts in its explanation.
              </p>
            </div>

            {/* Quick suggested questions */}
            <div className="w-full space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                Suggested Exam Questions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {SAMPLE_QUESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleClick(item.q, item.subject)}
                    className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all text-left flex flex-col justify-between"
                  >
                    <span className="line-clamp-2">{item.q}</span>
                    <span className="text-[10px] text-sky-400 mt-2 font-medium">{item.subject}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {/* Agent Reasoning Steps Badge */}
                {msg.role === 'assistant' && msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>Agentic Reasoning Flow:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-400">
                      {msg.reasoningSteps.map((step, idx) => (
                        <span key={idx} className="flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{step}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <div className="prose prose-invert prose-xs max-w-none space-y-2">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* Citations Box */}
                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Course Material Citations ({msg.citations.length})
                    </span>
                    <div className="space-y-1.5">
                      {msg.citations.map((cite, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/90 text-[11px] text-slate-300"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-200 text-[10px] mb-0.5">
                            <span className="text-sky-300">{cite.documentTitle} (Chunk #{cite.chunkIndex})</span>
                            <span className="text-emerald-400">{cite.relevanceScore}% Match</span>
                          </div>
                          <p className="italic text-slate-400 text-[10px]">"{cite.excerpt}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested follow-up pills */}
                {msg.role === 'assistant' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Follow-up Questions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((sq, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInputText(sq);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                        >
                          <CornerDownRight className="w-2.5 h-2.5 text-indigo-400" />
                          <span>{sq}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons on assistant answers */}
                {msg.role === 'assistant' && (
                  <div className="pt-2 border-t border-slate-800/60 flex items-center gap-2">
                    <button
                      onClick={() => onOpenExplainer(selectedSubject === 'All' ? 'Operating Systems' : selectedSubject, msg.content.slice(0, 40))}
                      className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <Lightbulb className="w-3 h-3" />
                      <span>Deep Explainer & Analogy</span>
                    </button>
                    <button
                      onClick={() => {
                        onLaunchQuizForTopic(selectedSubject === 'All' ? 'Operating Systems' : selectedSubject, 'Course Notes Review');
                        setActiveTab('quiz');
                      }}
                      className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold transition-colors flex items-center gap-1"
                    >
                      <Bookmark className="w-3 h-3" />
                      <span>Generate Quiz on this</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isSubmitting && (
          <div className="flex items-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2 max-w-md animate-pulse">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Agentic Reasoning in Progress...</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Retrieving chunks from {selectedSubject} materials and synthesizing contextual explanation...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="relative shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask about ${selectedSubject === 'All' ? 'your course notes' : selectedSubject} (e.g. "Explain Coffman conditions...")`}
          disabled={isSubmitting}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-4 pr-12 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-lg disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className="absolute right-2 top-2 bottom-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};
