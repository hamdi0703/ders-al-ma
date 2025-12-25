
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
  
  //