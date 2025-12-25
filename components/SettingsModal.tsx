
import React, { useState, useRef } from 'react';
import { 
    X, Moon, Sun, Volume2, Palette, Download, Upload, Trash2, 
    Bell, Languages, Monitor, HardDrive, RotateCcw, Check, AlertTriangle, User,
    Target, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Laptop
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ThemeColor } from '../types';

type SettingsTab = 'general' | 'appearance' | 'data';

export const SettingsModal: React.FC = () => {
    const { 
        isSettingsOpen, toggleSettings, settings, updateSettings, 
        exportData, importData, resetApp, exportHistoryToCSV, exportTasksToCSV,
        installPrompt, setInstallPrompt
    } = useStudy();
    
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [confirmReset, setConfirmReset] = useState(false);
    const [importStatus, setImportStatus] = useState<{type: 'success'|'error', msg: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (!isSettingsOpen) return null;

    const colors: {id: ThemeColor, bg: string}[] = [
        {id: 'blue', bg: 'bg-blue-500'},
        {id: 'purple', bg: 'bg-purple-500'},
        {id: 'orange', bg: 'bg-orange-500'},
        {id: 'green', bg: 'bg-green-500'},
        {id: 'rose', bg: 'bg-rose-500'},
    ];

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                setInstallPrompt(null);
            }
        });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const result = importData(content);
            
            if (result.success) {
                setImportStatus({ type: 'success', msg: result.message });
                setTimeout(() => {
                    setImportStatus(null);
                    toggleSettings();
                }, 2000);
            } else {
                setImportStatus({ type: 'error', msg: result.message });
                setTimeout(() => setImportStatus(null), 4000);
            }
            
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        if (confirmReset) {
            resetApp();
        } else {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 3000);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* Install App Section (Only if not installed) */}
                        {!isStandalone && (
                            <div className="p-5 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl text-white shadow-lg transform transition-all hover:scale-[1.02]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <Laptop size={22} className="text-blue-200" /> 
                                            Uygulamayı Yükle
                                        </h3>
                                        <p className="text-xs text-blue-100 mt-2 leading-relaxed opacity-90">
                                            StudyFlow'u bilgisayarına veya telefonuna indirerek internetsiz kullanabilirsin.
                                        </p>
                                    </div>
                                    {installPrompt ? (
                                        <button 
                                            onClick={handleInstallClick}
                                            className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-xl shrink-0 flex items-center gap-2"
                                        >
                                            <Download size={16} /> Yükle
                                        </button>
                                    ) : (
                                        <div className="bg-white/10 p-2 rounded-lg border border-white/20 text-[10px] text-center max-w-[120px] shrink-0 font-medium">
                                            Tarayıcı menüsünden <strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> seçin.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Profile Settings */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                             <div className="flex items-center gap-2 mb-3">
                                <User size={20} className="text-slate-500 dark:text-slate-400" />
                                <span className="font-medium text-slate-700 dark:text-slate-200">Profil Bilgileri</span>
                             </div>
                             <div className="space-y-3">
                                 <div>
                                     <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Adınız</label>
                                     <input 
                                        type="text" 
                                        value={settings.userName || ''} 
                                        onChange={(e) => updateSettings({ userName: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                                        placeholder="İsminiz..."
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Unvan / Hedef</label>
                                     <input 
                                        type="text" 
                                        value={settings.userTitle || ''} 
                                        onChange={(e) => updateSettings({ userTitle: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                                        placeholder="Örn: YKS Öğrencisi"
                                     />
                                 </div>
                             </div>
                        </div>
                        
                        {/* Goals Settings */}
                         <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                             <div className="flex items-center gap-2 mb-3">
                                <Target size={20} className="text-slate-500 dark:text-slate-400" />
                                <span className="font-medium text-slate-700 dark:text-slate-200">Haftalık Hedef</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <input 
                                    type="number" 
                                    value={Math.round(settings.weeklyGoalMinutes / 60)} 
                                    onChange={(e) => updateSettings({ weeklyGoalMinutes: Math.max(1, parseInt(e.target.value) * 60) })}
                                    className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-center text-slate-800 dark:text-white focus:outline-none focus:border-primary font-bold"
                                />
                                <span className="text-sm text-slate-500">Saat / Hafta</span>
                             </div>
                             <p className="text-xs text-slate-400 mt-2">Bu hedef paneldeki ilerleme çubuğunda gösterilir.</p>
                        </div>

                        {/* Language */}
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Languages size={20} className="text-slate-500 dark:text-slate-400" />
                                <span className="font-medium text-slate-700 dark:text-slate-200">Dil / Language</span>
                            </div>
                            <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-bold text-slate-800 dark:text-white shadow-sm">Türkçe</button>
                                <button className="px-3 py-1 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600">English</button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer" onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}>
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-slate-500 dark:text-slate-400" />
                                <div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200 block">Bildirimler</span>
                                    <span className="text-xs text-slate-400">Süre dolduğunda tarayıcı bildirimi gönder</span>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.notificationsEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.notificationsEnabled ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>

                         {/* Sound & Volume */}
                         <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                            <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}>
                                <span className="text-slate-700 dark:text-slate-200 font-medium flex items-center gap-3">
                                    <Volume2 size={20} className="text-slate-500 dark:text-slate-400" /> Ses Efektleri
                                </span>
                                <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.soundEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.soundEnabled ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                            {settings.soundEnabled && (
                                <div className="flex items-center gap-4 animate-slide-up">
                                    <span className="text-xs text-slate-500 font-bold uppercase w-20">Ses Düzeyi</span>
                                    <input 
                                        type="range" 
                                        min="0" max="1" step="0.1" 
                                        value={settings.soundVolume}
                                        onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <span className="text-xs text-slate-500 w-8 text-right">%{Math.round(settings.soundVolume * 100)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <div className="space-y-6 animate-fade-in">
                         {/* Dark Mode */}
                         <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl cursor-pointer" onClick={() => updateSettings({ darkMode: !settings.darkMode })}>
                            <div className="flex items-center gap-3">
                                {settings.darkMode ? <Moon size={20} className="text-purple-400" /> : <Sun size={20} className="text-orange-400" />}
                                <div>
                                    <span className="font-medium text-slate-700 dark:text-slate-200 block">Görünüm Modu</span>
                                    <span className="text-xs text-slate-400">{settings.darkMode ? 'Karanlık Mod' : 'Aydınlık Mod'}</span>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.darkMode ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${settings.darkMode ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </div>

                        {/* Theme Colors */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                             <div className="flex items-center gap-3 mb-4">
                                <Palette size={20} className="text-slate-500 dark:text-slate-400" />
                                <span className="font-medium text-slate-700 dark:text-slate-200">Tema Rengi</span>
                             </div>
                             <div className="flex gap-4 justify-center">
                                {colors.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => updateSettings({ themeColor: c.id })}
                                        className={`${c.bg} w-10 h-10 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${settings.themeColor === c.id ? 'border-slate-500 dark:border-white ring-2 ring-slate-400/20 dark:ring-white/20' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        {settings.themeColor === c.id && <Check size={16} className="text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'data':
                return (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* Import Status Alert */}
                        {importStatus && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 animate-slide-up ${importStatus.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                                {importStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                <span className="text-sm font-bold">{importStatus.msg}</span>
                            </div>
                        )}

                        {/* Backup JSON */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Yedekleme ve Geri Yükleme</h3>
                            <button 
                                onClick={exportData}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg"><Download size={20} /></div>
                                    <div className="text-left">
                                        <span className="block font-medium text-slate-700 dark:text-slate-200">Tam Yedek (JSON)</span>
                                        <span className="text-xs text-slate-500">Tüm verileri indir</span>
                                    </div>
                                </div>
                            </button>

                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg"><Upload size={20} /></div>
                                    <div className="text-left">
                                        <span className="block font-medium text-slate-700 dark:text-slate-200">Geri Yükle (JSON)</span>
                                        <span className="text-xs text-slate-500">Dosyadan veri yükle</span>
                                    </div>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    accept=".json" 
                                    className="hidden" 
                                />
                            </button>
                        </div>

                        {/* Excel Export */}
                        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                             <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rapor Oluştur (Excel / CSV)</h3>
                             <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={exportHistoryToCSV}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                                >
                                    <FileSpreadsheet size={24} className="text-green-600 dark:text-green-400 mb-2" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Geçmişi İndir</span>
                                </button>
                                <button 
                                    onClick={exportTasksToCSV}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
                                >
                                    <FileText size={24} className="text-indigo-600 dark:text-indigo-400 mb-2" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Görevleri İndir</span>
                                </button>
                             </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700 my-4"></div>

                        <button 
                            onClick={handleReset}
                            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all ${confirmReset ? 'bg-red-600 text-white animate-pulse' : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'}`}
                        >
                            {confirmReset ? <AlertTriangle size={18} /> : <RotateCcw size={18} />}
                            {confirmReset ? 'Emin misin? Tıkla ve Sıfırla' : 'Uygulamayı Sıfırla'}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-2xl relative animate-slide-up flex flex-col max-h-[90vh] overflow-hidden">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ayarlar</h2>
                    <button onClick={toggleSettings} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors bg-white dark:bg-slate-700 p-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Sidebar / Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 px-2">
                    <button 
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        Genel
                    </button>
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'appearance' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        Görünüm
                    </button>
                    <button 
                        onClick={() => setActiveTab('data')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'data' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        Veri
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {renderTabContent()}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">StudyFlow Pro v1.6.0</p>
                </div>
            </div>
        </div>
    );
}
