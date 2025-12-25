
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Calculator, Atom, FlaskConical, Dna, Landmark, 
  ChevronRight, Clock, Target, CheckCircle2, Plus, Trash2,
  BarChart2, FolderOpen, AlertTriangle, X, ArrowUpDown, AlertCircle,
  GraduationCap, ChevronLeft, Calendar, FileText, TrendingUp, Circle, CheckCircle, Disc,
  Wand2, ListPlus, BrainCircuit, Globe, Scale, Eraser, RotateCcw, Edit2, Palette
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    AreaChart, Area 
} from 'recharts';
import { useStudy } from '../context/StudyContext';
import { TestLog, TopicStatus, Subject } from '../types';

// Icon mapping
const ICON_MAP: Record<string, React.ElementType> = {
    Calculator, Atom, FlaskConical, Dna, BookOpen, Landmark, BrainCircuit, Globe, Scale
};

// ... (CURRICULUM DATA CONSTANTS TYT_DATA, AYT_DATA etc. remain same, skipping for brevity but assume they are here) ...
const TYT_DATA = [
    {
        name: 'TYT Türkçe',
        icon: 'BookOpen',
        color: 'bg-red-500', 
        topics: [
            'Sözcükte Anlam', 'Cümlede Anlam', 'Paragrafta Anlam ve Anlatım', 'Ses Bilgisi',
            'Yazım Kuralları', 'Noktalama İşaretleri', 'Sözcükte Yapı (Ek-Kök)', 'Sözcük Türleri (İsim, Sıfat, Zamir, Zarf)',
            'Edat - Bağlaç - Ünlem', 'Fiiller, Ek Fiil ve Fiilimsi', 'Fiilde Çatı', 'Cümlenin Ögeleri',
            'Cümle Türleri', 'Anlatım Bozuklukları'
        ]
    },
    {
        name: 'TYT Matematik',
        icon: 'Calculator',
        color: 'bg-sky-500', 
        topics: [
            'Temel Kavramlar', 'Sayı Basamakları', 'Bölme ve Bölünebilme', 'EBOB - OKEK',
            'Rasyonel Sayılar', 'Basit Eşitsizlikler', 'Mutlak Değer', 'Üslü Sayılar', 'Köklü Sayılar',
            'Çarpanlara Ayırma', 'Oran - Orantı', 'Denklem Çözme', 'Sayı Problemleri', 'Kesir Problemleri',
            'Yaş Problemleri', 'Hız Problemleri', 'Yüzde Kar-Zarar Problemleri', 'Karışım Problemleri', 'Grafik Problemleri',
            'Kümeler', 'Fonksiyonlar', 'Permütasyon - Kombinasyon', 'Binom', 'Olasılık', 'İstatistik',
            'Polinomlar', '2. Dereceden Denklemler', 'Karmaşık Sayılar'
        ]
    },
    {
        name: 'TYT Geometri',
        icon: 'Calculator',
        color: 'bg-indigo-400',
        topics: [
            'Doğruda ve Üçgende Açılar', 'Üçgende Açı-Kenar Bağıntıları', 'Üçgende Benzerlik',
            'Açıortay ve Kenarortay', 'Özel Üçgenler (Dik, İkizkenar, Eşkenar)', 'Üçgende Alan',
            'Çokgenler', 'Dörtgenler', 'Yamuk', 'Paralelkenar', 'Dikdörtgen', 'Kare', 'Deltoid',
            'Çember ve Daire', 'Analitik Geometri', 'Katı Cisimler (Prizma, Piramit, Koni, Küre)'
        ]
    },
    {
        name: 'TYT Fizik',
        icon: 'Atom',
        color: 'bg-purple-500', 
        topics: [
            'Fizik Bilimine Giriş', 'Madde ve Özellikleri', 'Sıvıların Kaldırma Kuvveti ve Basınç',
            'Isı, Sıcaklık ve Genleşme', 'Hareket ve Kuvvet', 'Dinamik', 'İş, Güç ve Enerji',
            'Elektrik ve Manyetizma', 'Optik', 'Dalgalar'
        ]
    },
    {
        name: 'TYT Kimya',
        icon: 'FlaskConical',
        color: 'bg-teal-500', 
        topics: [
            'Kimya Bilimi', 'Atom ve Periyodik Sistem', 'Kimyasal Türler Arası Etkileşimler',
            'Maddenin Halleri', 'Doğa ve Kimya', 'Kimyanın Temel Yasaları', 'Kimyasal Hesaplamalar',
            'Karışımlar', 'Asitler, Bazlar ve Tuzlar', 'Kimya Her Yerde'
        ]
    },
    {
        name: 'TYT Biyoloji',
        icon: 'Dna',
        color: 'bg-green-500', 
        topics: [
            'Canlıların Ortak Özellikleri', 'Temel Bileşenler', 'Hücre ve Organeller', 'Madde Geçişleri',
            'Canlıların Sınıflandırılması', 'Mitoz ve Eşeysiz Üreme', 'Mayoz ve Eşeyli Üreme',
            'Kalıtım', 'Ekosistem Ekolojisi', 'Güncel Çevre Sorunları'
        ]
    },
    {
        name: 'TYT Tarih',
        icon: 'Landmark',
        color: 'bg-orange-500', 
        topics: [
            'Tarih Bilimine Giriş', 'İlk Uygarlıklar', 'İlk Türk Devletleri', 'İslam Tarihi ve Uygarlığı',
            'Türk-İslam Devletleri', 'Osmanlı Tarihi (Kuruluş-Yükselme)', 'Osmanlı (Duraklama-Gerileme-Dağılma)',
            '20. YY Başlarında Osmanlı', 'Milli Mücadele Dönemi', 'Atatürk İlke ve İnkılapları', 'Dış Politika'
        ]
    },
    {
        name: 'TYT Coğrafya',
        icon: 'Globe',
        color: 'bg-amber-500', 
        topics: [
            'Doğa ve İnsan', 'Dünyanın Şekli ve Hareketleri', 'Coğrafi Konum', 'Harita Bilgisi',
            'Atmosfer ve İklim', 'Yerin Şekillenmesi', 'Su Kaynakları', 'Toprak ve Bitkiler',
            'Nüfus ve Göç', 'Ekonomik Faaliyetler', 'Bölgeler ve Ülkeler', 'Doğal Afetler'
        ]
    },
    {
        name: 'TYT Felsefe',
        icon: 'BrainCircuit',
        color: 'bg-fuchsia-500',
        topics: [
            'Felsefenin Alanı', 'Bilgi Felsefesi', 'Bilim Felsefesi', 'Varlık Felsefesi',
            'Ahlak Felsefesi', 'Siyaset Felsefesi', 'Sanat Felsefesi', 'Din Felsefesi'
        ]
    },
    {
        name: 'TYT Din Kültürü',
        icon: 'BookOpen',
        color: 'bg-emerald-500',
        topics: [
            'İnanç ve İbadet', 'Hz. Muhammed’in Hayatı', 'Vahiy ve Akıl', 'İslam Düşüncesi ve Yorumlar', 'Değerler ve Sanat'
        ]
    }
];

const AYT_SAYISAL_DATA = [
    {
        name: 'AYT Matematik',
        icon: 'Calculator',
        color: 'bg-blue-800', 
        topics: [
            'Fonksiyonlar (İleri)', 'Polinomlar', '2. Dereceden Denklemler', 'Parabol', 'Eşitsizlikler',
            'Trigonometri', 'Logaritma', 'Diziler', 'Limit ve Süreklilik', 'Türev', 'İntegral',
            'Permütasyon-Kombinasyon-Olasılık (İleri)'
        ]
    },
    {
        name: 'AYT Geometri',
        icon: 'Calculator',
        color: 'bg-indigo-800', 
        topics: [
            'Üçgenler (Tekrar)', 'Çokgenler ve Dörtgenler', 'Çember ve Daire', 'Analitik Geometri (Nokta, Doğru, Çember)',
            'Dönüşüm Geometrisi', 'Katı Cisimler'
        ]
    },
    {
        name: 'AYT Fizik',
        icon: 'Atom',
        color: 'bg-purple-800', 
        topics: [
            'Vektörler', 'Kuvvet, Tork ve Denge', 'Kütle Merkezi', 'Basit Makineler',
            'Hareket ve Newton Yasaları', 'İş, Güç, Enerji II', 'Atışlar', 'İtme ve Momentum',
            'Elektrik Alan ve Potansiyel', 'Paralel Levhalar ve Sığa', 'Manyetizma ve İndüksiyon',
            'Alternatif Akım ve Transformatörler', 'Çembersel Hareket', 'Kütle Çekim ve Kepler',
            'Basit Harmonik Hareket', 'Dalga Mekaniği', 'Atom Fiziği ve Radyoaktivite', 'Modern Fizik'
        ]
    },
    {
        name: 'AYT Kimya',
        icon: 'FlaskConical',
        color: 'bg-teal-800', 
        topics: [
            'Modern Atom Teorisi', 'Gazlar', 'Sıvı Çözeltiler ve Çözünürlük',
            'Kimyasal Tepkimelerde Enerji', 'Kimyasal Tepkimelerde Hız', 'Kimyasal Denge',
            'Asit-Baz Dengesi', 'Çözünürlük Dengesi (KÇÇ)', 'Kimya ve Elektrik',
            'Karbon Kimyasına Giriş', 'Organik Kimya', 'Enerji Kaynakları'
        ]
    },
    {
        name: 'AYT Biyoloji',
        icon: 'Dna',
        color: 'bg-green-800', 
        topics: [
            'Sinir Sistemi', 'Endokrin Sistem', 'Duyu Organları', 'Destek ve Hareket Sistemi',
            'Sindirim Sistemi', 'Dolaşım ve Bağışıklık Sistemi', 'Solunum Sistemi', 'Üriner Sistem',
            'Üreme Sistemi ve Embriyonik Gelişim', 'Komünite ve Popülasyon Ekolojisi',
            'Nükleik Asitler ve Protein Sentezi', 'Canlılık ve Enerji (Fotosentez-Kemosentez-Solunum)',
            'Bitki Biyolojisi', 'Canlılar ve Çevre'
        ]
    }
];

const AYT_SOZEL_DATA = [
    {
        name: 'AYT Edebiyat',
        icon: 'BookOpen',
        color: 'bg-yellow-700', 
        topics: [
            'Anlam Bilgisi (Sözcük, Cümle, Paragraf)', 'Şiir Bilgisi', 'Edebi Sanatlar', 'Düzyazı Türleri',
            'İslamiyet Öncesi Türk Edebiyatı', 'Halk Edebiyatı', 'Divan Edebiyatı', 'Edebi Akımlar',
            'Tanzimat Edebiyatı', 'Servet-i Fünun ve Fecr-i Ati', 'Milli Edebiyat',
            'Cumhuriyet Dönemi Şiir', 'Cumhuriyet Dönemi Roman/Hikaye', 'Dünya Edebiyatı'
        ]
    },
    {
        name: 'AYT Tarih 1-2',
        icon: 'Landmark',
        color: 'bg-orange-800', 
        topics: [
            'Tarih Bilimine Giriş', 'Uygarlığın Doğuşu', 'İlk Türk Devletleri', 'İslam Tarihi',
            'Türk-İslam Devletleri', 'Türkiye Tarihi', 'Beylikten Devlete (Osmanlı)', 'Dünya Gücü Osmanlı',
            'Osmanlı Kültür ve Medeniyeti', 'Yeni ve Yakın Çağda Avrupa', 'Osmanlı Dağılma Dönemi',
            'Milli Mücadele', 'Atatürkçülük ve Türk İnkılabı', 'Türk Dış Politikası',
            'Çağdaş Türk ve Dünya Tarihi'
        ]
    },
    {
        name: 'AYT Coğrafya 1-2',
        icon: 'Globe',
        color: 'bg-amber-700', 
        topics: [
            'Ekosistem ve Madde Döngüleri', 'Nüfus Politikaları ve Yerleşme', 'Türkiye\'nin Ekonomik Coğrafyası',
            'Türkiye\'nin Bölgeleri ve Kalkınma Projeleri', 'Küresel Ortam: Bölgeler ve Ülkeler',
            'Çevre ve Toplum', 'Doğal Afetler', 'Küreselleşen Dünya'
        ]
    },
    {
        name: 'AYT Felsefe Grubu',
        icon: 'BrainCircuit',
        color: 'bg-fuchsia-800',
        topics: [
            'Felsefe: Bilgi, Varlık, Ahlak, Siyaset, Sanat, Din Felsefesi',
            'Psikoloji: Temel Süreçler, Öğrenme, Bellek, Ruh Sağlığı',
            'Sosyoloji: Birey ve Toplum, Toplumsal Yapı, Değişme, Kültür',
            'Mantık: Klasik Mantık, Mantık ve Dil, Sembolik Mantık'
        ]
    },
    {
        name: 'AYT Din Kültürü',
        icon: 'BookOpen',
        color: 'bg-emerald-800',
        topics: [
            'Dünya ve Ahiret', 'Kur’an’a Göre Hz. Muhammed', 'İnanç Meseleleri', 'İslam ve Bilim',
            'Anadolu’da İslam', 'İslam Düşüncesinde Mezhepler', 'Güncel Dini Meseleler'
        ]
    }
];

const AYT_EA_DATA = [
    {
        name: 'AYT Edebiyat',
        icon: 'BookOpen',
        color: 'bg-yellow-700',
        topics: AYT_SOZEL_DATA.find(d => d.name === 'AYT Edebiyat')?.topics || []
    },
    {
        name: 'AYT Matematik',
        icon: 'Calculator',
        color: 'bg-blue-800',
        topics: AYT_SAYISAL_DATA.find(d => d.name === 'AYT Matematik')?.topics || []
    },
    {
        name: 'AYT Geometri',
        icon: 'Calculator',
        color: 'bg-indigo-800',
        topics: AYT_SAYISAL_DATA.find(d => d.name === 'AYT Geometri')?.topics || []
    },
    {
        name: 'AYT Tarih 1',
        icon: 'Landmark',
        color: 'bg-orange-800',
        topics: [
            'Tarih Bilimine Giriş', 'İlk Çağ Medeniyetleri', 'İslam Öncesi Türk Tarihi', 'İslam Tarihi',
            'İlk Türk İslam Devletleri', 'Osmanlı Tarihi (Tümü)', 'Osmanlı Kültür Medeniyet',
            'Avrupa Tarihi', 'Milli Mücadele ve İnkılaplar', 'Atatürk Dönemi Dış Politika'
        ]
    },
    {
        name: 'AYT Coğrafya 1',
        icon: 'Globe',
        color: 'bg-amber-700',
        topics: AYT_SOZEL_DATA.find(d => d.name === 'AYT Coğrafya 1-2')?.topics || []
    }
];

const KPSS_DATA = [
    {
        name: 'KPSS Türkçe',
        icon: 'BookOpen',
        color: 'bg-rose-500', 
        topics: [
            'Sözcükte Anlam', 'Cümlenin Anlamı', 'Sözcük Türleri', 'Sözcükte Yapı', 
            'Cümlenin Ögeleri', 'Ses Olayları', 'Yazım Kuralları', 'Noktalama İşaretleri',
            'Paragrafta Anlam', 'Paragrafta Anlatım Yolları/Biçimleri', 'Sözel Mantık'
        ]
    },
    {
        name: 'KPSS Matematik',
        icon: 'Calculator',
        color: 'bg-blue-600', 
        topics: [
            'Temel Kavramlar', 'Rasyonel Sayılar', 'Ondalık Sayılar', 'Basit Eşitsizlikler',
            'Mutlak Değer', 'Üslü Sayılar', 'Köklü Sayılar', 'Çarpanlara Ayırma', 'Denklem Çözme',
            'Sayı Problemleri', 'Yaş Problemleri', 'Hareket Problemleri', 'Yüzde Kar-Zarar/Faiz Problemleri',
            'Bağıntı ve Fonksiyon', 'İşlem', 'Olasılık', 'Sayısal Mantık'
        ]
    },
    {
        name: 'KPSS Geometri',
        icon: 'Calculator',
        color: 'bg-indigo-600',
        topics: [
            'Özel Üçgenler', 'Dörtgenler', 'Çokgenler', 'Analitik Geometri'
        ]
    },
    {
        name: 'KPSS Tarih',
        icon: 'Landmark',
        color: 'bg-amber-600', 
        topics: [
            'İslamiyet’ten Önceki Türk Devletleri', 'İlk Müslüman Türk Devletleri', 'Osmanlı Devleti Siyasi',
            'Osmanlı Devleti Kültür ve Uygarlık', 'Kurtuluş Savaşı Hazırlık Dönemi', 'Kurtuluş Savaşı Cepheleri',
            'Devrim Tarihi', 'Atatürk Dönemi İç ve Dış Politika', 'Atatürk İlkeleri', 'Çağdaş Türk ve Dünya Tarihi'
        ]
    },
    {
        name: 'KPSS Coğrafya',
        icon: 'Globe',
        color: 'bg-emerald-600', 
        topics: [
            'Türkiye Coğrafi Konumu', 'Türkiye’nin Yer Şekilleri Su Örtüsü', 'Türkiye’nin İklimi Ve Bitki Örtüsü',
            'Toprak Ve Doğa Çevre', 'Türkiye’nin Beşeri Coğrafyası', 'Tarım', 'Madenler Ve Enerji Kaynakları',
            'Sanayi', 'Ulaşım', 'Turizm'
        ]
    },
    {
        name: 'KPSS Vatandaşlık',
        icon: 'Scale',
        color: 'bg-cyan-600', 
        topics: [
            'Hukuka Giriş', 'Genel Esaslar', 'Yasama', 'Yürütme', 'İdari Yapı', 'Güncel Olaylar'
        ]
    }
];

// --- Types ---
type SortKey = 'topic' | 'duration' | 'questions' | 'accuracy' | 'net' | 'status';
type ViewLevel = 'SUBJECT_LIST' | 'TOPIC_DETAIL';

interface TopicAggregatedData {
  name: string;
  duration: number;
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalEmpty: number;
  accuracy: number;
  net: number;
  status: TopicStatus;
  testLogs: AugmentedTestLog[];
}

interface AugmentedTestLog extends TestLog {
    dateStr: string;
    efficiency: number;
    net: number;
}

const Subjects: React.FC = () => {
  const { 
      subjects, history, addTopicToSubject, addTopicsToSubject, loadCurriculum, 
      removeTopicFromSubject, deleteSubject, addNewSubject, updateSubject, 
      updateTopicStatus, clearSubjectTopics, removeAllSubjects, renameTopic 
  } = useStudy();
  
  // Navigation State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null); // If null, showing subject overview
  
  // Input State
  const [newTopic, setNewTopic] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Modals State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [isClearTopicsConfirmOpen, setIsClearTopicsConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Edit Subject State
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState('');

  // Edit Topic State (New for Safe Rename)
  const [editingTopic, setEditingTopic] = useState<{name: string, isEditing: boolean}>({ name: '', isEditing: false });
  const [tempTopicName, setTempTopicName] = useState('');

  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{key: SortKey, direction: 'asc' | 'desc'}>({ key: 'duration', direction: 'desc' });

  // Auto Select Logic
  useEffect(() => {
      if (subjects.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(subjects[0].id);
      }
  }, [subjects, selectedSubjectId]);

  const currentSubject = useMemo(() => subjects.find(s => s.id === selectedSubjectId), [subjects, selectedSubjectId]);

  // --- Calculate Total Topic Counts for Sidebar (Includes History) ---
  const topicCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      subjects.forEach(s => {
          const uniqueTopics = new Set(s.topics);
          history.filter(h => h.subject === s.id).forEach(h => {
              if(h.topic) uniqueTopics.add(h.topic);
          });
          counts[s.id] = uniqueTopics.size;
      });
      return counts;
  }, [subjects, history]);

  // --- DATA PROCESSING ENGINE ---
  const subjectData = useMemo(() => {
      if (!selectedSubjectId) return null;

      const relevantHistory = history.filter(h => h.subject === selectedSubjectId);
      const topicMap: Record<string, TopicAggregatedData> = {};

      currentSubject?.topics.forEach(t => {
          const currentStatus = currentSubject.topicStatuses?.[t] || 'not-started';
          topicMap[t] = {
              name: t, duration: 0, totalQuestions: 0, totalCorrect: 0, 
              totalIncorrect: 0, totalEmpty: 0, accuracy: 0, net: 0, 
              status: currentStatus, testLogs: []
          };
      });

      relevantHistory.forEach(session => {
          const tName = session.topic;
          if (!topicMap[tName]) {
              topicMap[tName] = {
                  name: tName, duration: 0, totalQuestions: 0, totalCorrect: 0, 
                  totalIncorrect: 0, totalEmpty: 0, accuracy: 0, net: 0, 
                  status: 'not-started', testLogs: []
              };
          }

          topicMap[tName].duration += session.durationMinutes;

          if (session.logs && session.logs.length > 0) {
              session.logs.forEach(log => {
                  const logNet = log.correct - (log.incorrect * 0.25);
                  const logTotal = log.correct + log.incorrect + log.empty;
                  const logEff = logTotal > 0 ? (log.correct / logTotal) * 100 : 0;

                  topicMap[tName].totalQuestions += logTotal;
                  topicMap[tName].totalCorrect += log.correct;
                  topicMap[tName].totalIncorrect += log.incorrect;
                  topicMap[tName].totalEmpty += log.empty;
                  topicMap[tName].testLogs.push({
                      ...log,
                      dateStr: session.date,
                      efficiency: logEff,
                      net: logNet
                  });
              });
          } else if (session.totalQuestions > 0) {
              topicMap[tName].totalQuestions += session.totalQuestions;
              topicMap[tName].totalCorrect += session.questionStats.correct;
              topicMap[tName].totalIncorrect += session.questionStats.incorrect;
              topicMap[tName].totalEmpty += session.questionStats.empty;
          }
      });

      Object.values(topicMap).forEach(t => {
          if (t.totalQuestions > 0) {
              t.accuracy = Math.round((t.totalCorrect / t.totalQuestions) * 100);
              t.net = t.totalCorrect - (t.totalIncorrect * 0.25);
          }
          t.testLogs.sort((a, b) => b.timestamp - a.timestamp);
      });

      const overall = Object.values(topicMap).reduce((acc, curr) => ({
          duration: acc.duration + curr.duration,
          questions: acc.questions + curr.totalQuestions,
          correct: acc.correct + curr.totalCorrect,
          incorrect: acc.incorrect + curr.totalIncorrect,
          net: acc.net + curr.net
      }), { duration: 0, questions: 0, correct: 0, incorrect: 0, net: 0 });

      const overallAccuracy = overall.questions > 0 ? Math.round((overall.correct / overall.questions) * 100) : 0;

      const totalTopics = Object.keys(topicMap).length;
      const completedCount = Object.values(topicMap).filter(t => t.status === 'completed').length;
      const workingCount = Object.values(topicMap).filter(t => t.status === 'working').length;
      const completionPercentage = totalTopics > 0 
        ? Math.round(((completedCount + (workingCount * 0.5)) / totalTopics) * 100) 
        : 0;

      return {
          topics: topicMap,
          overall: { ...overall, accuracy: overallAccuracy },
          completionPercentage
      };
  }, [history, selectedSubjectId, currentSubject]);

  const sortedTopics = useMemo(() => {
      if (!subjectData) return [];
      
      return Object.values(subjectData.topics).sort((a: TopicAggregatedData, b: TopicAggregatedData) => {
          let valA: number | string = 0;
          let valB: number | string = 0;

          switch(sortConfig.key) {
              case 'topic': valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
              case 'duration': valA = a.duration; valB = b.duration; break;
              case 'questions': valA = a.totalQuestions; valB = b.totalQuestions; break;
              case 'accuracy': valA = a.accuracy; valB = b.accuracy; break;
              case 'net': valA = a.net; valB = b.net; break;
              case 'status': 
                const statusWeight = { 'completed': 3, 'working': 2, 'not-started': 1 };
                valA = statusWeight[a.status]; valB = statusWeight[b.status];
                break;
          }

          if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });
  }, [subjectData, sortConfig]);

  const topicChartData = useMemo(() => {
      if (!selectedTopic || !subjectData) return [];
      const logs = subjectData.topics[selectedTopic]?.testLogs || [];
      return [...logs].reverse().map(log => ({
          name: log.name.length > 10 ? log.name.substring(0, 10) + '...' : log.name,
          net: log.net,
          accuracy: log.efficiency,
          date: log.dateStr.substring(0, 5)
      }));
  }, [selectedTopic, subjectData]);


  // --- Handlers ---

  const handleSort = (key: SortKey) => {
      setSortConfig(current => ({
          key,
          direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
      }));
  };

  const handleAddTopic = () => {
      setError(null);
      const trimmedTopic = newTopic.trim();
      if (!trimmedTopic) return;
      
      if (currentSubject?.topics.some(t => t.toLowerCase() === trimmedTopic.toLowerCase())) {
          setError('Bu konu zaten ekli.');
          return;
      }
      
      if (currentSubject) {
          addTopicToSubject(currentSubject.id, trimmedTopic);
          setNewTopic('');
      }
  };

  const startEditingTopic = (e: React.MouseEvent, topicName: string) => {
      e.stopPropagation();
      setEditingTopic({ name: topicName, isEditing: true });
      setTempTopicName(topicName);
  };

  const saveTopicRename = () => {
      if (currentSubject && tempTopicName.trim() && tempTopicName.trim() !== editingTopic.name) {
          renameTopic(currentSubject.id, editingTopic.name, tempTopicName.trim());
      }
      setEditingTopic({ name: '', isEditing: false });
  };

  const cancelTopicRename = () => {
      setEditingTopic({ name: '', isEditing: false });
  };

  const handleBulkAdd = () => {
      if (!currentSubject || !bulkText.trim()) return;
      const lines = bulkText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
          addTopicsToSubject(currentSubject.id, lines);
          setBulkText('');
          setIsBulkModalOpen(false);
      }
  };

  const handleLoadCurriculum = (data: any[]) => {
      loadCurriculum(data);
      setIsCurriculumModalOpen(false);
  };

  const handleResetSubjects = () => {
      removeAllSubjects();
      setSelectedSubjectId('');
      setSelectedTopic(null);
      setIsResetConfirmOpen(false);
  };

  const toggleStatus = (e: React.MouseEvent, topic: string, currentStatus: TopicStatus) => {
      e.stopPropagation();
      const nextStatus: Record<TopicStatus, TopicStatus> = {
          'not-started': 'working',
          'working': 'completed',
          'completed': 'not-started'
      };
      if (currentSubject) {
          updateTopicStatus(currentSubject.id, topic, nextStatus[currentStatus]);
      }
  };

  const handleClearTopics = () => {
      if (currentSubject) {
          clearSubjectTopics(currentSubject.id);
          setIsClearTopicsConfirmOpen(false);
      }
  };

  const handleAddSubjectSubmit = () => {
      if (newSubjectName.trim()) {
          addNewSubject(newSubjectName.trim());
          setNewSubjectName('');
          setIsAddModalOpen(false);
      }
  };

  const requestDeleteSubject = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setDeleteConfirmationId(id);
  };

  const handleEditSubject = (e: React.MouseEvent, subject: Subject) => {
      e.stopPropagation();
      setEditingSubjectId(subject.id);
      setEditName(subject.name);
      setEditColor(subject.color);
      setEditIcon(subject.icon);
      setIsEditSubjectModalOpen(true);
  };

  const saveEditedSubject = () => {
      if (editingSubjectId && editName.trim()) {
          updateSubject(editingSubjectId, {
              name: editName.trim(),
              color: editColor,
              icon: editIcon
          });
          setIsEditSubjectModalOpen(false);
          setEditingSubjectId(null);
      }
  };

  const confirmDeleteSubject = () => {
      if (deleteConfirmationId) {
          if (selectedSubjectId === deleteConfirmationId) {
              setSelectedSubjectId('');
              setSelectedTopic(null);
          }
          deleteSubject(deleteConfirmationId);
          setDeleteConfirmationId(null);
      }
  };

  const getSubjectIcon = (iconName: string) => {
     const Icon = ICON_MAP[iconName] || BookOpen;
     return <Icon size={20} className="pointer-events-none" />;
  };

  const subjectColors = [
      'bg-blue-600', 'bg-purple-600', 'bg-teal-600', 'bg-green-600', 
      'bg-yellow-600', 'bg-orange-600', 'bg-red-600', 'bg-pink-600', 
      'bg-indigo-600', 'bg-cyan-600', 'bg-rose-600', 'bg-emerald-600', 'bg-amber-600'
  ];

  return (
    <div className="animate-fade-in space-y-6 relative pb-20">
       
       {/* Modal: New Subject */}
       {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-slide-up shadow-2xl relative">
                  <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Yeni Ders Ekle</h3>
                  <input 
                    type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white mb-4 focus:border-primary focus:outline-none"
                    placeholder="Ders adı..." autoFocus
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={handleAddSubjectSubmit} className="px-6 py-2 bg-primary text-white rounded-xl hover:brightness-110 font-bold">Ekle</button>
                  </div>
              </div>
          </div>
       )}

       {/* Modal: Edit Subject */}
       {isEditSubjectModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-slide-up shadow-2xl relative">
                   <button onClick={() => setIsEditSubjectModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Dersi Düzenle</h3>
                   
                   <div className="mb-4">
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ders Adı</label>
                       <input 
                            type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                       />
                   </div>

                   <div className="mb-4">
                       <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Renk Seçimi</label>
                       <div className="flex flex-wrap gap-2">
                           {subjectColors.map(c => (
                               <button 
                                    key={c} 
                                    onClick={() => setEditColor(c)}
                                    className={`w-8 h-8 rounded-full ${c} ${editColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' : 'opacity-80 hover:opacity-100'} transition-all`}
                               />
                           ))}
                       </div>
                   </div>

                   <div className="mb-6">
                       <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">İkon Seçimi</label>
                       <div className="grid grid-cols-6 gap-2">
                           {Object.keys(ICON_MAP).map(key => {
                               const Icon = ICON_MAP[key];
                               return (
                                   <button 
                                        key={key} 
                                        onClick={() => setEditIcon(key)}
                                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${editIcon === key ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                   >
                                       <Icon size={18} />
                                   </button>
                               );
                           })}
                       </div>
                   </div>

                   <div className="flex justify-end gap-2">
                       <button onClick={() => setIsEditSubjectModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">İptal</button>
                       <button onClick={saveEditedSubject} className="px-6 py-2 bg-primary text-white rounded-xl hover:brightness-110 font-bold">Kaydet</button>
                   </div>
               </div>
           </div>
       )}

       {/* Modal: Rename Topic */}
       {editingTopic.isEditing && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-slide-up shadow-2xl">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Konuyu Yeniden Adlandır</h3>
                   <p className="text-xs text-slate-500 mb-4">Dikkat: Bu işlem geçmiş çalışma kayıtlarındaki konu adını da güncelleyecektir.</p>
                   <input 
                        type="text" 
                        value={tempTopicName} 
                        onChange={(e) => setTempTopicName(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white mb-4 focus:border-primary focus:outline-none"
                        autoFocus
                   />
                   <div className="flex justify-end gap-2">
                       <button onClick={cancelTopicRename} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">İptal</button>
                       <button onClick={saveTopicRename} className="px-6 py-2 bg-primary text-white rounded-xl hover:brightness-110 font-bold">Kaydet</button>
                   </div>
               </div>
           </div>
       )}

       {/* Modal: Bulk Paste Topics */}
       {isBulkModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 animate-slide-up shadow-2xl relative">
                   <button onClick={() => setIsBulkModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2"><ListPlus size={20} /> Toplu Konu Ekle</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Her satıra bir konu gelecek şekilde listenizi yapıştırın.</p>
                   
                   <textarea 
                        value={bulkText} 
                        onChange={(e) => setBulkText(e.target.value)}
                        className="w-full h-64 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none resize-none font-mono"
                        placeholder={`Vektörler\nBağıl Hareket\nNewton'un Hareket Yasaları...`}
                        autoFocus
                   />

                   <div className="flex justify-end gap-2 mt-4">
                       <button onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">İptal</button>
                       <button onClick={handleBulkAdd} className="px-6 py-2 bg-primary text-white rounded-xl hover:brightness-110 font-bold">
                           {bulkText.split('\n').filter(l=>l.trim()).length > 0 ? `${bulkText.split('\n').filter(l=>l.trim()).length} Konu Ekle` : 'Ekle'}
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* ... (Other Modals: Curriculum, Delete Subject, Reset Confirm, Clear Topics - No logic change, skipping display for brevity but keeping implementation) ... */}
       {/* Modal: Curriculum Wizard */}
       {isCurriculumModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
               <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 animate-slide-up shadow-2xl relative max-h-[90vh] overflow-y-auto">
                   <button onClick={() => setIsCurriculumModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
                   <div className="text-center mb-8">
                       <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                           <Wand2 size={32} className="text-white"/>
                       </div>
                       <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Müfredat Sihirbazı</h3>
                       <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Alanını seç, derslerini ve konularını tek tıkla yükleyelim.</p>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button onClick={() => handleLoadCurriculum(TYT_DATA)} className="group p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left flex items-center gap-4 relative overflow-hidden"><div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors"><BookOpen size={24} /></div><div><h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">TYT Konuları</h4><p className="text-xs text-slate-500">Tüm dersler (120 Soru)</p></div></button>
                       <button onClick={() => handleLoadCurriculum(AYT_SAYISAL_DATA)} className="group p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-left flex items-center gap-4 relative overflow-hidden"><div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors"><Calculator size={24} /></div><div><h4 className="font-bold text-slate-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">AYT Sayısal</h4><p className="text-xs text-slate-500">Mat, Fizik, Kimya, Biyo</p></div></button>
                       <button onClick={() => handleLoadCurriculum(AYT_SOZEL_DATA)} className="group p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all text-left flex items-center gap-4 relative overflow-hidden"><div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors"><Landmark size={24} /></div><div><h4 className="font-bold text-slate-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">AYT Sözel</h4><p className="text-xs text-slate-500">Edb, Tarih, Coğ, Felsefe...</p></div></button>
                       <button onClick={() => handleLoadCurriculum(AYT_EA_DATA)} className="group p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-pink-500 dark:hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-all text-left flex items-center gap-4 relative overflow-hidden"><div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg group-hover:bg-pink-500 group-hover:text-white transition-colors"><Scale size={24} /></div><div><h4 className="font-bold text-slate-800 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400">AYT Eşit Ağırlık</h4><p className="text-xs text-slate-500">Edb, Mat, Tarih, Coğ</p></div></button>
                       <button onClick={() => handleLoadCurriculum(KPSS_DATA)} className="group p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all text-left flex items-center gap-4 relative overflow-hidden"><div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-colors"><CheckCircle2 size={24} /></div><div><h4 className="font-bold text-slate-800 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">KPSS (Lisans)</h4><p className="text-xs text-slate-500">GY - GK Konuları</p></div></button>
                   </div>
                   <p className="text-xs text-slate-400 mt-6 text-center">Not: Mevcut dersleriniz silinmez, yeni konular listenize eklenir. "TYT" ve "AYT" dersleri ayrı başlıklar altında açılır.</p>
               </div>
           </div>
       )}
       {deleteConfirmationId && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-slide-up">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500"><Trash2 size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Dersi Sil?</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Ders geçmişi silinmez, sadece listeden kaldırılır.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setDeleteConfirmationId(null)} className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Vazgeç</button>
                        <button onClick={confirmDeleteSubject} className="py-3 rounded-xl bg-red-500 text-white font-bold">Sil</button>
                    </div>
               </div>
           </div>
       )}
       {isResetConfirmOpen && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-slide-up">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500 animate-pulse"><RotateCcw size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Ders Listesini Sıfırla?</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Mevcut <strong>tüm dersler ve konular</strong> listenizden silinecek. Çalışma geçmişiniz (analizler) korunur.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setIsResetConfirmOpen(false)} className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Vazgeç</button>
                        <button onClick={handleResetSubjects} className="py-3 rounded-xl bg-red-500 text-white font-bold">Sıfırla</button>
                    </div>
               </div>
           </div>
       )}
       {isClearTopicsConfirmOpen && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
               <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-slide-up">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mb-4 mx-auto text-orange-500"><Eraser size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Konuları Temizle?</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm"><strong>{currentSubject?.name}</strong> dersine ait tüm konular listeden silinecek. İstatistikler korunur.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setIsClearTopicsConfirmOpen(false)} className="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Vazgeç</button>
                        <button onClick={handleClearTopics} className="py-3 rounded-xl bg-orange-500 text-white font-bold">Temizle</button>
                    </div>
               </div>
           </div>
       )}

       {/* MAIN LAYOUT */}
       <div className="flex flex-col lg:flex-row gap-6 items-start">
           
           {/* LEFT COLUMN: Subject List */}
           <div className="w-full lg:w-1/3 space-y-4 lg:sticky lg:top-6">
                <div className="flex justify-between items-end">
                   <div>
                       <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <GraduationCap className="text-primary"/> Dersler
                       </h1>
                       <p className="text-slate-500 dark:text-slate-400 mt-1">Ders ve konu bazlı test analizi.</p>
                   </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col max-h-[70vh]">
                    <div className="overflow-y-auto custom-scrollbar flex-1">
                        {subjects.map(subject => {
                            const isSelected = selectedSubjectId === subject.id;
                            const safeColor = subject.color || 'bg-blue-500';
                            const textClass = safeColor.replace('bg-', 'text-').replace('600', '500').replace('800', '600');
                            const borderColor = isSelected ? 'var(--color-primary)' : 'transparent';

                            return (
                                <div
                                    key={subject.id}
                                    onClick={() => { setSelectedSubjectId(subject.id); setSelectedTopic(null); }}
                                    className={`w-full flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors cursor-pointer group ${
                                        isSelected 
                                        ? 'bg-slate-50 dark:bg-slate-700/50' 
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                    }`}
                                    style={{ borderLeft: `4px solid ${borderColor}` }}
                                >
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className={`p-2 rounded-lg bg-opacity-20 shrink-0 ${textClass.includes('text-') ? textClass : 'text-blue-500'}`} style={{backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)'}}>
                                            {getSubjectIcon(subject.icon)}
                                        </div>
                                        <span className={`font-semibold truncate ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {subject.name}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto mr-2 transition-colors ${isSelected ? 'bg-white/20 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500'}`}>
                                        {topicCounts[subject.id] || 0}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={(e) => handleEditSubject(e, subject)} 
                                            className={`p-2 rounded-lg text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity`}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={(e) => requestDeleteSubject(e, subject.id)} className={`p-2 rounded-lg text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity`}><Trash2 size={16} /></button>
                                        <ChevronRight size={16} className={`text-slate-400 transition-opacity ${isSelected ? 'text-primary opacity-100' : 'opacity-0'}`} />
                                    </div>
                                </div>
                            );
                        })}
                        {subjects.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">Listeniz boş.</div>}
                    </div>
                    
                    {/* Sidebar Footer Buttons */}
                    <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 grid grid-cols-3 gap-2">
                         <button onClick={() => setIsCurriculumModalOpen(true)} className="col-span-1 py-3 px-2 flex items-center justify-center gap-1 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-all text-xs font-bold">
                            <Wand2 size={16} /> Sihirbaz
                        </button>
                        <button onClick={() => setIsAddModalOpen(true)} className="col-span-1 py-3 px-2 flex items-center justify-center gap-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all text-xs font-bold">
                            <Plus size={16} /> Ders
                        </button>
                        <button 
                            onClick={() => setIsResetConfirmOpen(true)}
                            className="col-span-1 py-3 px-2 flex items-center justify-center gap-1 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-xs font-bold"
                            title="Tüm dersleri sil"
                        >
                            <RotateCcw size={16} /> Sıfırla
                        </button>
                    </div>
                </div>
           </div>

           {/* RIGHT COLUMN: Content Switcher */}
           {currentSubject ? (
               <div className="w-full lg:w-2/3 space-y-6 animate-slide-up">
                   
                   {/* CASE 1: TOPIC DETAIL VIEW (Drill Down) */}
                   {selectedTopic ? (
                       <div className="animate-fade-in space-y-6">
                           {/* ... (Existing Topic Detail View content remains same) ... */}
                           {/* Navigation Header */}
                           <div className="flex items-center gap-4">
                               <button 
                                onClick={() => setSelectedTopic(null)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                               >
                                   <ChevronLeft size={24}/>
                               </button>
                               <div>
                                   <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                       <span className="uppercase font-bold">{currentSubject.name}</span>
                                       <ChevronRight size={14}/>
                                       <span>Konu Analizi</span>
                                   </div>
                                   <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                       {selectedTopic}
                                   </h2>
                               </div>
                           </div>

                           {/* Specific Topic Stats Cards */}
                           {subjectData && (() => {
                               const tData = subjectData.topics[selectedTopic];
                               return (
                                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                       <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                           <p className="text-xs text-slate-500 font-bold uppercase">Toplam Süre</p>
                                           <p className="text-xl font-bold text-slate-900 dark:text-white">{Math.floor(tData.duration/60)}s {tData.duration%60}dk</p>
                                       </div>
                                       <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                           <p className="text-xs text-slate-500 font-bold uppercase">Toplam Soru</p>
                                           <p className="text-xl font-bold text-slate-900 dark:text-white">{tData.totalQuestions}</p>
                                       </div>
                                       <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                           <p className="text-xs text-slate-500 font-bold uppercase">Ortalama Net</p>
                                           <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                               {tData.testLogs.length > 0 ? (tData.net / tData.testLogs.length).toFixed(1) : tData.net}
                                           </p>
                                       </div>
                                       <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                           <p className="text-xs text-slate-500 font-bold uppercase">Başarı</p>
                                           <p className={`text-xl font-bold ${tData.accuracy >= 70 ? 'text-green-500' : tData.accuracy >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>%{tData.accuracy}</p>
                                       </div>
                                   </div>
                               )
                           })()}

                           {/* Chart & Table Grid */}
                           <div className="grid grid-cols-1 gap-6">
                                {/* Success Trend Chart */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <TrendingUp size={20} className="text-primary"/> Başarı Grafiği
                                    </h3>
                                    <div className="h-64 w-full">
                                        {topicChartData.length > 1 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={topicChartData}>
                                                    <defs>
                                                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                                                    <YAxis hide domain={[0, 'auto']} />
                                                    <RechartsTooltip contentStyle={{borderRadius: '12px', background: '#0f172a', border: 'none', color: '#fff'}} />
                                                    <Area type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" name="Net" />
                                                    <Area type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} fillOpacity={0} name="Başarı %" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl">
                                                <BarChart2 size={32} className="mb-2 opacity-50"/>
                                                <p className="text-sm">Grafik için en az 2 test sonucu gerekiyor.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Test Log Table */}
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-primary"/> Çözülen Testler
                                    </h3>
                                    
                                    {subjectData && subjectData.topics[selectedTopic].testLogs.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                                                        <th className="py-3 px-2">Tarih</th>
                                                        <th className="py-3 px-2">Test Adı / Not</th>
                                                        <th className="py-3 px-2 text-right">D / Y / B</th>
                                                        <th className="py-3 px-2 text-right">Net</th>
                                                        <th className="py-3 px-2 text-right">Başarı</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {subjectData.topics[selectedTopic].testLogs.map((log) => (
                                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                            <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-400 font-mono">
                                                                {log.dateStr}
                                                            </td>
                                                            <td className="py-3 px-2 text-sm text-slate-800 dark:text-white font-medium">
                                                                {log.name}
                                                                {log.note && <span className="block text-xs text-slate-400 font-normal truncate max-w-[150px]">{log.note}</span>}
                                                            </td>
                                                            <td className="py-3 px-2 text-sm text-right font-mono">
                                                                <span className="text-green-500">{log.correct}</span>/
                                                                <span className="text-red-500">{log.incorrect}</span>/
                                                                <span className="text-slate-400">{log.empty}</span>
                                                            </td>
                                                            <td className="py-3 px-2 text-sm text-right font-bold text-blue-600 dark:text-blue-400">
                                                                {log.net}
                                                            </td>
                                                            <td className="py-3 px-2 text-sm text-right">
                                                                 <span className={`px-2 py-0.5 rounded text-xs font-bold ${log.efficiency >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                                    %{Math.round(log.efficiency)}
                                                                 </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            <p>Bu konuya ait kaydedilmiş test bulunmuyor.</p>
                                            <p className="text-xs mt-1">Ders çalışırken "Test Ekle" butonunu kullanarak test sonuçlarını kaydedebilirsiniz.</p>
                                        </div>
                                    )}
                                </div>
                           </div>

                       </div>
                   ) : (
                   /* CASE 2: SUBJECT OVERVIEW (Default) */
                       <div className="animate-fade-in space-y-6">
                           {/* Header Card */}
                           <div 
                                className="p-6 rounded-2xl text-white shadow-lg relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(to right, ${currentSubject.color?.replace('bg-', '') === 'blue-500' ? '#3b82f6' : 'var(--color-primary)'}, #1e293b)`
                                }}
                           >
                               <div className={`absolute inset-0 opacity-80 bg-gradient-to-r ${currentSubject.color?.replace('bg-', 'from-') || 'from-blue-500'} to-slate-900`}></div>
                               
                               <div className="relative z-10">
                                   <div className="flex items-center space-x-3 mb-2">
                                       {getSubjectIcon(currentSubject.icon)}
                                       <h2 className="text-2xl font-bold">{currentSubject.name}</h2>
                                   </div>
                                   <div className="flex gap-6 mt-4">
                                       <div>
                                           <p className="text-white/60 text-xs font-bold uppercase">Toplam Süre</p>
                                           <p className="text-xl font-bold">{subjectData ? Math.floor(subjectData.overall.duration/60) : 0}s {subjectData ? subjectData.overall.duration%60 : 0}dk</p>
                                       </div>
                                       <div>
                                            <p className="text-white/60 text-xs font-bold uppercase">Toplam Soru</p>
                                            <p className="text-xl font-bold">{subjectData ? subjectData.overall.questions : 0}</p>
                                       </div>
                                       <div>
                                            <p className="text-white/60 text-xs font-bold uppercase">Konu Sayısı</p>
                                            <p className="text-xl font-bold">{subjectData ? Object.keys(subjectData.topics).length : 0}</p>
                                       </div>
                                       <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-white/60 text-xs font-bold uppercase">Müfredat Tamamlanma</p>
                                                <span className="text-xs font-bold bg-white/20 px-2 rounded">%{subjectData ? subjectData.completionPercentage : 0}</span>
                                            </div>
                                            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-white/80 transition-all duration-1000" style={{width: `${subjectData ? subjectData.completionPercentage : 0}%`}}></div>
                                            </div>
                                       </div>
                                   </div>
                               </div>
                               <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 scale-150">
                                   {getSubjectIcon(currentSubject.icon)}
                               </div>
                           </div>

                           {/* Topics List with Drill Down */}
                           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <FolderOpen size={20} className="text-primary"/> Konu Performansı <span className="text-slate-400 text-sm font-normal">({subjectData ? Object.keys(subjectData.topics).length : 0})</span>
                                    </h3>
                                    
                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setIsClearTopicsConfirmOpen(true)}
                                            className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40"
                                            title="Tüm Konuları Temizle"
                                        >
                                            <Eraser size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setIsBulkModalOpen(true)}
                                            className="p-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                                            title="Çoklu Ekle"
                                        >
                                            <ListPlus size={18} />
                                        </button>
                                        <input 
                                            type="text" value={newTopic} onChange={(e) => { setNewTopic(e.target.value); setError(null); }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                                            placeholder="Konu ekle..."
                                            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:border-primary focus:outline-none w-32 sm:w-auto"
                                        />
                                        <button onClick={handleAddTopic} className="p-1.5 bg-primary text-white rounded-lg hover:bg-blue-600"><Plus size={18}/></button>
                                    </div>
                                </div>
                                
                                {error && <p className="text-xs text-red-500 mb-3 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-700">
                                                <th className="py-3 px-2 w-8 cursor-pointer hover:text-primary group" onClick={() => handleSort('status')} title="Durum">
                                                    <Circle size={12} className="inline opacity-50"/> <ArrowUpDown size={10} className="inline opacity-0 group-hover:opacity-100"/>
                                                </th>
                                                <th className="py-3 px-2 cursor-pointer hover:text-primary group" onClick={() => handleSort('topic')}>Konu <ArrowUpDown size={10} className="inline opacity-0 group-hover:opacity-100"/></th>
                                                <th className="py-3 px-2 text-right cursor-pointer hover:text-primary group" onClick={() => handleSort('duration')}>Süre <ArrowUpDown size={10} className="inline opacity-0 group-hover:opacity-100"/></th>
                                                <th className="py-3 px-2 text-right cursor-pointer hover:text-primary group" onClick={() => handleSort('questions')}>Soru <ArrowUpDown size={10} className="inline opacity-0 group-hover:opacity-100"/></th>
                                                <th className="py-3 px-2 text-right cursor-pointer hover:text-primary group" onClick={() => handleSort('net')}>Net <ArrowUpDown size={10} className="inline opacity-0 group-hover:opacity-100"/></th>
                                                <th className="py-3 px-2 text-right cursor-pointer hover:text-primary group" onClick={() => handleSort('accuracy')}>Başarı <ArrowUpDown size={10} className="inline opacity-0 group-hover:opacity-100"/></th>
                                                <th className="py-3 px-2 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {sortedTopics.length > 0 ? sortedTopics.map((topic) => (
                                                <tr 
                                                    key={topic.name} 
                                                    onClick={() => setSelectedTopic(topic.name)}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                                                >
                                                    <td className="py-3 px-2 text-center">
                                                        <button 
                                                            onClick={(e) => toggleStatus(e, topic.name, topic.status)}
                                                            className="hover:scale-110 transition-transform focus:outline-none"
                                                            title={topic.status === 'completed' ? 'Bitti' : topic.status === 'working' ? 'Çalışılıyor' : 'Başlanmadı'}
                                                        >
                                                            {topic.status === 'completed' ? (
                                                                <CheckCircle size={18} className="text-green-500" />
                                                            ) : topic.status === 'working' ? (
                                                                <Disc size={18} className="text-yellow-500" />
                                                            ) : (
                                                                <Circle size={18} className="text-slate-300 dark:text-slate-600" />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="py-3 px-2 text-slate-800 dark:text-white font-bold text-sm">
                                                        {topic.name}
                                                    </td>
                                                    <td className="py-3 px-2 text-right text-sm text-slate-600 dark:text-slate-400">
                                                        {topic.duration > 60 ? `${(topic.duration/60).toFixed(1)} sa` : `${topic.duration} dk`}
                                                    </td>
                                                    <td className="py-3 px-2 text-right text-sm text-slate-600 dark:text-slate-400">
                                                        {topic.totalQuestions}
                                                    </td>
                                                    <td className="py-3 px-2 text-right text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {topic.net}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {topic.totalQuestions > 0 ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                    <div className={`h-full ${topic.accuracy >= 70 ? 'bg-green-500' : 'bg-orange-500'}`} style={{width: `${topic.accuracy}%`}}></div>
                                                                </div>
                                                                <span className="text-xs font-bold">%{topic.accuracy}</span>
                                                            </div>
                                                        ) : <span className="text-slate-300">-</span>}
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {/* New: Edit Topic Button */}
                                                            <button 
                                                                onClick={(e) => startEditingTopic(e, topic.name)}
                                                                className="text-slate-300 hover:text-blue-500 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                title="Konuyu Düzenle"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); removeTopicFromSubject(currentSubject.id, topic.name); }}
                                                                className="text-slate-300 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                title="Konuyu Sil"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={7} className="py-8 text-center text-slate-400 text-sm">Henüz konu eklenmemiş.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                           </div>
                       </div>
                   )}

               </div>
           ) : (
             <div className="w-full lg:w-2/3 flex items-center justify-center p-12 flex-col h-[60vh] text-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                    <GraduationCap size={48} className="text-slate-400 opacity-50"/>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Ders Seçimi Yapın</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">Detaylı analizlerini görmek için soldaki menüden bir ders seçin.</p>
             </div>
           )}
       </div>
    </div>
  );
};

export default Subjects;
