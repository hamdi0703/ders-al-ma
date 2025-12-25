
import React, { useState, useMemo } from 'react';
import { 
    Plus, CheckCircle2, Circle, Trash2, ListTodo, Flag, 
    Calendar, BookOpen, ChevronDown, ChevronUp, Edit2, X, Target,
    LayoutGrid, List, Columns, ArrowUpDown, Clock
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { TaskPriority, Task } from '../types';

type ViewMode = 'list' | 'grid' | 'board';
type SortMode = 'newest' | 'oldest' | 'priority' | 'dueDate' | 'alphabetical';

// --- Helpers moved outside ---
const getPriorityColor = (p: TaskPriority) => {
    switch(p) {
        case 'high': return 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'low': return 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
    }
};

const getRelativeTime = (timestamp: number) => {
    const date = new Date(timestamp);
    // User requested full date instead of "Just now" style relative time
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
};

const getDeadlineBadge = (timestamp?: number) => {
    if (!timestamp) return null;
    const now = new Date();
    now.setHours(0,0,0,0);
    const due = new Date(timestamp);
    due.setHours(0,0,0,0);
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded flex items-center gap-1">Gecikti</span>;
    if (diffDays === 0) return <span className="text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded flex items-center gap-1">Bugün</span>;
    if (diffDays === 1) return <span className="text-[10px] font-bold bg-yellow-500 text-white px-1.5 py-0.5 rounded flex items-center gap-1">Yarın</span>;
    if (diffDays <= 3) return <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-1">{diffDays} gün</span>;
    
    return <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10}/> {due.toLocaleDateString('tr-TR')}</span>;
};

// --- TaskCard Component moved outside ---
interface TaskCardProps {
    task: Task;
    isCompact?: boolean;
    onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isCompact = false, onEdit }) => {
    const { toggleTask, deleteTask, subjects } = useStudy();
    const subject = subjects.find(s => s.id === task.subjectId);
    
    return (
        <div 
            className={`group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all animate-slide-up relative overflow-hidden flex flex-col ${isCompact ? 'p-3' : 'p-4 pl-5'}`}
        >
            {/* Subject Color Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${subject?.color || 'bg-slate-300 dark:bg-slate-600'}`}></div>

            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button 
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 text-slate-300 hover:text-green-500 transition-colors flex-shrink-0"
                    >
                        <Circle size={isCompact ? 18 : 22} />
                    </button>
                    
                    <div className="flex flex-col gap-1 w-full min-w-0">
                        <span 
                            className="text-slate-800 dark:text-slate-200 font-medium leading-tight cursor-pointer hover:text-primary transition-colors truncate block" 
                            onClick={() => onEdit(task)}
                            title={task.title}
                        >
                            {task.title}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            {!isCompact && (
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                                    <Flag size={10} fill="currentColor"/> 
                                    {task.priority === 'high' ? 'Yüksek' : task.priority === 'low' ? 'Düşük' : 'Orta'}
                                </span>
                            )}

                            {subject && (
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 flex items-center gap-1 truncate max-w-[100px]`}>
                                    <BookOpen size={10} /> {subject.name}
                                </span>
                            )}

                            {getDeadlineBadge(task.dueDate)}
                        </div>

                        {/* Created At Info */}
                        <div className="flex items-center gap-1 mt-0.5">
                            <Clock size={10} className="text-slate-300" />
                            <span className="text-[10px] text-slate-400">{getRelativeTime(task.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className={`flex items-center gap-1 ${isCompact ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex-shrink-0`}>
                    <button onClick={() => onEdit(task)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <Edit2 size={14} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Tasks: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, editTask, subjects } = useStudy();
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [dueDateStr, setDueDateStr] = useState(''); 

  // --- Helpers ---
  const handleResetForm = () => {
      setTitle('');
      setPriority('medium');
      setSelectedSubjectId('');
      setDueDateStr('');
      setFormMode('add');
      setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dateTimestamp = dueDateStr ? new Date(dueDateStr).getTime() : undefined;

    if (formMode === 'add') {
        addTask(title.trim(), priority, selectedSubjectId || undefined, dateTimestamp);
    } else if (editingId) {
        editTask(editingId, {
            title: title.trim(),
            priority,
            subjectId: selectedSubjectId || undefined,
            dueDate: dateTimestamp
        });
    }
    handleResetForm();
  };

  const handleEditClick = (task: Task) => {
      setTitle(task.title);
      setPriority(task.priority);
      setSelectedSubjectId(task.subjectId || '');
      if (task.dueDate) {
          const d = new Date(task.dueDate);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          setDueDateStr(`${year}-${month}-${day}`);
      } else {
          setDueDateStr('');
      }
      setEditingId(task.id);
      setFormMode('edit');
  };

  // --- Derived Data ---
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  
  const activeTasks = useMemo(() => {
      let filtered = tasks.filter(t => !t.isCompleted);

      return filtered.sort((a, b) => {
          switch (sortMode) {
              case 'newest':
                  return b.createdAt - a.createdAt;
              case 'oldest':
                  return a.createdAt - b.createdAt;
              case 'priority':
                  const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                  if (pDiff !== 0) return pDiff;
                  return b.createdAt - a.createdAt;
              case 'dueDate':
                  if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
                  if (a.dueDate) return -1; // Has date comes first
                  if (b.dueDate) return 1;
                  return b.createdAt - a.createdAt;
              case 'alphabetical':
                  return a.title.localeCompare(b.title);
              default:
                  return b.createdAt - a.createdAt;
          }
      });
  }, [tasks, sortMode]);

  const completedTasks = useMemo(() => tasks.filter(t => t.isCompleted), [tasks]);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  
  const getMotivationalMessage = (rate: number) => {
      if (rate === 100) return "Mükemmelsin! Hepsi bitti 🎉";
      if (rate >= 75) return "Harika gidiyorsun, bitmek üzere!";
      if (rate >= 50) return "Yarıyı geçtin, devam et! 🚀";
      if (rate >= 25) return "Güzel bir başlangıç!";
      return "Hadi başlayalım! 💪";
  };

  const renderContent = () => {
      if (activeTasks.length === 0) {
          return (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 animate-fade-in">
                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Target size={32} className="text-primary"/>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Her Şey Yolunda!</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Yapılacak listen tertemiz. Yeni bir hedef belirle.</p>
            </div>
          );
      }

      switch (viewMode) {
          case 'grid':
              return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeTasks.map(task => <TaskCard key={task.id} task={task} onEdit={handleEditClick} />)}
                  </div>
              );
          case 'board':
              const columns: {id: TaskPriority, label: string, color: string}[] = [
                  { id: 'high', label: 'Yüksek Öncelik', color: 'bg-red-500' },
                  { id: 'medium', label: 'Orta Öncelik', color: 'bg-yellow-500' },
                  { id: 'low', label: 'Düşük Öncelik', color: 'bg-blue-500' }
              ];
              return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
                      {columns.map(col => {
                          const colTasks = activeTasks.filter(t => t.priority === col.id);
                          return (
                              <div key={col.id} className="min-w-[250px] bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 flex flex-col h-full">
                                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                                      <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{col.label}</span>
                                      <span className="ml-auto text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 border border-slate-200 dark:border-slate-700 font-mono">
                                          {colTasks.length}
                                      </span>
                                  </div>
                                  <div className="space-y-3 flex-1">
                                      {colTasks.length > 0 ? (
                                          colTasks.map(task => <TaskCard key={task.id} task={task} isCompact={true} onEdit={handleEditClick} />)
                                      ) : (
                                          <div className="h-24 flex items-center justify-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">Boş</div>
                                      )}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              );
          case 'list':
          default:
              return (
                  <div className="space-y-3">
                      {activeTasks.map(task => <TaskCard key={task.id} task={task} onEdit={handleEditClick} />)}
                  </div>
              );
      }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-24 space-y-8">
      
      {/* 1. Header & Progress */}
      <div className="flex flex-col md:flex-row gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden flex-1">
              <div className="absolute top-0 right-0 p-8 opacity-5 transform rotate-12">
                  <ListTodo size={120} />
              </div>
              
              <div className="relative z-10">
                  <div className="flex justify-between items-end mb-4">
                      <div>
                          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Görevlerim</h1>
                          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                              {getMotivationalMessage(completionRate)}
                          </p>
                      </div>
                      <div className="text-right">
                          <span className="text-3xl font-bold text-primary">{completionRate}%</span>
                      </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-out relative" 
                        style={{ width: `${completionRate}%` }}
                      >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                  </div>
                  
                  <div className="flex gap-4 mt-3 text-xs font-bold text-slate-400">
                      <span>{activeTasks.length} Bekleyen</span>
                      <span>{completedTasks.length} Tamamlanan</span>
                  </div>
              </div>
          </div>
      </div>

      {/* 2. Controls & Form */}
      <div className="space-y-4">
          
          {/* View Switcher & Add Form */}
          <div className="flex flex-col lg:flex-row gap-4">
              
              {/* Form Area */}
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm transition-all focus-within:ring-2 ring-primary/20">
                  <form onSubmit={handleSubmit}>
                      <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                          {formMode === 'edit' ? <Edit2 size={18} className="text-primary"/> : <Plus size={18} className="text-slate-400"/>}
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={formMode === 'edit' ? "Görevi düzenle..." : "Yeni bir görev ekle..."}
                            className="w-full bg-transparent text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                            autoFocus={formMode === 'edit'}
                          />
                          {formMode === 'edit' && (
                              <button type="button" onClick={handleResetForm} className="text-slate-400 hover:text-red-500">
                                  <X size={18} />
                              </button>
                          )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                              {/* Priority */}
                              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                                  {(['low', 'medium', 'high'] as TaskPriority[]).map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`p-1.5 rounded-md transition-all ${priority === p ? 'bg-white dark:bg-slate-700 shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                                        title={p}
                                    >
                                        <Flag 
                                            size={14} 
                                            className={p === 'high' ? 'text-red-500' : p === 'medium' ? 'text-yellow-500' : 'text-blue-500'} 
                                            fill={priority === p ? 'currentColor' : 'none'}
                                        />
                                    </button>
                                ))}
                              </div>

                              {/* Subject Select */}
                              <div className="relative group">
                                  <select
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    className="appearance-none bg-slate-100 dark:bg-slate-900 border-none rounded-lg py-1.5 pl-8 pr-8 text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                                  >
                                      <option value="">Ders Seç (Opsiyonel)</option>
                                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                  </select>
                                  <BookOpen size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                              </div>

                              {/* Date Picker */}
                              <div className="relative group">
                                  <input 
                                        type="date" 
                                        value={dueDateStr}
                                        onChange={(e) => setDueDateStr(e.target.value)}
                                        className="bg-slate-100 dark:bg-slate-900 border-none rounded-lg py-1.5 pl-8 pr-2 text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800"
                                  />
                                  <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                              </div>
                          </div>

                          <button
                            type="submit"
                            disabled={!title.trim()}
                            className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {formMode === 'add' ? 'Ekle' : 'Güncelle'}
                          </button>
                      </div>
                  </form>
              </div>

              {/* Tools & View Switcher */}
              <div className="flex flex-col sm:flex-row gap-2 self-start shrink-0">
                  
                  {/* Sorting Dropdown */}
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="relative h-full">
                        <select
                            value={sortMode}
                            onChange={(e) => setSortMode(e.target.value as SortMode)}
                            className="appearance-none bg-transparent text-xs font-bold pl-8 pr-6 py-2.5 rounded-lg focus:outline-none cursor-pointer text-slate-600 dark:text-slate-300 h-full w-full hover:bg-white dark:hover:bg-slate-700/50"
                        >
                            <option value="newest">En Yeni</option>
                            <option value="oldest">En Eski</option>
                            <option value="priority">Öncelik</option>
                            <option value="dueDate">Bitiş Tarihi</option>
                            <option value="alphabetical">A-Z</option>
                        </select>
                        <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <ChevronDown size={12} className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* View Modes */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="Liste"
                      >
                          <List size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="Kart"
                      >
                          <LayoutGrid size={18} />
                      </button>
                      <button 
                        onClick={() => setViewMode('board')}
                        className={`p-2 rounded-lg transition-all flex items-center justify-center ${viewMode === 'board' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="Pano"
                      >
                          <Columns size={18} />
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {/* 3. Task Content Area */}
      <div>
          {renderContent()}
      </div>

      {/* 4. Completed Section (Collapsible) */}
      {completedTasks.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
              {showCompleted ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              Tamamlananlar ({completedTasks.length})
          </button>
          
          {showCompleted && (
            <div className="space-y-2 animate-slide-up opacity-60 hover:opacity-100 transition-opacity">
                {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800 transition-all group">
                        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                            <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                            <span className="text-slate-500 font-medium line-through decoration-slate-400 text-sm">{task.title}</span>
                        </div>
                        <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;
