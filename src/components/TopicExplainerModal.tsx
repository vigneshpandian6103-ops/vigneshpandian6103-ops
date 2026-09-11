import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lightbulb, AlertTriangle, Bookmark, BookOpen, Loader2 } from 'lucide-react';
import { LearningMemory } from '../types';

interface TopicExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  topic: string;
  documentsContext: string;
  memory: LearningMemory;
}

interface ExplainerData {
  title: string;
  summary: string;
  analogy: string;
  breakdown: { heading: string; text: string }[];
  quickCard: {
    definition: string;
    formulaOrLaw: string;
    keyTakeaway: string;
  };
}

export const TopicExplainerModal: React.FC<TopicExplainerModalProps> = ({
  isOpen,
  onClose,
  subject,
  topic,
  documentsContext,
  memory
}) => {
  const [data, setData] = useState<ExplainerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !topic) return;

    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/explain-topic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject,
            topic,
            documentsContext: documentsContext.slice(0, 3000),
            memoryContext: memory
          })
        });
        if (!res.ok) throw new Error('Could not generate topic explanation');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error('Explainer error:', err);
        setError(err.message || 'Failed to explain topic');
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [isOpen, topic, subject, documentsContext, memory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[88vh] shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">StudyMate Deep Explainer</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {subject}
                </span>
              </div>
              <p className="text-xs text-slate-400">{topic}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
              <p className="text-sm font-medium">Synthesizing intuitive explanation & analogies...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {data && !loading && (
            <>
              {/* Analogy Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                    The Intuitive Analogy
                  </h4>
                  <p className="text-xs text-amber-100/90 leading-relaxed italic">
                    "{data.analogy}"
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Conceptual Overview
                </h4>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Detailed Breakdown
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {data.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                    >
                      <span className="font-semibold text-sky-300 block mb-1 text-sm">
                        {item.heading}
                      </span>
                      <p className="text-slate-300 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Card Flashcard */}
              <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    Quick Exam Revision Card
                  </span>
                  <span className="text-[10px] text-indigo-400">High Yield</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Formula / Core Invariant</span>
                    <span className="font-mono text-emerald-300 text-[11px]">{data.quickCard.formulaOrLaw}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Golden Rule</span>
                    <span className="text-slate-200 text-[11px]">{data.quickCard.keyTakeaway}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
