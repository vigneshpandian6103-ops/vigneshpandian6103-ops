import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckSquare, 
  Calendar, 
  FileText, 
  Flame, 
  Award, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { StudentProfile, CourseDocument, StudyPlan, LearningMemory, ActiveTab } from '../types';

interface DashboardViewProps {
  profile: StudentProfile;
  materials: CourseDocument[];
  plans: StudyPlan[];
  memory: LearningMemory;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenExplainer: (subject: string, topic: string) => void;
  onQuickAsk: (subject: string, question: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  materials,
  plans,
  memory,
  setActiveTab,
  onOpenExplainer,
  onQuickAsk,
}) => {
  const activePlan = plans.find(p => p.status === 'active') || plans[0];

  // Group materials by subject
  const subjectsMap: Record<string, { docs: CourseDocument[]; chunksCount: number }> = {};
  materials.forEach(doc => {
    if (!subjectsMap[doc.subject]) {
      subjectsMap[doc.subject] = { docs: [], chunksCount: 0 };
    }
    subjectsMap[doc.subject].docs.push(doc);
    subjectsMap[doc.subject].chunksCount += doc.chunks.length;
  });

  const subjects = Object.keys(subjectsMap);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Active Session
              </span>
              <span className="text-xs text-slate-400">{profile.degree} • {profile.semester}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Current Goal: <span className="text-sky-300 font-medium">{profile.studyGoal}</span>
            </p>
          </div>

          {/* Key metrics counters */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center min-w-[85px]">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold mb-0.5">
                <Flame className="w-3.5 h-3.5" />
                <span>{profile.streakDays} Days</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Streak</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center min-w-[85px]">
              <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{(profile.totalStudyMinutes / 60).toFixed(1)}h</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Studied</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center min-w-[85px]">
              <div className="flex items-center justify-center gap-1 text-sky-400 text-xs font-bold mb-0.5">
                <Award className="w-3.5 h-3.5" />
                <span>{profile.averageScore}%</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Score</span>
            </div>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Launchpad Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('qa')}
          className="flex flex-col items-start p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
            Ask Questions
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            RAG citations from your course notes
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className="flex flex-col items-start p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 transition-all text-left group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
            Generate Quiz
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Practice questions with instant grading
          </span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className="flex flex-col items-start p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 transition-all text-left group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
            Study Plans
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Topic-wise schedules & goals
          </span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className="flex flex-col items-start p-4 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/50 transition-all text-left group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
            Course Notes
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Upload notes, syllabus & view chunks
          </span>
        </button>
      </div>

      {/* Main Grid: Active Plan + Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Subjects & Knowledge Repositories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Course Subjects & Notes Knowledge Base</h2>
            </div>
            <button
              onClick={() => setActiveTab('materials')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Manage Materials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => {
              const info = subjectsMap[sub];
              const confRating = memory.confidenceRatings[`${sub} - Deadlocks`] || 
                                memory.confidenceRatings[`${sub} - Bias-Variance`] || 
                                memory.confidenceRatings[`${sub} - AVL Trees`] || 4;

              return (
                <div
                  key={sub}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {info.docs.length} Doc{info.docs.length > 1 ? 's' : ''} • {info.chunksCount} Chunks
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>Mastery {confRating * 20}%</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-white mb-1.5">{sub}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {info.docs[0]?.title || 'Course syllabus and study notes indexed for semantic RAG retrieval.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => {
                        onQuickAsk(sub, `Explain the core concepts and common exam questions in ${sub}`);
                        setActiveTab('qa');
                      }}
                      className="flex-1 text-center py-1.5 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
                    >
                      Ask Q&A
                    </button>
                    <button
                      onClick={() => {
                        onOpenExplainer(sub, info.docs[0]?.tags?.[0] || sub);
                      }}
                      className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Explain</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RAG Agentic Architecture Workflow Visualizer */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              Agentic RAG Pipeline Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-indigo-400 font-bold block mb-0.5">1. Input Intake</span>
                <span className="text-slate-300 font-medium">Goal, Notes, Prompts</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-sky-400 font-bold block mb-0.5">2. RAG Chunking</span>
                <span className="text-slate-300 font-medium">Keyword & Vector Filter</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold block mb-0.5">3. Memory Context</span>
                <span className="text-slate-300 font-medium">Weak Spots & History</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-amber-400 font-bold block mb-0.5">4. Agent Reasoning</span>
                <span className="text-slate-300 font-medium">Plan, Q&A, Quizzes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Plan & Student Memory Context */}
        <div className="space-y-6">
          {/* Active Study Plan */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Study Plan</h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activePlan?.status || 'Active'}
              </span>
            </div>

            {activePlan ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-white">{activePlan.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{activePlan.goal}</p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Roadmap Progress</span>
                    <span className="font-semibold text-emerald-400">{activePlan.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.max(activePlan.progressPercent, 12)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span>{activePlan.days[0]?.dayLabel}: {activePlan.days[0]?.theme}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {activePlan.days[0]?.tasks?.length || 0} tasks scheduled for today
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('plan')}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Continue Study Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <p className="text-xs">No active study plan yet.</p>
                <button
                  onClick={() => setActiveTab('plan')}
                  className="mt-2 text-xs text-indigo-400 hover:underline"
                >
                  Create your first plan
                </button>
              </div>
            )}
          </div>

          {/* Student Memory Context Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Memory & Context
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('progress')}
                className="text-[11px] text-sky-400 hover:underline"
              >
                View Details
              </button>
            </div>

            {/* Identified Weak Spots */}
            <div>
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <AlertCircle className="w-3 h-3" />
                Revision Recommendations (Weak Areas)
              </span>
              <div className="space-y-1.5">
                {memory.weakAreas.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center justify-between"
                  >
                    <span className="truncate pr-2">{item}</span>
                    <button
                      onClick={() => onOpenExplainer('Operating Systems', item)}
                      className="text-[10px] text-rose-300 font-semibold hover:underline shrink-0"
                    >
                      Explain
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Strengths */}
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <Award className="w-3 h-3" />
                Solidified Strengths
              </span>
              <div className="flex flex-wrap gap-1.5">
                {memory.strengths.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
