import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import { Sparkles, MapPin, DollarSign, Bed, Compass, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

const POPULAR_LOCATIONS = [
  'Baneshwor', 'Jhamsikhel', 'Patan', 'Koteshwor', 'Kupondole',
  'Maitighar', 'Thamel', 'Baluwatar', 'Lazimpat', 'Bhaktapur', 'Sanepa'
];

export const TenantOnboardingModal: React.FC = () => {
  const { showOnboardingModal, setShowOnboardingModal, refreshUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [minBudget, setMinBudget] = useState(12000);
  const [maxBudget, setMaxBudget] = useState(25000);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['Baneshwor', 'Jhamsikhel']);
  const [occupationStatus, setOccupationStatus] = useState('Student');
  const [universityOrCompany, setUniversityOrCompany] = useState('');
  const [bedroomsPreferred, setBedroomsPreferred] = useState(2);
  const [furnishingPreference, setFurnishingPreference] = useState('FURNISHED');
  const [lifestyleType, setLifestyleType] = useState('QUIET');
  const [cleanlinessLevel, setCleanlinessLevel] = useState('VERY_CLEAN');
  const [sleepSchedule, setSleepSchedule] = useState('EARLY_BIRD');
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingPreference, setSmokingPreference] = useState(false);
  const [bio, setBio] = useState('');

  if (!showOnboardingModal) return null;

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await authService.submitOnboarding({
        min_budget: minBudget,
        max_budget: maxBudget,
        preferred_locations: selectedLocations,
        occupation_status: occupationStatus,
        university_or_company: universityOrCompany,
        bedrooms_preferred: bedroomsPreferred,
        furnishing_preference: furnishingPreference,
        lifestyle_type: lifestyleType,
        cleanliness_level: cleanlinessLevel,
        sleep_schedule: sleepSchedule,
        pets_allowed: petsAllowed,
        smoking_preference: smokingPreference,
        bio,
      });
      await refreshUser();
      setShowOnboardingModal(false);
    } catch (err) {
      console.error('Failed to save onboarding preferences', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Top Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-brand-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <Sparkles className="w-4 h-4" />
              <span>Personalized Matching Profile • Step {step} of 3</span>
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
              {step === 1 && 'Your Budget & Preferred Areas'}
              {step === 2 && 'Living Space & Comfort Preferences'}
              {step === 3 && 'Lifestyle & Roommate Habits'}
            </h2>
          </div>
          <button
            onClick={() => setShowOnboardingModal(false)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
          >
            Skip for now
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6">
              {/* Budget Slider/Inputs */}
              <div>
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Monthly Budget Range (NPR)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Min (Rs.)</span>
                    <input
                      type="number"
                      step="1000"
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Max (Rs.)</span>
                    <input
                      type="number"
                      step="1000"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Target: <strong className="text-brand-600 dark:text-brand-400">Rs. {minBudget.toLocaleString()} – Rs. {maxBudget.toLocaleString()}</strong>/month
                </div>
              </div>

              {/* Preferred Areas */}
              <div>
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-brand-500" />
                  Preferred Neighborhoods in Kathmandu Valley
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = selectedLocations.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleLocation(loc)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {loc} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Occupation / Institution */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Occupation Status</label>
                  <select
                    value={occupationStatus}
                    onChange={(e) => setOccupationStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Student">Student</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Remote Worker / Freelancer">Remote Worker / Freelancer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">University or Company</label>
                  <input
                    type="text"
                    value={universityOrCompany}
                    onChange={(e) => setUniversityOrCompany(e.target.value)}
                    placeholder="e.g. Pulchowk / Leapfrog"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                  <Bed className="w-4 h-4 text-brand-500" />
                  Bedrooms Preferred
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBedroomsPreferred(num)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        bedroomsPreferred === num
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 block">
                  Furnishing Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'FURNISHED', label: 'Furnished' },
                    { id: 'SEMI_FURNISHED', label: 'Semi-Furnished' },
                    { id: 'UNFURNISHED', label: 'Unfurnished' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFurnishingPreference(item.id)}
                      className={`p-3 rounded-xl border text-center transition ${
                        furnishingPreference === item.id
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio snippet */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Short Bio for Roommate Profiles
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Introduce yourself! Share your daily routine, hobbies, or what kind of flatmate you get along with..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4 text-purple-500" />
                  Lifestyle Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'QUIET', label: 'Quiet', desc: 'Study-focused & calm' },
                    { id: 'SOCIAL', label: 'Social', desc: 'Friendly & outgoing' },
                    { id: 'FLEXIBLE', label: 'Flexible', desc: 'Adaptable balance' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLifestyleType(item.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        lifestyleType === item.id
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Cleanliness</label>
                  <select
                    value={cleanlinessLevel}
                    onChange={(e) => setCleanlinessLevel(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="VERY_CLEAN">Very Clean</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="RELAXED">Relaxed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Sleep Schedule</label>
                  <select
                    value={sleepSchedule}
                    onChange={(e) => setSleepSchedule(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="EARLY_BIRD">Early Bird (before 11 PM)</option>
                    <option value="NIGHT_OWL">Night Owl (after 12 AM)</option>
                    <option value="FLEXIBLE">Flexible Schedule</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={petsAllowed}
                    onChange={(e) => setPetsAllowed(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Pet Friendly</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={smokingPreference}
                    onChange={(e) => setSmokingPreference(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Smoking Allowed</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-600/20 flex items-center gap-2 transition"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save & Complete Onboarding
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
