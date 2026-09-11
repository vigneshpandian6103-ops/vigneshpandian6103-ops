import React, { useState } from 'react';
import { X, User, BookOpen, Target, Clock, Award, Check } from 'lucide-react';
import { StudentProfile } from '../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSaveProfile: (updated: StudentProfile) => void;
}

const PRESET_STUDENTS: Partial<StudentProfile>[] = [
  {
    name: 'Vignesh Pandian',
    email: 'vigneshpandian6103@gmail.com',
    degree: 'B.Tech in Computer Science & Engineering',
    semester: 'Semester 6',
    studyGoal: 'Master OS Concurrency & ML Foundations for Upcoming Midterm Exams',
    dailyTargetHours: 2.5
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@university.edu',
    degree: 'M.S. in Data Science & Artificial Intelligence',
    semester: 'Semester 2',
    studyGoal: 'Deep dive into Model Regularization, Evaluation Metrics & Loss Formulations',
    dailyTargetHours: 3.0
  },
  {
    name: 'Alex Chen',
    email: 'alex.chen@campus.org',
    degree: 'B.S. in Software Systems',
    semester: 'Semester 4',
    studyGoal: 'Ace Technical Interviews on AVL Trees, Graph Algorithms & Shortest Paths',
    dailyTargetHours: 2.0
  }
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: Partial<StudentProfile>) => {
    setFormData(prev => ({
      ...prev,
      ...preset
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Student Profile & Academic Context</h3>
              <p className="text-xs text-slate-400">Personalize how StudyMate AI tailors plans and evaluations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-800/60 bg-slate-900/50">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quick Persona Switcher
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_STUDENTS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`text-left p-2 rounded-xl border text-xs transition-all ${
                  formData.name === preset.name
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold truncate text-slate-200">{preset.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{preset.semester}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email / Academic ID</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Degree / Program</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Semester / Term</label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Primary Learning Goal</label>
            <textarea
              rows={2}
              value={formData.studyGoal}
              onChange={(e) => setFormData({ ...formData, studyGoal: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Master CPU Scheduling and ML metrics for semester finals..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center text-center">
              <Clock className="w-4 h-4 text-sky-400 mb-1" />
              <span className="text-[11px] text-slate-400">Target Daily</span>
              <div className="flex items-center gap-1 mt-0.5">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={formData.dailyTargetHours}
                  onChange={(e) => setFormData({ ...formData, dailyTargetHours: parseFloat(e.target.value) || 2 })}
                  className="w-14 bg-slate-900 text-center font-bold text-white border border-slate-600 rounded px-1 text-xs"
                />
                <span className="text-xs text-slate-400">hrs</span>
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center text-center">
              <BookOpen className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[11px] text-slate-400">Quizzes Taken</span>
              <span className="text-base font-bold text-white mt-0.5">{formData.completedQuizzesCount}</span>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex flex-col items-center text-center">
              <Award className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[11px] text-slate-400">Avg Quiz Score</span>
              <span className="text-base font-bold text-white mt-0.5">{formData.averageScore}%</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/30"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
