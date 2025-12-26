
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Play, Pause, RotateCcw, Zap, Plus, Minus, FilePlus2, 
  Trophy, StickyNote, BarChart3, AlertTriangle, 
  Maximize2, Minimize2, Trash2, PenLine, CheckSquare, 
  ListTodo, ClipboardEdit, Flame, Clock, Calendar, ArrowRight, History, XCircle,
  MoreHorizontal, Flag, Check, X, Percent, Calculator, Medal, Star, Sparkles, CheckCircle2,
  Timer, Brain, Layers, Hourglass, ChevronDown, FolderOpen, Hash
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid, XAxis } from 'recharts';
import { useStudy, useTimer } from '../context/StudyContext';
import { ViewState, TaskPriority, Subject } from '../types';

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

// --- Modern Live Stat Control ---
const LiveStatRow = ({ label, value, type, onUpdate }: { label: string, value: number, type: 'correct' | 'incorrect' | 'empty', onUpdate: (n: number) => void }) => {
    const config = {
        correct: { color: 'green', icon: Check, bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
        incorrect: { color: 'red', icon: X, bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' },
        empty: { color: 'slate', icon: Minus, bg: 'bg-slate-400', text: 'text-slate-500', border: 'border-slate-200' }
    }[type];

    return (
        <div className="group relative flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} bg-opacity-10 dark:bg-opacity-20`}>
                    <config.icon size={20} className={`${config.text} dark:text-${config.color}-400`} strokeWidth={3} />
                </div>
                <div>
                    <p className={`text-xs font-bold uppercase ${config.text} dark:text-${config.color}-400 opacity-80`}>{label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white leading-none">{value}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => onUpdate(-1)} 
                    disabled={value <= 0}
                    aria-label={`${label} sayısını azalt`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <Minus size={16} strokeWidth={3}/>
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button 
                    onClick={() => onUpdate(1)} 
                    aria-label={`${label} sayısını arttır`}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all ${config.bg}`}
                >
                    <Plus size={16} strokeWidth={3}/>
                </button>
            </div>
        </div>
    );
};

// --- REDESIGNED SUMMARY VIEW (MINIMALIST) ---
const SessionSummary = ({ activeSession, finishSession, toggleTask }: { activeSession: any, finishSession: any, toggleTask: any }) => {
    const { subjects } = useStudy();
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
    
    // Derived Real-time stats
    const correctVal = parseInt(summaryStats.correct) || 0;
    const incorrectVal = parseInt(summaryStats.incorrect) || 0;
    const emptyVal = parseInt(summaryStats.empty) || 0;
    const totalQs = correctVal + incorrectVal + emptyVal;
    const net = correctVal - (incorrectVal * 0.25);
    const accuracy = totalQs > 0 ? Math.round((correctVal / totalQs) * 100) : 0;
    
    const subjectName = subjects.find((s: any) => s.id === activeSession.subjectId)?.name || 'Ders';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-0 animate-slide-up z-10 overflow-hidden flex flex-col">
                
                {/* Header: Clean & Informative */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" size={20} />
                            Oturum Tamamlandı
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="block text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                           {elapsedMinutes}<span className="text-sm text-slate-400 font-sans ml-1">dk</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toplam Süre</span>
                    </div>
                </div>

                {/* Body: Info Grid */}
                <div className="p-6 space-y-6">
                    {/* Session Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Ders</div>
                             <div className="font-semibold text-slate-800 dark:text-white truncate">{subjectName}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Konu</div>
                             <div className="font-semibold text-slate-800 dark:text-white truncate">{activeSession.topic}</div>
                        </div>
                    </div>

                    {/* Stats Input Section */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Soru İstatistikleri</p>
                            <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">Opsiyonel</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase block text-center">Doğru</label>
                                <input 
                                    type="number" 
                                    className="w-full text-center p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all"
                                    value={summaryStats.correct}
                                    onChange={(e) => setSummaryStats(prev => ({...prev, correct: e.target.value}))}
                                    placeholder="-"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase block text-center">Yanlış</label>
                                <input 
                                    type="number" 
                                    className="w-full text-center p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                                    value={summaryStats.incorrect}
                                    onChange={(e) => setSummaryStats(prev => ({...prev, incorrect: e.target.value}))}
                                    placeholder="-"
                                />
                            </div>
                             <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block text-center">Boş</label>
                                <input 
                                    type="number" 
                                    className="w-full text-center p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 outline-none transition-all"
                                    value={summaryStats.empty}
                                    onChange={(e) => setSummaryStats(prev => ({...prev, empty: e.target.value}))}
                                    placeholder="-"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Result Card (Live Calculation) */}
                    {totalQs > 0 && (
                        <div className="flex items-stretch gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-700 pr-4">
                                <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{net}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Toplam Net</div>
                            </div>
                             <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-700 px-4">
                                <div className={`text-2xl font-black ${accuracy >= 70 ? 'text-green-500' : accuracy >= 50 ? 'text-yellow-500' : 'text-orange-500'}`}>%{accuracy}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Başarı</div>
                            </div>
                            <div className="flex-1 text-center pl-4">
                                <div className="text-2xl font-black text-slate-700 dark:text-slate-200">{totalQs}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Toplam Soru</div>
                            </div>
                        </div>
                    )}

                    {/* Linked Task Toggle */}
                    {activeSession.linkedTaskId && (
                        <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${markTaskCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${markTaskCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-transparent border-slate-300 text-transparent'}`}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={markTaskCompleted} 
                                onChange={() => setMarkTaskCompleted(!markTaskCompleted)} 
                            />
                            <div className="flex-1">
                                <p className={`text-sm font-bold ${markTaskCompleted ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>Bağlı Görevi Tamamla</p>
                                <p className="text-[10px] text-slate-400">Bu oturum bir göreve bağlı başlatıldı.</p>
                            </div>
                        </label>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-0 mt-auto">
                    <button 
                        onClick={handleFinish} 
                        className="w-full py-3.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={20} /> Kaydet ve Bitir
                    </button>
                </div>

            </div>
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
    // UPDATED: Removed totalQuestions, logic now sums inputs
    const [testForm, setTestForm] = useState({ name: '', subjectId: '', topic: '', correct: '', incorrect: '', empty: '', note: '' });
    const [tempTopic, setTempTopic] = useState('');
    const [quickTaskTitle, setQuickTaskTitle] = useState('');
    const [quickTaskPriority, setQuickTaskPriority] = useState<TaskPriority>('medium');
    
    // Manual Log State
    const [manualForm, setManualForm] = useState({ 
        subjectId: subjects[0]?.id || '', 
        topic: '', 
        duration: '', 
        correct: '', 
        incorrect: '', 
        empty: '',
        date: new Date().toISOString().split('T')[0] // Default to today YYYY-MM-DD
    });
    const [showManualTopicSelector, setShowManualTopicSelector] = useState(false);

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
        setTestForm({ name: '', subjectId: '', topic: '', correct: '', incorrect: '', empty: '', note: '' });
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
        const logDate = manualForm.date ? new Date(manualForm.date) : new Date();
        logManualSession(
            manualForm.subjectId, manualForm.topic.trim(), parseInt(manualForm.duration) || 0,
            { correct: parseInt(manualForm.correct) || 0, incorrect: parseInt(manualForm.incorrect) || 0, empty: parseInt(manualForm.empty) || 0 },
            logDate
        );
        // Reset form except Subject (user might log multiple for same subject)
        setManualForm(prev => ({ ...prev, topic: '', duration: '', correct: '', incorrect: '', empty: '' }));
        setIsManualLogOpen(false);
        setShowManualTopicSelector(false);
    };

    return (
        <>
            {/* UPDATED TEST MODAL: Modern & Simplified */}
            {isTestModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 animate-slide-up space-y-5 relative">
                        <button onClick={()=>setIsTestModalOpen(false)} aria-label="Kapat" className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><XCircle size={24}/></button>
                        
                        <div className="flex items-center gap-3">
                             <div className="p-2 bg-primary/10 rounded-lg text-primary"><FilePlus2 size={24}/></div>
                             <h3 className="font-bold text-xl dark:text-white">Test Sonucu</h3>
                        </div>

                        <input 
                            type="text" 
                            placeholder="Test Adı / Kaynak (Örn: 3D Yayınları)" 
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white focus:border-primary focus:outline-none font-medium" 
                            value={testForm.name} 
                            onChange={e=>setTestForm({...testForm, name: e.target.value})} 
                            autoFocus
                        />
                        
                        <div className="grid grid-cols-3 gap-3">
                             <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-green-600 block text-center">Doğru</label>
                                <input type="number" className="w-full p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-center font-bold text-lg text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500/50" value={testForm.correct} onChange={e=>setTestForm({...testForm, correct: e.target.value})}/>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-red-600 block text-center">Yanlış</label>
                                <input type="number" className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-center font-bold text-lg text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50" value={testForm.incorrect} onChange={e=>setTestForm({...testForm, incorrect: e.target.value})}/>
                             </div>
                             <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 block text-center">Boş</label>
                                <input type="number" className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold text-lg text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50" value={testForm.empty} onChange={e=>setTestForm({...testForm, empty: e.target.value})}/>
                             </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex justify-between items-center border border-slate-100 dark:border-slate-700">
                             <span className="text-xs font-bold text-slate-400 uppercase">Toplam Soru</span>
                             <span className="text-lg font-bold text-slate-800 dark:text-white">
                                 {(parseInt(testForm.correct)||0) + (parseInt(testForm.incorrect)||0) + (parseInt(testForm.empty)||0)}
                             </span>
                        </div>

                        <input 
                            type="text" 
                            placeholder="Kısa bir not ekle..." 
                            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white text-sm focus:border-primary focus:outline-none" 
                            value={testForm.note} 
                            onChange={e=>setTestForm({...testForm, note: e.target.value})}
                        />
                        
                        <button onClick={handleAddTest} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                            Sonucu Kaydet
                        </button>
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
            
            {/* REDESIGNED MANUAL LOG MODAL */}
            {isManualLogOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 animate-slide-up max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                    <ClipboardEdit size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl dark:text-white">Çalışma Ekle</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Manuel veri girişi</p>
                                </div>
                            </div>
                            <button onClick={()=>setIsManualLogOpen(false)} aria-label="Kapat" className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                <X size={20}/>
                            </button>
                        </div>

                        {/* Updated Subject Selector (Dropdown) */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block px-1">Ders Seçimi</label>
                            <div className="relative">
                                <select 
                                    value={manualForm.subjectId}
                                    onChange={(e) => {
                                        setManualForm({...manualForm, subjectId: e.target.value});
                                        setShowManualTopicSelector(false); // Reset topic dropdown on subject change
                                    }}
                                    className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium pr-10"
                                >
                                    {subjects.map((s: Subject) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        {/* Topic & Date Row with Topic Selector */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="col-span-2 relative">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase block">Konu Başlığı</label>
                                    {subjects.find(s => s.id === manualForm.subjectId)?.topics && subjects.find(s => s.id === manualForm.subjectId)!.topics.length > 0 && (
                                        <button 
                                            onClick={() => setShowManualTopicSelector(!showManualTopicSelector)}
                                            className="text-xs text-blue-500 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline"
                                        >
                                            <FolderOpen size={12} /> Konulardan Seç
                                        </button>
                                    )}
                                </div>
                                
                                {/* Topic Selector Dropdown */}
                                {showManualTopicSelector && (
                                    <div className="absolute top-16 left-0 w-full z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto animate-fade-in">
                                        <h4 className="text-xs font-bold text-slate-400 px-3 py-1 uppercase truncate">{subjects.find(s => s.id === manualForm.subjectId)?.name} Konuları</h4>
                                        {subjects.find(s => s.id === manualForm.subjectId)?.topics?.map((t, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => {
                                                    setManualForm({...manualForm, topic: t});
                                                    setShowManualTopicSelector(false);
                                                }}
                                                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg truncate flex items-center gap-2"
                                            >
                                                <FolderOpen size={14} className="text-slate-400"/>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        placeholder="Örn: Limit ve Süreklilik" 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-medium" 
                                        value={manualForm.topic} 
                                        onChange={e=>setManualForm({...manualForm, topic: e.target.value})}
                                    />
                                    <StickyNote size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"/>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block px-1">Tarih</label>
                                <div className="relative group">
                                    <input 
                                        type="date" 
                                        className="w-full pl-2 pr-2 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all text-xs font-bold text-center" 
                                        value={manualForm.date}
                                        onChange={e=>setManualForm({...manualForm, date: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Duration Section with Quick Presets */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Süre (Dakika)</label>
                                <div className="flex gap-2">
                                    {[30, 45, 60].map(m => (
                                        <button 
                                            key={m}
                                            onClick={() => setManualForm({...manualForm, duration: m.toString()})}
                                            className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                        >
                                            {m}dk
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="relative group">
                                <input 
                                    type="number" 
                                    placeholder="0" 
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all font-bold" 
                                    value={manualForm.duration} 
                                    onChange={e=>setManualForm({...manualForm, duration: e.target.value})}
                                />
                                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"/>
                            </div>
                        </div>
                        
                        {/* Stats Cards (Gamified) */}
                        <div className="mb-8">
                             <label className="text-xs font-bold text-slate-400 uppercase mb-3 block px-1">Soru İstatistikleri (Opsiyonel)</label>
                             <div className="grid grid-cols-3 gap-3">
                                 {/* Correct */}
                                 <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-3 flex flex-col items-center justify-center focus-within:ring-2 ring-green-500 transition-all">
                                     <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-1">Doğru</span>
                                     <input 
                                        type="number" 
                                        placeholder="0" 
                                        className="w-full text-center bg-transparent text-2xl font-bold text-green-700 dark:text-green-400 focus:outline-none placeholder-green-700/30 dark:placeholder-green-400/30" 
                                        value={manualForm.correct} 
                                        onChange={e=>setManualForm({...manualForm, correct: e.target.value})}
                                     />
                                 </div>
                                 {/* Incorrect */}
                                 <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-3 flex flex-col items-center justify-center focus-within:ring-2 ring-red-500 transition-all">
                                     <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-1">Yanlış</span>
                                     <input 
                                        type="number" 
                                        placeholder="0" 
                                        className="w-full text-center bg-transparent text-2xl font-bold text-red-700 dark:text-red-400 focus:outline-none placeholder-red-700/30 dark:placeholder-red-400/30" 
                                        value={manualForm.incorrect} 
                                        onChange={e=>setManualForm({...manualForm, incorrect: e.target.value})}
                                     />
                                 </div>
                                 {/* Empty */}
                                 <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex flex-col items-center justify-center focus-within:ring-2 ring-slate-400 transition-all">
                                     <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Boş</span>
                                     <input 
                                        type="number" 
                                        placeholder="0" 
                                        className="w-full text-center bg-transparent text-2xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none placeholder-slate-400/50" 
                                        value={manualForm.empty} 
                                        onChange={e=>setManualForm({...manualForm, empty: e.target.value})}
                                     />
                                 </div>
                            </div>
                        </div>
                        
                        {/* Footer Buttons */}
                        <div className="flex gap-3">
                            <button onClick={()=>setIsManualLogOpen(false)} className="px-6 py-4 rounded-xl text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Vazgeç</button>
                            <button onClick={handleManualLog} className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold shadow-xl shadow-slate-900/20 active:scale-98 transition-all flex items-center justify-center gap-2 text-lg">
                                <CheckCircle2 size={20} /> Kaydet
                            </button>
                        </div>
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

      // Calculate Net for Live View
      const currentNet = activeSession.stats.correct - (activeSession.stats.incorrect * 0.25);
      const totalQs = activeSession.stats.correct + activeSession.stats.incorrect + activeSession.stats.empty;
      const currentAccuracy = totalQs > 0 ? Math.round((activeSession.stats.correct / totalQs) * 100) : 0;

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
                <button onClick={() => setIsZenMode(true)} aria-label="Zen Modunu Aç" className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                    <Maximize2 size={16} /> <span className="text-xs font-bold">Zen</span>
                </button>
            </div>
          )}

          {isZenMode && (
             <button onClick={() => setIsZenMode(false)} aria-label="Zen Modunu Kapat" className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition z-50 backdrop-blur-md">
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
                             {/* REMOVED: Rainbow Gradient. Using solid colors per user request */}
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

                        {/* 2. Active Ticks (Solid Blue) */}
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
                                    stroke="var(--color-primary)" 
                                    strokeWidth={isMajor ? 3 : 2}
                                    strokeLinecap="round"
                                />
                            );
                        })}

                        {/* 3. The Needle / Indicator (Current Position) - Simple Blue */}
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
                                    stroke="var(--color-primary)"
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
                <div className="flex items-center gap-4 z-10 w-full justify-center max-w-lg mt-4">
                    <button onClick={() => setIsStopConfirmOpen(true)} aria-label="Oturumu İptal Et" className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95" title="İptal Et (Çöp)"><Trash2 size={24}/></button>
                    
                    <button onClick={activeSession.isPaused ? resumeSession : pauseSession} className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
                        {activeSession.isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                        <span>{activeSession.isPaused ? 'Devam Et' : 'Duraklat'}</span>
                    </button>
                    
                    {/* NEW: Finish Button */}
                    <button onClick={() => finishSession()} aria-label="Oturumu Bitir ve Kaydet" className="p-4 rounded-2xl bg-green-500 text-white hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20" title="Bitir ve Kaydet"><Check size={24} strokeWidth={3} /></button>
                </div>
            </div>

            {/* Right Stats Column - Modernized */}
            {!isZenMode && (
            <div className="flex flex-col gap-6 h-full">
                
                {/* 1. Live Stats Panel */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex-1 flex flex-col relative overflow-hidden">
                    {/* Header with Live Indicator */}
                    <div className="flex items-center justify-between mb-6">
                        <SectionHeader title="Canlı İstatistik" icon={BarChart3} />
                        <div className="flex items-center gap-2">
                             <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-slate-600">
                                <Calculator size={14} className="text-blue-500"/>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Net: {currentNet}</span>
                             </div>
                             <div className={`px-3 py-1 rounded-lg flex items-center gap-1.5 border ${currentAccuracy >= 50 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500'}`}>
                                <Percent size={14} />
                                <span className="text-xs font-bold">{currentAccuracy}%</span>
                             </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                        <LiveStatRow label="Doğru" value={activeSession.stats.correct} type="correct" onUpdate={(n) => updateQuestionStats('correct', n)} />
                        <LiveStatRow label="Yanlış" value={activeSession.stats.incorrect} type="incorrect" onUpdate={(n) => updateQuestionStats('incorrect', n)} />
                        <LiveStatRow label="Boş" value={activeSession.stats.empty} type="empty" onUpdate={(n) => updateQuestionStats('empty', n)} />
                    </div>
                </div>
                
                {/* 2. Tools Panel (Notes & Test Add) */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <div className="relative mb-4 group">
                        <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors">
                            <StickyNote size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Bir not ekle..." 
                            className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none dark:text-white transition-all placeholder:text-slate-400" 
                            value={activeSession.sessionNote || ''} 
                            onChange={(e) => updateActiveSessionNote(e.target.value)} 
                        />
                    </div>

                    <button 
                        onClick={() => setIsTestModalOpen(true)} 
                        className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 hover:from-primary hover:to-blue-600 dark:hover:from-primary dark:hover:to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 hover:shadow-primary/25 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                    >
                        <FilePlus2 size={20} className="group-hover:scale-110 transition-transform" /> 
                        <span>Test Sonucu Ekle</span>
                    </button>
                    
                    {/* Mini Log List (Modernized) */}
                    {activeSession.logs.length > 0 && (
                         <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700/50">
                             <div className="flex justify-between items-center mb-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eklenen Testler</p>
                                <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">{activeSession.logs.length}</span>
                             </div>
                             <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                {activeSession.logs.map(log => (
                                    <div key={log.id} className="group flex justify-between items-center text-xs p-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-all shadow-sm">
                                        <div className="flex flex-col truncate pr-2">
                                            <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{log.name}</span>
                                            {log.note && <span className="text-[10px] text-slate-400 truncate">{log.note}</span>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex space-x-1 font-mono text-[10px] font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-700">
                                                <span className="text-green-600">{log.correct}D</span>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-red-500">{log.incorrect}Y</span>
                                            </div>
                                            <button onClick={() => removeTestLog(log.id)} aria-label="Test sonucunu sil" className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded transition-colors"><Trash2 size={14}/></button>
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
            aria-label="Hızlı Görev Ekle"
            className="fixed bottom-24 right-6 w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform z-40 md:hidden"
         >
            <Plus size={24} />
         </button>
    </div>
  );
};

export default Dashboard;
