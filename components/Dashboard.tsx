
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Zap, Plus, Minus, FilePlus2, 
  Trophy, StickyNote, BarChart3, AlertTriangle, 
  Maximize2, Minimize2, Trash2, PenLine, CheckSquare, 
  ListTodo, ClipboardEdit, Flame, Clock, Calendar, ArrowRight, History, XCircle,
  MoreHorizontal
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid, XAxis } from 'recharts';
import { useStudy, useTimer } from '../context/StudyContext';
import { ViewState, TaskPriority } from '../types';

// --- Sub-Components (Clean & Consistent) ---

const StatCard = ({ title, value, icon: Icon, colorClass, subText }: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-full transition-all hover:shadow-md hover:scale-[1.02]">
        <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</span>
            <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon size={16} />
            </div>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
            {subText && <span className="text-xs font-medium text-slate-400">{subText}</span>}
        </div>
    </div>
);

const SectionHeader = ({ title, icon: Icon }: { title: string, icon?: any }) => (
    <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-primary" />}
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">{title}</h3>
    </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-slate-700">
          <p className="font-bold mb-1 opacity-70">{label}</p>
          <p className="font-bold text-sm">
            {payload[0].value} dakika
          </p>
        </div>
      );
    }
    return null;
};

// --- Extracted Summary View ---
const SessionSummary = ({ activeSession, finishSession, toggleTask }: { activeSession: any, finishSession: any, toggleTask: any }) => {
    const [summaryStats, setSummaryStats] = useState({ 
        correct: activeSession.stats.correct.toString(), 
        incorrect: activeSession.stats.incorrect.toString(), 
        empty: activeSession.stats.empty.toString() 
    });
    const [markTaskCompleted, setMarkTaskCompleted] = useState(true);

    const elapsedMinutes = Math.floor((activeSession.mode === 'stopwatch' 
        ? activeSession.timeLeft 
        : (activeSession.totalDuration - activeSession.timeLeft)) / 60);

    const handleFinish = () => {
        if (activeSession.linkedTaskId && markTaskCompleted) toggleTask(activeSession.linkedTaskId);
        finishSession({
            correct: parseInt(summaryStats.correct) || 0,
            incorrect: parseInt(summaryStats.incorrect) || 0,
            empty: parseInt(summaryStats.empty) || 0
        });
    };
    
    // Prevent negative inputs
    const handleStatChange = (field: string, value: string) => {
        const val = parseInt(value);
        if (value === '' || (!isNaN(val) && val >= 0)) {
            setSummaryStats(prev => ({ ...prev, [field]: value }));
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-slide-up text-center max-w-lg mx-auto px-4">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20 animate-blob">
                <Trophy size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Oturum Tamamlandı!</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeSession.topic}</span> çalışman sona erdi.
            </p>

            {activeSession.linkedTaskId && (
                <div 
                    onClick={() => setMarkTaskCompleted(!markTaskCompleted)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all mb-6 text-left ${markTaskCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                >
                    <div className={`text-${markTaskCompleted ? 'green-500' : 'slate-300'}`}>
                        {markTaskCompleted ? <CheckSquare size={20} /> : <CheckSquare size={20} />}
                    </div>
                    <div>
                        <p className={`text-sm font-bold ${markTaskCompleted ? 'text-green-700 dark:text-green-300' : 'text-slate-600 dark:text-slate-400'}`}>Bağlı Görevi Tamamla</p>
                    </div>
                </div>
            )}

            <div className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase font-bold">Süre</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{elapsedMinutes} dk</p>
                     </div>
                     <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <p className="text-xs text-slate-400 uppercase font-bold">Toplam Soru</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{(parseInt(summaryStats.correct)||0) + (parseInt(summaryStats.incorrect)||0) + (parseInt(summaryStats.empty)||0)}</p>
                     </div>
                </div>
                
                <p className="text-xs font-bold text-slate-400 uppercase mb-3 text-left">Sonuçları Gir</p>
                <div className="grid grid-cols-3 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-green-600 uppercase block text-center">Doğru</label>
                        <input type="number" className="w-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-lg py-2 text-center font-bold text-green-700 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500/50" value={summaryStats.correct} onChange={(e) => handleStatChange('correct', e.target.value)} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-red-600 uppercase block text-center">Yanlış</label>
                        <input type="number" className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg py-2 text-center font-bold text-red-700 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50" value={summaryStats.incorrect} onChange={(e) => handleStatChange('incorrect', e.target.value)} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase block text-center">Boş</label>
                        <input type="number" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 text-center font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400/50" value={summaryStats.empty} onChange={(e) => handleStatChange('empty', e.target.value)} />
                     </div>
                </div>
            </div>

            <button onClick={handleFinish} className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                Kaydet ve Bitir
            </button>
        </div>
    );
};

// --- Modals Wrapper ---
const Modals = React.memo(({ 
    isTestModalOpen, setIsTestModalOpen, 
    isStopConfirmOpen, setIsStopConfirmOpen, 
    isEditTopicOpen, setIsEditTopicOpen,
    isQuickTaskOpen, setIsQuickTaskOpen,
    isManualLogOpen, setIsManualLogOpen,
    activeSession, subjects, confirmStopSession, updateTopic, addTestLog, addTask, logManualSession
}: any) => {
    // Reuse existing logic from previous implementation
    const [testForm, setTestForm] = useState({ name: '', subjectId: '', topic: '', totalQuestions: '', correct: '', incorrect: '', empty: '', note: '' });
    const [tempTopic, setTempTopic] = useState('');
    const [quickTaskTitle, setQuickTaskTitle] = useState('');
    const [quickTaskPriority, setQuickTaskPriority] = useState<TaskPriority>('medium');
    const [manualForm, setManualForm] = useState({ subjectId: subjects[0]?.id || '', topic: '', duration: '', correct: '', incorrect: '', empty: '' });

    useEffect(() => {
        if (isTestModalOpen && activeSession) setTestForm(prev => ({ ...prev, subjectId: activeSession.subjectId, topic: activeSession.topic }));
        if (isEditTopicOpen && activeSession) setTempTopic(activeSession.topic);
    }, [isTestModalOpen, isEditTopicOpen, activeSession]);
    
    // Manual Log subject update fix
    useEffect(() => {
        if (isManualLogOpen && !manualForm.subjectId && subjects.length > 0) {
            setManualForm(prev => ({ ...prev, subjectId: subjects[0].id }));
        }
    }, [isManualLogOpen, subjects]);

    // Auto Calc Empty
    useEffect(() => {
        const t = parseInt(testForm.totalQuestions) || 0;
        const c = parseInt(testForm.correct) || 0;
        const i = parseInt(testForm.incorrect) || 0;
        // Only auto-calc if total is entered and valid
        if(t > 0 && c + i <= t) {
             setTestForm(prev => ({ ...prev, empty: (t - (c + i)).toString() }));
        }
    }, [testForm.totalQuestions, testForm.correct, testForm.incorrect]);

    const handleAddTest = () => {
        addTestLog({
            name: testForm.name || `Test`,
            subjectId: testForm.subjectId || activeSession?.subjectId,
            topic: testForm.topic || activeSession?.topic,
            correct: parseInt(testForm.correct)||0,
            incorrect: parseInt(testForm.incorrect)||0,
            empty: parseInt(testForm.empty)||0,
            note: testForm.note
        });
        setTestForm({ name: '', subjectId: '', topic: '', totalQuestions: '', correct: '', incorrect: '', empty: '', note: '' });
        setIsTestModalOpen(false);
    };

    const handleQuickTaskAdd = () => {
        if (quickTaskTitle.trim()) {
            addTask(quickTaskTitle.trim(), quickTaskPriority);
            setQuickTaskTitle(''); setQuickTaskPriority('medium'); setIsQuickTaskOpen(false);
        }
    };

    const handleManualLog = () => {
        if (!manualForm.topic.trim()) return;
        logManualSession(
            manualForm.subjectId, manualForm.topic.trim(), parseInt(manualForm.duration) || 0,
            { correct: parseInt(manualForm.correct) || 0, incorrect: parseInt(manualForm.incorrect) || 0, empty: parseInt(manualForm.empty) || 0 }
        );
        setManualForm({ subjectId: subjects[0]?.id || '', topic: '', duration: '', correct: '', incorrect: '', empty: '' });
        setIsManualLogOpen(false);
    };

    return (
        <>
            {isTestModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-slide-up space-y-4 relative">
                        <button onClick={()=>setIsTestModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><XCircle size={24}/></button>
                        <h3 className="font-bold text-lg dark:text-white">Test Sonucu Ekle</h3>
                        <input type="text" placeholder="Başlık (Opsiyonel)" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:border-primary focus:outline-none" value={testForm.name} onChange={e=>setTestForm({...testForm, name: e.target.value})} autoFocus/>
                        <div className="grid grid-cols-4 gap-2">
                             <input type="number" placeholder="Top." className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center font-bold dark:text-white" value={testForm.totalQuestions} onChange={e=>setTestForm({...testForm, totalQuestions: e.target.value})}/>
                             <input type="number" placeholder="D" className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-center font-bold text-green-600" value={testForm.correct} onChange={e=>setTestForm({...testForm, correct: e.target.value})}/>
                             <input type="number" placeholder="Y" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-center font-bold text-red-600" value={testForm.incorrect} onChange={e=>setTestForm({...testForm, incorrect: e.target.value})}/>
                             <input type="number" placeholder="B" className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-500" value={testForm.empty} onChange={e=>setTestForm({...testForm, empty: e.target.value})}/>
                        </div>
                        <input type="text" placeholder="Not ekle..." className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white text-sm focus:border-primary focus:outline-none" value={testForm.note} onChange={e=>setTestForm({...testForm, note: e.target.value})}/>
                        <button onClick={handleAddTest} className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20">Kaydet</button>
                    </div>
                </div>
            )}
            {isEditTopicOpen && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg dark:text-white mb-4">Konuyu Düzenle</h3>
                        <input type="text" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white mb-4 focus:border-primary focus:outline-none" value={tempTopic} onChange={(e) => setTempTopic(e.target.value)} autoFocus />
                        <div className="flex justify-end gap-2">
                            <button onClick={()=>setIsEditTopicOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">İptal</button>
                            <button onClick={()=>{updateTopic(tempTopic); setIsEditTopicOpen(false)}} className="px-4 py-2 bg-primary text-white rounded-xl font-bold">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
            {isStopConfirmOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center animate-slide-up border border-slate-200 dark:border-slate-700">
                        <AlertTriangle size={48} className="mx-auto text-red-500 mb-4"/>
                        <h3 className="font-bold text-xl dark:text-white mb-2">Bitirmek istiyor musun?</h3>
                        <p className="text-slate-500 mb-6 text-sm">Oturum süresi dolmadan bitirirsen "Yarım Kaldı" olarak işaretlenecek.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={()=>setIsStopConfirmOpen(false)} className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Devam Et</button>
                            <button onClick={confirmStopSession} className="py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">Bitir</button>
                        </div>
                    </div>
                </div>
            )}
            {isQuickTaskOpen && (
                 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up border border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-lg dark:text-white mb-4">Hızlı Görev Ekle</h3>
                        <input type="text" placeholder="Görev adı..." className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white mb-4 focus:border-primary focus:outline-none" value={quickTaskTitle} onChange={(e) => setQuickTaskTitle(e.target.value)} autoFocus />
                         <div className="flex gap-2 mb-6">
                            {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                                <button key={p} onClick={() => setQuickTaskPriority(p)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${quickTaskPriority===p ? (p==='high'?'bg-red-500 text-white border-red-500':p==='medium'?'bg-yellow-500 text-white border-yellow-500':'bg-blue-500 text-white border-blue-500') : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                    {p === 'high' ? 'Yüksek' : p === 'medium' ? 'Orta' : 'Düşük'}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={()=>setIsQuickTaskOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">İptal</button>
                            <button onClick={handleQuickTaskAdd} className="px-4 py-2 bg-primary text-white rounded-xl font-bold">Ekle</button>
                        </div>
                    </div>
                </div>
            )}
            {isManualLogOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-slide-up space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 relative">
                        <button onClick={()=>setIsManualLogOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><XCircle size={24}/></button>
                        <h3 className="font-bold text-lg dark:text-white">Manuel Çalışma Kaydı</h3>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">Ders Seçimi</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                {subjects.map((s:any) => (
                                    <button key={s.id} onClick={()=>setManualForm({...manualForm, subjectId: s.id})} className={`px-3 py-1.5 rounded-lg border whitespace-nowrap text-sm font-medium transition-colors ${manualForm.subjectId===s.id ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input type="text" placeholder="Konu başlığı..." className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:border-primary focus:outline-none" value={manualForm.topic} onChange={e=>setManualForm({...manualForm, topic: e.target.value})}/>
                        <input type="number" placeholder="Süre (Dakika)" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:border-primary focus:outline-none" value={manualForm.duration} onChange={e=>setManualForm({...manualForm, duration: e.target.value})}/>
                        
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-slate-400 uppercase">Soru İstatistikleri (Opsiyonel)</label>
                             <div className="grid grid-cols-3 gap-2">
                                 <input type="number" placeholder="Doğru" className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-center font-bold text-green-600 focus:outline-none focus:ring-1 focus:ring-green-500" value={manualForm.correct} onChange={e=>setManualForm({...manualForm, correct: e.target.value})}/>
                                 <input type="number" placeholder="Yanlış" className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-center font-bold text-red-600 focus:outline-none focus:ring-1 focus:ring-red-500" value={manualForm.incorrect} onChange={e=>setManualForm({...manualForm, incorrect: e.target.value})}/>
                                 <input type="number" placeholder="Boş" className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-400" value={manualForm.empty} onChange={e=>setManualForm({...manualForm, empty: e.target.value})}/>
                            </div>
                        </div>
                        
                        <button onClick={handleManualLog} className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all mt-4">Kaydet</button>
                    </div>
                </div>
            )}
        </>
    );
});


// --- Main Dashboard Component ---

interface DashboardProps { onChangeView: (view: ViewState) => void; }

export const Dashboard: React.FC<DashboardProps> = ({ onChangeView }) => {
  // Use Study for static data, Timer for dynamic data
  const { history, subjects, toggleTask, settings, toggleSettings, addTask, logManualSession } = useStudy();
  
  const { 
      activeSession, pauseSession, resumeSession, stopSession, finishSession, restartSession, 
      formatTime, updateQuestionStats, addTestLog, removeTestLog,
      updateActiveSessionNote, updateActiveSessionTopic, adjustActiveSessionTime
  } = useTimer();

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [isStopConfirmOpen, setIsStopConfirmOpen] = useState(false);
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false); 
  const [isManualLogOpen, setIsManualLogOpen] = useState(false); 
  const [isZenMode, setIsZenMode] = useState(false);

  // --- Calculations ---

  const greeting = useMemo(() => {
      const hour = new Date().getHours();
      const name = settings.userName || 'Öğrenci';
      return hour < 12 ? `Günaydın, ${name}` : hour < 18 ? `İyi Günler, ${name}` : `İyi Akşamlar, ${name}`;
  }, [settings.userName]);

  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('tr-TR');
        const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
        const total = history.filter(h => h.date === dateStr).reduce((acc, curr) => acc + curr.durationMinutes, 0);
        days.push({ name: dayName, value: total });
    }
    return days;
  }, [history]);

  const todayStats = useMemo(() => {
      const today = new Date().toLocaleDateString('tr-TR');
      const sessions = history.filter(s => s.date === today);
      return {
          minutes: sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0),
          questions: sessions.reduce((acc, curr) => acc + curr.totalQuestions, 0),
          count: sessions.length
      };
  }, [history]);

  const streak = useMemo(() => {
      if (history.length === 0) return 0;
      const uniqueDates = (Array.from(new Set(history.map(h => h.date))) as string[]).sort((a, b) => {
          const da = new Date(a.split('.').reverse().join('-'));
          const db = new Date(b.split('.').reverse().join('-'));
          return db.getTime() - da.getTime();
      });
      
      const today = new Date().toLocaleDateString('tr-TR');
      const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toLocaleDateString('tr-TR');

      if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

      let count = 1;
      let checkDate = new Date(uniqueDates[0].split('.').reverse().join('-'));
      
      for(let i=1; i<uniqueDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          if (uniqueDates[i] === checkDate.toLocaleDateString('tr-TR')) count++;
          else break;
      }
      return count;
  }, [history]);

  const weeklyMinutes = useMemo(() => {
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1; 
      const monday = new Date(now);
      monday.setDate(now.getDate() - diff);
      monday.setHours(0,0,0,0);
      return history.filter(h => h.timestamp >= monday.getTime()).reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }, [history]);

  // Goal Progress
  const goalPercentage = settings.weeklyGoalMinutes > 0 
    ? Math.min(100, Math.round((weeklyMinutes / settings.weeklyGoalMinutes) * 100)) 
    : 0;
    
  // Fixed Ring Geometry for 160x160 Box
  const ringRadius = 70; // r=70 fits in 160 with 10px stroke (70+5=75, center 80, 5px margin)
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (goalPercentage / 100) * ringCircumference;

  // Circle Progress (Active Session)
  const isInfiniteStopwatch = activeSession?.mode === 'stopwatch' && activeSession?.totalDuration === 0;
  
  // GAUGE LOGIC
  const TOTAL_TICKS = 60; // Like a clock
  const activeTicks = useMemo(() => {
      if (!activeSession) return 0;
      if (isInfiniteStopwatch) {
          // Animated spinning effect simulation or seconds based
          // OLD: return (activeSession.timeLeft % 60); 
          // NEW: Rotate over 1 hour (60 minutes) instead of 1 minute (60 seconds)
          // We floor the seconds to get minutes, then mod 60 for the ring position.
          return Math.floor(activeSession.timeLeft / 60) % 60; 
      }
      // Calculate remaining percentage
      const total = activeSession.totalDuration;
      const left = activeSession.timeLeft;
      const fraction = (total - left) / total;
      return Math.floor(fraction * TOTAL_TICKS);
  }, [activeSession?.timeLeft, activeSession?.totalDuration, isInfiniteStopwatch]);


  // --- Render Views ---

  if (activeSession && activeSession.isCompleted) {
      return <SessionSummary activeSession={activeSession} finishSession={finishSession} toggleTask={toggleTask} />;
  }

  if (activeSession) {
      const containerClasses = isZenMode 
        ? "fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-4 animate-fade-in" 
        : "space-y-6 animate-slide-up relative";

      return (
        <div className={containerClasses}>
          <Modals 
            isTestModalOpen={isTestModalOpen} setIsTestModalOpen={setIsTestModalOpen}
            isStopConfirmOpen={isStopConfirmOpen} setIsStopConfirmOpen={setIsStopConfirmOpen}
            isEditTopicOpen={isEditTopicOpen} setIsEditTopicOpen={setIsEditTopicOpen}
            isQuickTaskOpen={isQuickTaskOpen} setIsQuickTaskOpen={setIsQuickTaskOpen}
            activeSession={activeSession} subjects={subjects}
            confirmStopSession={() => { stopSession('interrupted'); setIsStopConfirmOpen(false); }}
            updateTopic={updateActiveSessionTopic} addTestLog={addTestLog} addTask={addTask}
          />

          {!isZenMode && (
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Odak Modu</h1>
                <button onClick={() => setIsZenMode(true)} className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                    <Maximize2 size={16} /> <span className="text-xs font-bold">Zen</span>
                </button>
            </div>
          )}

          {isZenMode && (
             <button onClick={() => setIsZenMode(false)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-50 backdrop-blur-md">
                <Minimize2 size={24} />
             </button>
          )}

          <div className={`grid grid-cols-1 ${isZenMode ? 'w-full max-w-4xl' : 'lg:grid-cols-3'} gap-6`}>
            
            {/* --- NEW MODERN TIMER COCKPIT (GAUGE STYLE) --- */}
            <div className={`
                ${isZenMode ? 'w-full aspect-square flex items-center justify-center' : 'lg:col-span-2'} 
                bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-12 shadow-sm flex flex-col items-center justify-between relative overflow-hidden transition-all duration-500
            `}>
                {/* Top Info */}
                <div className="z-10 text-center cursor-pointer hover:opacity-80 transition-opacity mb-4" onClick={() => setIsEditTopicOpen(true)}>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                        {subjects.find(s=>s.id === activeSession.subjectId)?.name || 'Ders'}
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                        {activeSession.topic} <PenLine size={18} className="text-primary opacity-50"/>
                    </div>
                </div>

                {/* The Gauge Clock Visual */}
                <div className="relative flex-1 flex items-center justify-center w-full max-w-[400px] aspect-square my-4">
                    <svg className="w-full h-full" viewBox="0 0 400 400">
                        <defs>
                            {/* Modern Gradient for Ticks - User Space to span the whole gauge */}
                            <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#06b6d4" />  {/* Cyan */}
                                <stop offset="50%" stopColor="#8b5cf6" /> {/* Violet */}
                                <stop offset="100%" stopColor="#ec4899" /> {/* Pink */}
                            </linearGradient>
                            
                            <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        
                        {/* 1. Background Ticks (Gray) */}
                        {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
                            const angle = (i * 6) - 90; // Start from top (-90 deg)
                            const isMajor = i % 5 === 0;
                            // Math for ticks
                            const rad = angle * (Math.PI / 180);
                            const outerR = 160;
                            const innerR = isMajor ? 140 : 145;
                            const x1 = 200 + innerR * Math.cos(rad);
                            const y1 = 200 + innerR * Math.sin(rad);
                            const x2 = 200 + outerR * Math.cos(rad);
                            const y2 = 200 + outerR * Math.sin(rad);

                            return (
                                <line 
                                    key={`bg-${i}`} 
                                    x1={x1} y1={y1} x2={x2} y2={y2} 
                                    stroke="currentColor" 
                                    strokeWidth={isMajor ? 2 : 1}
                                    className="text-slate-200 dark:text-slate-700/50"
                                />
                            );
                        })}

                        {/* 2. Active Ticks (Gradient) */}
                        {Array.from({ length: activeTicks }).map((_, i) => {
                            const angle = (i * 6) - 90;
                            const isMajor = i % 5 === 0;
                            const rad = angle * (Math.PI / 180);
                            const outerR = 160;
                            const innerR = isMajor ? 140 : 145;
                            const x1 = 200 + innerR * Math.cos(rad);
                            const y1 = 200 + innerR * Math.sin(rad);
                            const x2 = 200 + outerR * Math.cos(rad);
                            const y2 = 200 + outerR * Math.sin(rad);

                            return (
                                <line 
                                    key={`active-${i}`} 
                                    x1={x1} y1={y1} x2={x2} y2={y2} 
                                    stroke="url(#gaugeGradient)" 
                                    strokeWidth={isMajor ? 3 : 2}
                                    strokeLinecap="round"
                                />
                            );
                        })}

                        {/* 3. The Needle / Indicator (Current Position) */}
                        {(() => {
                            // Needle Position
                            const currentTickIndex = activeTicks > 0 ? activeTicks - 1 : 0;
                            const angle = (currentTickIndex * 6) - 90;
                            const rad = angle * (Math.PI / 180);
                            // Make needle distinct
                            const needleInner = 135; 
                            const needleOuter = 165;
                            const nx1 = 200 + needleInner * Math.cos(rad);
                            const ny1 = 200 + needleInner * Math.sin(rad);
                            const nx2 = 200 + needleOuter * Math.cos(rad);
                            const ny2 = 200 + needleOuter * Math.sin(rad);
                            
                            return (
                                <line 
                                    x1={nx1} y1={ny1} x2={nx2} y2={ny2}
                                    stroke="#f43f5e" // Rose-500
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    filter="url(#needleGlow)"
                                    className="transition-all duration-300 ease-out"
                                />
                            );
                        })()}

                        {/* Decorative Inner Circle Text Track */}
                        <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-100 dark:text-slate-800 opacity-50" />
                    </svg>
                    
                    {/* Time Display */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl sm:text-7xl md:text-8xl font-light text-slate-800 dark:text-white font-mono tracking-tighter tabular-nums drop-shadow-lg">
                            {formatTime(activeSession.timeLeft)}
                        </span>
                        
                        {activeSession.isPaused ? (
                            <div className="mt-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 font-bold text-xs animate-pulse flex items-center gap-1">
                                <Pause size={12} fill="currentColor"/> Duraklatıldı
                            </div>
                        ) : (
                             <div className="mt-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center gap-1">
                                {activeSession.mode === 'stopwatch' ? 'Kronometre' : 'Kalan Süre'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 z-10 w-full justify-center max-w-md mt-4">
                    <button onClick={() => setIsStopConfirmOpen(true)} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95" title="Bitir"><Trash2 size={24}/></button>
                    <button onClick={activeSession.isPaused ? resumeSession : pauseSession} className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
                        {activeSession.isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                        <span>{activeSession.isPaused ? 'Devam Et' : 'Duraklat'}</span>
                    </button>
                    <button onClick={restartSession} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95" title="Yeniden Başlat"><RotateCcw size={24}/></button>
                </div>
            </div>

            {/* Right Stats Column */}
            {!isZenMode && (
            <div className="space-y-6 flex flex-col">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex-1">
                    <SectionHeader title="Canlı İstatistik" icon={BarChart3} />
                    <div className="space-y-3">
                        <CounterRow label="Doğru" color="green" val={activeSession.stats.correct} onUpdate={(n) => updateQuestionStats('correct', n)} />
                        <CounterRow label="Yanlış" color="red" val={activeSession.stats.incorrect} onUpdate={(n) => updateQuestionStats('incorrect', n)} />
                        <CounterRow label="Boş" color="slate" val={activeSession.stats.empty} onUpdate={(n) => updateQuestionStats('empty', n)} />
                    </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <div className="relative mb-4">
                        <StickyNote size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input type="text" placeholder="Not ekle..." className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-primary focus:outline-none dark:text-white" value={activeSession.sessionNote || ''} onChange={(e) => updateActiveSessionNote(e.target.value)} />
                    </div>
                    <button onClick={() => setIsTestModalOpen(true)} className="w-full py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                        <FilePlus2 size={18} /> <span>Test Sonucu Ekle</span>
                    </button>
                    
                    {activeSession.logs.length > 0 && (
                         <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                             <p className="text-xs font-bold text-slate-400 uppercase mb-2">Eklenenler</p>
                             <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {activeSession.logs.map(log => (
                                    <div key={log.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                                        <span className="truncate w-24 font-medium dark:text-slate-300">{log.name}</span>
                                        <div className="flex space-x-2 font-mono">
                                            <span className="text-green-500">{log.correct}D</span>
                                            <span className="text-red-500">{log.incorrect}Y</span>
                                            <button onClick={() => removeTestLog(log.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={12}/></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                         </div>
                    )}
                </div>
            </div>
            )}
          </div>
        </div>
      );
  }

  // --- DASHBOARD (Main View) ---
  return (
    <div className="space-y-6 pb-24 animate-slide-up">
         <Modals 
            isQuickTaskOpen={isQuickTaskOpen} setIsQuickTaskOpen={setIsQuickTaskOpen}
            isManualLogOpen={isManualLogOpen} setIsManualLogOpen={setIsManualLogOpen}
            addTask={addTask} 
            subjects={subjects}
            logManualSession={logManualSession}
            activeSession={null} // Main view has no active session context passed this way
         />
         
         {/* 1. Header: Greeting & Primary Action */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{greeting}</h1>
                 <p className="text-slate-500 dark:text-slate-400 text-sm">Bugünkü hedeflerine odaklan.</p>
             </div>
             <div className="flex gap-3">
                <button onClick={() => setIsManualLogOpen(true)} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-2 shadow-sm">
                     <ClipboardEdit size={16}/> <span className="hidden sm:inline">Hızlı Kayıt</span>
                 </button>
                 <button onClick={() => onChangeView('new-session')} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:brightness-105 transition flex items-center gap-2">
                     <Zap size={16}/> Oturum Başlat
                 </button>
             </div>
         </div>

         {/* 2. Stats Grid (Clean & Consistent) */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <StatCard title="Seri (Gün)" value={streak} icon={Flame} colorClass="text-orange-500 bg-orange-500" />
             <StatCard title="Bugün (Dk)" value={Math.floor(todayStats.minutes)} icon={Clock} colorClass="text-blue-500 bg-blue-500" />
             <StatCard title="Soru" value={todayStats.questions} icon={CheckSquare} colorClass="text-green-500 bg-green-500" />
             <StatCard title="Oturum" value={todayStats.count} icon={ListTodo} colorClass="text-purple-500 bg-purple-500" />
         </div>

         {/* 3. Main Visuals: Activity Chart & Weekly Goal */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Left: Activity Area Chart */}
             <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <SectionHeader title="Haftalık Aktivite" icon={BarChart3} />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {Math.floor(weeklyMinutes / 60)}<span className="text-sm font-normal text-slate-400">sa</span> {weeklyMinutes % 60}<span className="text-sm font-normal text-slate-400">dk</span>
                    </span>
                 </div>
                 <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                            <Tooltip content={<CustomTooltip />} cursor={{stroke: 'var(--color-primary)', strokeWidth: 1}} />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="var(--color-primary)" 
                                strokeWidth={2} 
                                fill="url(#colorWeekly)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
             </div>

             {/* Right: Weekly Goal Ring */}
             <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col items-center justify-center relative">
                 <div className="w-full flex justify-between items-center absolute top-6 px-6">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Haftalık Hedef</span>
                     <button onClick={toggleSettings} className="text-xs text-primary font-bold hover:underline">Düzenle</button>
                 </div>
                 
                 <div className="relative mt-4 flex items-center justify-center">
                     <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 160 160">
                         {/* Background Track */}
                         <circle 
                            cx="80" cy="80" r={ringRadius} 
                            stroke="currentColor" 
                            strokeWidth="12" 
                            fill="transparent" 
                            className="text-slate-100 dark:text-slate-700" 
                         />
                         {/* Progress Ring with Glow */}
                         <circle 
                            cx="80" cy="80" r={ringRadius} 
                            stroke="var(--color-primary)" 
                            strokeWidth="12" 
                            fill="transparent" 
                            strokeDasharray={ringCircumference} 
                            strokeDashoffset={ringOffset} 
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out neon-stroke"
                         />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-3xl font-bold text-slate-900 dark:text-white">%{goalPercentage}</span>
                     </div>
                 </div>
                 <p className="mt-4 text-sm text-slate-500">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{Math.floor(settings.weeklyGoalMinutes/60)} saat</span> hedefine ulaşmak için çalışmaya devam et.
                 </p>
             </div>
         </div>

         {/* 4. Recent Activity (Same Style as Tasks/History) */}
         <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
             <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                 <SectionHeader title="Son Aktiviteler" icon={History} />
             </div>
             <div>
                {history.slice(0, 3).length > 0 ? (
                    history.slice(0, 3).map((item) => {
                        const subject = subjects.find(s => s.id === item.subject);
                        return (
                            <div key={item.id} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1 h-10 rounded-full ${subject?.color || 'bg-slate-400'}`}></div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.topic}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <span>{subject?.name}</span> • <span>{item.durationMinutes} dk</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                                        {new Date(item.timestamp).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">Henüz bir aktivite yok.</div>
                )}
             </div>
             {history.length > 3 && (
                 <button onClick={() => onChangeView('history')} className="w-full py-3 text-xs font-bold text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1">
                     Tümünü Gör <ArrowRight size={12}/>
                 </button>
             )}
         </div>
         
         {/* FAB Mobile - Only for quick task to keep it clean */}
         <button 
            onClick={() => setIsQuickTaskOpen(true)}
            className="fixed bottom-24 right-6 w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform z-40 md:hidden"
         >
            <Plus size={24} />
         </button>
    </div>
  );
};

// Helper Components
const CounterRow = ({label, color, val, onUpdate}: any) => (
    <div className={`flex items-center justify-between p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-900/20`}>
        <span className={`text-xs font-bold text-${color}-600 dark:text-${color}-400 uppercase w-12`}>{label}</span>
        <div className="flex items-center space-x-3">
            <button onClick={() => onUpdate(-1)} className={`w-7 h-7 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition`}><Minus size={14}/></button>
            <span className="text-lg font-bold w-8 text-center text-slate-800 dark:text-white">{val}</span>
            <button onClick={() => onUpdate(1)} className={`w-7 h-7 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition`}><Plus size={14}/></button>
        </div>
    </div>
);

export default Dashboard;
