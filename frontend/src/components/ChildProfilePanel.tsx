import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ChildProfile, ChildProfileCreate } from '../types';
import { User, Edit3, Trash2, CheckCircle, AlertCircle, Plus, Save } from 'lucide-react';

interface ChildProfilePanelProps {
  /** Called whenever the active profile changes (created, updated, or deleted). */
  onProfileChange?: (profile: ChildProfile | null) => void;
}

const EMPTY_FORM: ChildProfileCreate = {
  name: '',
  age: undefined,
  interests: '',
  triggers: '',
  sensory_preferences: '',
  calming_tools: '',
  communication_style: '',
  notes: '',
};

export const ChildProfilePanel: React.FC<ChildProfilePanelProps> = ({ onProfileChange }) => {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ChildProfileCreate>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const flash = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await api.getChildProfiles();
      setProfiles(data);
      if (data.length > 0 && !activeProfile) {
        setActiveProfile(data[0]);
        onProfileChange?.(data[0]);
      }
    } catch {
      // Silent — user just won't see profiles
    }
  };

  useEffect(() => {
    loadProfiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setForm(EMPTY_FORM);
    setIsEditing(true);
    setActiveProfile(null);
  };

  const startEdit = (profile: ChildProfile) => {
    setForm({
      name: profile.name,
      age: profile.age,
      interests: profile.interests ?? '',
      triggers: profile.triggers ?? '',
      sensory_preferences: profile.sensory_preferences ?? '',
      calming_tools: profile.calming_tools ?? '',
      communication_style: profile.communication_style ?? '',
      notes: profile.notes ?? '',
    });
    setIsEditing(true);
    setActiveProfile(profile);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      flash('Please enter the child\'s name.', 'error');
      return;
    }
    setLoading(true);
    try {
      let saved: ChildProfile;
      if (activeProfile) {
        saved = await api.updateChildProfile(activeProfile.id, form);
        flash('Profile updated successfully!', 'success');
      } else {
        saved = await api.createChildProfile(form);
        flash('Profile saved successfully!', 'success');
      }
      setActiveProfile(saved);
      onProfileChange?.(saved);
      setIsEditing(false);
      await loadProfiles();
    } catch {
      flash('Could not save the profile. Please check the server is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profile: ChildProfile) => {
    if (!window.confirm(`Delete ${profile.name}'s profile? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await api.deleteChildProfile(profile.id);
      const updated = profiles.filter(p => p.id !== profile.id);
      setProfiles(updated);
      const next = updated[0] ?? null;
      setActiveProfile(next);
      onProfileChange?.(next);
      setIsEditing(false);
      flash('Profile deleted.', 'success');
    } catch {
      flash('Could not delete the profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof ChildProfileCreate) =>
    (form[key] as string | number | undefined) ?? '';

  const setField = (key: keyof ChildProfileCreate, val: string | number | undefined) =>
    setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      {/* Messages */}
      {errorMsg && (
        <div className="bg-red-50 text-red-800 p-3 rounded-2xl border border-red-100 flex items-start gap-2 text-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-100 flex items-start gap-2 text-sm animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {successMsg}
        </div>
      )}

      {/* ─── View Mode: Saved profile summary card ─── */}
      {!isEditing && activeProfile && (
        <div className="bg-white rounded-3xl border-2 border-calm-cream/40 p-6 shadow-sm space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-peach-gradient border-2 border-white shadow flex items-center justify-center text-xl select-none">
                🧒
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-800 leading-tight">{activeProfile.name}</h4>
                {activeProfile.age && (
                  <p className="text-xs text-slate-400">{activeProfile.age} years old</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(activeProfile)}
                className="p-2 rounded-xl bg-calm-blue/60 hover:bg-calm-blue text-calm-blue-dark transition active:scale-95"
                title="Edit profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(activeProfile)}
                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition active:scale-95"
                title="Delete profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Profile chips */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {activeProfile.interests && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">✨ Interests</p>
                <p className="text-slate-700">{activeProfile.interests}</p>
              </div>
            )}
            {activeProfile.triggers && (
              <div className="bg-amber-50/60 rounded-2xl p-3 border border-amber-100">
                <p className="font-bold text-amber-700 uppercase tracking-wider mb-1">⚡ Triggers</p>
                <p className="text-slate-700">{activeProfile.triggers}</p>
              </div>
            )}
            {activeProfile.sensory_preferences && (
              <div className="bg-lavender-gradient/30 rounded-2xl p-3 border border-slate-100">
                <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">🌿 Sensory Preferences</p>
                <p className="text-slate-700">{activeProfile.sensory_preferences}</p>
              </div>
            )}
            {activeProfile.calming_tools && (
              <div className="bg-green-50/60 rounded-2xl p-3 border border-green-100">
                <p className="font-bold text-calm-green-dark uppercase tracking-wider mb-1">🌊 Calming Tools</p>
                <p className="text-slate-700">{activeProfile.calming_tools}</p>
              </div>
            )}
            {activeProfile.communication_style && (
              <div className="bg-calm-blue/30 rounded-2xl p-3 border border-calm-blue/40 sm:col-span-2">
                <p className="font-bold text-calm-blue-dark uppercase tracking-wider mb-1">💬 Communication Style</p>
                <p className="text-slate-700">{activeProfile.communication_style}</p>
              </div>
            )}
            {activeProfile.notes && (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 sm:col-span-2">
                <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">📝 Notes</p>
                <p className="text-slate-600 italic">{activeProfile.notes}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 text-center pt-1">
            This profile will be used automatically when you generate a story.
          </p>
        </div>
      )}

      {/* ─── No profile yet ─── */}
      {!isEditing && !activeProfile && profiles.length === 0 && (
        <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 text-center animate-fadeIn">
          <User className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h4 className="font-bold text-slate-700 mb-1">No Child Profile Yet</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Save your child's details once and Lumi will automatically personalize every story.
          </p>
          <button
            onClick={startCreate}
            className="bg-calm-cream text-calm-cream-dark font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-calm-cream/80 transition active:scale-95 flex items-center gap-1.5 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Profile
          </button>
        </div>
      )}

      {/* ─── Edit / Create Form ─── */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border-2 border-calm-cream/30 p-6 shadow-sm space-y-4 animate-fadeIn">
          <h4 className="font-bold text-slate-800 text-base">
            {activeProfile ? `Edit ${activeProfile.name}'s Profile` : 'Create Child Profile'}
          </h4>

          {/* Row 1: Name + Age */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={field('name')}
                onChange={e => setField('name', e.target.value)}
                placeholder="e.g., Leo"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-calm-cream focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Age (optional)</label>
              <input
                type="number"
                value={field('age')}
                onChange={e => setField('age', e.target.value === '' ? undefined : Number(e.target.value))}
                placeholder="e.g., 6"
                min={1}
                max={18}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-calm-cream focus:outline-none"
              />
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Interests (optional)</label>
            <input
              type="text"
              value={field('interests')}
              onChange={e => setField('interests', e.target.value)}
              placeholder="e.g., dinosaurs, space, trains"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-calm-cream focus:outline-none"
            />
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Triggers (optional)</label>
            <input
              type="text"
              value={field('triggers')}
              onChange={e => setField('triggers', e.target.value)}
              placeholder="e.g., loud sudden noises, unexpected changes"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-calm-cream focus:outline-none"
            />
          </div>

          {/* Sensory */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Sensory Preferences (optional)</label>
            <input
              type="text"
              value={field('sensory_preferences')}
              onChange={e => setField('sensory_preferences', e.target.value)}
              placeholder="e.g., soft lighting, no tags on clothes"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-calm-cream focus:outline-none"
            />
          </div>

          {/* Calming tools */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Calming Tools (optional)</label>
            <input
              type="text"
              value={field('calming_tools')}
              onChange={e => setField('calming_tools', e.target.value)}
              placeholder="e.g., blue blanket, deep breaths, fidget toy"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-calm-cream focus:outline-none"
            />
          </div>

          {/* Communication style */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Communication Style (optional)</label>
            <input
              type="text"
              value={field('communication_style')}
              onChange={e => setField('communication_style', e.target.value)}
              placeholder="e.g., prefers visual cues, short sentences"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-calm-cream focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Additional Notes (optional)</label>
            <textarea
              value={field('notes')}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Any other details that help personalise stories…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-calm-cream focus:outline-none min-h-[70px] resize-y"
            />
          </div>

          {/* Safety note */}
          <p className="text-xs text-amber-800/70 bg-amber-50/60 rounded-xl p-3 border border-amber-100 leading-relaxed">
            ⚠️ This information is stored in the app database and used only to personalise educational stories. It is not shared or used for clinical or diagnostic purposes.
          </p>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setIsEditing(false); if (profiles.length > 0) setActiveProfile(profiles[0]); }}
              className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-100 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-calm-cream text-calm-cream-dark font-bold py-3 rounded-xl hover:bg-calm-cream/80 transition text-sm flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-calm-cream-dark" />
              ) : (
                <><Save className="w-4 h-4" /> Save Profile</>
              )}
            </button>
          </div>
        </form>
      )}


    </div>
  );
};
