
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { StudySession, Subject, SUBJECTS, AppSettings, TimerMode, QuestionStats, TestLog, THEME_COLORS, Task, TaskPriority, TopicStatus } from '../types';

// --- 1. STUDY DATA CONTEXT (Slow changing data) ---
interface StudyContextType {
  history: StudySession[];
  subjects: Subject[];
  settings: AppSettings;
  tasks: Task[];
  isSettingsOpen: boolean;
  installPrompt: any;
  setInstallPrompt: (e: any) => void;
  // CRUD Actions
  addHistoryItem: (item: StudySession) => void;
  deleteHistoryItem: (id: string) => void;
  updateHistoryItem: (id: string, data: Partial<StudySession>) => void;
  addNewSubject: (name: string) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addTopicToSubject: (subjectId: string, topic: string) => void;
  addTopicsToSubject: (subjectId: string, topics: string[]) => void;
  loadCurriculum: (data: {name: string, topics: string[], icon: string, color: string}[]) => void;
  removeTopicFromSubject: (subjectId: string, topic: string) => void;
  renameTopic: (subjectId: string, oldName: string, newName: string) => void; // NEW: Safe rename
  clearSubjectTopics: (subjectId: string) => void;
  removeAllSubjects: () => void;
  updateTopicStatus: (subjectId: string, topic: string, status: TopicStatus) => void;
  addTask: (title: string, priority?: TaskPriority, subjectId?: string, dueDate?: number) => void;
  editTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleSettings: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  // IO
  exportData: () => void;
  importData: (jsonData: string) => { success: boolean; message: string };
  exportHistoryToCSV: () => void; 
  exportTasksToCSV: () => void; 
  resetApp: () => void;
  logManualSession: (subjectId: string, topic: string, durationMinutes: number, stats: QuestionStats, date?: Date) => void;
  getFormattedDate: (date?: Date) => string;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within a StudyProvider');
  return context;
};

// --- 2. TIMER CONTEXT (Fast changing data - Re-renders every second) ---
interface TimerContextType {
  activeSession: {
    isActive: boolean;
    mode: TimerMode;
    subjectId: string;
    topic: string;
    tags: string[];
    sessionNote: string;
    totalDuration: number; 
    timeLeft: number; 
    isPaused: boolean;
    isCompleted: boolean; 
    questionGoal: number;
    stats: QuestionStats;
    logs: TestLog[]; 
    ambientSound: string | null;
    startTime: number;
    lastTick?: number; 
    linkedTaskId?: string;
  } | null;
  startSession: (mode: TimerMode, subjectId: string, topic: string, tags: string[], durationMinutes: number, goal: number, ambient: string | null, taskId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: (status: 'completed' | 'interrupted') => void;
  finishSession: (finalStats?: QuestionStats) => void;
  restartSession: () => void;
  updateQuestionStats: (type: keyof QuestionStats, amount: number) => void;
  addTestLog: (log: Omit<TestLog, 'id' | 'timestamp'>) => void;
  removeTestLog: (id: string) => void;
  updateActiveSessionNote: (note: string) => void;
  updateActiveSessionTopic: (topic: string) => void;
  adjustActiveSessionTime: (minutes: number) => void;
  formatTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
    const context = useContext(TimerContext);
    if (!context) throw new Error('useTimer must be used within a TimerProvider');
    return context;
};

// --- PROVIDERS ---

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // Date Formatter
  const getFormattedDate = useCallback((date: Date = new Date()) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  }, []);

  // --- Data States ---
  const [history, setHistory] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem('study_history');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.map((session: any) => ({ ...session, tags: Array.isArray(session.tags) ? session.tags : [] }));
    } catch (e) { return []; }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('study_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      return { 
          userName: parsed.userName || 'Öğrenci', 
          userTitle: parsed.userTitle || 'Hedef: Zirve 🚀',
          weeklyGoalMinutes: parsed.weeklyGoalMinutes || 1200,
          darkMode: parsed.darkMode ?? true,
          soundEnabled: parsed.soundEnabled ?? true,
          soundVolume: parsed.soundVolume ?? 0.5,
          themeColor: parsed.themeColor || 'blue',
          language: parsed.language || 'tr',
          notificationsEnabled: parsed.notificationsEnabled ?? true,
      };
    } catch (e) { return { userName: 'Öğrenci', userTitle: 'Öğrenci', weeklyGoalMinutes: 1200, darkMode: true, soundEnabled: true, soundVolume: 0.5, themeColor: 'blue', language: 'tr', notificationsEnabled: true }; }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
      try {
          const saved = localStorage.getItem('study_subjects');
          const parsed = saved ? JSON.parse(saved) : SUBJECTS;
          return parsed.map((s: Subject) => ({ ...s, topicStatuses: s.topicStatuses || {} }));
      } catch (e) { return SUBJECTS; }
  });
  
  const [tasks, setTasks] = useState<Task[]>(() => {
      try {
          const saved = localStorage.getItem('study_tasks');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // --- Effects ---
  useEffect(() => {
    const colorKey = settings.themeColor;
    const hex = THEME_COLORS[colorKey] || THEME_COLORS.blue;
    document.documentElement.style.setProperty('--color-primary', hex);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    document.documentElement.style.setProperty('--color-primary-rgb', `${r} ${g} ${b}`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', hex);
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('study_settings', JSON.stringify(settings));
  }, [settings.themeColor, settings.darkMode, settings]);

  useEffect(() => { localStorage.setItem('study_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('study_subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem('study_tasks', JSON.stringify(tasks)); }, [tasks]);

  // --- CRUD Implementations ---
  const addHistoryItem = (item: StudySession) => setHistory(prev => [item, ...prev]);
  const deleteHistoryItem = (id: string) => setHistory(prev => prev.filter(item => item.id !== id));
  const updateHistoryItem = (id: string, data: Partial<StudySession>) => setHistory(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));

  const addNewSubject = (name: string) => {
      const colors = ['bg-blue-600', 'bg-purple-600', 'bg-teal-600', 'bg-green-600', 'bg-yellow-600', 'bg-orange-600', 'bg-red-600', 'bg-pink-600', 'bg-indigo-600', 'bg-cyan-600'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newSub: Subject = { id: `custom_${Date.now()}`, name, icon: 'BookOpen', color: randomColor, topics: [], topicStatuses: {} };
      setSubjects(prev => [...prev, newSub]);
  };
  const updateSubject = (id: string, updates: Partial<Subject>) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  const deleteSubject = (id: string) => setSubjects(prev => prev.filter(s => s.id !== id));
  
  const addTopicToSubject = (subjectId: string, topic: string) => {
      setSubjects(prev => prev.map(s => {
          if (s.id === subjectId && !s.topics.includes(topic)) {
              return { ...s, topics: [...s.topics, topic], topicStatuses: { ...(s.topicStatuses || {}), [topic]: 'not-started' } };
          }
          return s;
      }));
  };
  
  // NEW: Rename topic safely across Subjects and History to prevent data decoupling
  const renameTopic = (subjectId: string, oldName: string, newName: string) => {
      if (!newName.trim() || oldName === newName) return;
      const trimmedNewName = newName.trim();

      // 1. Update in Subject
      setSubjects(prev => prev.map(s => {
          if (s.id !== subjectId) return s;
          
          // Rename in list
          const newTopics = s.topics.map(t => t === oldName ? trimmedNewName : t);
          
          // Rename in statuses
          const newStatuses = { ...(s.topicStatuses || {}) };
          if (newStatuses[oldName]) {
              newStatuses[trimmedNewName] = newStatuses[oldName];
              delete newStatuses[oldName];
          }

          return { ...s, topics: newTopics, topicStatuses: newStatuses };
      }));

      // 2. Update in History (Cascade Update)
      setHistory(prev => prev.map(h => {
          if (h.subject === subjectId && h.topic === oldName) {
              return { ...h, topic: trimmedNewName };
          }
          return h;
      }));
  };

  const addTopicsToSubject = (subjectId: string, newTopics: string[]) => {
      setSubjects(prev => prev.map(s => {
          if (s.id === subjectId) {
              const uniqueNew = newTopics.filter(t => !s.topics.includes(t));
              if (uniqueNew.length === 0) return s;
              const newStatuses = { ...(s.topicStatuses || {}) };
              uniqueNew.forEach(t => newStatuses[t] = 'not-started');
              return { ...s, topics: [...s.topics, ...uniqueNew], topicStatuses: newStatuses };
          }
          return s;
      }));
  };
  const loadCurriculum = (data: {name: string, topics: string[], icon: string, color: string}[]) => {
      setSubjects(prev => {
          const updated = [...prev];
          data.forEach((item, index) => {
              let sub = updated.find(s => s.name.toLowerCase() === item.name.toLowerCase());
              if (!sub) {
                  sub = { id: `auto_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`, name: item.name, icon: item.icon, color: item.color, topics: [], topicStatuses: {} };
                  updated.push(sub);
              }
              const uniqueNew = item.topics.filter(t => !sub!.topics.includes(t));
              const newStatuses = { ...(sub!.topicStatuses || {}) };
              uniqueNew.forEach(t => newStatuses[t] = 'not-started');
              sub!.topics = [...sub!.topics, ...uniqueNew];
              sub!.topicStatuses = newStatuses;
          });
          return updated;
      });
  };
  const removeTopicFromSubject = (subjectId: string, topic: string) => {
      setSubjects(prev => prev.map(s => {
          if (s.id === subjectId) {
              const newStatuses = { ...(s.topicStatuses || {}) };
              delete newStatuses[topic];
              return { ...s, topics: s.topics.filter(t => t !== topic), topicStatuses: newStatuses };
          }
          return s;
      }));
  };
  const clearSubjectTopics = (subjectId: string) => setSubjects(prev => prev.map(s => (s.id === subjectId ? { ...s, topics: [], topicStatuses: {} } : s)));
  const removeAllSubjects = () => setSubjects([]);
  const updateTopicStatus = (subjectId: string, topic: string, status: TopicStatus) => setSubjects(prev => prev.map(s => (s.id === subjectId ? { ...s, topicStatuses: { ...(s.topicStatuses || {}), [topic]: status } } : s)));

  const addTask = (title: string, priority: TaskPriority = 'medium', subjectId?: string, dueDate?: number) => setTasks(prev => [{ id: Date.now().toString(), title, isCompleted: false, priority, subjectId, dueDate, createdAt: Date.now() }, ...prev]);
  const editTask = (id: string, updates: Partial<Task>) => setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const updateSettings = (newSettings: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...newSettings }));

  const logManualSession = (subjectId: string, topic: string, durationMinutes: number, stats: QuestionStats, date?: Date) => {
      // Ensure stats are safe numbers
      const safeStats = {
          correct: Math.max(0, stats.correct || 0),
          incorrect: Math.max(0, stats.incorrect || 0),
          empty: Math.max(0, stats.empty || 0)
      };
      
      const totalQuestions = safeStats.correct + safeStats.incorrect + safeStats.empty;
      const efficiency = totalQuestions > 0 ? Math.round((safeStats.correct / totalQuestions) * 100) : -1;
      
      const newHistoryItem: StudySession = {
          id: Date.now().toString(),
          subject: subjectId, topic: topic, tags: ['#manuel-kayıt'], sessionNote: 'Hızlı test girişi ile eklendi.',
          date: getFormattedDate(date || new Date()), timestamp: date ? date.getTime() : Date.now(),
          durationMinutes: Math.max(0, durationMinutes), questionStats: safeStats, totalQuestions: totalQuestions, logs: [], efficiency: efficiency, status: 'completed',
      };
      setHistory(prev => [newHistoryItem, ...prev]);
  };

  const downloadCSV = (content: string, fileName: string) => {
      const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = fileName; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };
  const escapeCSV = (str: string | undefined | null) => {
      if (!str) return '';
      const s = String(str);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const exportHistoryToCSV = () => {
      const headers = ['Tarih', 'Saat', 'Ders', 'Konu', 'Etiketler', 'Süre (dk)', 'Doğru', 'Yanlış', 'Boş', 'Verim %', 'Durum', 'Not'];
      const rows = history.map(h => {
          const subjectName = subjects.find(s => s.id === h.subject)?.name || h.subject;
          const time = new Date(h.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
          return [
              h.date, time, escapeCSV(subjectName), escapeCSV(h.topic), escapeCSV(h.tags ? h.tags.join('; ') : ''),
              h.durationMinutes, h.questionStats?.correct||0, h.questionStats?.incorrect||0, h.questionStats?.empty||0, h.efficiency,
              h.status === 'completed' ? 'Tamamlandı' : 'Yarım Kaldı', escapeCSV(h.sessionNote)
          ].join(',');
      });
      downloadCSV([headers.join(','), ...rows].join('\n'), `studyflow_gecmis_${getFormattedDate()}.csv`);
  };
  const exportTasksToCSV = () => {
      const headers = ['Görev', 'Durum', 'Öncelik', 'Oluşturulma Tarihi'];
      const rows = tasks.map(t => {
          const date = new Date(t.createdAt).toLocaleDateString('tr-TR');
          const priority = t.priority === 'high' ? 'Yüksek' : t.priority === 'low' ? 'Düşük' : 'Orta';
          return [escapeCSV(t.title), t.isCompleted?'Tamamlandı':'Yapılacak', priority, date].join(',');
      });
      downloadCSV([headers.join(','), ...rows].join('\n'), `studyflow_gorevler_${getFormattedDate()}.csv`);
  };
  const exportData = () => {
      const data = { settings, history, subjects, tasks, version: '1.6' }; 
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `studyflow_backup_${getFormattedDate()}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };
  
  // ROBUST IMPORT IMPLEMENTATION
  const importData = (jsonStr: string): { success: boolean; message: string } => {
      try {
          const data = JSON.parse(jsonStr);
          if (!data || typeof data !== 'object') return { success: false, message: 'Geçersiz dosya formatı.' };
          
          // STRICT VALIDATION
          // Check for essential keys to ensure it's a StudyFlow backup
          if (!Array.isArray(data.history) && !Array.isArray(data.tasks) && !Array.isArray(data.subjects) && !data.settings) {
              return { success: false, message: 'Tanınmayan yedek dosyası. (Geçersiz Yapı)' };
          }
          
          // Safe Import Logic: Validate/Sanitize each item to prevent White Screen of Death
          if(Array.isArray(data.history)) {
              const safeHistory = data.history.map((h: any) => ({
                  ...h,
                  // Ensure ID exists, or generate one
                  id: h.id || `imported_${Date.now()}_${Math.random()}`,
                  // Ensure numeric fields are numbers
                  durationMinutes: typeof h.durationMinutes === 'number' ? h.durationMinutes : 0,
                  totalQuestions: typeof h.totalQuestions === 'number' ? h.totalQuestions : 0,
                  efficiency: typeof h.efficiency === 'number' ? h.efficiency : 0,
                  timestamp: typeof h.timestamp === 'number' ? h.timestamp : Date.now(),
                  // Ensure arrays and objects exist
                  tags: Array.isArray(h.tags) ? h.tags : [],
                  logs: Array.isArray(h.logs) ? h.logs : [],
                  questionStats: h.questionStats || {correct:0, incorrect:0, empty:0}
              }));
              setHistory(safeHistory);
          }

          if(Array.isArray(data.tasks)) {
              const safeTasks = data.tasks.map((t: any) => ({
                  ...t,
                  id: t.id || `task_${Date.now()}_${Math.random()}`,
                  isCompleted: !!t.isCompleted,
                  createdAt: t.createdAt || Date.now()
              }));
              setTasks(safeTasks);
          }

          if(Array.isArray(data.subjects)) {
              const safeSubjects = data.subjects.map((s: any) => ({
                  ...s,
                  id: s.id || `subj_${Date.now()}_${Math.random()}`,
                  topics: Array.isArray(s.topics) ? s.topics : [],
                  topicStatuses: s.topicStatuses || {}
              }));
              setSubjects(safeSubjects);
          }

          if(data.settings) setSettings({...settings, ...data.settings});
          
          return { success: true, message: 'Veriler başarıyla ve güvenle yüklendi.' };
      } catch (e) { return { success: false, message: 'Dosya okunamadı. JSON hatası.' }; }
  };
  
  const resetApp = () => { 
      // 1. Clear Storage
      localStorage.clear();
      
      // 2. Re-populate with defaults immediately to prevent crash on reload
      // This is crucial because "subjects" cannot be empty for some views
      localStorage.setItem('study_subjects', JSON.stringify(SUBJECTS));
      
      const defaultSettings = { 
          userName: 'Öğrenci', 
          userTitle: 'Hedef: Zirve 🚀',
          weeklyGoalMinutes: 1200, 
          darkMode: true, 
          soundEnabled: true, 
          soundVolume: 0.5, 
          themeColor: 'blue', 
          language: 'tr', 
          notificationsEnabled: true 
      };
      localStorage.setItem('study_settings', JSON.stringify(defaultSettings));

      // 3. Reload
      window.location.reload(); 
  };

  return (
    <StudyContext.Provider value={{
      history, subjects, settings, tasks, isSettingsOpen, installPrompt, setInstallPrompt,
      addHistoryItem, deleteHistoryItem, updateHistoryItem, addNewSubject, updateSubject, deleteSubject, 
      addTopicToSubject, addTopicsToSubject, loadCurriculum, removeTopicFromSubject, clearSubjectTopics, renameTopic,
      removeAllSubjects, updateTopicStatus, addTask, editTask, toggleTask, deleteTask, 
      toggleSettings, updateSettings, exportData, importData, exportHistoryToCSV, exportTasksToCSV, 
      resetApp, logManualSession, getFormattedDate
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // ... existing TimerProvider implementation (no changes needed here)
    const { addHistoryItem, getFormattedDate, settings } = useStudy(); // Timer needs access to data actions
    
    const [activeSession, setActiveSession] = useState<TimerContextType['activeSession']>(() => {
        try {
            const saved = localStorage.getItem('study_active_session');
            const parsed = saved ? JSON.parse(saved) : null;
            return parsed ? { ...parsed, tags: parsed.tags || [] } : null;
        } catch (e) { return null; }
    });

    const timerRef = useRef<number | null>(null);
    const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
    
    // Use refs for settings to avoid clearing interval when settings change,
    // but still have access to the latest values inside the interval closure.
    const settingsRef = useRef(settings);
    useEffect(() => { settingsRef.current = settings; }, [settings]);

    useEffect(() => {
        if (activeSession) localStorage.setItem('study_active_session', JSON.stringify(activeSession));
        else localStorage.removeItem('study_active_session');
    }, [activeSession]);

    // Audio Logic
    useEffect(() => {
        if (!activeSession || activeSession.isPaused || activeSession.isCompleted || !settings.soundEnabled) {
            if (ambientAudioRef.current) { ambientAudioRef.current.pause(); ambientAudioRef.current = null; }
            return;
        }
        if (activeSession.ambientSound && !ambientAudioRef.current) {
            let soundUrl = '';
            if(activeSession.ambientSound === 'rain') soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2464/2464-preview.mp3';
            else if(activeSession.ambientSound === 'forest') soundUrl = 'https://assets.mixkit.co/active_storage/sfx/138/138-preview.mp3';
            
            if(soundUrl) {
                const audio = new Audio(soundUrl);
                audio.loop = true; audio.volume = settings.soundVolume * 0.5;
                audio.play().catch(e => console.log('Audio error', e));
                ambientAudioRef.current = audio;
            }
        }
    }, [activeSession?.isActive, activeSession?.isPaused, activeSession?.ambientSound, settings.soundEnabled, settings.soundVolume]);

    const playAlarm = () => {
        // Use ref for settings to ensure we have latest volume even inside intervals
        const currentSettings = settingsRef.current;
        if (currentSettings.soundEnabled) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = currentSettings.soundVolume;
            audio.play().catch(e => console.log('Alarm error', e));
        }
        if (currentSettings.notificationsEnabled && Notification.permission === 'granted') {
            new Notification("Süre Doldu!", { body: "Oturum tamamlandı.", icon: "/icon.png" });
        }
    };

    // The Ticking Heartbeat - Robust Background Handling
    useEffect(() => {
        // Clear any existing timer to prevent duplicates
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (activeSession && activeSession.isActive && !activeSession.isPaused && !activeSession.isCompleted) {
            timerRef.current = window.setInterval(() => {
                setActiveSession(prev => {
                    if (!prev || prev.isPaused || prev.isCompleted) return prev;
                    
                    const now = Date.now();
                    // Fallback to now if lastTick is missing (legacy safety)
                    const lastTick = prev.lastTick || now; 
                    const delta = now - lastTick;

                    // If less than 1 second passed (micro-throttling), do nothing
                    if (delta < 1000) return prev;
                    
                    // Calculate precise seconds passed (robust against background tab sleep)
                    const secondsPassed = Math.floor(delta / 1000);
                    
                    // Calculate new anchor time aligned to the second boundary to prevent drift
                    const remainder = delta % 1000;
                    const newLastTick = now - remainder;

                    if (prev.mode === 'stopwatch') {
                        return { 
                            ...prev, 
                            timeLeft: prev.timeLeft + secondsPassed, 
                            lastTick: newLastTick 
                        };
                    } else {
                        const newTime = prev.timeLeft - secondsPassed;
                        
                        if (newTime <= 0) {
                            playAlarm();
                            return { 
                                ...prev, 
                                timeLeft: 0, 
                                isCompleted: true, 
                                lastTick: newLastTick 
                            };
                        }
                        
                        return { 
                            ...prev, 
                            timeLeft: newTime, 
                            lastTick: newLastTick 
                        };
                    }
                });
            }, 1000);
        }
        
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [activeSession?.isActive, activeSession?.isPaused, activeSession?.isCompleted]); // Minimized dependencies for stability

    const startSession = (mode: TimerMode, subjectId: string, topic: string, tags: string[], durationMinutes: number, goal: number, ambient: string | null, taskId?: string) => {
        if (Notification.permission === 'default') Notification.requestPermission();
        const now = Date.now();
        setActiveSession({
            isActive: true, mode, subjectId, topic, tags, sessionNote: '',
            totalDuration: durationMinutes * 60,
            timeLeft: mode === 'stopwatch' ? 0 : durationMinutes * 60,
            isPaused: false, isCompleted: false, questionGoal: goal,
            stats: { correct: 0, incorrect: 0, empty: 0 }, logs: [],
            ambientSound: ambient, startTime: now, lastTick: now, linkedTaskId: taskId
        });
    };

    const pauseSession = () => setActiveSession(prev => prev ? { ...prev, isPaused: true, lastTick: undefined } : null);
    
    // Important: Update lastTick to NOW when resuming to prevent huge jumps from background sleep time
    const resumeSession = () => setActiveSession(prev => prev ? { ...prev, isPaused: false, lastTick: Date.now() } : null);
    
    const stopSession = (status: 'completed' | 'interrupted') => {
        if (!activeSession) return;
        const sessionDurationMinutes = activeSession.mode === 'stopwatch' 
            ? Math.floor(activeSession.timeLeft / 60)
            : Math.floor((activeSession.totalDuration - activeSession.timeLeft) / 60);
        
        const totalQuestions = activeSession.stats.correct + activeSession.stats.incorrect + activeSession.stats.empty;
        const efficiency = totalQuestions > 0 ? Math.round((activeSession.stats.correct / totalQuestions) * 100) : -1; 

        addHistoryItem({
            id: Date.now().toString(),
            subject: activeSession.subjectId, topic: activeSession.topic, tags: activeSession.tags || [],
            sessionNote: activeSession.sessionNote, date: getFormattedDate(), timestamp: Date.now(),
            durationMinutes: Math.max(1, sessionDurationMinutes), questionStats: activeSession.stats,
            totalQuestions: totalQuestions, logs: activeSession.logs, efficiency: efficiency, status: status,
        });
        setActiveSession(null);
    };

    const finishSession = (finalStats?: QuestionStats) => {
        setActiveSession(current => {
            if (!current) return null;
            if (!finalStats && !current.isCompleted) {
                return { ...current, isCompleted: true, isPaused: true }; 
            }
            const sessionDurationMinutes = current.mode === 'stopwatch' 
              ? Math.floor(current.timeLeft / 60)
              : Math.floor((current.totalDuration - current.timeLeft) / 60);
            
            const statsToUse = finalStats || current.stats;
            const totalQuestions = statsToUse.correct + statsToUse.incorrect + statsToUse.empty;
            const efficiency = totalQuestions > 0 ? Math.round((statsToUse.correct / totalQuestions) * 100) : -1;
            
            addHistoryItem({
                id: Date.now().toString(),
                subject: current.subjectId, topic: current.topic, tags: current.tags || [],
                sessionNote: current.sessionNote, date: getFormattedDate(), timestamp: Date.now(),
                durationMinutes: Math.max(1, sessionDurationMinutes), questionStats: statsToUse,
                totalQuestions: totalQuestions, logs: current.logs, efficiency: efficiency, status: 'completed',
            });
            return null;
        });
    };

    const restartSession = () => {
        if (!activeSession) return;
        setActiveSession({ ...activeSession, timeLeft: activeSession.mode === 'stopwatch' ? 0 : activeSession.totalDuration, isPaused: false, isCompleted: false, stats: { correct: 0, incorrect: 0, empty: 0 }, logs: [], lastTick: Date.now() });
    };

    const updateQuestionStats = (type: keyof QuestionStats, amount: number) => {
        setActiveSession(prev => {
            if (!prev) return null;
            const newVal = Math.max(0, prev.stats[type] + amount);
            return { ...prev, stats: { ...prev.stats, [type]: newVal } };
        });
    };

    const addTestLog = (log: Omit<TestLog, 'id' | 'timestamp'>) => {
        setActiveSession(prev => {
            if (!prev) return null;
            const newLog: TestLog = { ...log, id: Date.now().toString(), timestamp: Date.now() };
            const newStats = { correct: prev.stats.correct + log.correct, incorrect: prev.stats.incorrect + log.incorrect, empty: prev.stats.empty + log.empty };
            return { ...prev, logs: [...prev.logs, newLog], stats: newStats };
        });
    };

    const removeTestLog = (id: string) => {
        setActiveSession(prev => {
            if(!prev) return null;
            const log = prev.logs.find(l => l.id === id);
            if(!log) return prev;
            const newStats = { correct: Math.max(0, prev.stats.correct - log.correct), incorrect: Math.max(0, prev.stats.incorrect - log.incorrect), empty: Math.max(0, prev.stats.empty - log.empty) };
            return { ...prev, logs: prev.logs.filter(l => l.id !== id), stats: newStats };
        });
    };

    const updateActiveSessionNote = (note: string) => setActiveSession(prev => prev ? { ...prev, sessionNote: note } : null);
    const updateActiveSessionTopic = (topic: string) => setActiveSession(prev => prev ? { ...prev, topic: topic } : null);
    const adjustActiveSessionTime = (minutes: number) => {
        setActiveSession(prev => {
            if (!prev) return null;
            if (prev.mode === 'stopwatch') return prev;
            const newTime = Math.max(0, prev.timeLeft + (minutes * 60));
            return { ...prev, timeLeft: newTime };
        });
    };

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <TimerContext.Provider value={{
            activeSession, startSession, pauseSession, resumeSession, stopSession, finishSession, restartSession,
            updateQuestionStats, addTestLog, removeTestLog, updateActiveSessionNote, updateActiveSessionTopic, 
            adjustActiveSessionTime, formatTime
        }}>
            {children}
        </TimerContext.Provider>
    );
};
