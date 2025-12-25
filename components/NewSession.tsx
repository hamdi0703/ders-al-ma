
import React, { useState } from 'react';
import { 
  Calculator, Atom, FlaskConical, Dna, BookOpen, Landmark, Plus,
  CloudRain, Trees, Clock, Target, Play, CheckCircle2,
  Timer, Zap, X, ListTodo, FolderOpen, MousePointer2, Tag, Hourglass, Layers, Infinity,
  Brain, Coffee, Flame, Battery
} from 'lucide-react';
import { ViewState, TimerMode } from '../types';
import { useStudy, useTimer } from '../context/StudyContext';

interface NewSessionProps {
    onChangeView: (view: ViewState) => void;
}

const NewSession: React.FC<NewSessionProps> = ({ onChangeView }) => {
  // Split contexts: Data from Study, Actions from Timer
  const { subjects, addNewSubject, tasks } = useStudy();
  const { startSession } = useTimer();
  
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [topic, setTopic] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [questionGoal, setQuestionGoal] = useState<number | ''>(20); 
  const [selectedAmbient, setSelectedAmbient] = useState<string | null>(null);
  const [customDuration, setCustomDuration] = useState<number | ''>(30);
  
  // New: Custom Mode Toggle
  const [customMode, setCustomMode] = useState<TimerMode>('timer');
  
  // UI State
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [topicError, setTopicError] = useState(false);
  
  // Selectors State
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

  // Crash Protection: Ensure we handle empty subjects case gracefully
  if (subjects.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in px-4">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <Layers size={48} className="text-slate-400 opacity-50" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Henüz Ders Eklenmemiş</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
                  Oturum başlatabilmek için önce listenize en az bir ders eklemelisiniz.
              </p>
              
              {/* Add Subject Modal Reused Logic inside Empty State */}
              {!isAddSubjectOpen ? (
                  <button 
                    onClick={() => setIsAddSubjectOpen(true)} 
                    className="px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2"
                  >
                      <Plus size={20} /> Ders Ekle
                  </button>
              ) : (
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-slide-up shadow-2xl">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Yeni Ders Ekle</h3>
                      <input 
                        type="text" 
                        placeholder="Ders adı..."
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white mb-4 focus:border-primary focus:outline-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                          <button onClick={() => setIsAddSubjectOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">İptal</button>
                          <button onClick={() => { if(newSubjectName.trim()) { addNewSubject(newSubjectName.trim()); setNewSubjectName(''); setIsAddSubjectOpen(false); }}} className="px-4 py-2 bg-primary text-white rounded-lg hover:brightness-110">Ekle</button>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  const currentSubject = subjects.find(s => s.id === selectedSubject) || subjects[0];
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  
  const suggestedTags = ['#zor', '#tekrar', '#ezber', '#sınav-haftası', '#pratik', '#konu-anlatımı'];

  const handleStart = (mode: TimerMode, duration: number, overrideTopic?: string, overrideTags?: string[]) => {
      const finalTopic = overrideTopic || topic;
      
      if (!finalTopic.trim()) {
          setTopicError(true);
          setTimeout(() => setTopicError(false), 500);
          return;
      }
      const finalGoal = questionGoal === '' ? 0 : questionGoal;
      // Merge existing tags with override tags if any, avoiding duplicates
      const currentTags = [...tags];
      if (overrideTags) {
          overrideTags.forEach(t => {
              if (!currentTags.includes(t)) currentTags.push(t);
          });
      }
      
      startSession(mode, currentSubject.id, finalTopic, currentTags, duration, finalGoal, selectedAmbient, selectedTaskId);
      onChangeView('dashboard');
  };

  const handleAddSubjectSubmit = () => {
      if (newSubjectName.trim()) {
          addNewSubject(newSubjectName.trim());
          setNewSubjectName('');
          setIsAddSubjectOpen(false);
      }
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '') {
          setQuestionGoal('');
      } else {
          // Prevent negative values
          setQuestionGoal(Math.max(0, parseInt(val)));
      }
  };

  const selectTask = (taskTitle: string, taskId: string) => {
      setTopic(taskTitle);
      setSelectedTaskId(taskId);
      setShowTaskSelector(false);
      setShowTopicSelector(false);
  };

  const selectSavedTopic = (savedTopic: string) => {
      setTopic(savedTopic);
      setSelectedTaskId(undefined);
      setShowTopicSelector(false);
      setShowTaskSelector(false);
  };
  
  const handleTopicChange = (val: string) => {
      setTopic(val);
      if (selectedTaskId) setSelectedTaskId(undefined);
  };

  const addTag = (tag: string) => {
      const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
      if (!tags.includes(formattedTag) && tags.length < 5) {
          setTags([...tags, formattedTag]);
      }
      setNewTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
  };

  // Safe duration handler
  const handleDurationChange = (val: string) => {
      if(val === '') setCustomDuration('');
      else setCustomDuration(Math.max(1, parseInt(val))); // Ensure minimum 1 minute
  };

  // --- Clock Modes Data ---
  const PRESET_MODES = [
      { id: 'pomodoro', name: 'Pomodoro', duration: 25, icon: Timer, color: 'text-red-500', bg: 'bg-red-500', border: 'border-red-200 dark:border-red-900', desc: '25dk Çalış • 5dk Mola', tags: ['#pomodoro'] },
      { id: 'long', name: 'Uzun Odak', duration: 50, icon: Brain, color: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-900', desc: '50dk Derinleşme', tags: ['#derin-odak'] },
      { id: 'short', name: 'Hızlı Seri', duration: 15, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-200 dark:border-orange-900', desc: '15dk Pratik', tags: ['#hızlı'] },
      { id: 'block', name: 'Blok Ders', duration: 90, icon: Layers, color: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-200 dark:border-purple-900', desc: '90dk Blok', tags: ['#blok'] },
  ];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto relative pb-24">
      
      {/* Add Subject Modal */}
      {isAddSubjectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-slide-up shadow-2xl">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Yeni Ders Ekle</h3>
                  <input 
                    type="text" 
                    placeholder="Ders adı..."
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white mb-4 focus:border-primary focus:outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setIsAddSubjectOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">İptal</button>
                      <button onClick={handleAddSubjectSubmit} className="px-4 py-2 bg-primary text-white rounded-lg hover:brightness-110">Ekle</button>
                  </div>
              </div>
          </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hızlı Başlangıç</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
          Çalışma modunu seç, konunu belirle ve anında odaklanmaya başla.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Selection Area */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Subject & Topic */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
                 {/* Subject List */}
                 <div>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center">
                        Ders Seçimi
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {subjects.map((sub) => {
                            const Icon = { Calculator, Atom, FlaskConical, Dna, BookOpen, Landmark }[sub.icon as any] || BookOpen;
                            const isSelected = selectedSubject === sub.id;
                            return (
                                <button 
                                    key={sub.id}
                                    onClick={() => { setSelectedSubject(sub.id); setTopic(''); setSelectedTaskId(undefined); }}
                                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border transition-all ${
                                        isSelected 
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/40 ring-2 ring-primary/20' 
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span className="text-sm font-medium truncate">{sub.name}</span>
                                </button>
                            );
                        })}
                        <button onClick={() => setIsAddSubjectOpen(true)} className="flex items-center justify-center p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-white hover:border-primary dark:hover:border-slate-500 transition">
                            <Plus size={18} />
                        </button>
                    </div>
                 </div>

                 {/* Topic Input Area */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="relative">
                        <div className="flex justify-between items-center mb-2">
                             <label className={`text-sm font-semibold uppercase block ${topicError ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>Konu Başlığı</label>
                             
                             <div className="flex gap-3">
                                {/* Topic Selector Button */}
                                {currentSubject.topics && currentSubject.topics.length > 0 && (
                                    <button 
                                        onClick={() => { setShowTopicSelector(!showTopicSelector); setShowTaskSelector(false); }}
                                        className="text-xs text-blue-500 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <FolderOpen size={12} /> Konulardan Seç
                                    </button>
                                )}

                                {/* Task Selector Button */}
                                {pendingTasks.length > 0 && (
                                    <button 
                                        onClick={() => { setShowTaskSelector(!showTaskSelector); setShowTopicSelector(false); }}
                                        className="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <ListTodo size={12} /> Görevden Seç
                                    </button>
                                )}
                             </div>
                        </div>
                        
                        {/* Task Selector Dropdown */}
                        {showTaskSelector && (
                            <div className="absolute top-8 left-0 w-full z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto animate-fade-in">
                                <h4 className="text-xs font-bold text-slate-400 px-3 py-1 uppercase">Bekleyen Görevler</h4>
                                {pendingTasks.map(task => (
                                    <button 
                                        key={task.id}
                                        onClick={() => selectTask(task.title, task.id)}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg truncate flex items-center gap-2"
                                    >
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        {task.title}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Topic Selector Dropdown */}
                        {showTopicSelector && (
                            <div className="absolute top-8 left-0 w-full z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 max-h-48 overflow-y-auto animate-fade-in">
                                <h4 className="text-xs font-bold text-slate-400 px-3 py-1 uppercase">{currentSubject.name} Konuları</h4>
                                {currentSubject.topics?.map((t, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => selectSavedTopic(t)}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg truncate flex items-center gap-2"
                                    >
                                        <FolderOpen size={14} className="text-slate-400"/>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="relative">
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => handleTopicChange(e.target.value)}
                                className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary transition-all ${topicError ? 'border-red-500 animate-shake ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                placeholder="Konu seç veya yaz..."
                                autoComplete="off"
                            />
                        </div>
                        
                        <div className="flex justify-between items-start mt-1 pl-1">
                            <p className="text-xs text-slate-400">Yeni konu girebilir veya listeden seçebilirsiniz.</p>
                            {selectedTaskId && (
                                <p className="text-xs text-green-500 flex items-center gap-1 font-medium"><CheckCircle2 size={12}/> Görev Bağlandı</p>
                            )}
                        </div>
                     </div>
                     <div>
                        <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Soru Hedefi</label>
                        <input 
                            type="number" 
                            value={questionGoal}
                            onChange={handleGoalChange}
                            min="0"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary transition-all font-medium"
                            placeholder="Hedef soru sayısı (Örn: 50)"
                        />
                     </div>
                 </div>

                 {/* Tags Input */}
                 <div>
                    <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center gap-2">
                        <Tag size={14} /> Etiketler
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2 items-center">
                        {tags.map((tag, idx) => (
                            <span key={idx} className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800 animate-fade-in">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X size={12} /></button>
                            </span>
                        ))}
                        <input 
                            type="text" 
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') { 
                                    e.preventDefault(); 
                                    if(newTagInput.trim()) addTag(newTagInput.trim()); 
                                }
                            }}
                            placeholder="+ Etiket ekle"
                            className="bg-transparent text-sm focus:outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400 min-w-[80px] border-b border-transparent focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {suggestedTags.filter(t => !tags.includes(t)).map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => addTag(tag)}
                                className="text-[10px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                 </div>
            </div>

            {/* 2. Clock Modes & Presets */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 flex items-center gap-2">
                <Clock size={20} className="text-primary"/> Çalışma Modu Seç
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_MODES.map(mode => (
                    <button 
                        key={mode.id}
                        onClick={() => handleStart('timer', mode.duration, undefined, mode.tags)}
                        className={`group relative overflow-hidden bg-white dark:bg-slate-800 border ${mode.border} rounded-xl p-4 text-left transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95`}
                    >
                        <div className="flex items-center justify-between mb-2">
                             <div className={`p-2 rounded-lg ${mode.bg} bg-opacity-10 text-opacity-100 ${mode.color}`}>
                                 <mode.icon size={20} />
                             </div>
                             <span className={`text-xl font-bold ${mode.color}`}>{mode.duration}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{mode.name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{mode.desc}</p>
                    </button>
                ))}
            </div>

            {/* 3. Stopwatch Mode (Full Width) */}
            <button 
                onClick={() => handleStart('stopwatch', 0)}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-400 rounded-xl p-4 flex items-center justify-between transition-all hover:shadow-md active:scale-[0.99]"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors">
                        <Play size={24} fill="currentColor" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-slate-900 dark:text-white">Serbest Kronometre</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Süre sınırı olmadan çalış. Süre yukarı doğru sayar.</p>
                    </div>
                </div>
                <div className="text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors">
                    <Infinity size={32} />
                </div>
            </button>


            {/* 4. Exam Simulation Section */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 flex items-center gap-2">
                <Hourglass size={20} className="text-amber-500"/> Deneme Simülasyonu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button 
                    onClick={() => handleStart('timer', 130, 'Hız Denemesi', ['#deneme', '#130dk'])}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95"
                >
                    <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">130 dk</span>
                    <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-500">Hız Denemesi</span>
                </button>
                <button 
                    onClick={() => handleStart('timer', 165, 'Standart Deneme', ['#deneme', '#165dk'])}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
                >
                    <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">165 dk</span>
                    <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-500">Genel Deneme</span>
                </button>
                <button 
                    onClick={() => handleStart('timer', 180, 'Kapsamlı Deneme', ['#deneme', '#180dk'])}
                    className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 p-4 rounded-xl flex flex-col items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all active:scale-95"
                >
                    <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">180 dk</span>
                    <span className="text-xs font-bold uppercase text-purple-600 dark:text-purple-500">Uzun Deneme</span>
                </button>
            </div>

            {/* 5. Custom Duration */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mt-4 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center space-x-2">
                            <Clock size={20} className="text-slate-400" />
                            <span className="font-bold text-slate-900 dark:text-white">Manuel Süre</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-transparent focus-within:border-primary/50 transition-all relative">
                            <input 
                                type="number" 
                                min="1" max="300" 
                                value={customDuration} 
                                onChange={(e) => handleDurationChange(e.target.value)}
                                className="text-6xl font-bold bg-transparent text-center w-full focus:outline-none text-slate-800 dark:text-white font-mono tracking-tight"
                                placeholder="00"
                            />
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Dakika</span>
                        </div>

                        <div className="flex flex-col justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Hızlı Seçim</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[20, 40, 60, 80].map(min => (
                                        <button 
                                            key={min} 
                                            onClick={() => { setCustomMode('timer'); setCustomDuration(min); }} 
                                            className={`py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 ${customDuration === min ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'}`}
                                        >
                                            {min}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleStart('timer', (typeof customDuration === 'number' ? customDuration : 0))} 
                                disabled={!customDuration}
                                className="w-full bg-slate-800 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-slate-900 py-4 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-98"
                            >
                                <Play size={20} fill="currentColor"/>
                                Özel Süre ile Başla
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl sticky top-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Oturum Detayı</h2>
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${currentSubject.color.replace('bg-', 'from-').replace('600', '100 dark:from-' + currentSubject.color.replace('bg-','').replace('600','900/50'))} to-white dark:to-slate-800 border border-slate-200 dark:border-slate-700`}>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Seçilen Ders</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white flex items-center">{currentSubject.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 truncate">{topic || 'Konu Seçilmedi'}</p>
                    </div>

                    {/* Tags Preview */}
                    {tags.length > 0 && (
                        <div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-2">Etiketler</p>
                             <div className="flex flex-wrap gap-1">
                                 {tags.map(t => (
                                     <span key={t} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                                         {t}
                                     </span>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>

                <div className="my-6 border-t border-slate-200 dark:border-slate-700"></div>

                <div className="mb-2">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Odak Sesi</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSelectedAmbient(selectedAmbient === 'rain' ? null : 'rain')} className={`flex items-center justify-center space-x-2 border py-3 rounded-xl transition-all ${selectedAmbient === 'rain' ? 'bg-primary/20 border-primary text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500'}`}><CloudRain size={18} /><span className="text-sm font-medium">Yağmur</span></button>
                         <button onClick={() => setSelectedAmbient(selectedAmbient === 'forest' ? null : 'forest')} className={`flex items-center justify-center space-x-2 border py-3 rounded-xl transition-all ${selectedAmbient === 'forest' ? 'bg-green-600/20 border-green-500 text-slate-900 dark:text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500'}`}><Trees size={18} /><span className="text-sm font-medium">Orman</span></button>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default NewSession;
