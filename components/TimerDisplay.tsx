
import React, { useMemo } from 'react';
import { Play, Pause, Trash2, Check, PenLine } from 'lucide-react';
import { useTimer } from '../context/StudyContext';

interface TimerDisplayProps {
  activeSession: any;
  isZenMode: boolean;
  setIsEditTopicOpen: (val: boolean) => void;
  setIsStopConfirmOpen: (val: boolean) => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ 
  activeSession, 
  isZenMode, 
  setIsEditTopicOpen, 
  setIsStopConfirmOpen 
}) => {
  const { pauseSession, resumeSession, finishSession, formatTime, subjects } = useTimer();

  // --- Calculations for Gauge ---
  const isInfiniteStopwatch = activeSession?.mode === 'stopwatch' && activeSession?.totalDuration === 0;
  const TOTAL_TICKS = 60; 

  const activeTicks = useMemo(() => {
      if (!activeSession) return 0;
      if (isInfiniteStopwatch) {
          return Math.floor(activeSession.timeLeft / 60) % 60; 
      }
      const total = activeSession.totalDuration;
      const left = activeSession.timeLeft;
      const fraction = (total - left) / total;
      return Math.floor(fraction * TOTAL_TICKS);
  }, [activeSession?.timeLeft, activeSession?.totalDuration, isInfiniteStopwatch]);

  // Find subject name safely
  const subjectName = useMemo(() => {
     // We need to access subjects from context or pass it down. 
     // For performance, we'll just display the generic name or pass subjects as prop if strictly needed, 
     // but to keep this component pure, we rely on activeSession data if available or generic.
     // Ideally, pass subjectName from parent.
     return 'Ders'; 
  }, []);

  return (
    <div className={`
        ${isZenMode ? 'w-full aspect-square flex items-center justify-center' : 'lg:col-span-2'} 
        bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-12 shadow-sm flex flex-col items-center justify-between relative overflow-hidden transition-all duration-500
    `}>
        {/* Top Info */}
        <div className="z-10 text-center cursor-pointer hover:opacity-80 transition-opacity mb-4" onClick={() => setIsEditTopicOpen(true)}>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                {/* Subject Name Placeholder or Logic */}
                Çalışma Oturumu
            </div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                {activeSession.topic} <PenLine size={18} className="text-primary opacity-50"/>
            </div>
        </div>

        {/* The Gauge Clock Visual */}
        <div className="relative flex-1 flex items-center justify-center w-full max-w-[400px] aspect-square my-4">
            <svg className="w-full h-full" viewBox="0 0 400 400">
                <defs>
                    <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                
                {/* 1. Background Ticks */}
                {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
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
                            key={`bg-${i}`} 
                            x1={x1} y1={y1} x2={x2} y2={y2} 
                            stroke="currentColor" 
                            strokeWidth={isMajor ? 2 : 1}
                            className="text-slate-200 dark:text-slate-700/50"
                        />
                    );
                })}

                {/* 2. Active Ticks */}
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

                {/* 3. The Needle */}
                {(() => {
                    const currentTickIndex = activeTicks > 0 ? activeTicks - 1 : 0;
                    const angle = (currentTickIndex * 6) - 90;
                    const rad = angle * (Math.PI / 180);
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

                {/* Inner Circle Track */}
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
            <button onClick={() => setIsStopConfirmOpen(true)} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95" title="İptal Et"><Trash2 size={24}/></button>
            
            <button onClick={activeSession.isPaused ? resumeSession : pauseSession} className="flex-1 py-4 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all">
                {activeSession.isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                <span>{activeSession.isPaused ? 'Devam Et' : 'Duraklat'}</span>
            </button>
            
            <button onClick={() => finishSession()} className="p-4 rounded-2xl bg-green-500 text-white hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20" title="Bitir ve Kaydet"><Check size={24} strokeWidth={3} /></button>
        </div>
    </div>
  );
};

export default React.memo(TimerDisplay);
