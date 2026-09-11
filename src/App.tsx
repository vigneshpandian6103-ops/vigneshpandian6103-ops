import React, { useState, useEffect } from 'react';
import { 
  ActiveTab, 
  StudentProfile, 
  CourseDocument, 
  StudyPlan, 
  LearningMemory, 
  ChatMessage, 
  QuizSession 
} from './types';
import { 
  DEFAULT_MATERIALS, 
  INITIAL_STUDENT_PROFILE, 
  INITIAL_MEMORY 
} from './data/defaultMaterials';
import { retrieveRelevantChunks } from './utils/ragEngine';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MaterialsView } from './components/MaterialsView';
import { StudyPlanView } from './components/StudyPlanView';
import { QAView } from './components/QAView';
import { QuizView } from './components/QuizView';
import { ProgressView } from './components/ProgressView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { TopicExplainerModal } from './components/TopicExplainerModal';

const INITIAL_PLAN: StudyPlan = {
  id: 'plan_os_midterm',
  title: '3-Day Midterm Sprint: Operating Systems',
  subject: 'Operating Systems',
  goal: 'Master Process Concurrency, Deadlocks, and Virtual Memory',
  totalDays: 3,
  hoursPerDay: 2.5,
  status: 'active',
  createdAt: '2026-09-08T08:00:00Z',
  progressPercent: 44,
  days: [
    {
      dayNumber: 1,
      dayLabel: 'Day 1',
      theme: 'Concurrency & Deadlock Prevention',
      estimatedMinutes: 150,
      isCompleted: true,
      tasks: [
        {
          id: 't_1_1',
          title: 'Review Coffman Conditions & Prevention Techniques',
          description: 'Study mutual exclusion, hold-and-wait, no-preemption, and circular wait invalidation.',
          type: 'reading',
          durationMinutes: 60,
          isCompleted: true,
          topic: 'Deadlocks'
        },
        {
          id: 't_1_2',
          title: "Banker's Algorithm & Safe Sequence Verification",
          description: 'Solve step-by-step numerical matrix allocations to guarantee safe system state.',
          type: 'practice',
          durationMinutes: 45,
          isCompleted: true,
          topic: 'Banker Algorithm'
        },
        {
          id: 't_1_3',
          title: 'Self-Check Diagnostic Quiz on Concurrency',
          description: 'Verify understanding of race conditions and synchronization primitives.',
          type: 'quiz',
          durationMinutes: 45,
          isCompleted: false,
          topic: 'Concurrency'
        }
      ]
    },
    {
      dayNumber: 2,
      dayLabel: 'Day 2',
      theme: 'Virtual Memory, Paging & TLB Mechanics',
      estimatedMinutes: 150,
      isCompleted: false,
      tasks: [
        {
          id: 't_2_1',
          title: 'Address Translation & Paging Architecture',
          description: 'Examine VPN to PFN mapping, MMU logic, and TLB hit/miss penalties.',
          type: 'reading',
          durationMinutes: 60,
          isCompleted: true,
          topic: 'Paging'
        },
        {
          id: 't_2_2',
          title: "Page Fault Handling Traps & Swap Storage",
          description: 'Trace step-by-step operating system trap sequence when a missing page is referenced.',
          type: 'practice',
          durationMinutes: 45,
          isCompleted: false,
          topic: 'Page Faults'
        },
        {
          id: 't_2_3',
          title: 'StudyMate Q&A: Resolve Edge Cases',
          description: 'Ask AI contextual questions on inverted page tables and multilevel paging.',
          type: 'practice',
          durationMinutes: 45,
          isCompleted: false,
          topic: 'Virtual Memory'
        }
      ]
    },
    {
      dayNumber: 3,
      dayLabel: 'Day 3',
      theme: "Page Replacement Algorithms & Comprehensive Exam Review",
      estimatedMinutes: 150,
      isCompleted: false,
      tasks: [
        {
          id: 't_3_1',
          title: "FIFO, LRU and Belady's Anomaly Comparisons",
          description: 'Calculate page faults across test reference strings to compare replacement policies.',
          type: 'reading',
          durationMinutes: 60,
          isCompleted: false,
          topic: 'Page Replacement'
        },
        {
          id: 't_3_2',
          title: 'Comprehensive Midterm Simulation Quiz',
          description: 'Take an 8-question practice exam with instant feedback and score grading.',
          type: 'quiz',
          durationMinutes: 50,
          isCompleted: false,
          topic: 'Exam Simulation'
        },
        {
          id: 't_3_3',
          title: 'Final Revision of Weak Spots & Key Formulas',
          description: 'Review memory context notes and solidify high-yield definitions.',
          type: 'revision',
          durationMinutes: 40,
          isCompleted: false,
          topic: 'Final Revision'
        }
      ]
    }
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Persistent / Initial State
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('studymate_profile');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROFILE;
  });

  const [materials, setMaterials] = useState<CourseDocument[]>(() => {
    const saved = localStorage.getItem('studymate_materials');
    return saved ? JSON.parse(saved) : DEFAULT_MATERIALS;
  });

  const [plans, setPlans] = useState<StudyPlan[]>(() => {
    const saved = localStorage.getItem('studymate_plans');
    return saved ? JSON.parse(saved) : [INITIAL_PLAN];
  });

  const [memory, setMemory] = useState<LearningMemory>(() => {
    const saved = localStorage.getItem('studymate_memory');
    return saved ? JSON.parse(saved) : INITIAL_MEMORY;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('studymate_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'msg_welcome',
        role: 'assistant',
        content: `Hello **${INITIAL_STUDENT_PROFILE.name.split(' ')[0]}**! I am **StudyMate AI**, your dedicated learning companion.\n\nI have indexed your course notes for **Operating Systems**, **Machine Learning**, and **Data Structures & Algorithms**. You can ask me any theoretical or problem-solving question, and I'll explain it grounded directly in your syllabus with cited excerpts.\n\nWhat would you like to explore today?`,
        timestamp: new Date().toISOString(),
        suggestedQuestions: [
          "What are Coffman's four conditions for deadlock?",
          "Why does FIFO page replacement suffer from Belady's Anomaly?",
          "Explain the Bias-Variance tradeoff with an example."
        ]
      }
    ];
  });

  const [activeQuiz, setActiveQuiz] = useState<QuizSession | null>(null);

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [explainerConfig, setExplainerConfig] = useState<{
    isOpen: boolean;
    subject: string;
    topic: string;
  }>({
    isOpen: false,
    subject: 'Operating Systems',
    topic: 'Process Deadlocks & Coffman Conditions'
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('studymate_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('studymate_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('studymate_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('studymate_memory', JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem('studymate_messages', JSON.stringify(messages));
  }, [messages]);

  // Handlers
  const handleAddMaterial = (doc: CourseDocument) => {
    setMaterials(prev => [doc, ...prev]);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleResetDefaults = () => {
    setMaterials(DEFAULT_MATERIALS);
  };

  const handleSavePlan = (plan: StudyPlan) => {
    setPlans(prev => [plan, ...prev.filter(p => p.id !== plan.id)]);
  };

  const handleToggleTask = (planId: string, dayNumber: number, taskId: string) => {
    setPlans(prevPlans => prevPlans.map(plan => {
      if (plan.id !== planId) return plan;

      let totalTasksCount = 0;
      let completedTasksCount = 0;

      const updatedDays = plan.days.map(day => {
        const updatedTasks = day.tasks.map(task => {
          totalTasksCount++;
          if (day.dayNumber === dayNumber && task.id === taskId) {
            const nextCompleted = !task.isCompleted;
            if (nextCompleted) completedTasksCount++;
            return { ...task, isCompleted: nextCompleted };
          }
          if (task.isCompleted) completedTasksCount++;
          return task;
        });

        const dayFinished = updatedTasks.every(t => t.isCompleted);
        return {
          ...day,
          tasks: updatedTasks,
          isCompleted: dayFinished
        };
      });

      const newPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

      // Also increment student studied minutes
      setProfile(prev => ({
        ...prev,
        totalStudyMinutes: prev.totalStudyMinutes + 15
      }));

      return {
        ...plan,
        days: updatedDays,
        progressPercent: newPercent
      };
    }));
  };

  const handleSendMessage = async (userText: string, subject: string) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
      subject
    };

    setMessages(prev => [...prev, userMsg]);

    // RAG Retrieval
    const allChunks = materials.flatMap(m => m.chunks);
    const retrieved = retrieveRelevantChunks(userText, allChunks, subject, 4);

    try {
      const res = await fetch('/api/rag-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          subject,
          retrievedChunks: retrieved.map(r => r.chunk),
          memoryContext: memory,
          chatHistory: messages.slice(-4)
        })
      });

      if (!res.ok) throw new Error('Could not generate contextual answer');
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString(),
        citations: data.citations,
        reasoningSteps: data.reasoningSteps,
        suggestedQuestions: data.suggestedQuestions,
        subject
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Update recent questions in memory
      setMemory(prev => ({
        ...prev,
        recentTopics: Array.from(new Set([userText.slice(0, 30), ...prev.recentTopics])).slice(0, 6)
      }));
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: `I retrieved ${retrieved.length} relevant excerpts from your **${subject}** notes:\n\n` +
          retrieved.map((r, i) => `**Source ${i + 1} (${r.chunk.documentTitle}):**\n> ${r.chunk.content}`).join('\n\n') +
          `\n\n*Review these notes or ask for a specific formula or diagram explanation.*`,
        timestamp: new Date().toISOString(),
        citations: retrieved.map(r => ({
          documentTitle: r.chunk.documentTitle,
          chunkIndex: r.chunk.chunkIndex,
          excerpt: r.chunk.content.slice(0, 160) + '...',
          relevanceScore: 90
        })),
        subject
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg_welcome_fresh',
        role: 'assistant',
        content: `Chat history reset. Ask any question from your course materials for **${profile.studyGoal}**!`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleCompleteQuiz = (completedQuiz: QuizSession) => {
    const score = completedQuiz.score || 0;

    // Update profile
    setProfile(prev => {
      const newCount = prev.completedQuizzesCount + 1;
      const newAvg = Math.round(((prev.averageScore * prev.completedQuizzesCount) + score) / newCount);
      return {
        ...prev,
        completedQuizzesCount: newCount,
        averageScore: newAvg,
        totalStudyMinutes: prev.totalStudyMinutes + 20
      };
    });

    // Update memory
    setMemory(prev => {
      const topic = completedQuiz.topic || completedQuiz.subject;
      const isStrength = score >= 75;

      const newStrengths = isStrength
        ? Array.from(new Set([topic, ...prev.strengths])).slice(0, 6)
        : prev.strengths.filter(s => s !== topic);

      const newWeak = !isStrength
        ? Array.from(new Set([topic, ...prev.weakAreas])).slice(0, 6)
        : prev.weakAreas.filter(w => w !== topic);

      return {
        ...prev,
        strengths: newStrengths,
        weakAreas: newWeak,
        completedTopics: Array.from(new Set([topic, ...prev.completedTopics])),
        confidenceRatings: {
          ...prev.confidenceRatings,
          [topic]: Math.max(1, Math.min(5, Math.round((score / 20))))
        }
      };
    });
  };

  const handleOpenExplainer = (subject: string, topic: string) => {
    setExplainerConfig({
      isOpen: true,
      subject,
      topic
    });
  };

  const handleQuickAsk = (subject: string, question: string) => {
    handleSendMessage(question, subject);
    setActiveTab('qa');
  };

  const handleLaunchQuizForTopic = (subject: string, topicName: string) => {
    setActiveTab('quiz');
  };

  const handleAddMemoryInsight = (insight: string) => {
    setMemory(prev => ({
      ...prev,
      keyInsights: [insight, ...prev.keyInsights]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenProfile={() => setProfileModalOpen(true)}
        materialsCount={materials.length}
      />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            materials={materials}
            plans={plans}
            memory={memory}
            setActiveTab={setActiveTab}
            onOpenExplainer={handleOpenExplainer}
            onQuickAsk={handleQuickAsk}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialsView
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {activeTab === 'plan' && (
          <StudyPlanView
            plans={plans}
            materials={materials}
            onSavePlan={handleSavePlan}
            onToggleTask={handleToggleTask}
            setActiveTab={setActiveTab}
            onQuickAsk={handleQuickAsk}
            onLaunchQuizForTopic={handleLaunchQuizForTopic}
          />
        )}

        {activeTab === 'qa' && (
          <QAView
            materials={materials}
            memory={memory}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onOpenExplainer={handleOpenExplainer}
            onLaunchQuizForTopic={handleLaunchQuizForTopic}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizView
            materials={materials}
            activeQuiz={activeQuiz}
            onSetQuiz={setActiveQuiz}
            onCompleteQuiz={handleCompleteQuiz}
            setActiveTab={setActiveTab}
            onOpenExplainer={handleOpenExplainer}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            profile={profile}
            memory={memory}
            plans={plans}
            quizzes={[]}
            onAddMemoryInsight={handleAddMemoryInsight}
            onOpenExplainer={handleOpenExplainer}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Student Profile & Persona Switcher Modal */}
      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => setProfile(updated)}
      />

      {/* Deep Topic Explainer Modal */}
      <TopicExplainerModal
        isOpen={explainerConfig.isOpen}
        onClose={() => setExplainerConfig(prev => ({ ...prev, isOpen: false }))}
        subject={explainerConfig.subject}
        topic={explainerConfig.topic}
        documentsContext={materials.filter(m => m.subject === explainerConfig.subject).map(m => m.rawText).join('\n\n')}
        memory={memory}
      />
    </div>
  );
}
