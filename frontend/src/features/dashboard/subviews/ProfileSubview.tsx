import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Edit3,
  CheckCircle2,
  Save,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const ProfileSubview: React.FC = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile data
  const [fullName, setFullName] = useState(user?.full_name || 'Subekshya Karki');
  const [bio, setBio] = useState(
    'Software engineer looking for a peaceful, clean 2BHK flat or private room in Kathmandu or Lalitpur with reliable Wi-Fi and 24h water supply.'
  );
  const [occupation, setOccupation] = useState('Full-time Software Engineer');
  const [budget, setBudget] = useState('Rs. 15,000 - 30,000 / month');
  const [targetMoveIn, setTargetMoveIn] = useState('October 2026');
  const [preferredAreas, setPreferredAreas] = useState('New Baneshwor, Sanepa, Jhamsikhel, Maitighar');

  const lifestyleBadges = [
    { label: 'Non-Smoker', icon: '🚭' },
    { label: 'Early Riser (6 AM)', icon: '🌅' },
    { label: 'Pet Friendly', icon: '🐾' },
    { label: 'Clean & Organized', icon: '✨' },
    { label: 'Working Professional', icon: '💼' },
    { label: 'Quiet Evenings', icon: '🌙' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="tenant-subview-wrapper">
      <div className="tenant-subview-header">
        <div>
          <h2 className="tenant-subview-title">
            <UserIcon className="w-6 h-6 text-blue-600" />
            <span>Tenant Profile</span>
          </h2>
          <p className="tenant-subview-subtitle">
            Your public tenant profile visible to landlords and potential roommate matches
          </p>
        </div>

        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
        >
          {isEditing ? (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile changes saved and updated successfully!</span>
        </div>
      )}

      {/* Main Profile Layout */}
      <div className="tenant-content-card p-0 overflow-hidden">
        {/* Banner Hero */}
        <div className="profile-banner-hero">
          <div className="profile-avatar-wrap">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Subekshya Karki"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="pt-14 px-6 pb-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input text-base font-bold py-1 px-2.5 max-w-xs"
                  />
                ) : (
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {fullName}
                  </h3>
                )}
                <span className="profile-badge-pill">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Verified Tenant</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Kathmandu, Nepal</span>
                <span>•</span>
                <span>Member since Jan 2026</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>ID & Background Verified</span>
              </span>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              About Me
            </h4>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="form-input text-xs"
              />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {bio}
              </p>
            )}
          </div>

          {/* Details & Preferences Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>Occupation</span>
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="form-input text-xs"
                />
              ) : (
                <span className="font-bold text-slate-900 dark:text-white">{occupation}</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Target Monthly Budget</span>
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="form-input text-xs"
                />
              ) : (
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{budget}</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
              <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>Target Move-in</span>
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={targetMoveIn}
                  onChange={(e) => setTargetMoveIn(e.target.value)}
                  className="form-input text-xs"
                />
              ) : (
                <span className="font-bold text-slate-900 dark:text-white">{targetMoveIn}</span>
              )}
            </div>
          </div>

          {/* Preferred Locations */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Preferred Hubs in Kathmandu Valley
            </h4>
            {isEditing ? (
              <input
                type="text"
                value={preferredAreas}
                onChange={(e) => setPreferredAreas(e.target.value)}
                className="form-input text-xs"
                placeholder="Comma-separated areas (e.g. New Baneshwor, Sanepa)"
              />
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {preferredAreas.split(',').map((area) => (
                  <span
                    key={area.trim()}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-100 dark:border-blue-900/40 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{area.trim()}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Lifestyle Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Lifestyle & Habits
            </h4>
            <div className="flex items-center gap-2.5 flex-wrap">
              {lifestyleBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm"
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
