
export type ViewState = 'dashboard' | 'new-session' | 'history' | 'analytics' | 'subjects' | 'tasks';

export type TimerMode = 'timer' | 'stopwatch' | 'pomodoro';

export type ThemeColor = 'blue' | 'purple' | 'orange' | 'green' | 'rose';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TopicStatus = 'not-started' | 'working' | 'completed';

export interface QuestionStats {
  correct: number;
  incorrect: number;
  empty: number;
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: TaskPriority;
  subjectId?: string; // New: Link task to a subject
  dueDate?: number;   // New: Due date timestamp
  createdAt: number;
}

export interface TestLog {
  id: string;
  name: string;
  subjectId?: string; 
  topic?: string;    
  correct: number;
  incorrect: number;
  empty: number;
  note?: string;
  timestamp: number;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  tags: string[]; 
  sessionNote?: string;
  date: string;
  timestamp: number;
  durationMinutes: number;
  questionStats: QuestionStats; 
  totalQuestions: number;
  logs?: TestLog[]; 
  efficiency: number; 
  status: 'completed' | 'interrupted';
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: string[];
  topicStatuses?: Record<string, TopicStatus>; // New: Track status per topic name
}

export interface AppSettings {
  userName: string;
  userTitle: string;
  weeklyGoalMinutes: number;
  darkMode: boolean;
  soundEnabled: boolean;
  soundVolume: number; 
  themeColor: ThemeColor; 
  language: 'tr' | 'en';
  notificationsEnabled: boolean;
}

export const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Matematik', icon: 'Calculator', color: 'bg-blue-600', topics: [], topicStatuses: {} },
  { id: 'phys', name: 'Fizik', icon: 'Atom', color: 'bg-purple-600', topics: [], topicStatuses: {} },
  { id: 'chem', name: 'Kimya', icon: 'FlaskConical', color: 'bg-teal-600', topics: [], topicStatuses: {} },
  { id: 'bio', name: 'Biyoloji', icon: 'Dna', color: 'bg-green-600', topics: [], topicStatuses: {} },
  { id: 'lit', name: 'Edebiyat', icon: 'BookOpen', color: 'bg-yellow-600', topics: [], topicStatuses: {} },
  { id: 'hist', name: 'Tarih', icon: 'Landmark', color: 'bg-orange-600', topics: [], topicStatuses: {} },
];

export const SUBJECT_COLORS: Record<string, string> = {
  math: '#2563eb', 
  phys: '#9333ea', 
  chem: '#0d9488', 
  bio: '#16a34a',  
  lit: '#ca8a04',  
  hist: '#ea580c', 
  default: '#475569'
};

export const THEME_COLORS: Record<ThemeColor, string> = {
    blue: '#3b82f6',
    purple: '#a855f7',
    orange: '#f97316',
    green: '#22c55e',
    rose: '#f43f5e'
};
