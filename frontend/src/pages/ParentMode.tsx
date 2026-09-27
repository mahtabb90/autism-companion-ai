import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { EmotionCheckIn, Situation, Story, ChildProfile, Routine } from '../types';
import { Activity, Plus, FileText, Sparkles, Clock, AlertCircle, CheckCircle, Book, Trash2, Play, User, ListChecks } from 'lucide-react';
import { ChildProfilePanel } from '../components/ChildProfilePanel';

const getStoryIcon = (title: string): { emoji: string; color: string } => {
  const t = title.toLowerCase();
  if (t.includes('dentist') || t.includes('teeth') || t.includes('tooth')) {
    return { emoji: '🦷', color: 'bg-calm-gradient border-calm-blue/60 text-calm-blue-dark' };
  }
  if (t.includes('hair') || t.includes('cut') || t.includes('barber')) {
    return { emoji: '✂️', color: 'bg-peach-gradient border-calm-cream/60 text-calm-cream-dark' };
  }
  if (t.includes('share') || t.includes('friend') || t.includes('play') || t.includes('toy') || t.includes('give') || t.includes('take')) {
    return { emoji: '🤝', color: 'bg-green-gradient border-calm-green/60 text-calm-green-dark' };
  }
  if (t.includes('bath') || t.includes('wash') || t.includes('shower') || t.includes('clean') || t.includes('water')) {
    return { emoji: '🛁', color: 'bg-lavender-gradient border-calm-lavender/60 text-calm-lavender-dark' };
  }
  if (t.includes('school') || t.includes('bus') || t.includes('class') || t.includes('teacher') || t.includes('study')) {
    return { emoji: '🚌', color: 'bg-calm-gradient border-calm-blue/60 text-calm-blue-dark' };
  }
  if (t.includes('sleep') || t.includes('bed') || t.includes('night') || t.includes('dream')) {
    return { emoji: '🌙', color: 'bg-lavender-gradient border-calm-lavender/60 text-calm-lavender-dark' };
  }
  if (t.includes('doctor') || t.includes('hurt') || t.includes('checkup') || t.includes('clinic')) {
    return { emoji: '🩺', color: 'bg-peach-gradient border-calm-cream/60 text-calm-cream-dark' };
  }
  if (t.includes('food') || t.includes('eat') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast') || t.includes('kitchen')) {
    return { emoji: '🍽️', color: 'bg-green-gradient border-calm-green/60 text-calm-green-dark' };
  }
  if (t.includes('shop') || t.includes('store') || t.includes('grocery') || t.includes('buy') || t.includes('market')) {
    return { emoji: '🛒', color: 'bg-peach-gradient border-calm-cream/60 text-calm-cream-dark' };
  }
  return { emoji: '📄', color: 'bg-white border-slate-100 text-slate-700' };
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

interface ParentModeProps {
  onReadStory: (story: Story) => void;
}

export const ParentMode: React.FC<ParentModeProps> = ({ onReadStory }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'generate' | 'stories' | 'routines'>('dashboard');
  const [emotions, setEmotions] = useState<EmotionCheckIn[]>([]);
  const [situations, setSituations] = useState<Situation[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  // Form fields for story generator
  const [selectedSituationId, setSelectedSituationId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number | ''>('');
  const [keyDetails, setKeyDetails] = useState('');
  
  // Form fields for creating a new situation
  const [showAddSituation, setShowAddSituation] = useState(false);
  const [newSitTitle, setNewSitTitle] = useState('');
  const [newSitDesc, setNewSitDesc] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active child profile (selected in the Profile tab)
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);

  // Routines state
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineCategory, setRoutineCategory] = useState('');
  const [routineSteps, setRoutineSteps] = useState<string[]>(['', '', '']);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<Routine | null>(null);
  const [deletingRoutineId, setDeletingRoutineId] = useState<number | null>(null);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  // Load backend data
  const loadAllData = async () => {
    setLoadingData(true);
    setErrorMsg(null);
    try {
      const [emoData, sitData, storyData, routineData] = await Promise.all([
        api.getEmotions(),
        api.getSituations(),
        api.getStories(),
        api.getRoutines(),
      ]);
      setEmotions(emoData);
      setSituations(sitData);
      setStories(storyData);
      setRoutines(routineData);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync data with the backend server. Make sure the FastAPI app is running on localhost:8000.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const handleCreateSituation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSitTitle || !newSitDesc) return;
    
    try {
      const added = await api.createSituation({ title: newSitTitle, description: newSitDesc });
      setSituations(prev => [added, ...prev]);
      setSelectedSituationId(added.id.toString());
      setNewSitTitle('');
      setNewSitDesc('');
      setShowAddSituation(false);
      setSuccessMsg('Successfully created a new situation template!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create situation template.');
    }
  };

  const handleDeleteStory = async () => {
    if (!storyToDelete) return;
    setDeletingId(storyToDelete.id);
    setErrorMsg(null);
    try {
      await api.deleteStory(storyToDelete.id);
      setStories(prev => prev.filter(s => s.id !== storyToDelete.id));
      setStoryToDelete(null);
      setSuccessMsg('Story deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete the story.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate inputs
    const useCustom = selectedSituationId === 'custom';
    if (!useCustom && !selectedSituationId) {
      setErrorMsg('Please select a situation template or choose "Create a Custom Situation".');
      return;
    }
    if (useCustom && (!customTitle || !customDesc)) {
      setErrorMsg('Please provide a title and description for your custom situation.');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        situation_id: useCustom ? undefined : Number(selectedSituationId),
        custom_situation_text: useCustom ? customDesc : undefined,
        custom_title: useCustom ? customTitle : undefined,
        child_name: childName || (activeProfile?.name) || undefined,
        child_age: childAge ? Number(childAge) : (activeProfile?.age) || undefined,
        key_details: keyDetails || undefined,
        child_profile_id: activeProfile?.id || undefined,
      };
      
      // Override title if custom is used
      const generated = await api.generateStory(payload);
      
      setStories(prev => [generated, ...prev]);
      setSuccessMsg('Success! Social story has been successfully generated.');
      
      // Reset form
      setCustomTitle('');
      setCustomDesc('');
      setSelectedSituationId('');
      setKeyDetails('');
      setChildName('');
      setChildAge('');

      // Redirect to list
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveTab('stories');
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg('AI generation request failed. Check API key configurations.');
    } finally {
      setGenerating(false);
    }
  };

  // ── Routine helpers ──────────────────────────────────────────────────────
  const ROUTINE_CATEGORIES = ['Morning', 'School', 'After School', 'Evening', 'Bedtime', 'Other'];

  const handleAddStep = () => {
    if (routineSteps.length < 8) setRoutineSteps(prev => [...prev, '']);
  };

  const handleRemoveStep = (idx: number) => {
    if (routineSteps.length > 3) setRoutineSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const handleStepChange = (idx: number, value: string) => {
    setRoutineSteps(prev => prev.map((s, i) => i === idx ? value : s));
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSteps = routineSteps.map(s => s.trim()).filter(Boolean);
    if (!routineTitle.trim() || cleanSteps.length < 1) {
      setErrorMsg('Please add a title and at least one step.');
      return;
    }
    setSavingRoutine(true);
    setErrorMsg(null);
    try {
      if (editingRoutine) {
        const updated = await api.updateRoutine(editingRoutine.id, {
          title: routineTitle.trim(),
          category: routineCategory || undefined,
          steps: cleanSteps,
        });
        setRoutines(prev => prev.map(r => r.id === editingRoutine.id ? updated : r));
        setEditingRoutine(null);
      } else {
        const created = await api.createRoutine({
          title: routineTitle.trim(),
          category: routineCategory || undefined,
          steps: cleanSteps,
          child_profile_id: activeProfile?.id,
        });
        setRoutines(prev => [created, ...prev]);
      }
      setRoutineTitle('');
      setRoutineCategory('');
      setRoutineSteps(['', '', '']);
      setSuccessMsg('Routine saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save routine. Please try again.');
    } finally {
      setSavingRoutine(false);
    }
  };

  const handleDeleteRoutine = async () => {
    if (!routineToDelete) return;
    setDeletingRoutineId(routineToDelete.id);
    try {
      await api.deleteRoutine(routineToDelete.id);
      setRoutines(prev => prev.filter(r => r.id !== routineToDelete.id));
      setRoutineToDelete(null);
      setSuccessMsg('Routine deleted.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete routine.');
    } finally {
      setDeletingRoutineId(null);
    }
  };

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setRoutineTitle(routine.title);
    setRoutineCategory(routine.category || '');
    setRoutineSteps(routine.steps.length >= 3 ? [...routine.steps] : [...routine.steps, ...Array(3 - routine.steps.length).fill('')]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getEmotionEmoji = (emotion: string) => {
    const e = emotion.toLowerCase();
    if (e.includes('happy') || e.includes('joy')) return '☀️';
    if (e.includes('calm') || e.includes('peace')) return '🌊';
    if (e.includes('excit')) return '🚀';
    if (e.includes('tired')) return '🧸';
    if (e.includes('worri') || e.includes('anxio') || e.includes('sad')) return '☁️';
    if (e.includes('overwhelmed') || e.includes('angry')) return '⚡';
    return '😊';
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    let formattedStr = isoString;
    // Append 'Z' to treat as UTC if there is no timezone suffix
    if (!isoString.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(isoString)) {
      formattedStr = isoString + 'Z';
    }
    const date = new Date(formattedStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 mb-8">
        {/* Title row */}
        <div>
          <h2 className="text-3xl font-bold text-calm-cream-dark font-sans flex items-center gap-2 select-none">
            🧸 Parent Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1 select-none">
            Track emotions, create social stories, and build visual routines for everyday support.
          </p>
        </div>

        {/* Tab Selector — full width below title, scrollable on very small screens */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-200 min-w-max">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-none px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center border border-transparent shadow-xs select-none active:scale-98 ${
                activeTab === 'dashboard'
                  ? 'bg-white border-calm-cream border-b-3 text-calm-cream-dark'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Emotion Log</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-none px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center border border-transparent shadow-xs select-none active:scale-98 ${
                activeTab === 'profile'
                  ? 'bg-white border-calm-cream border-b-3 text-calm-cream-dark'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Child Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('generate')}
              className={`flex-none px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center border border-transparent shadow-xs select-none active:scale-98 ${
                activeTab === 'generate'
                  ? 'bg-white border-calm-cream border-b-3 text-calm-cream-dark'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Generate Story</span>
            </button>

            <button
              onClick={() => setActiveTab('stories')}
              className={`flex-none px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center border border-transparent shadow-xs select-none active:scale-98 ${
                activeTab === 'stories'
                  ? 'bg-white border-calm-cream border-b-3 text-calm-cream-dark'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Saved Stories</span>
            </button>

            <button
              onClick={() => setActiveTab('routines')}
              className={`flex-none px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 justify-center border border-transparent shadow-xs select-none active:scale-98 ${
                activeTab === 'routines'
                  ? 'bg-white border-calm-cream border-b-3 text-calm-cream-dark'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <ListChecks className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Routines</span>
            </button>
          </div>
        </div>
      </div>

      {/* Parent Welcome bubble */}
      <div className="bg-white rounded-[2rem] border-4 border-slate-100 p-4 shadow-sm mb-8 flex items-center gap-4 text-left bg-scandi-gradient select-none">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-peach-gradient border-2 border-white shadow-xs shrink-0 flex items-center justify-center">
          <img src="/lumi_welcome.png" alt="Lumi waving" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="flex-1 bg-white border border-calm-cream/40 px-4 py-2 rounded-2xl text-xs text-slate-500 leading-normal">
          <strong>Lumi says:</strong> "Welcome parent! Below you can track emotional journals, save custom situation templates, or create new story books. Thank you for guiding your child!"
        </div>
      </div>

      {/* Global Messages */}
      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-100 flex items-start gap-2 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{errorMsg}</div>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-100 flex items-start gap-2 mb-6">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{successMsg}</div>
        </div>
      )}

      {/* Loading Overlay (data-syncing) */}
      {loadingData && !generating && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-calm-cream mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Syncing with server database...</p>
        </div>
      )}

      {/* TAB 1: Dashboard logs */}
      {!loadingData && activeTab === 'dashboard' && (
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            Child Emotional Tracker
          </h3>

          {emotions.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3 mb-6 select-none max-w-3xl mx-auto shadow-xs bg-scandi-gradient">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-calm-gradient border border-slate-200 shrink-0 flex items-center justify-center">
                <img src="/lumi_emotions.png" alt="Lumi emotions" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="text-xs text-slate-500 leading-normal">
                <strong>Lumi's Guide:</strong> "Tracking these checks helps us find patterns. If your child logs a feeling like worried ☁️ or overwhelmed ⚡, reading a social story together can help!"
              </div>
            </div>
          )}

          {emotions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto shadow-sm select-none animate-fadeIn">
              <span className="text-6xl mb-4 block calm-float">📊</span>
              <h3 className="font-bold text-lg text-slate-800 mb-2">No Emotion Logs Yet</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-1">
                When your child logs a feeling in Child Mode, it will appear here.
              </p>
              <p className="text-xs text-slate-400">
                This helps you track emotional patterns and trends over time.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm max-w-3xl mx-auto">
              <div className="flow-root">
                <ul className="-mb-8">
                  {emotions.map((log, logIdx) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {logIdx !== emotions.length - 1 ? (
                          <span className="absolute top-4 left-6 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3 items-start">
                          <div>
                            <span className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl select-none">
                              {getEmotionEmoji(log.emotion)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                Checked in feeling <span className="font-bold capitalize">{log.emotion}</span>
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                                  Intensity {log.intensity}/3
                                </span>
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(log.timestamp)}
                              </p>
                              {log.notes && (
                                <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 italic">
                                  Notes: "{log.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1.5: Child Profile */}
      {!loadingData && activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-calm-cream-dark" />
                Child Profile
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Save your child's details once. Lumi will use them automatically in every story.
              </p>
            </div>
          </div>
          <ChildProfilePanel onProfileChange={(p) => setActiveProfile(p)} />
        </div>
      )}

      {/* TAB 2: Story Generator Form */}
      {!loadingData && activeTab === 'generate' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Create Social Story</h3>
            
            <form onSubmit={handleGenerateStory} className="space-y-6">
              {/* Situation Template Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Select Situation Template
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedSituationId}
                    onChange={(e) => setSelectedSituationId(e.target.value)}
                    className="flex-1 rounded-2xl border-slate-200 border bg-slate-50/50 p-3.5 text-sm focus:border-calm-cream focus:ring-calm-cream"
                    required
                  >
                    <option value="">-- Choose a situation template --</option>
                    {situations.map((sit) => (
                      <option key={sit.id} value={sit.id}>{sit.title}</option>
                    ))}
                    <option value="custom">+ Create a Custom Situation...</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => setShowAddSituation(true)}
                    className="bg-calm-cream-light/60 hover:bg-calm-cream/50 text-calm-cream-dark p-3.5 rounded-2xl transition"
                    title="Add situation template"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Custom fields (shown if "custom" situation is selected) */}
              {selectedSituationId === 'custom' && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wide">Custom Situation Details</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Situation Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g., Playing at the Park"
                      className="w-full rounded-xl border-slate-200 bg-white p-3 text-sm focus:ring-calm-cream"
                      required={selectedSituationId === 'custom'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Situation Description</label>
                    <textarea
                      value={customDesc}
                      onChange={(e) => setCustomDesc(e.target.value)}
                      placeholder="Explain the situation in details. E.g. We will walk to the park, play on swings, and go home when the timer goes ring-ring."
                      className="w-full rounded-xl border-slate-200 bg-white p-3 text-sm focus:ring-calm-cream min-h-[100px]"
                      required={selectedSituationId === 'custom'}
                    />
                  </div>
                </div>
              )}

              {/* Child Profile Details */}
              {/* Profile auto-fill notice */}
              {activeProfile && (
                <div className="bg-calm-blue/30 border border-calm-blue/50 rounded-2xl p-4 flex items-start gap-3 animate-fadeIn">
                  <span className="text-lg select-none">🧒</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-calm-blue-dark">
                      Using {activeProfile.name}'s profile
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Profile details will be woven into the story automatically. You can still override name and age below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="text-xs text-calm-blue-dark underline shrink-0 hover:no-underline"
                  >
                    Edit
                  </button>
                </div>
              )}
              {!activeProfile && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-300 shrink-0" />
                  <p className="text-xs text-slate-400">
                    No profile saved yet.{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="underline text-calm-cream-dark hover:no-underline"
                    >
                      Create a Child Profile
                    </button>{' '}to auto-fill stories.
                  </p>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Child's Name (Optional)</label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g., Leo"
                    className="w-full rounded-2xl border-slate-200 border bg-slate-50/50 p-3.5 text-sm focus:ring-calm-cream"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Child's Age (Optional)</label>
                  <input
                    type="number"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g., 6"
                    className="w-full rounded-2xl border-slate-200 border bg-slate-50/50 p-3.5 text-sm focus:ring-calm-cream"
                  />
                </div>
              </div>

              {/* Special details */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Special Details / Triggers / Interests (Optional)
                </label>
                <textarea
                  value={keyDetails}
                  onChange={(e) => setKeyDetails(e.target.value)}
                  placeholder="e.g., Loves space ships, afraid of loud buzzing scissors, needs to hug his blue blanket."
                  className="w-full rounded-2xl border-slate-200 border bg-slate-50/50 p-3.5 text-sm focus:ring-calm-cream min-h-[80px]"
                />
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  These details will be woven into the generated story, suggesting calming tools (e.g. hugging the blanket, thinking about space ships) directly in gray guidelines.
                </p>
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={generating}
                className={`w-full font-bold text-lg py-4 rounded-2xl shadow-sm text-center transition flex items-center justify-center gap-2 active:scale-95 ${
                  generating
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-calm-cream text-calm-cream-dark hover:bg-calm-cream/80'
                }`}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-calm-cream-dark"></div>
                    Composing Story...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate AI Social Story
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Info Sidebar */}
          <div className="space-y-6">
            {/* Lumi Tip Bubble */}
            <div className="bg-white rounded-3xl border-2 border-slate-100 p-5 flex items-center gap-4 bg-scandi-gradient shadow-xs select-none">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-calm-gradient border-2 border-white shadow-xs shrink-0 flex items-center justify-center">
                <img src="/lumi_welcome.png" alt="Lumi help" className="w-full h-full object-cover scale-110" />
              </div>
              <div className="flex-1 bg-white border border-calm-blue/30 px-3.5 py-2 rounded-2xl text-xs text-slate-500 leading-normal">
                <strong>Lumi's Tip:</strong> "Adding child details helps me suggest customized calming tools directly in the story!"
              </div>
            </div>

            {/* Carol Gray Rules Reminder */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
              <h4 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                <Book className="w-4 h-4 text-calm-cream-dark" />
                Carol Gray Social Story Guidelines
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Our AI generates stories following Carol Gray-inspired social story principles:
              </p>
              <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside">
                <li>Uses simple, literal, visual language (no abstract idioms).</li>
                <li>Explains what is happening step-by-step.</li>
                <li>Details how other friendly helpers feel and think (perspective).</li>
                <li>Includes directive options like taking breaths or raising hands.</li>
                <li>Written in the 1st person ("I", "my") so the child can read from their perspective.</li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-6">
              <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wide mb-2 flex items-center gap-1">
                ⚠️ Advisory Note
              </h4>
              <p className="text-xs text-amber-900/75 leading-relaxed">
                This is a supportive educational tool only. It is not therapeutic or clinical intervention software. Use stories to co-read and prepare, adjusting prompts based on unique professional therapeutic advice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Saved Stories List */}
      {!loadingData && activeTab === 'stories' && (
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-6">Generated & Saved Stories</h3>
          
          {stories.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto shadow-sm select-none animate-fadeIn">
              <span className="text-6xl mb-4 block calm-float">📚</span>
              <h3 className="font-bold text-lg text-slate-800 mb-2">No Stories Created Yet</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-1">
                You haven't generated any social stories yet.
              </p>
              <p className="text-xs text-slate-400">
                Go to the "Generate Story" tab to create your first custom story!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => {
                const visual = getStoryIcon(story.title);
                return (
                  <div
                    key={story.id}
                    className={`rounded-3xl border-4 border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between border-b-8 ${visual.color}`}
                  >
                    <div>
                      <div className="bg-white border-2 border-slate-200/50 text-calm-blue-dark w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold select-none">
                        {visual.emoji}
                      </div>
                      <h4 className="font-bold text-lg text-slate-800 mb-1.5 leading-snug">{getDisplayTitle(story.title)}</h4>
                      <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Created: {formatDate(story.created_at)}
                      </p>
                      
                      {/* Story Preview Content */}
                      <div className="bg-white/90 rounded-2xl p-4 border border-slate-100 mb-6">
                        <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wider">Page 1 Snippet</p>
                        <p className="text-xs text-slate-500 italic line-clamp-3">
                          "{story.content[0]?.text}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReadStory(story)}
                        className="flex-grow bg-calm-blue border border-calm-blue-dark text-calm-blue-dark font-bold py-2.5 rounded-xl hover:bg-white hover:text-calm-blue-dark transition text-xs flex items-center justify-center gap-1 active:scale-95 select-none"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Read Story
                      </button>
                      <button
                        onClick={() => {
                          // Printable format logic
                          const printWindow = window.open('', '_blank');
                          if (printWindow) {
                            const cleanTitle = getDisplayTitle(story.title);
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Print: ${cleanTitle}</title>
                                  <style>
                                    body { font-family: sans-serif; padding: 40px; color: #2D3748; line-height: 1.6; }
                                    h1 { text-align: center; color: #374785; margin-bottom: 40px; }
                                    .page { border: 1px solid #E2E8F0; padding: 20px; border-radius: 12px; margin-bottom: 20px; page-break-inside: avoid; }
                                    .page-num { font-weight: bold; color: #7f4f24; font-size: 14px; margin-bottom: 10px; }
                                    .text { font-size: 18px; margin-bottom: 10px; }
                                    .prompt { font-size: 12px; color: #718096; font-style: italic; }
                                  </style>
                                </head>
                                <body>
                                  <h1>${cleanTitle}</h1>
                                  ${story.content.map(p => `
                                    <div class="page">
                                      <div class="page-num">Page ${p.page_number}</div>
                                      <div class="text">${p.text}</div>
                                      <div class="prompt">Illustration Guide: ${p.visual_prompt}</div>
                                    </div>
                                  `).join('')}
                                  <script>window.onload = function() { window.print(); }</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                          }
                        }}
                        className="bg-white border border-slate-200 text-slate-600 font-semibold py-2.5 px-3 rounded-xl hover:bg-slate-50 transition text-xs active:scale-95 select-none"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => setStoryToDelete(story)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl p-2.5 transition active:scale-95 select-none shrink-0"
                        title="Delete Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal for adding Situation Templates */}
      {showAddSituation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md border border-slate-100 shadow-xl">
            <h4 className="font-bold text-xl text-slate-800 mb-4">Add Situation Template</h4>
            
            <form onSubmit={handleCreateSituation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Situation Title</label>
                <input
                  type="text"
                  value={newSitTitle}
                  onChange={(e) => setNewSitTitle(e.target.value)}
                  placeholder="e.g., Riding the School Bus"
                  className="w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm focus:ring-calm-cream"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newSitDesc}
                  onChange={(e) => setNewSitDesc(e.target.value)}
                  placeholder="e.g., A template to explain finding a seat on the bus and waiting safely."
                  className="w-full rounded-xl border-slate-200 bg-slate-50/50 p-3 text-sm focus:ring-calm-cream min-h-[80px]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSituation(false)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-100 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-calm-cream text-calm-cream-dark font-bold py-3 rounded-xl hover:bg-calm-cream/80 transition text-sm"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Deleting Stories */}
      {storyToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn animate-duration-200">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-sm border-2 border-slate-100 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <h4 className="font-sans font-bold text-xl text-slate-800 mb-2 select-none">Delete Social Story?</h4>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed select-none">
              Are you sure you want to delete <span className="font-bold text-slate-700">"{getDisplayTitle(storyToDelete.title)}"</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStoryToDelete(null)}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-100 transition text-sm select-none active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStory}
                disabled={deletingId !== null}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition text-sm flex items-center justify-center gap-1.5 active:scale-95 select-none disabled:opacity-50"
              >
                {deletingId !== null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Routines Builder */}
      {!loadingData && activeTab === 'routines' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create / Edit Form */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-calm-cream-dark" />
              {editingRoutine ? 'Edit Routine' : 'Create a Routine'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Build a simple step-by-step routine your child can follow at home or school.
            </p>

            <form onSubmit={handleSaveRoutine} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Routine Title</label>
                <input
                  id="routine-title"
                  type="text"
                  value={routineTitle}
                  onChange={e => setRoutineTitle(e.target.value)}
                  placeholder="e.g., Morning Routine"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm focus:border-calm-cream focus:ring-calm-cream"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  id="routine-category"
                  value={routineCategory}
                  onChange={e => setRoutineCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm focus:border-calm-cream"
                >
                  <option value="">-- Choose a category --</option>
                  {ROUTINE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Steps ({routineSteps.length}/8)
                </label>
                <div className="space-y-2">
                  {routineSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-calm-cream/70 text-calm-cream-dark text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        id={`routine-step-${idx}`}
                        type="text"
                        value={step}
                        onChange={e => handleStepChange(idx, e.target.value)}
                        placeholder={`Step ${idx + 1}...`}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:border-calm-cream"
                      />
                      {routineSteps.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="text-slate-300 hover:text-red-400 transition shrink-0"
                          title="Remove step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {routineSteps.length < 8 && (
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="mt-3 flex items-center gap-1.5 text-xs font-bold text-calm-cream-dark hover:text-calm-cream transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add another step
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {editingRoutine && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoutine(null);
                      setRoutineTitle('');
                      setRoutineCategory('');
                      setRoutineSteps(['', '', '']);
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-100 transition text-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingRoutine}
                  className={`flex-1 font-bold py-3.5 rounded-2xl transition text-sm flex items-center justify-center gap-2 active:scale-95 ${
                    savingRoutine
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-calm-cream text-calm-cream-dark hover:bg-calm-cream/80'
                  }`}
                >
                  {savingRoutine ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-calm-cream-dark" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {editingRoutine ? 'Update Routine' : 'Save Routine'}
                </button>
              </div>
            </form>
          </div>

          {/* Saved Routines List */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Saved Routines ({routines.length})</h3>
            {routines.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center shadow-sm select-none animate-fadeIn">
                <span className="text-5xl mb-4 block calm-float">📋</span>
                <h4 className="font-bold text-base text-slate-800 mb-1">No Routines Yet</h4>
                <p className="text-slate-400 text-xs">
                  Create your first routine using the form on the left!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {routines.map(routine => (
                  <div
                    key={routine.id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xl select-none">📋</span>
                          <h4 className="font-bold text-slate-800 text-base">{routine.title}</h4>
                        </div>
                        {routine.category && (
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-calm-cream/40 text-calm-cream-dark px-2 py-0.5 rounded-full">
                            {routine.category}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditRoutine(routine)}
                          className="bg-slate-50 border border-slate-200 text-slate-500 hover:text-calm-cream-dark hover:border-calm-cream rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setRoutineToDelete(routine)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl p-1.5 transition active:scale-95"
                          title="Delete routine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <ol className="space-y-1">
                      {routine.steps.map((step, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Delete Routine */}
      {routineToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-sm border-2 border-slate-100 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-50 border-2 border-red-200 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Trash2 className="w-8 h-8" />
            </div>
            <h4 className="font-sans font-bold text-xl text-slate-800 mb-2 select-none">Delete Routine?</h4>
            <p className="text-sm text-slate-500 mb-6 select-none">
              Delete <span className="font-bold text-slate-700">"{routineToDelete.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRoutineToDelete(null)}
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-100 transition text-sm select-none active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRoutine}
                disabled={deletingRoutineId !== null}
                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition text-sm flex items-center justify-center gap-1.5 active:scale-95 select-none disabled:opacity-50"
              >
                {deletingRoutineId !== null ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
