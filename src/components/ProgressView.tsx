import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  Award, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  BookOpen, 
  Download, 
  TrendingUp,
  BrainCircuit,
  Tag
} from 'lucide-react';
import { StudentProfile, LearningMemory, QuizSession, StudyPlan, ActiveTab } from '../types';

interface ProgressViewProps {
  profile: StudentProfile;
  memory: LearningMemory;
  plans: StudyPlan[];
  quizzes: QuizSession[];
  onAddMemoryInsight: (insight: string) => void;
  onOpenExplainer: (subject: string, topic: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  profile,
  memory,
  plans,
  quizzes,
  onAddMemoryInsight,
  onOpenExplainer,
  setActiveTab
}) => {
  const [newInsight, setNewInsight] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsight.trim()) return;
    onAddMemoryInsight(newInsight.trim());
    setNewInsight('');
    setShowAddNote(false);
  };

  const handleExportReport = () => {
    const text = `# StudyMate AI — Student Learning & Progress Report\n` +
      `Student: ${profile.name} (${profile.email})\n` +
      `Program: ${profile.degree} • ${profile.semester}\n` +
      `Study Streak: ${profile.streakDays} Days\n` +
      `Total Studied: ${(profile.totalStudyMinutes / 60).toFixed(1)} Hours\n` +
      `Average Quiz Score: ${profile.averageScore}%\n` +
      `Completed Quizzes: ${profile.completedQuizzesCount}\n\n` +
      `## Completed Topics\n` +
      memory.completedTopics.map(t => `- [x] ${t}`).join('\n') + `\n\n` +
      `## Identified Strengths\n` +
      memory.strengths.map(s => `- ${s}`).join('\n') + `\n\n` +
      `## Areas for Focused Revision (Weak Spots)\n` +
      memory.weakAreas.map(w => `- ${w}`).join('\n') + `\n\n` +
      `## Agent Memory Insights\n` +
      memory.keyInsights.map(k => `- ${k}`).join('\n');

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.toLowerCase().replace(/\s+/g, '_')}_study_progress.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Learning Progress & Memory Context
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track topic mastery, quiz analytics, and review the transparent memory context StudyMate AI uses to personalize your learning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Progress Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{profile.streakDays} Days</div>
          <span className="text-[10px] text-emerald-400 mt-1">Active daily habit</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Study Time</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{(profile.totalStudyMinutes / 60).toFixed(1)} hrs</div>
          <span className="text-[10px] text-slate-400 mt-1">Across all subjects</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Quiz Score</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{profile.averageScore}%</div>
          <span className="text-[10px] text-emerald-400 mt-1">High retention</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quizzes Taken</span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{profile.completedQuizzesCount}</div>
          <span className="text-[10px] text-slate-400 mt-1">Verified assessments</span>
        </div>
      </div>

      {/* Subject Confidence Matrix & Memory Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Topic Mastery & Confidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Curriculum Topic Mastery Index</h2>
            </div>
            <span className="text-[10px] text-slate-400">Based on quiz results & self-checks</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(memory.confidenceRatings).map(([topicName, rating]) => (
              <div key={topicName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{topicName}</span>
                  <span className="font-bold text-emerald-400">{rating * 20}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rating >= 4
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : rating >= 3
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                        : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                    style={{ width: `${rating * 20}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Completed Topics list */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Mastered / Completed Topics ({memory.completedTopics.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {memory.completedTopics.map((topic, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{topic}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Transparent AI Memory Context */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Student Memory Engine</h2>
            </div>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add Memory Note</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            StudyMate AI uses this contextual memory to tailor answers, adjust quiz difficulty, and avoid repetitive questions.
          </p>

          {/* Add custom note form */}
          {showAddNote && (
            <form onSubmit={handleAddNote} className="p-3 rounded-xl bg-slate-950 border border-slate-700/80 space-y-2 animate-fadeIn">
              <label className="block text-[11px] font-semibold text-slate-300">New Insight or Learning Preference</label>
              <input
                type="text"
                value={newInsight}
                onChange={(e) => setNewInsight(e.target.value)}
                placeholder="e.g. Student prefers code examples in C/C++ for OS concepts..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-medium rounded-lg"
                >
                  Save to Memory
                </button>
              </div>
            </form>
          )}

          {/* Weak Spots with quick trigger */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Flagged Weak Areas (Recommended for Review)
            </h3>
            <div className="space-y-1.5">
              {memory.weakAreas.map((wa, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-center justify-between"
                >
                  <span>{wa}</span>
                  <button
                    onClick={() => onOpenExplainer('Course Review', wa)}
                    className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-semibold transition-colors"
                  >
                    Deep Explain
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Solidified Strengths */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Solidified Strengths
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {memory.strengths.map((str, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium"
                >
                  {str}
                </span>
              ))}
            </div>
          </div>

          {/* Key Insights List */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Agent Contextual Observations
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {memory.keyInsights.map((insight, i) => (
                <li key={i} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                  <span className="text-sky-400 text-sm leading-none mt-0.5">•</span>
                  <span className="leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
