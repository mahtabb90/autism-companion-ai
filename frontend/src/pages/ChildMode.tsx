import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import type { Story } from '../types';
import { ArrowLeft, Volume2, VolumeX, BookOpen, Sparkles, AlertCircle } from 'lucide-react';

interface EmotionOption {
  label: string;
  emoji: string;
  colorClass: string;
  hoverColorClass: string;
}

const EMOTIONS: EmotionOption[] = [
  { label: 'Happy', emoji: '☀️', colorClass: 'bg-[#EBF5F0] border-[#68B0AB] text-[#2d5a27]', hoverColorClass: 'hover:bg-[#d5ebe1]' },
  { label: 'Calm', emoji: '🌊', colorClass: 'bg-[#F0F4F8] border-[#A8D0E6] text-[#273c75]', hoverColorClass: 'hover:bg-[#dce9f2]' },
  { label: 'Excited', emoji: '🚀', colorClass: 'bg-[#FCFAF7] border-[#F7C59F] text-[#7f4f24]', hoverColorClass: 'hover:bg-[#f3dfce]' },
  { label: 'Tired', emoji: '🧸', colorClass: 'bg-[#F5F3F7] border-[#D8C3E5] text-[#4a2f5a]', hoverColorClass: 'hover:bg-[#e9def0]' },
  { label: 'Worried', emoji: '☁️', colorClass: 'bg-slate-50 border-slate-300 text-slate-700', hoverColorClass: 'hover:bg-slate-100' },
  { label: 'Overwhelmed', emoji: '⚡', colorClass: 'bg-red-50/50 border-red-200 text-red-800', hoverColorClass: 'hover:bg-red-50' }
];

interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  colorClass: string;
}

const BADGES: Badge[] = [
  { id: 'first_checkin', title: 'First Step', description: 'Shared your feelings with Lumi!', emoji: '☀️', colorClass: 'bg-green-gradient border-calm-green/60 text-calm-green-dark' },
  { id: 'emotions_expert', title: 'Emotion Expert', description: 'Checked in your feelings 3 times.', emoji: '🌈', colorClass: 'bg-calm-gradient border-calm-blue/60 text-calm-blue-dark' },
  { id: 'story_starter', title: 'Story Explorer', description: 'Read your first friendly story!', emoji: '📖', colorClass: 'bg-lavender-gradient border-calm-lavender/60 text-calm-lavender-dark' },
  { id: 'super_reader', title: 'Super Reader', description: 'Read 3 stories with Lumi.', emoji: '🌟', colorClass: 'bg-peach-gradient border-calm-cream/60 text-calm-cream-dark' },
  { id: 'dentist_hero', title: 'Dentist Hero', description: 'Read a story about visiting the dentist.', emoji: '🦷', colorClass: 'bg-calm-gradient border-calm-blue/60 text-calm-blue-dark' },
  { id: 'haircut_hero', title: 'Haircut Hero', description: 'Read a story about getting a haircut.', emoji: '✂️', colorClass: 'bg-peach-gradient border-calm-cream/60 text-calm-cream-dark' },
  { id: 'sharing_master', title: 'Sharing Master', description: 'Read a story about sharing or playing.', emoji: '🤝', colorClass: 'bg-green-gradient border-calm-green/60 text-calm-green-dark' }
];

const getStoryIcon = (title: string): { emoji: string; color: string } => {
  const t = title.toLowerCase();
  if (t.includes('dentist') || t.includes('teeth') || t.includes('tooth')) {
    return { emoji: '🦷', color: 'bg-calm-gradient border-calm-blue/60 text-calm-blue-dark hover:bg-calm-blue/20' };
  }
  if (t.includes('hair') || t.includes('cut') || t.includes('barber')) {
    return { emoji: '✂️', color: 'bg-peach-gradient border-calm-cream/60 text-calm-cream-dark hover:bg-calm-cream/20' };
  }
  if (t.includes('share') || t.includes('friend') || t.includes('play') || t.includes('toy') || t.includes('give') || t.includes('take')) {
    return { emoji: '🤝', color: 'bg-green-gradient border-calm-green/60 text-calm-green-dark hover:bg-calm-green/20' };
  }
  if (t.includes('bath') || t.includes('wash') || t.includes('shower') || t.includes('clean') || t.includes('water')) {
    return { emoji: '🛁', color: 'bg-lavender-gradient border-calm-lavender/60 text-calm-lavender-dark hover:bg-calm-lavender/20' };
  }
  if (t.includes('school') || t.includes('bus') || t.includes('class') || t.includes('teacher') || t.includes('study')) {
    return { emoji: '🚌', color: 'bg-calm-gradient border-calm-blue/60 text-calm-blue-dark hover:bg-calm-blue/20' };
  }
  if (t.includes('sleep') || t.includes('bed') || t.includes('night') || t.includes('dream')) {
    return { emoji: '🌙', color: 'bg-lavender-gradient border-calm-lavender/60 text-calm-lavender-dark hover:bg-calm-lavender/20' };
  }
  if (t.includes('doctor') || t.includes('hurt') || t.includes('checkup') || t.includes('clinic')) {
    return { emoji: '🩺', color: 'bg-peach-gradient border-calm-cream/60 text-calm-cream-dark hover:bg-calm-cream/20' };
  }
  if (t.includes('food') || t.includes('eat') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast') || t.includes('kitchen')) {
    return { emoji: '🍽️', color: 'bg-green-gradient border-calm-green/60 text-calm-green-dark hover:bg-calm-green/20' };
  }
  if (t.includes('shop') || t.includes('store') || t.includes('grocery') || t.includes('buy') || t.includes('market')) {
    return { emoji: '🛒', color: 'bg-peach-gradient border-calm-cream/60 text-calm-cream-dark hover:bg-calm-cream/20' };
  }
  return { emoji: '📖', color: 'bg-calm-gradient border-calm-blue/50 text-calm-blue-dark hover:bg-calm-blue/20' };
};

export const getDisplayTitle = (title: string): string => {
  if (!title) return '';
  if (title.toLowerCase().startsWith('story about ')) {
    const topic = title.substring(12).trim();
    const standardTopics = [
      'going to the dentist',
      'getting a haircut',
      'sharing toys at school',
      'sharing toys with friends',
      'custom situation',
      'new situation'
    ];
    if (!standardTopics.includes(topic.toLowerCase())) {
      return topic;
    }
  }
  return title;
};

const StoryIllustration: React.FC<{ title: string; visualPrompt: string }> = ({ title, visualPrompt }) => {
  const combinedText = (title + " " + visualPrompt).toLowerCase();
  
  if (combinedText.includes("dentist") || combinedText.includes("teeth") || combinedText.includes("tooth")) {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
        <circle cx="100" cy="80" r="55" fill="#FAF6F0" />
        <rect x="50" y="70" width="100" height="20" rx="10" fill="#D7E5F0" />
        <rect x="110" y="85" width="20" height="40" rx="5" fill="#3B4B72" opacity="0.3" />
        
        <path d="M75 80 C75 115, 90 120, 90 85 Z" fill="#FFFFFF" stroke="#3B4B72" strokeWidth="4" />
        <path d="M125 80 C125 115, 110 120, 110 85 Z" fill="#FFFFFF" stroke="#3B4B72" strokeWidth="4" />
        <path d="M70 65 C70 45, 90 40, 100 50 C110 40, 130 45, 130 65 C130 85, 70 85, 70 65 Z" fill="#FFFFFF" stroke="#3B4B72" strokeWidth="4" />
        
        <path d="M140 40 L145 45 L140 50 L135 45 Z" fill="#F3D9C9" />
        <path d="M60 45 L63 48 L60 51 L57 48 Z" fill="#D5E5D5" />
        
        <circle cx="90" cy="62" r="2.5" fill="#3A3A3A" />
        <circle cx="110" cy="62" r="2.5" fill="#3A3A3A" />
        <path d="M96 66 Q100 70 104 66" fill="none" stroke="#3A3A3A" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="85" cy="66" r="3.5" fill="#F3D9C9" opacity="0.8" />
        <circle cx="115" cy="66" r="3.5" fill="#F3D9C9" opacity="0.8" />
      </svg>
    );
  }

  if (combinedText.includes("hair") || combinedText.includes("cut") || combinedText.includes("barber")) {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
        <circle cx="100" cy="80" r="55" fill="#FAF6F0" />
        <path d="M50 110 C50 85, 150 85, 150 110 Z" fill="#FAF7F2" stroke="#8C5E47" strokeWidth="3" />
        <rect x="55" y="50" width="55" height="15" rx="3" fill="#D5E5D5" stroke="#4E6A4E" strokeWidth="3" />
        <line x1="65" y1="65" x2="65" y2="78" stroke="#4E6A4E" strokeWidth="2.5" />
        <line x1="75" y1="65" x2="75" y2="78" stroke="#4E6A4E" strokeWidth="2.5" />
        <line x1="85" y1="65" x2="85" y2="78" stroke="#4E6A4E" strokeWidth="2.5" />
        <line x1="95" y1="65" x2="95" y2="78" stroke="#4E6A4E" strokeWidth="2.5" />
        <line x1="105" y1="65" x2="105" y2="78" stroke="#4E6A4E" strokeWidth="2.5" />
        
        <g transform="translate(110, 45) rotate(15)">
          <circle cx="20" cy="40" r="12" fill="none" stroke="#3B4B72" strokeWidth="3.5" />
          <circle cx="40" cy="40" r="12" fill="none" stroke="#3B4B72" strokeWidth="3.5" />
          <line x1="23" y1="28" x2="25" y2="-10" stroke="#3B4B72" strokeWidth="4" strokeLinecap="round" />
          <line x1="37" y1="28" x2="35" y2="-10" stroke="#3B4B72" strokeWidth="4" strokeLinecap="round" />
          <circle cx="30" cy="24" r="3" fill="#3B4B72" />
        </g>
        <circle cx="150" cy="40" r="3" fill="#D7E5F0" />
        <circle cx="160" cy="50" r="4.5" fill="#D7E5F0" />
        <circle cx="145" cy="55" r="2.5" fill="#D7E5F0" />
      </svg>
    );
  }

  if (combinedText.includes("share") || combinedText.includes("friend") || combinedText.includes("play") || combinedText.includes("toy") || combinedText.includes("block")) {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
        <circle cx="100" cy="80" r="55" fill="#FAF6F0" />
        <rect x="50" y="85" width="35" height="35" rx="6" fill="#D7E5F0" stroke="#3B4B72" strokeWidth="3.5" />
        <path d="M125 85 L145 120 L105 120 Z" fill="#F3D9C9" stroke="#8C5E47" strokeWidth="3.5" strokeLinejoin="round" />
        <circle cx="67.5" cy="65" r="17.5" fill="#D5E5D5" stroke="#4E6A4E" strokeWidth="3.5" />
        <g transform="translate(100, 45)">
          <path d="M-12 -12 L12 -12 L6 0 L12 12 L-12 12 L-6 0 Z" fill="#FAF6F0" stroke="#3B4B72" strokeWidth="2.5" />
          <circle cx="0" cy="-6" r="3" fill="#8C5E47" />
          <circle cx="0" cy="6" r="2.5" fill="#8C5E47" />
        </g>
      </svg>
    );
  }

  if (combinedText.includes("bath") || combinedText.includes("wash") || combinedText.includes("shower") || combinedText.includes("clean") || combinedText.includes("water") || combinedText.includes("duck")) {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
        <circle cx="100" cy="80" r="55" fill="#FAF6F0" />
        <path d="M40 110 Q70 100 100 110 Q130 120 160 110" fill="none" stroke="#D7E5F0" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="70" r="8" fill="#E5DDF0" opacity="0.6" />
        <circle cx="65" cy="55" r="5" fill="#E5DDF0" opacity="0.6" />
        <circle cx="145" cy="65" r="10" fill="#E5DDF0" opacity="0.6" />
        <g transform="translate(75, 55)">
          <circle cx="35" cy="15" r="15" fill="#F7C59F" stroke="#8C5E47" strokeWidth="3" />
          <path d="M10 25 C10 40, 50 40, 50 25 Z" fill="#F7C59F" stroke="#8C5E47" strokeWidth="3" />
          <path d="M48 12 L58 16 L48 20 Z" fill="#8C5E47" />
          <circle cx="38" cy="12" r="2" fill="#3A3A3A" />
        </g>
      </svg>
    );
  }

  if (combinedText.includes("school") || combinedText.includes("bus") || combinedText.includes("class") || combinedText.includes("teacher")) {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
        <path d="M20 130 C80 110, 120 110, 180 130" fill="none" stroke="#D5E5D5" strokeWidth="5" strokeLinecap="round" />
        <rect x="50" y="60" width="90" height="45" rx="10" fill="#F7C59F" stroke="#8C5E47" strokeWidth="4.5" />
        <rect x="60" y="68" width="18" height="15" rx="3" fill="#FFFFFF" stroke="#8C5E47" strokeWidth="2.5" />
        <rect x="85" y="68" width="18" height="15" rx="3" fill="#FFFFFF" stroke="#8C5E47" strokeWidth="2.5" />
        <rect x="110" y="68" width="18" height="15" rx="3" fill="#FFFFFF" stroke="#8C5E47" strokeWidth="2.5" />
        <circle cx="70" cy="110" r="12" fill="#3A3A3A" stroke="#8C5E47" strokeWidth="3" />
        <circle cx="70" cy="110" r="4" fill="#FFFFFF" />
        <circle cx="120" cy="110" r="12" fill="#3A3A3A" stroke="#8C5E47" strokeWidth="3" />
        <circle cx="120" cy="110" r="4" fill="#FFFFFF" />
      </svg>
    );
  }

  if (combinedText.includes("sleep") || combinedText.includes("bed") || combinedText.includes("night") || combinedText.includes("dream") || combinedText.includes("moon")) {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
        <circle cx="100" cy="80" r="55" fill="#FAF6F0" />
        <path d="M60 100 C50 90, 70 70, 90 80 C100 70, 130 70, 135 85 C145 80, 155 95, 145 105 C140 110, 60 110, 60 100 Z" fill="#FFFFFF" stroke="#5E4975" strokeWidth="3.5" />
        <path d="M100 45 C100 65, 115 75, 130 75 C120 85, 95 85, 85 70 C75 55, 85 40, 100 45 Z" fill="#F3D9C9" stroke="#8C5E47" strokeWidth="3" />
        <circle cx="95" cy="60" r="1.5" fill="#3A3A3A" />
        <path d="M92 64 Q95 66 98 64" fill="none" stroke="#3A3A3A" strokeWidth="1.5" />
        <path d="M60 45 L63 48 L60 51 L57 48 Z" fill="#FAF6F0" className="scandi-twinkle" />
        <path d="M145 40 L148 43 L145 46 L142 43 Z" fill="#FAF6F0" className="scandi-twinkle" />
      </svg>
    );
  }

  if (combinedText.includes("doctor") || combinedText.includes("hurt") || combinedText.includes("checkup") || combinedText.includes("clinic") || combinedText.includes("stethoscope")) {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
        <circle cx="100" cy="80" r="55" fill="#FAF6F0" />
        <g transform="translate(65, 75) rotate(-30)">
          <rect x="0" y="0" width="70" height="24" rx="6" fill="#F3D9C9" stroke="#8C5E47" strokeWidth="3" />
          <rect x="23" y="2" width="24" height="20" fill="#FAF6F0" />
          <path d="M35 15 C33 11, 29 11, 29 15 C29 19, 35 23, 35 23 C35 23, 41 19, 41 15 C41 11, 37 11, 35 15 Z" fill="#F7C59F" />
        </g>
        <path d="M110 50 C110 110, 160 110, 160 70" fill="none" stroke="#3B4B72" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="110" cy="50" r="5" fill="#3B4B72" />
        <circle cx="160" cy="70" r="7" fill="#D7E5F0" stroke="#3B4B72" strokeWidth="2.5" />
      </svg>
    );
  }

  if (combinedText.includes("food") || combinedText.includes("eat") || combinedText.includes("dinner") || combinedText.includes("lunch") || combinedText.includes("breakfast") || combinedText.includes("apple")) {
    return (
      <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
        <circle cx="100" cy="80" r="55" fill="#FAF6F0" />
        <circle cx="100" cy="80" r="40" fill="#FFFFFF" stroke="#4E6A4E" strokeWidth="3.5" />
        <circle cx="100" cy="80" r="16" fill="#F7C59F" />
        <path d="M96 66 C98 64, 102 64, 104 66" fill="none" stroke="#8C5E47" strokeWidth="2.5" />
        <path d="M100 64 C102 58, 108 58, 106 64 Z" fill="#D5E5D5" />
        <rect x="42" y="55" width="6" height="45" rx="2" fill="#3B4B72" />
        <line x1="40" y1="55" x2="40" y2="70" stroke="#3B4B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="45" y1="55" x2="45" y2="70" stroke="#3B4B72" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="55" x2="50" y2="70" stroke="#3B4B72" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="148" y="70" width="6" height="30" rx="2" fill="#3B4B72" />
        <ellipse cx="151" cy="60" rx="10" ry="14" fill="#3B4B72" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full max-h-52">
      <circle cx="100" cy="80" r="55" fill="#FAF6F0" />
      <circle cx="72" cy="50" r="14" fill="#F3D9C9" stroke="#8C5E47" strokeWidth="4" />
      <circle cx="72" cy="50" r="7" fill="#FAF6F0" />
      <circle cx="128" cy="50" r="14" fill="#F3D9C9" stroke="#8C5E47" strokeWidth="4" />
      <circle cx="128" cy="50" r="7" fill="#FAF6F0" />
      <circle cx="100" cy="85" r="38" fill="#F3D9C9" stroke="#8C5E47" strokeWidth="4" />
      <path d="M72 110 C72 135, 128 135, 128 110 Z" fill="#D5E5D5" stroke="#4E6A4E" strokeWidth="3" />
      <path d="M110 120 L125 145 L135 140 L120 115 Z" fill="#D5E5D5" stroke="#4E6A4E" strokeWidth="3" />
      <circle cx="88" cy="78" r="3" fill="#3A3A3A" />
      <circle cx="112" cy="78" r="3" fill="#3A3A3A" />
      <ellipse cx="100" cy="88" rx="8" ry="6" fill="#FAF6F0" stroke="#8C5E47" strokeWidth="2.5" />
      <polygon points="97,85 103,85 100,88" fill="#8C5E47" />
      <circle cx="78" cy="85" r="4" fill="#FAF7F2" opacity="0.8" />
      <circle cx="122" cy="85" r="4" fill="#FAF7F2" opacity="0.8" />
    </svg>
  );
};

interface ChildModeProps {
  initialStory?: Story | null;
  onCloseStory?: () => void;
}

export const ChildMode: React.FC<ChildModeProps> = ({ initialStory = null, onCloseStory }) => {
  const [step, setStep] = useState<'emotion' | 'post-emotion' | 'stories' | 'reading'>(
    initialStory ? 'reading' : 'emotion'
  );
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(initialStory);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [loadingStories, setLoadingStories] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  const [textSize, setTextSize] = useState<'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl'>('text-2xl');
  const [showCompletion, setShowCompletion] = useState(false);

  // Achievement/Badge States
  const [checkinsCount, setCheckinsCount] = useState<number>(0);
  const [storiesReadCount, setStoriesReadCount] = useState<number>(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [readStoryTitles, setReadStoryTitles] = useState<string[]>([]);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);

  const { speak, stop, isSpeaking, supported: ttsSupported } = useSpeechSynthesis();

  // Load achievements from localStorage on mount
  useEffect(() => {
    const savedCheckins = localStorage.getItem('lumi_checkins_count');
    const savedStories = localStorage.getItem('lumi_stories_count');
    const savedBadges = localStorage.getItem('lumi_unlocked_badges');
    const savedStoryTitles = localStorage.getItem('lumi_read_stories_list');

    if (savedCheckins) setCheckinsCount(parseInt(savedCheckins, 10));
    if (savedStories) setStoriesReadCount(parseInt(savedStories, 10));
    if (savedBadges) {
      try {
        setUnlockedBadges(JSON.parse(savedBadges));
      } catch (e) {
        console.error('Failed to parse unlocked badges', e);
      }
    }
    if (savedStoryTitles) {
      try {
        setReadStoryTitles(JSON.parse(savedStoryTitles));
      } catch (e) {
        console.error('Failed to parse read stories list', e);
      }
    }
  }, []);

  const unlockBadge = (badgeId: string, currentUnlocked: string[]) => {
    if (currentUnlocked.includes(badgeId)) return currentUnlocked;
    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) {
      setNewlyUnlockedBadge(badge);
      const updated = [...currentUnlocked, badgeId];
      setUnlockedBadges(updated);
      localStorage.setItem('lumi_unlocked_badges', JSON.stringify(updated));
      return updated;
    }
    return currentUnlocked;
  };

  const adjustTextSize = (dir: 'in' | 'out') => {
    if (dir === 'out') {
      if (textSize === 'text-xl') setTextSize('text-2xl');
      else if (textSize === 'text-2xl') setTextSize('text-3xl');
      else if (textSize === 'text-3xl') setTextSize('text-4xl');
    } else {
      if (textSize === 'text-4xl') setTextSize('text-3xl');
      else if (textSize === 'text-3xl') setTextSize('text-2xl');
      else if (textSize === 'text-2xl') setTextSize('text-xl');
    }
  };

  // Load stories when switching to stories list
  useEffect(() => {
    if (step === 'stories') {
      setLoadingStories(true);
      setErrorMsg(null);
      api.getStories()
        .then(data => {
          setStories(data);
          setLoadingStories(false);
        })
        .catch(err => {
          console.error(err);
          setErrorMsg('Oops! We had a problem loading stories.');
          setLoadingStories(false);
        });
    }
  }, [step]);

  // Read page content automatically when turning page
  useEffect(() => {
    if (step === 'reading' && selectedStory && isAutoSpeak) {
      const page = selectedStory.content[currentPage];
      if (page) {
        // Delay slightly for visual transition
        const timer = setTimeout(() => {
          speak(page.text);
        }, 300);
        return () => clearTimeout(timer);
      }
    } else {
      stop();
    }
  }, [step, selectedStory, currentPage, isAutoSpeak]);

  const handleEmotionSelect = async (emotion: string) => {
    setSelectedEmotion(emotion);
    
    // Increment checkins
    const newCheckins = checkinsCount + 1;
    setCheckinsCount(newCheckins);
    localStorage.setItem('lumi_checkins_count', newCheckins.toString());

    // Check check-in badges
    let currentUnlocked = [...unlockedBadges];
    if (newCheckins >= 1) {
      currentUnlocked = unlockBadge('first_checkin', currentUnlocked);
    }
    if (newCheckins >= 3) {
      currentUnlocked = unlockBadge('emotions_expert', currentUnlocked);
    }

    try {
      await api.createEmotion({
        emotion: emotion.toLowerCase(),
        intensity: 2,
        notes: 'Child checked in via Child Mode.'
      });
      setStep('post-emotion');
    } catch (err) {
      console.error('Failed to log emotion:', err);
      // Proceed anyway to not block child flow
      setStep('post-emotion');
    }
  };

  const handleStoryCompletion = (story: Story) => {
    // Check if we already read this story in this session or load latest list
    const title = story.title.trim();
    let updatedTitles = [...readStoryTitles];
    if (!updatedTitles.includes(title)) {
      updatedTitles.push(title);
      setReadStoryTitles(updatedTitles);
      localStorage.setItem('lumi_read_stories_list', JSON.stringify(updatedTitles));
    }

    // Increment stories count
    const newStoriesCount = storiesReadCount + 1;
    setStoriesReadCount(newStoriesCount);
    localStorage.setItem('lumi_stories_count', newStoriesCount.toString());

    let currentUnlocked = [...unlockedBadges];
    
    // Unlocks based on count
    if (newStoriesCount >= 1) {
      currentUnlocked = unlockBadge('story_starter', currentUnlocked);
    }
    if (newStoriesCount >= 3) {
      currentUnlocked = unlockBadge('super_reader', currentUnlocked);
    }

    // Unlocks based on content keywords
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('dentist') || lowerTitle.includes('teeth') || lowerTitle.includes('tooth')) {
      currentUnlocked = unlockBadge('dentist_hero', currentUnlocked);
    }
    if (lowerTitle.includes('hair') || lowerTitle.includes('cut') || lowerTitle.includes('barber')) {
      currentUnlocked = unlockBadge('haircut_hero', currentUnlocked);
    }
    if (lowerTitle.includes('share') || lowerTitle.includes('friend') || lowerTitle.includes('play') || lowerTitle.includes('toy')) {
      currentUnlocked = unlockBadge('sharing_master', currentUnlocked);
    }
  };

  const handleStartReading = (story: Story) => {
    setSelectedStory(story);
    setCurrentPage(0);
    setShowCompletion(false);
    setStep('reading');
  };

  const handleNextPage = () => {
    if (selectedStory && currentPage < selectedStory.content.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      setShowCompletion(true);
      if (selectedStory) {
        handleStoryCompletion(selectedStory);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const renderBadgeCollection = () => {
    return (
      <div className="mt-12 bg-white rounded-[2.5rem] border-4 border-slate-100 p-6 sm:p-8 shadow-xs select-none">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-3">
          <span className="text-3xl">🏅</span>
          <div>
            <h3 className="font-sans font-bold text-xl text-calm-blue-dark">My Badge Shelf</h3>
            <p className="text-xs text-slate-400 font-medium">Explore everyday things and share your feelings to unlock badges!</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div
                key={badge.id}
                title={isUnlocked ? badge.description : `Locked: ${badge.description}`}
                className={`relative rounded-2xl p-3 border-2 border-slate-100 flex flex-col items-center justify-center text-center transition-all ${
                  isUnlocked 
                    ? `bg-white border-b-4 border-slate-200 cursor-pointer badge-unlocked ${badge.colorClass}`
                    : 'bg-slate-50 opacity-40 select-none grayscale'
                }`}
              >
                <div className="text-3xl sm:text-4xl mb-2 select-none">
                  {badge.emoji}
                </div>
                <h4 className="text-xs font-bold text-slate-700 leading-tight mb-0.5 truncate max-w-full">
                  {badge.title}
                </h4>
                <p className="text-[9px] text-slate-400 font-medium leading-none">
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </p>
                
                {/* Micro lock overlay for locked ones */}
                {!isUnlocked && (
                  <div className="absolute top-1.5 right-1.5 text-[10px] text-slate-400">🔒</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Back Buttons */}
      {step !== 'emotion' && (
        <button
          onClick={() => {
            stop();
            setShowCompletion(false);
            if (step === 'reading') {
              if (onCloseStory) {
                onCloseStory();
              } else {
                setStep('stories');
                setSelectedStory(null);
              }
            } else if (step === 'stories') {
              setStep('post-emotion');
            } else {
              setStep('emotion');
            }
          }}
          className="mb-6 flex items-center gap-2 text-calm-blue-dark font-medium text-base hover:opacity-80 transition select-none"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      )}

      {/* STEP 1: Emotion Check-In */}
      {step === 'emotion' && (
        <div className="text-center">
          {/* Welcome Mascot Banner */}
          <div className="max-w-2xl mx-auto bg-white rounded-[2.2rem] border-4 border-slate-100/80 p-5 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-5 text-left bg-scandi-gradient">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-calm-gradient border-2 border-white shadow-sm lumi-float shrink-0 flex items-center justify-center">
              <img 
                src="/lumi_emotions.png" 
                alt="Lumi emotions mascot" 
                className="w-full h-full object-cover scale-110 select-none" 
              />
            </div>
            <div className="bg-white border-2 border-calm-blue/50 p-4 rounded-2xl relative flex-1">
              <div className="hidden sm:block absolute left-0 top-1/2 -translate-x-[9px] -translate-y-2.5 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-calm-blue/50 rotate-45"></div>
              <p className="text-calm-blue-dark font-sans font-bold text-sm mb-0.5">Lumi the Bear says:</p>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                "Hello friend! Pick the picture below that matches how you feel inside right now. All feelings are okay with me!"
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-calm-blue-dark mb-6 font-sans select-none">
            How do you feel today?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {EMOTIONS.map((emo) => (
              <button
                key={emo.label}
                onClick={() => handleEmotionSelect(emo.label)}
                className={`border-4 rounded-[2.2rem] p-6 flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 shadow-sm active:scale-95 border-b-8 border-slate-700/80 lumi-wiggle-hover ${emo.colorClass} ${emo.hoverColorClass}`}
              >
                <span className="text-5xl sm:text-6xl mb-3 select-none">{emo.emoji}</span>
                <span className="font-bold text-base sm:text-lg font-sans tracking-wide">{emo.label}</span>
              </button>
            ))}
          </div>
          {renderBadgeCollection()}
        </div>
      )}

      {/* STEP 2: Post-Emotion Choice */}
      {step === 'post-emotion' && (
        <div className="text-center max-w-xl mx-auto py-6 bg-white rounded-[2.5rem] p-8 shadow-sm border-4 border-slate-100 bg-scandi-gradient flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-calm-gradient border-4 border-white shadow-md lumi-float mb-6 flex items-center justify-center">
            <img 
              src="/lumi_welcome.png" 
              alt="Lumi waving" 
              className="w-full h-full object-cover scale-110 select-none" 
            />
          </div>
          
          <div className="bg-white border-2 border-calm-blue/50 p-5 rounded-2xl mb-8 relative max-w-sm">
            <p className="text-calm-blue-dark font-sans font-bold text-sm mb-1">Lumi says:</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              "Thank you for sharing! You checked in feeling <span className="font-bold text-calm-blue-dark capitalize">{selectedEmotion}</span>. It is wonderful to recognize our feelings. Let's read a story now!"
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={() => setStep('stories')}
              className="w-full bg-calm-blue text-calm-blue-dark font-bold text-lg py-4 border-2 border-calm-blue-dark border-b-5 rounded-2xl shadow-sm hover:bg-white transition flex items-center justify-center gap-2 active:scale-95"
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              Read a Social Story
            </button>
            
            <button
              onClick={() => setStep('emotion')}
              className="w-full bg-white text-slate-600 border-2 border-slate-200 border-b-4 font-bold text-base py-3 rounded-2xl hover:bg-slate-50 transition active:scale-95"
            >
              Log another feeling
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Stories List */}
      {step === 'stories' && (
        <div>
          {/* Story Selection Mascot Greeting */}
          <div className="max-w-2xl mx-auto bg-white rounded-[2.2rem] border-4 border-slate-100/80 p-5 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-5 text-left bg-scandi-gradient">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-calm-gradient border-2 border-white shadow-sm lumi-float shrink-0 flex items-center justify-center">
              <img 
                src="/lumi_reading.png" 
                alt="Lumi reading" 
                className="w-full h-full object-cover scale-110 select-none" 
              />
            </div>
            <div className="bg-white border-2 border-calm-blue/50 p-4 rounded-2xl relative flex-1">
              <div className="hidden sm:block absolute left-0 top-1/2 -translate-x-[9px] -translate-y-2.5 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-calm-blue/50 rotate-45"></div>
              <p className="text-calm-blue-dark font-sans font-bold text-sm mb-0.5">Lumi the Bear says:</p>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                "I love reading! Pick a story below, and we can read it together page-by-page. I can even read the words out loud!"
              </p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-calm-blue-dark mb-6 font-sans text-center select-none">
            Pick a story to read
          </h2>

          {loadingStories ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-calm-blue mx-auto mb-4"></div>
              <p className="text-sm text-slate-500">Finding stories for you...</p>
            </div>
          ) : errorMsg ? (
            <div className="bg-red-50 text-red-700 p-6 rounded-2xl flex items-start gap-3 border border-red-100 max-w-md mx-auto">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Oh no!</h3>
                <p className="text-sm">{errorMsg}</p>
                <button 
                  onClick={() => setStep('stories')}
                  className="mt-3 text-sm underline font-semibold hover:opacity-85"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center bg-white border-4 border-slate-100 p-10 rounded-3xl max-w-md mx-auto shadow-sm select-none bg-scandi-gradient">
              <span className="text-6xl mb-4 block calm-float">🧩</span>
              <h3 className="font-bold text-lg text-calm-blue-dark mb-2">No Stories Ready Yet</h3>
              <p className="text-slate-500 mb-2 text-sm">
                Stories are friendly step-by-step guides for everyday things.
              </p>
              <p className="text-xs text-slate-400">Ask your parent or caregiver to create one in Parent Mode!</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {stories.map((story) => {
                  const visual = getStoryIcon(story.title);
                  return (
                    <div
                      key={story.id}
                      onClick={() => handleStartReading(story)}
                      className={`rounded-[2.2rem] border-4 border-slate-100 p-6 shadow-sm cursor-pointer hover:shadow-md hover:border-calm-blue transition flex flex-col justify-between group border-b-8 ${visual.color}`}
                    >
                      <div>
                        <div className="bg-white border-2 border-slate-200/50 text-calm-blue-dark w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold group-hover:scale-105 transition select-none">
                          {visual.emoji}
                        </div>
                        <h3 className="font-bold text-xl text-calm-blue-dark mb-2">{getDisplayTitle(story.title)}</h3>
                        <p className="text-xs text-slate-400 mb-4">
                          {story.content.length} Pages
                        </p>
                      </div>
                      <button className="w-full bg-white text-calm-blue-dark border-2 border-slate-700/80 border-b-4 font-bold py-2.5 rounded-xl group-hover:bg-calm-blue transition active:scale-95">
                        Start Reading
                      </button>
                    </div>
                  );
                })}
              </div>
              {renderBadgeCollection()}
            </>
          )}
        </div>
      )}

      {/* STEP 4: Story Reader (Carousel) */}
      {step === 'reading' && selectedStory && (
        <div className="bg-white rounded-[2.5rem] border-4 border-slate-100 p-6 sm:p-10 shadow-md">
          {showCompletion ? (
            /* Story Completed Screen */
            <div className="text-center py-10 select-none flex flex-col items-center bg-scandi-gradient rounded-[2rem] p-6 border-2 border-white shadow-xs">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-calm-gradient border-4 border-white shadow-md lumi-float mb-6 flex items-center justify-center">
                <img 
                  src="/lumi_welcome.png" 
                  alt="Lumi celebrate" 
                  className="w-full h-full object-cover scale-110" 
                />
              </div>
              <h3 className="font-sans font-bold text-3xl text-calm-blue-dark mb-4">Great Job! 🎉</h3>
              <p className="text-slate-600 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                You read the whole story about <span className="font-bold text-calm-blue-dark">{getDisplayTitle(selectedStory.title)}</span> with Lumi. You did amazing!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
                <button
                  onClick={() => {
                    setCurrentPage(0);
                    setShowCompletion(false);
                  }}
                  className="flex-1 bg-white border-2 border-slate-200 border-b-4 text-slate-700 font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition active:scale-95"
                >
                  Read Again 🔄
                </button>
                <button
                  onClick={() => {
                    if (onCloseStory) {
                      onCloseStory();
                    } else {
                      setStep('stories');
                      setSelectedStory(null);
                      setShowCompletion(false);
                    }
                  }}
                  className="flex-1 bg-calm-blue text-calm-blue-dark border-2 border-calm-blue-dark border-b-4 font-bold px-6 py-3.5 rounded-2xl hover:bg-white transition active:scale-95"
                >
                  Another Story 📖
                </button>
              </div>
            </div>
          ) : (
            /* Actual Reader Page */
            <>
              {/* Horizontal Progress Bar */}
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden mb-6">
                <div 
                  className="bg-calm-blue h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentPage + 1) / selectedStory.content.length) * 100}%` }}
                ></div>
              </div>

              {/* Reader Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="font-bold text-xl text-calm-blue-dark leading-tight">{getDisplayTitle(selectedStory.title)}</h3>
                  <p className="text-xs text-slate-400 mt-1 select-none font-semibold uppercase tracking-wider">
                    Page {currentPage + 1} of {selectedStory.content.length}
                  </p>
                </div>

                {/* Sizing & Audio Controls */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                  {/* Speaking Indicator */}
                  {isSpeaking && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] text-emerald-800 font-bold uppercase tracking-wider select-none animate-pulse">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                      Lumi is Reading
                    </div>
                  )}

                  {/* Aa- / Aa+ Text Size */}
                  <div className="flex border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => adjustTextSize('in')}
                      className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition active:bg-slate-200 border-r border-slate-200 select-none"
                      title="Make text smaller"
                    >
                      Aa-
                    </button>
                    <button
                      type="button"
                      onClick={() => adjustTextSize('out')}
                      className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition active:bg-slate-200 select-none"
                      title="Make text larger"
                    >
                      Aa+
                    </button>
                  </div>

                  {/* TTS Action */}
                  {ttsSupported && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 font-semibold select-none">
                        <input
                          type="checkbox"
                          checked={isAutoSpeak}
                          onChange={(e) => setIsAutoSpeak(e.target.checked)}
                          className="rounded border-slate-300 text-calm-blue focus:ring-calm-blue w-4 h-4"
                        />
                        Auto-Read
                      </label>
                      
                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            stop();
                          } else {
                            speak(selectedStory.content[currentPage].text);
                          }
                        }}
                        className={`p-3 rounded-full transition border-2 border-b-4 active:scale-90 ${
                          isSpeaking 
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                            : 'bg-calm-blue-light border-calm-blue-dark text-calm-blue-dark hover:bg-white'
                        }`}
                        title={isSpeaking ? 'Stop reading' : 'Read out loud'}
                      >
                        {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mascot Co-reading prompt bubble */}
              <div className="flex items-center gap-4 bg-scandi-gradient p-4 rounded-3xl border-2 border-slate-100/60 mb-6 text-left shadow-xs">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-calm-gradient border-2 border-white shadow-xs shrink-0 flex items-center justify-center select-none">
                  <img src="/lumi_reading.png" alt="Lumi reading" className="w-full h-full object-cover scale-110" />
                </div>
                <div className="bg-white border border-calm-blue/30 px-4 py-2.5 rounded-2xl text-xs text-slate-500 italic flex-1 leading-normal select-none">
                  "I am sitting with you reading. We can read this slide together, and turn the page when you are ready!"
                </div>
              </div>

              {/* Premium Illustration Panel */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div className="w-full max-w-md h-56 sm:h-64 rounded-3xl border-4 border-slate-100 shadow-xs overflow-hidden flex items-center justify-center relative bg-white border-b-6 select-none">
                  <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-calm-blue via-transparent to-transparent pointer-events-none"></div>
                  <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
                    <StoryIllustration title={selectedStory.title} visualPrompt={selectedStory.content[currentPage]?.visual_prompt || ""} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 text-center max-w-xs mt-2.5 italic px-4 select-none">
                  "{selectedStory.content[currentPage]?.visual_prompt}"
                </p>
              </div>

              {/* Page Text - Configurable Large text */}
              <div className="text-center px-4 mb-10 min-h-[100px] flex items-center justify-center">
                <p className={`${textSize} font-bold font-sans text-calm-charcoal leading-relaxed transition-all duration-200`}>
                  {selectedStory.content[currentPage]?.text}
                </p>
              </div>

              {/* Reader Footer Controls */}
              <div className="flex items-center justify-between gap-4 mt-6 border-t border-slate-100 pt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`flex-1 max-w-[150px] font-bold text-base sm:text-lg py-4 border-2 border-b-4 rounded-2xl text-center transition ${
                    currentPage === 0
                      ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed border-b-2'
                      : 'bg-white border-slate-700/80 text-slate-700 hover:bg-slate-50 active:scale-95'
                  }`}
                >
                  Previous
                </button>

                {/* Visual Page Indicators */}
                <div className="hidden sm:flex gap-2.5 items-center">
                  {selectedStory.content.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border border-slate-300 ${
                        idx === currentPage ? 'bg-calm-blue w-7' : 'bg-white'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  className="flex-1 max-w-[150px] bg-calm-green text-white hover:bg-calm-green/90 font-bold text-base sm:text-lg py-4 border-2 border-calm-green-dark border-b-4 rounded-2xl text-center transition flex items-center justify-center gap-1 active:scale-95"
                >
                  {currentPage === selectedStory.content.length - 1 ? (
                    <>
                      <Sparkles className="w-5 h-5 shrink-0" />
                      Finish
                    </>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Gentle Celebration Modal for Unlocked Badge */}
      {newlyUnlockedBadge && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn animate-duration-300">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 w-full max-w-sm border-4 border-calm-blue text-center shadow-xl badge-pop relative overflow-hidden bg-scandi-gradient">
            {/* Twinkling background stars */}
            <div className="absolute top-4 left-4 text-calm-blue text-xl scandi-twinkle">✨</div>
            <div className="absolute top-10 right-6 text-calm-cream text-lg scandi-drift-reverse">✨</div>

            <div className="w-24 h-24 rounded-full overflow-hidden bg-calm-gradient border-4 border-white shadow-md mx-auto mb-4 flex items-center justify-center lumi-float">
              <img src="/lumi_welcome.png" alt="Lumi waving" className="w-full h-full object-cover scale-110" />
            </div>

            <h3 className="font-sans font-bold text-2xl text-calm-blue-dark mb-1 select-none">Hooray! 🎉</h3>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">You unlocked a badge!</p>

            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center mx-auto text-4xl mb-4 shadow-sm select-none ${newlyUnlockedBadge.colorClass}`}>
              {newlyUnlockedBadge.emoji}
            </div>

            <h4 className="font-bold text-lg text-slate-800 mb-1 select-none">{newlyUnlockedBadge.title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-6 px-2">
              {newlyUnlockedBadge.description}
            </p>

            <button
              onClick={() => setNewlyUnlockedBadge(null)}
              className="w-full bg-calm-blue text-calm-blue-dark border-2 border-calm-blue-dark border-b-5 font-bold py-3 rounded-2xl transition hover:bg-white active:scale-95"
            >
              Great Job! 🧸
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
