
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Calendar, Clock, Trash2, 
  Edit2, Filter, X,
  Calculator, PieChart, Layers,
  SlidersHorizontal, ArrowUpDown, CheckCircle2, AlertCircle,
  MoreHorizontal, ChevronDown, Check, Download, Tag, CalendarDays
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

const HISTORY_PAGE_SIZE = 50;

const History: React.FC = () => {
  const { history, deleteHistoryItem, updateHistoryItem, getFormattedDate, subjects } = useStudy();
  
  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(HISTORY_PAGE_SIZE);
  
  // Advanced Filters
  const [filters, setFilters] = useState({
      subject: 'all',
      status: 'all', // 'completed', 'interrupted'
      duration: 'all', // 'short', 'medium', 'long'
      tag: 'all', // New: Tag filter
      startDate: '', // New: Date Range Start (YYYY-MM-DD)
      endDate: ''    // New: Date Range End (YYYY-MM-DD)
  });

  const [sortConfig, setSortConfig] = useState({
      key: 'date', // 'date', 'duration', 'efficiency'
      direction: 'desc' // 'asc', 'desc'
  });

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ topic: '', note: '' });

  // Delete Modal State
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // --- Reset display limit when filters change ---
  useEffect(() => {
      setDisplayLimit(HISTORY_PAGE_SIZE);
  }, [searchTerm, filters, sortConfig]);

  // --- Calculations ---

  // 1. Extract Unique Tags from History
  const availableTags = useMemo(() => {
      const tags = new Set<string>();
      history.forEach(h => {
          if (h.tags && h.tags.length > 0) {
              h.tags.forEach(t => tags.add(t));
          }
      });
      return Array.from(tags).sort();
  }, [history]);

  // 2. Filter Logic
  const filteredHistory = useMemo(() => {
    let result = history.filter(item => {
        // A. Search Filter
        const subjectName = subjects.find(s => s.id === item.subject)?.name || '';
        const matchesSearch = 
            searchTerm === '' ||
            item.topic.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR')) || 
            subjectName.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR')) ||
            (item.sessionNote && item.sessionNote.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))) ||
            (item.tags && item.tags.some(tag => tag.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))));
        
        if (!matchesSearch) return false;

        // B. Subject Filter
        if (filters.subject !== 'all' && item.subject !== filters.subject) return false;

        // C. Status Filter
        if (filters.status !== 'all' && item.status !== filters.status) return false;

        // D. Tag Filter
        if (filters.tag !== 'all' && (!item.tags || !item.tags.includes(filters.tag))) return false;

        // E. Date Range Filter
        if (filters.startDate) {
            const start = new Date(filters.startDate).setHours(0,0,0,0);
            if (item.timestamp < start) return false;
        }
        if (filters.endDate) {
            const end = new Date(filters.endDate).setHours(23,59,59,999);
            if (item.timestamp > end) return false;
        }

        // F. Duration Filter
        if (filters.duration !== 'all') {
            if (filters.duration === 'short' && item.durationMinutes >= 20) return false;
            if (filters.duration === 'medium' && (item.durationMinutes < 20 || item.durationMinutes > 60)) return false;
            if (filters.duration === 'long' && item.durationMinutes <= 60) return false;
        }

        return true;
    });

    // 3. Sorting
    result = result.sort((a, b) => {
        let valA, valB;
        
        switch(sortConfig.key) {
            case 'duration':
                valA = a.durationMinutes; valB = b.durationMinutes;
                break;
            case 'efficiency':
                valA = a.efficiency; valB = b.efficiency;
                break;
            case 'date':
            default:
                valA = a.timestamp; valB = b.timestamp;
                break;
        }

        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [history, searchTerm, filters, sortConfig, subjects]);

  // 4. Pagination Slice
  const visibleHistory = useMemo(() => {
      return filteredHistory.slice(0, displayLimit);
  }, [filteredHistory, displayLimit]);

  // Summary Stats based on current view
  const summaryStats = useMemo(() => {
      const totalSessions = filteredHistory.length;
      const totalMinutes = filteredHistory.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const totalQuestions = filteredHistory.reduce((acc, curr) => acc + curr.totalQuestions, 0);
      
      const sessionsWithEfficiency = filteredHistory.filter(h => h.efficiency >= 0);
      const avgEfficiency = sessionsWithEfficiency.length > 0 
        ? Math.round(sessionsWithEfficiency.reduce((acc, curr) => acc + curr.efficiency, 0) / sessionsWithEfficiency.length) 
        : 0;

      return { totalSessions, totalMinutes, totalQuestions, avgEfficiency };
  }, [filteredHistory]);

  // --- Handlers ---
  const handleStartEdit = (item: any) => {
      setEditingId(item.id);
      setEditForm({ topic: item.topic, note: item.sessionNote || '' });
  };

  const handleSaveEdit = () => {
      if (editingId) {
          updateHistoryItem(editingId, { topic: editForm.topic, sessionNote: editForm.note });
          setEditingId(null);
      }
  };

  const resetFilters = () => {
      setFilters({ subject: 'all', status: 'all', duration: 'all', tag: 'all', startDate: '', endDate: '' });
      setSearchTerm('');
      setSortConfig({ key: 'date', direction: 'desc' });
  };

  const escapeCSV = (str: string | undefined | null) => {
      if (!str) return '';
      const s = String(str);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const handleExportFiltered = () => {
      if (filteredHistory.length === 0) return;

      const headers = ['Tarih', 'Saat', 'Ders', 'Konu', 'Etiketler', 'Süre (dk)', 'Doğru', 'Yanlış', 'Boş', 'Verim %', 'Durum', 'Not'];
      const rows = filteredHistory.map(h => {
          const subjectName = subjects.find(s => s.id === h.subject)?.name || h.subject;
          const time = new Date(h.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'});
          return [
              h.date, time, escapeCSV(subjectName), escapeCSV(h.topic), escapeCSV(h.tags ? h.tags.join('; ') : ''),
              h.durationMinutes, h.questionStats?.correct||0, h.questionStats?.incorrect||0, h.questionStats?.empty||0, h.efficiency,
              h.status === 'completed' ? 'Tamamlandı' : 'Yarım Kaldı', escapeCSV(h.sessionNote)
          ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `studyflow_ozel_rapor_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const activeFilterCount = [
      filters.subject !== 'all',
      filters.status !== 'all',
      filters.duration !== 'all',
      filters.tag !== 'all',
      filters.startDate !== '',
      filters.endDate !== ''
  ].filter(Boolean).length;

  return (
    <div className="animate-slide-up space-y-4 pb-24 max-w-5xl mx-auto">
      
      {/* Delete Modal */}
      {deleteConfirmationId && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 animate-fade-in">
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-slide-up">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500 animate-pulse">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Kaydı Sil?</h3>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button onClick={() => setDeleteConfirmationId(null)} className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200">Vazgeç</button>
                        <button onClick={() => { deleteHistoryItem(deleteConfirmationId); setDeleteConfirmationId(null); }} className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30">Sil</button>
                    </div>
               </div>
           </div>
       )}

      {/* 1. Header & Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-20">
          <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Konu, etiket veya notlarda ara..." 
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-950 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white transition-all outline-none"
                />
              </div>
              
              {/* Filter Toggle, Sort & Export */}
              <div className="flex gap-2">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                        showFilters || activeFilterCount > 0
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                        : 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                      <SlidersHorizontal size={16} />
                      <span className="hidden sm:inline">Filtrele</span>
                      {activeFilterCount > 0 && (
                          <span className="ml-1 w-5 h-5 bg-blue-500 text-white rounded-full text-[10px] flex items-center justify-center">{activeFilterCount}</span>
                      )}
                  </button>

                  <button 
                    onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                      <ArrowUpDown size={16} />
                      <span className="hidden sm:inline">{sortConfig.direction === 'desc' ? 'Yeni' : 'Eski'}</span>
                  </button>

                  {/* New Export Button */}
                  <button 
                    onClick={handleExportFiltered}
                    disabled={filteredHistory.length === 0}
                    title="Listelenenleri İndir"
                    aria-label="Listelenenleri İndir"
                    className="flex items-center justify-center px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <Download size={16} />
                  </button>
              </div>
          </div>

          {/* Expanded Filter Panel */}
          {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-slide-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Subject Filter */}
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Ders</label>
                      <div className="relative">
                          <select 
                            value={filters.subject}
                            onChange={(e) => setFilters({...filters, subject: e.target.value})}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                              <option value="all">Tüm Dersler</option>
                              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                      </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Durum</label>
                      <div className="relative">
                          <select 
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                              <option value="all">Tümü</option>
                              <option value="completed">Tamamlandı</option>
                              <option value="interrupted">Yarım Kaldı</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                      </div>
                  </div>

                  {/* Tag Filter */}
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Etiket</label>
                      <div className="relative">
                          <select 
                            value={filters.tag}
                            onChange={(e) => setFilters({...filters, tag: e.target.value})}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                              <option value="all">Tüm Etiketler</option>
                              {availableTags.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <Tag className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                      </div>
                  </div>

                  {/* Date Range - From */}
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Başlangıç Tarihi</label>
                      <div className="relative">
                          <input 
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-2 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                      </div>
                  </div>

                  {/* Date Range - To */}
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Bitiş Tarihi</label>
                      <div className="relative">
                          <input 
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-2 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                      </div>
                  </div>

                  {/* Duration Filter */}
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase">Süre</label>
                      <div className="relative">
                          <select 
                            value={filters.duration}
                            onChange={(e) => setFilters({...filters, duration: e.target.value})}
                            className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                              <option value="all">Farketmez</option>
                              <option value="short">Kısa (&lt; 20dk)</option>
                              <option value="medium">Orta (20-60dk)</option>
                              <option value="long">Uzun (&gt; 60dk)</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                      </div>
                  </div>
              </div>
          )}

          {/* Active Filters Summary Row */}
          {activeFilterCount > 0 && (
              <div className="mt-3 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                      {filters.subject !== 'all' && (
                          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                              {subjects.find(s=>s.id===filters.subject)?.name} <button onClick={() => setFilters({...filters, subject: 'all'})} aria-label="Filtreyi kaldır"><X size={12}/></button>
                          </span>
                      )}
                      {filters.tag !== 'all' && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                              {filters.tag} <button onClick={() => setFilters({...filters, tag: 'all'})} aria-label="Filtreyi kaldır"><X size={12}/></button>
                          </span>
                      )}
                      {(filters.startDate || filters.endDate) && (
                          <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                              <CalendarDays size={10}/> {filters.startDate || 'Başlangıç'} - {filters.endDate || 'Bugün'} 
                              <button onClick={() => setFilters({...filters, startDate: '', endDate: ''})} aria-label="Filtreyi kaldır"><X size={12}/></button>
                          </span>
                      )}
                  </div>
                  <button onClick={resetFilters} className="text-xs text-red-500 hover:underline font-medium">Temizle</button>
              </div>
          )}
      </div>

      {/* 2. Smart Summary Card */}
      {filteredHistory.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg"><Layers size={18} /></div>
                  <div>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{summaryStats.totalSessions}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Oturum</p>
                  </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg"><Clock size={18} /></div>
                  <div>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{Math.floor(summaryStats.totalMinutes/60)}<span className="text-xs">sa</span> {summaryStats.totalMinutes%60}<span className="text-xs">dk</span></p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Toplam Süre</p>
                  </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg"><Calculator size={18} /></div>
                  <div>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{summaryStats.totalQuestions}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Çözülen Soru</p>
                  </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg"><PieChart size={18} /></div>
                  <div>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">%{summaryStats.avgEfficiency}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Ort. Verim</p>
                  </div>
              </div>
          </div>
      )}

      {/* 3. Timeline List */}
      <div className="relative pl-4 md:pl-8 space-y-2 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-4 md:before:left-8 before:w-0.5 before:-translate-x-1/2 before:bg-slate-200 dark:before:bg-slate-700">
          {visibleHistory.length > 0 ? (
              <>
                {visibleHistory.map((item, index) => {
                    const prevItem = visibleHistory[index - 1];
                    const showDateSeparator = !prevItem || prevItem.date !== item.date;
                    
                    const subject = subjects.find(s => s.id === item.subject);
                    const isEditing = editingId === item.id;
                    const netCount = item.questionStats ? (item.questionStats.correct - (item.questionStats.incorrect * 0.25)) : 0;
                    
                    return (
                        <React.Fragment key={item.id}>
                            {/* Date Separator */}
                            {showDateSeparator && (
                                <div className="relative pl-8 py-4">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-slate-50 dark:ring-slate-900"></div>
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                        {item.date === getFormattedDate() ? 'Bugün' : item.date}
                                    </span>
                                </div>
                            )}

                            {/* Timeline Card */}
                            <div className="relative pl-8 group">
                                    {/* Connector Dot */}
                                    <div className={`absolute left-0 top-6 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${subject?.color || 'bg-slate-400'} z-10 shadow-sm`}></div>
                                    
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                        {/* Card Content */}
                                        <div className="flex flex-col md:flex-row gap-4">
                                            
                                            {/* Time & Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-mono text-slate-400 font-medium">
                                                        {new Date(item.timestamp).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${subject?.color.replace('bg-', 'text-').replace('600', '600') || 'text-slate-500'} bg-slate-100 dark:bg-slate-900`}>
                                                        {subject?.name || 'Bilinmeyen Ders'}
                                                    </span>
                                                    {item.status === 'interrupted' && (
                                                        <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-1.5 rounded flex items-center gap-0.5"><AlertCircle size={10}/> Yarım</span>
                                                    )}
                                                </div>

                                                {isEditing ? (
                                                    <div className="mt-2 space-y-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        <input 
                                                            type="text" value={editForm.topic} onChange={(e) => setEditForm({...editForm, topic: e.target.value})}
                                                            className="w-full text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                                                        />
                                                        <textarea 
                                                            value={editForm.note} onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                                                            placeholder="Not..." className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 resize-none" rows={2}
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => setEditingId(null)} className="text-xs text-slate-500 hover:text-slate-700">İptal</button>
                                                            <button onClick={handleSaveEdit} className="text-xs bg-primary text-white px-3 py-1 rounded font-bold">Kaydet</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h4 className="font-bold text-slate-800 dark:text-white truncate pr-8">{item.topic}</h4>
                                                        {item.sessionNote && (
                                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{item.sessionNote}</p>
                                                        )}
                                                        {item.tags && item.tags.length > 0 && (
                                                            <div className="flex gap-1 mt-2">
                                                                {item.tags.map(t => <span key={t} className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 rounded border border-slate-200 dark:border-slate-700">{t}</span>)}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Stats Columns */}
                                            <div className="flex items-center gap-2 md:gap-6 border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-3 md:pt-0 justify-between md:justify-end">
                                                <div className="text-center min-w-[60px]">
                                                    <span className="block text-lg font-bold text-slate-700 dark:text-slate-200">{item.durationMinutes}<span className="text-xs font-normal text-slate-400">dk</span></span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Süre</span>
                                                </div>
                                                
                                                {item.totalQuestions > 0 ? (
                                                    <>
                                                        <div className="text-center min-w-[50px]">
                                                            <span className="block text-lg font-bold text-blue-600 dark:text-blue-400">{netCount}</span>
                                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Net</span>
                                                        </div>
                                                        <div className="text-center min-w-[50px]">
                                                            <span className={`block text-lg font-bold ${item.efficiency >= 80 ? 'text-green-500' : item.efficiency >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>%{item.efficiency}</span>
                                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Verim</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center min-w-[100px] text-slate-300 dark:text-slate-600">
                                                        <MinusLine />
                                                        <span className="text-[10px]">Soru Yok</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons (Absolute Top Right) */}
                                        {!isEditing && (
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 pl-2 shadow-sm">
                                                <button onClick={() => handleStartEdit(item)} aria-label="Kaydı Düzenle" className="p-1.5 text-slate-400 hover:text-blue-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><Edit2 size={14}/></button>
                                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmationId(item.id); }} aria-label="Kaydı Sil" className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2 size={14}/></button>
                                            </div>
                                        )}
                                    </div>
                            </div>
                        </React.Fragment>
                    );
                })}
                
                {/* LOAD MORE BUTTON */}
                {filteredHistory.length > displayLimit && (
                    <div className="flex justify-center pt-6 pb-4">
                        <button 
                            onClick={() => setDisplayLimit(prev => prev + HISTORY_PAGE_SIZE)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm"
                        >
                            Daha Fazla Göster ({filteredHistory.length - displayLimit} kalan)
                        </button>
                    </div>
                )}
              </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center ml-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                <Filter className="text-slate-300 dark:text-slate-600 mb-2" size={32} />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Bu filtrelemeye uygun kayıt bulunamadı.</p>
                <button onClick={resetFilters} className="mt-2 text-primary text-sm font-bold hover:underline">Filtreleri Sıfırla</button>
            </div>
          )}
      </div>
    </div>
  );
};

const MinusLine = () => (
    <svg width="20" height="4" viewBox="0 0 20 4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="20" height="4" rx="2" fill="currentColor" fillOpacity="0.2"/>
    </svg>
);

export default History;
