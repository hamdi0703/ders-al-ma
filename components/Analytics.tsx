
import React, { useMemo, useState } from 'react';
import { 
  Clock, Target, CheckCircle2, 
  TrendingUp, Microscope, AlertTriangle,
  Calendar, BrainCircuit,
  Activity, Tag, BarChart2, PieChart as PieIcon,
  ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, ResponsiveContainer, Tooltip,
    PieChart, Pie, Cell, BarChart, Bar, CartesianGrid,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Area, AreaChart, YAxis, Legend, ComposedChart, ReferenceLine
} from 'recharts';
import { useStudy } from '../context/StudyContext';
import { SUBJECTS, SUBJECT_COLORS } from '../types';

type TabType = 'overview' | 'macro' | 'micro';

// --- Shared Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl animate-fade-in z-50">
                <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-white text-sm font-bold flex items-center gap-2" style={{ color: entry.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        {entry.name}: {entry.value}
                        {entry.unit && <span className="text-xs text-slate-400 ml-1">{entry.unit}</span>}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 opacity-60 min-h-[200px]">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
            <Icon size={32} />
        </div>
        <p className="text-sm font-medium text-center max-w-[200px]">{message}</p>
    </div>
);

const Analytics: React.FC = () => {
  const { history, getFormattedDate, subjects, settings } = useStudy();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // --- Common Calculations ---
  const totalDuration = history.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHoursStr = `${Math.floor(totalDuration / 60)}s ${totalDuration % 60}dk`;
  const completedSessions = history.filter(h => h.status === 'completed').length;
  
  const dailyGoalHours = parseFloat((settings.weeklyGoalMinutes / 7 / 60).toFixed(1));

  // --- 1. OVERVIEW DATA ---
  
  // Weekly Data (Area Chart)
  const weeklyData = useMemo(() => {
    const data = [];
    const map = new Map();
    history.forEach(h => {
        map.set(h.date, (map.get(h.date) || 0) + h.durationMinutes);
    });
    for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getFormattedDate(d); 
        const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
        data.push({
            name: dayName,
            Süre: parseFloat(((map.get(dateStr) || 0) / 60).toFixed(1)),
            fullDate: dateStr
        });
    }
    return data;
  }, [history, getFormattedDate]);

  // Subject Distribution (Donut Chart)
  const subjectChartData = useMemo(() => {
    const subjectStats = history.reduce((acc: any, curr) => {
        acc[curr.subject] = (acc[curr.subject] || 0) + curr.durationMinutes;
        return acc;
    }, {});
    
    return Object.keys(subjectStats)
        .map(key => {
            const subject = subjects.find(s => s.id === key);
            return {
                name: subject?.name || 'Silinmiş',
                value: Math.round(subjectStats[key]), // Minutes
                color: SUBJECT_COLORS[key] || SUBJECT_COLORS.default
            };
        })
        .sort((a, b) => b.value - a.value); // Sort biggest first
  }, [history, subjects]);

  // --- 2. MACRO (GELİŞİM) DATA ---
  const monthlyData = useMemo(() => {
      const months: Record<string, number> = {};
      const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
          const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const key = `${monthNames[d.getMonth()]}`;
          months[key] = 0;
      }

      history.forEach(h => {
          const d = new Date(h.timestamp);
          const key = `${monthNames[d.getMonth()]}`;
          if (months[key] !== undefined) {
              months[key] += h.durationMinutes;
          }
      });

      return Object.entries(months).map(([name, min]) => ({
          name,
          Saat: Math.round(min / 60)
      }));
  }, [history]);

  const proficiencyData = useMemo(() => {
      const stats: Record<string, {totalEff: number, count: number}> = {};
      
      history.forEach(h => {
          if (h.efficiency >= 0) {
              if (!stats[h.subject]) stats[h.subject] = { totalEff: 0, count: 0 };
              stats[h.subject].totalEff += h.efficiency;
              stats[h.subject].count += 1;
          }
      });

      return subjects.map(s => ({
          subject: s.name,
          Başarı: stats[s.id] ? Math.round(stats[s.id].totalEff / stats[s.id].count) : 0,
          fullMark: 100
      })).filter(d => d.Başarı > 0); // Only show subjects with data
  }, [history, subjects]);

  const tagData = useMemo(() => {
    const tags: Record<string, number> = {};
    history.forEach(h => {
        if (h.tags && h.tags.length > 0) {
            h.tags.forEach(tag => {
                tags[tag] = (tags[tag] || 0) + h.durationMinutes;
            });
        }
    });
    
    return Object.entries(tags)
        .map(([name, minutes]) => ({ name, minutes: Math.round(minutes) }))
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 5); // Top 5 tags only for cleaner mobile view
  }, [history]);

  // --- 3. MICRO (VERİMLİLİK) DATA ---
  
  // Accuracy Trend (Last 10 sessions with efficiency data)
  const accuracyTrendData = useMemo(() => {
      return history
        .filter(h => h.efficiency >= 0)
        .sort((a, b) => a.timestamp - b.timestamp) // Sort by date ascending
        .slice(-10) // Last 10
        .map(h => ({
            name: h.date.substring(0, 5), // DD.MM
            Başarı: h.efficiency
        }));
  }, [history]);

  const weakTopics = useMemo(() => {
      const topicStats: Record<string, {correct: number, incorrect: number, subject: string}> = {};
      
      history.forEach(h => {
          if (h.totalQuestions > 0) {
              const key = `${h.topic}::${h.subject}`;
              if (!topicStats[key]) topicStats[key] = { correct: 0, incorrect: 0, subject: h.subject };
              topicStats[key].correct += h.questionStats.correct;
              topicStats[key].incorrect += h.questionStats.incorrect;
          }
      });

      return Object.entries(topicStats)
          .map(([key, stat]) => {
              const [topicName, subjectId] = key.split('::');
              const total = stat.correct + stat.incorrect;
              const accuracy = total > 0 ? (stat.correct / total) * 100 : 0;
              const subjectName = subjects.find(s => s.id === subjectId)?.name || '';
              return { topic: topicName, subject: subjectName, accuracy, total };
          })
          .filter(item => item.total >= 5 && item.accuracy < 60) // Show topics with at least 5 questions
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 5);
  }, [history, subjects]);

  const hourlyData = useMemo(() => {
      const hours = Array(24).fill(0).map((_, i) => ({
          hour: i,
          label: `${i}:00`,
          minutes: 0,
          efficiency: 0,
          count: 0
      }));

      history.forEach(h => {
          const date = new Date(h.timestamp);
          const hour = date.getHours();
          hours[hour].minutes += h.durationMinutes;
          if (h.efficiency >= 0) {
              hours[hour].efficiency += h.efficiency;
              hours[hour].count += 1;
          }
      });

      return hours.map(h => ({
          ...h,
          minutes: Math.round(h.minutes),
          Verim: h.count > 0 ? Math.round(h.efficiency / h.count) : 0
      }));
  }, [history]);

  return (
    <div className="animate-fade-in space-y-6 pb-24">
         {/* Header & Tabs */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BrainCircuit className="text-primary" /> Analiz Merkezi
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Veriye dayalı çalışma stratejileri geliştir.</p>
            </div>
         </div>

         {/* Navigation Tabs - Mobile Optimized */}
         <div className="flex overflow-x-auto gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4 scrollbar-hide">
             {[
                 { id: 'overview', label: 'Genel', icon: Activity },
                 { id: 'macro', label: 'Gelişim', icon: TrendingUp },
                 { id: 'micro', label: 'Verim', icon: Microscope },
             ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center
                        ${activeTab === tab.id 
                            ? 'bg-primary text-white shadow-md' 
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }
                    `}
                 >
                     <tab.icon size={16} /> {tab.label}
                 </button>
             ))}
         </div>

         {/* CONTENT AREAS */}
         
         {/* 1. OVERVIEW TAB */}
         {activeTab === 'overview' && (
             <div className="space-y-6 animate-slide-up">
                 {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KPICard label="Toplam Süre" val={totalHoursStr} icon={Clock} color="blue" />
                    <KPICard label="Oturumlar" val={completedSessions} icon={CheckCircle2} color="purple" />
                    <KPICard label="Aktif Ders" val={subjectChartData.length} icon={Target} color="orange" />
                    <KPICard label="Veri Puanı" val={history.length * 10} icon={TrendingUp} color="indigo" subtext="XP" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Weekly Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-primary"/> Haftalık Aktivite (Saat)
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWeekly" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                                    <Tooltip content={<CustomTooltip />} cursor={{stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5'}} />
                                    <ReferenceLine y={dailyGoalHours} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Hedef', fill: '#10b981', fontSize: 10 }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="Süre" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3} 
                                        fillOpacity={1} 
                                        fill="url(#colorWeekly)" 
                                        unit=" sa"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart with Mobile Friendly Legend */}
                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                             <PieIcon size={18} className="text-purple-500"/> Ders Dağılımı
                        </h3>
                        <div className="h-48 w-full relative shrink-0">
                            {subjectChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Pie 
                                            data={subjectChartData} 
                                            innerRadius={60} 
                                            outerRadius={80} 
                                            paddingAngle={4} 
                                            dataKey="value"
                                            cornerRadius={4}
                                        >
                                            {subjectChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyState message="Henüz ders kaydı yok" icon={PieIcon} />}
                            
                            {subjectChartData.length > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="text-2xl font-bold text-slate-800 dark:text-white block">{Math.floor(totalDuration/60)}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Toplam Saat</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Custom Legend */}
                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                            {subjectChartData.map((entry, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></span>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{entry.name}</span>
                                    </div>
                                    <span className="text-slate-500">{entry.value} dk</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
         )}

         {/* 2. MACRO (GELİŞİM) ANALYSIS TAB */}
         {activeTab === 'macro' && (
             <div className="space-y-6 animate-slide-up">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Monthly Trend */}
                     <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                             <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Calendar size={20}/></div>
                             <div>
                                 <h3 className="text-base font-bold text-slate-900 dark:text-white">Aylık Trend</h3>
                                 <p className="text-xs text-slate-500">Son 6 ayın çalışma yoğunluğu.</p>
                             </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                                    <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                    <Bar dataKey="Saat" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={32}>
                                         {monthlyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`url(#colorBar${index})`} />
                                         ))}
                                    </Bar>
                                    <defs>
                                        {monthlyData.map((entry, index) => (
                                            <linearGradient id={`colorBar${index}`} key={index} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                                            </linearGradient>
                                        ))}
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                     </div>

                     {/* Proficiency Radar/Bar - Adaptive */}
                     <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                             <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600"><Target size={20}/></div>
                             <div>
                                 <h3 className="text-base font-bold text-slate-900 dark:text-white">Yetkinlik Haritası</h3>
                                 <p className="text-xs text-slate-500">Ders bazlı başarı oranları.</p>
                             </div>
                        </div>
                        <div className="h-64 w-full">
                            {proficiencyData.length > 2 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={proficiencyData}>
                                        <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
                                        <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Başarı %" dataKey="Başarı" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.3} />
                                        <Tooltip content={<CustomTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : proficiencyData.length > 0 ? (
                                // Fallback to BarChart if sparse data
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={proficiencyData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.1} />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis type="category" dataKey="subject" tick={{fill: '#94a3b8', fontSize: 11}} width={80} />
                                        <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                        <Bar dataKey="Başarı" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} unit="%" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState message="Yetkinlik analizi için test verisi gerekiyor." icon={Target} />
                            )}
                        </div>
                     </div>
                 </div>

                 {/* Tag Analysis */}
                 <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600"><Tag size={20}/></div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Etiket Analizi (Top 5)</h3>
                                <p className="text-xs text-slate-500">En çok vakit ayırdığın çalışma türleri.</p>
                            </div>
                    </div>
                    <div className="h-56 w-full">
                        {tagData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={tagData} layout="vertical" margin={{ left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} strokeOpacity={0.1} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" tick={{fill: '#64748b', fontSize: 11}} width={90} />
                                    <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                    <Bar dataKey="minutes" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} name="Süre (dk)" unit=" dk" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="Henüz etiketlenmiş bir çalışma yok." icon={Tag} />
                        )}
                    </div>
                 </div>
             </div>
         )}

         {/* 3. MICRO (VERİMLİLİK) ANALYSIS TAB */}
         {activeTab === 'micro' && (
             <div className="space-y-6 animate-slide-up">
                 
                 {/* Accuracy Trend Chart */}
                 <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                             <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600"><TrendingUp size={20}/></div>
                             <div>
                                 <h3 className="text-base font-bold text-slate-900 dark:text-white">Başarı Trendi</h3>
                                 <p className="text-xs text-slate-500">Son 10 oturumdaki performans değişimi.</p>
                             </div>
                        </div>
                        {accuracyTrendData.length > 1 && (
                            accuracyTrendData[accuracyTrendData.length-1].Başarı >= accuracyTrendData[0].Başarı 
                            ? <span className="text-xs font-bold text-green-500 flex items-center bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded"><ArrowUpRight size={14}/> Yükselişte</span>
                            : <span className="text-xs font-bold text-red-500 flex items-center bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded"><ArrowDownRight size={14}/> Düşüşte</span>
                        )}
                     </div>
                     <div className="h-64 w-full">
                         {accuracyTrendData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={accuracyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="Başarı" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#0d9488', strokeWidth: 2, stroke:'#fff'}} activeDot={{r: 6}} unit="%" />
                                </LineChart>
                            </ResponsiveContainer>
                         ) : <EmptyState message="Trend analizi için daha fazla test verisi gerekiyor." icon={TrendingUp} />}
                     </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     
                     {/* Weak Topics List */}
                     <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                         <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600"><AlertTriangle size={20}/></div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Dikkat Gerektirenler</h3>
                                <p className="text-xs text-slate-500">Başarı oranı %60'ın altındaki konular.</p>
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                             {weakTopics.length > 0 ? weakTopics.map((item, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                     <div>
                                         <p className="font-bold text-slate-800 dark:text-white text-sm">{item.topic}</p>
                                         <p className="text-xs text-slate-500">{item.subject} • {item.total} Soru</p>
                                     </div>
                                     <div className="text-right">
                                         <span className="text-lg font-bold text-red-600 dark:text-red-400">%{Math.round(item.accuracy)}</span>
                                         <p className="text-[10px] text-red-400 font-bold uppercase">Başarı</p>
                                     </div>
                                 </div>
                             )) : (
                                 <div className="text-center py-10">
                                     <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2 text-green-500">
                                         <CheckCircle2 size={24} />
                                     </div>
                                     <p className="text-slate-500 dark:text-slate-400">Harika! Zayıf konu tespit edilemedi.</p>
                                 </div>
                             )}
                         </div>
                     </div>

                     {/* Hourly Efficiency & Volume Heatmap */}
                     <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                             <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600"><Layers size={20}/></div>
                             <div>
                                 <h3 className="text-base font-bold text-slate-900 dark:text-white">Saatlik Analiz</h3>
                                 <p className="text-xs text-slate-500">Çalışma yoğunluğu ve verimlilik karşılaştırması.</p>
                             </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={hourlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.2}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} interval={3}/>
                                    
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#10b981', fontSize: 10}} domain={[0, 100]} />
                                    
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                                    
                                    <Bar yAxisId="left" dataKey="minutes" fill="url(#colorMin)" barSize={12} radius={[4, 4, 0, 0]} name="Süre (dk)" unit=" dk" />
                                    <Line yAxisId="right" type="monotone" dataKey="Verim" stroke="#10b981" strokeWidth={2} dot={false} name="Verim %" unit="%" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                     </div>
                 </div>
             </div>
         )}
    </div>
  );
};

// Helper Component for Overview KPI
const KPICard = ({label, val, icon: Icon, color, subtext}: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase truncate">{label}</p>
            <div className={`p-1.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
                <Icon size={14} />
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{val}</p>
            {subtext && <span className="text-xs text-slate-400 font-bold">{subtext}</span>}
        </div>
    </div>
);

export default Analytics;
