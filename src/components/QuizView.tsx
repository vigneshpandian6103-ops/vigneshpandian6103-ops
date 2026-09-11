import React, { useState } from 'react';
import { 
  CheckSquare, 
  Sparkles, 
  HelpCircle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  BookOpen, 
  Loader2,
  ChevronRight,
  ChevronLeft,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizSession, QuizQuestion, CourseDocument, ActiveTab } from '../types';

interface QuizViewProps {
  materials: CourseDocument[];
  activeQuiz: QuizSession | null;
  onSetQuiz: (quiz: QuizSession | null) => void;
  onCompleteQuiz: (quiz: QuizSession) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExplainer: (subject: string, topic: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  materials,
  activeQuiz,
  onSetQuiz,
  onCompleteQuiz,
  setActiveTab,
  onOpenExplainer
}) => {
  const subjects = Array.from(new Set(materials.map(m => m.subject)));

  // Form State
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || 'Operating Systems');
  const [topic, setTopic] = useState('Process Deadlocks & Coffman Conditions');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [numQuestions, setNumQuestions] = useState(4);
  const [generating, setGenerating] = useState(false);

  // Active Quiz taking state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const docContext = materials
        .filter(m => m.subject === selectedSubject)
        .map(m => m.rawText.slice(0, 2000))
        .join('\n\n');

      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedSubject,
          topic,
          difficulty,
          numQuestions,
          documentsContext: docContext
        })
      });

      if (!res.ok) throw new Error('Failed to generate quiz');
      const data = await res.json();
      if (data.quiz) {
        onSetQuiz({
          ...data.quiz,
          status: 'in_progress'
        });
        setCurrentIdx(0);
        setShowHint(false);
        setShowExplanation(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!activeQuiz || activeQuiz.status === 'completed') return;

    const updatedQuestions = [...activeQuiz.questions];
    updatedQuestions[currentIdx] = {
      ...updatedQuestions[currentIdx],
      userSelectedIndex: optionIndex
    };

    onSetQuiz({
      ...activeQuiz,
      questions: updatedQuestions
    });
    setShowExplanation(true);
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;
    const correctCount = activeQuiz.questions.filter(q => q.userSelectedIndex === q.correctIndex).length;
    const scorePct = Math.round((correctCount / activeQuiz.questions.length) * 100);

    const completed: QuizSession = {
      ...activeQuiz,
      status: 'completed',
      score: scorePct,
      completedAt: new Date().toISOString()
    };

    onSetQuiz(completed);
    onCompleteQuiz(completed);

    if (scorePct >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const currentQ = activeQuiz?.questions[currentIdx];
  const isLastQuestion = activeQuiz && currentIdx === activeQuiz.questions.length - 1;
  const answeredCount = activeQuiz?.questions.filter(q => q.userSelectedIndex !== undefined).length || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            Automatic Quiz & Practice Question Generator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test your knowledge with curriculum-aligned questions generated from your course notes with instant rationale and source quotes.
          </p>
        </div>

        {activeQuiz && (
          <button
            onClick={() => onSetQuiz(null)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Quiz Config</span>
          </button>
        )}
      </div>

      {/* Quiz Configurator Form (when no active quiz) */}
      {!activeQuiz && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Configure Practice Quiz</h2>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    if (e.target.value.includes('Machine')) {
                      setTopic('Bias-Variance Tradeoff & Regularization');
                    } else if (e.target.value.includes('Data')) {
                      setTopic('AVL Tree Rotations & Dijkstra Algorithm');
                    } else {
                      setTopic('Process Deadlocks & Coffman Conditions');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="beginner">Beginner (Foundations & Definitions)</option>
                  <option value="intermediate">Intermediate (Problem Solving & Rules)</option>
                  <option value="advanced">Advanced (Edge Cases & Complex Scenarios)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Focus Topic or Unit</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Page Replacement Algorithms, Coffman Conditions, L1/L2 Norms"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-300">Question Count</label>
                <span className="text-xs font-bold text-emerald-400">{numQuestions} Questions</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={generating}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Agent Crafting Grounded Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Start Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Quiz Taking Runner */}
      {activeQuiz && activeQuiz.status !== 'completed' && currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
          {/* Quiz Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {activeQuiz.subject}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
                  {activeQuiz.difficulty}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white">{activeQuiz.title}</h2>
            </div>

            <div className="text-xs font-semibold text-slate-400">
              Question <span className="text-white font-bold">{currentIdx + 1}</span> of {activeQuiz.questions.length}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Hint Button */}
            {currentQ.hint && (
              <div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>
                {showHint && (
                  <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg mt-1.5 italic">
                    {currentQ.hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = currentQ.userSelectedIndex === optIdx;
              const isAnswered = currentQ.userSelectedIndex !== undefined;
              const isCorrect = currentQ.correctIndex === optIdx;

              let optionStyle = 'bg-slate-950/70 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900';

              if (isAnswered) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-semibold shadow-sm';
                } else if (isSelected) {
                  optionStyle = 'bg-rose-500/15 border-rose-500 text-rose-200';
                } else {
                  optionStyle = 'bg-slate-950/40 border-slate-850 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswered && (
                    <div className="shrink-0">
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Immediate Rationale & Citation */}
          {(showExplanation || currentQ.userSelectedIndex !== undefined) && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Answer Explanation
                </span>
                <span className="text-[10px] text-slate-400">Course Grounded</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
              {currentQ.sourceExcerpt && (
                <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400 italic">
                  "{currentQ.sourceExcerpt}"
                </div>
              )}
            </div>
          )}

          {/* Question Navigation Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                if (currentIdx > 0) {
                  setCurrentIdx(currentIdx - 1);
                  setShowHint(false);
                }
              }}
              disabled={currentIdx === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {!isLastQuestion ? (
                <button
                  onClick={() => {
                    setCurrentIdx(currentIdx + 1);
                    setShowHint(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleFinishQuiz}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                >
                  <Award className="w-4 h-4" />
                  <span>Finish & View Score</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completed Quiz Summary */}
      {activeQuiz && activeQuiz.status === 'completed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white">Quiz Completed!</h2>
            <p className="text-xs text-slate-400 mt-1">{activeQuiz.title} • {activeQuiz.subject}</p>
          </div>

          {/* Score Badge */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 inline-block px-8">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Your Performance Score
            </span>
            <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-indigo-400">
              {activeQuiz.score}%
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {activeQuiz.questions.filter(q => q.userSelectedIndex === q.correctIndex).length} of {activeQuiz.questions.length} Correct
            </p>
          </div>

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            {activeQuiz.score! >= 75
              ? 'Excellent retention! Your conceptual understanding of this topic has been recorded to your Student Memory.'
              : 'Good effort! Review the missed questions below or ask StudyMate AI to explain the underlying mechanisms.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSetQuiz(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              Take Another Quiz
            </button>
            <button
              onClick={() => onOpenExplainer(activeQuiz.subject, activeQuiz.topic)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              Deep Explain Missed Topics
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
            >
              View Learning Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
