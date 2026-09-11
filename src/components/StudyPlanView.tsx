import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Plus, 
  CheckSquare, 
  Layers, 
  ArrowRight, 
  Download, 
  RotateCcw,
  Loader2
} from 'lucide-react';
import { StudyPlan, CourseDocument, ActiveTab } from '../types';

interface StudyPlanViewProps {
  plans: StudyPlan[];
  materials: CourseDocument[];
  onSavePlan: (plan: StudyPlan) => void;
  onToggleTask: (planId: string, dayNumber: number, taskId: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickAsk: (subject: string, question: string) => void;
  onLaunchQuizForTopic: (subject: string, topic: string) => void;
}

export const StudyPlanView: React.FC<StudyPlanViewProps> = ({
  plans,
  materials,
  onSavePlan,
  onToggleTask,
  setActiveTab,
  onQuickAsk,
  onLaunchQuizForTopic
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const subjects = Array.from(new Set(materials.map(m => m.subject)));
  const [formSubject, setFormSubject] = useState(subjects[0] || 'Operating Systems');
  const [formGoal, setFormGoal] = useState('3-Day Intensive Exam Preparation');
  const [formDays, setFormDays] = useState(3);
  const [formHours, setFormHours] = useState(2.5);
  const [formTopics, setFormTopics] = useState<string[]>(['Deadlocks', 'Page Replacement', 'Process Synchronization']);

  const activePlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docContext = materials
        .filter(m => m.subject === formSubject)
        .map(m => m.rawText.slice(0, 1500))
        .join('\n\n');

      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formSubject,
          topics: formTopics,
          targetGoal: formGoal,
          availableHoursPerDay: formHours,
          totalDays: formDays,
          documentsContext: docContext
        })
      });

      if (!res.ok) throw new Error('Failed to generate study plan');
      const data = await res.json();
      if (data.plan) {
        onSavePlan(data.plan);
        setSelectedPlanId(data.plan.id);
        setIsCreating(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPlan = () => {
    if (!activePlan) return;
    const text = `# ${activePlan.title}\nSubject: ${activePlan.subject}\nGoal: ${activePlan.goal}\nDuration: ${activePlan.totalDays} Days (${activePlan.hoursPerDay} hrs/day)\n\n` +
      activePlan.days.map(d => (
        `## ${d.dayLabel}: ${d.theme} (${d.estimatedMinutes} mins)\n` +
        d.tasks.map(t => `- [${t.isCompleted ? 'x' : ' '}] ${t.title} (${t.durationMinutes}m) - ${t.description}`).join('\n')
      )).join('\n\n');

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlan.title.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Personalized Study Planner
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Agentic study roadmap generator tailored to your specific subject, exam goals, and available study hours.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activePlan && (
            <button
              onClick={handleExportPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Plan</span>
            </button>
          )}

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'View Plans' : 'New Plan'}</span>
          </button>
        </div>
      </div>

      {/* Plan Creator Form */}
      {isCreating && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Generate Personalized Study Roadmap</h2>
            </div>
            <button onClick={() => setIsCreating(false)} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Subject</label>
                <select
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Learning / Exam Goal</label>
                <input
                  type="text"
                  value={formGoal}
                  onChange={(e) => setFormGoal(e.target.value)}
                  placeholder="e.g. 3-Day Sprint for Semester Midterm"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Total Duration (Days)</label>
                  <span className="text-xs font-bold text-indigo-400">{formDays} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={formDays}
                  onChange={(e) => setFormDays(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">Daily Study Hours</label>
                  <span className="text-xs font-bold text-sky-400">{formHours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={formHours}
                  onChange={(e) => setFormHours(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Key Topics to Emphasize</label>
              <input
                type="text"
                value={formTopics.join(', ')}
                onChange={(e) => setFormTopics(e.target.value.split(',').map(s => s.trim()))}
                placeholder="Deadlocks, Concurrency, Virtual Memory"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">StudyMate AI balances theory, practice questions, and self-checks across each day.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition-colors shadow-md shadow-indigo-600/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Agent Generating Schedule...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Personalized Schedule</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plan Selector & Progress Bar */}
      {plans.length > 0 && activePlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activePlan.subject}
                </span>
                <span className="text-xs text-slate-400">
                  {activePlan.totalDays} Days • {activePlan.hoursPerDay} hrs/day
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{activePlan.title}</h2>
              <p className="text-xs text-slate-400">{activePlan.goal}</p>
            </div>

            {/* Plan switcher */}
            {plans.length > 1 && (
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Completion</span>
              <span className="font-bold text-emerald-400">{activePlan.progressPercent}% Completed</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${Math.max(activePlan.progressPercent, 5)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Days Roadmap */}
      {activePlan && (
        <div className="space-y-4">
          {activePlan.days.map((day) => {
            const completedTasks = day.tasks.filter(t => t.isCompleted).length;
            const totalTasks = day.tasks.length;
            const isDayFinished = completedTasks === totalTasks && totalTasks > 0;

            return (
              <div
                key={day.dayNumber}
                className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                  isDayFinished ? 'border-emerald-500/30' : 'border-slate-800'
                }`}
              >
                {/* Day Header */}
                <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isDayFinished ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {day.dayLabel.replace('Day ', 'D')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{day.dayLabel}: {day.theme}</span>
                        {isDayFinished && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                            Day Completed
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Estimated: {day.estimatedMinutes} mins • {completedTasks}/{totalTasks} Tasks Done
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onLaunchQuizForTopic(activePlan.subject, day.theme);
                        setActiveTab('quiz');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>Take Day Quiz</span>
                    </button>
                    <button
                      onClick={() => {
                        onQuickAsk(activePlan.subject, `Explain the core concepts of ${day.theme} and prepare me for Day ${day.dayNumber} tasks`);
                        setActiveTab('qa');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="p-4 divide-y divide-slate-800/60">
                  {day.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(activePlan.id, day.dayNumber, task.id)}
                      className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 cursor-pointer group hover:bg-slate-850/40 -mx-4 px-4 rounded-lg transition-colors"
                    >
                      <div className="mt-0.5 text-slate-400 group-hover:text-slate-200">
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs font-semibold ${
                            task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {task.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {task.durationMinutes}m
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 ${
                          task.isCompleted ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
