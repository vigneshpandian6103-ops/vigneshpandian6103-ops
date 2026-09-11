export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  degree: string;
  semester: string;
  studyGoal: string;
  dailyTargetHours: number;
  streakDays: number;
  totalStudyMinutes: number;
  completedQuizzesCount: number;
  averageScore: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  subject: string;
  chunkIndex: number;
  content: string;
  keywords: string[];
}

export interface CourseDocument {
  id: string;
  title: string;
  subject: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  chunks: DocumentChunk[];
  rawText: string;
  tags: string[];
  isDefault?: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  description: string;
  type: 'reading' | 'practice' | 'quiz' | 'revision';
  durationMinutes: number;
  isCompleted: boolean;
  topic: string;
}

export interface StudyDayPlan {
  dayNumber: number;
  dayLabel: string;
  theme: string;
  estimatedMinutes: number;
  tasks: StudyTask[];
  isCompleted: boolean;
}

export interface StudyPlan {
  id: string;
  title: string;
  subject: string;
  goal: string;
  totalDays: number;
  hoursPerDay: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  days: StudyDayPlan[];
  progressPercent: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceExcerpt?: string;
  hint?: string;
  userSelectedIndex?: number;
}

export interface QuizSession {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  timeSpentSeconds?: number;
}

export interface LearningMemory {
  completedTopics: string[];
  weakAreas: string[];
  strengths: string[];
  recentTopics: string[];
  lastActiveDate: string;
  keyInsights: string[];
  confidenceRatings: Record<string, number>; // topic -> 1 to 5
}

export interface Citation {
  documentTitle: string;
  chunkIndex: number;
  excerpt: string;
  relevanceScore?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  reasoningSteps?: string[];
  suggestedQuestions?: string[];
  subject?: string;
}

export type ActiveTab = 'dashboard' | 'materials' | 'plan' | 'qa' | 'quiz' | 'progress';
