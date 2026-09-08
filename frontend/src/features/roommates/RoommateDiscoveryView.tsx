import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  Heart,
  Check,
  X,
  MessageSquare,
  MapPin,
  Moon,
  Sun,
  ShieldCheck,
  Filter,
  Loader2,
} from 'lucide-react';
import { roommateService, type RoommateCandidate, type RoommateMatchRecord } from '../../services/roommateService';

interface RoommateDiscoveryViewProps {
  onStartChat?: (userId: number) => void;
}

export const RoommateDiscoveryView: React.FC<RoommateDiscoveryViewProps> = ({ onStartChat }) => {
  const [candidates, setCandidates] = useState<RoommateCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DISCOVER' | 'CONNECTIONS'>('DISCOVER');

  // Filters
  const [lifestyle, setLifestyle] = useState('');
  const [cleanliness, setCleanliness] = useState('');
  const [sleep, setSleep] = useState('');
  const [pets, setPets] = useState<string>('');
  const [smoking, setSmoking] = useState<string>('');
  const [location, setLocation] = useState('');
  const [minScore, setMinScore] = useState(0);

  // Selected candidate for deep compatibility breakdown
  const [selectedBreakdown, setSelectedBreakdown] = useState<RoommateCandidate | null>(null);

  // Connections & requests state
  const [connectionsData, setConnectionsData] = useState<{
    connections: RoommateMatchRecord[];
    pending_received: RoommateMatchRecord[];
    pending_sent: RoommateMatchRecord[];
  }>({ connections: [], pending_received: [], pending_sent: [] });

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (activeTab === 'DISCOVER') {
      loadCandidates();
    } else {
      loadConnections();
    }
  }, [activeTab, lifestyle, cleanliness, sleep, pets, smoking, location, minScore]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await roommateService.discoverRoommates({
        lifestyle: lifestyle || undefined,
        cleanliness: cleanliness || undefined,
        sleep: sleep || undefined,
        pets: pets !== '' ? pets === 'true' : undefined,
        smoking: smoking !== '' ? smoking === 'true' : undefined,
        location: location || undefined,
        min_score: minScore > 0 ? minScore : undefined,
      });
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load roommate candidates', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async () => {
    setLoading(true);
    try {
      const data = await roommateService.getConnections();
      setConnectionsData(data);
    } catch (err) {
      console.error('Failed to load connections', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (candidateId: number) => {
    setActionLoading(candidateId);
    try {
      const res = await roommateService.sendRequest(candidateId);
      if (res.status === 'ACCEPTED') {
        alert("🎉 It's a Match! You both connected.");
      }
      loadCandidates();
    } catch (err) {
      alert('Could not send roommate request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRespond = async (matchId: number, status: 'ACCEPTED' | 'DECLINED') => {
    setActionLoading(matchId);
    try {
      await roommateService.respondToRequest(matchId, status);
      loadConnections();
    } catch (err) {
      alert('Failed to respond to request.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 md:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-4 text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Deterministic 10-Factor AI Harmony Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Discover Your Ideal Roommate in Kathmandu
          </h1>
          <p className="mt-3 text-indigo-100 text-sm md:text-base leading-relaxed">
            Match with verified flatmates based on sleep cycles, cleanliness habits, budget overlap, quiet hours, and shared Kathmandu Valley neighborhoods.
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setActiveTab('DISCOVER')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition shadow-sm ${
                activeTab === 'DISCOVER'
                  ? 'bg-white text-indigo-900'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Explore Matches ({candidates.length})
            </button>
            <button
              onClick={() => setActiveTab('CONNECTIONS')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition shadow-sm flex items-center gap-2 ${
                activeTab === 'CONNECTIONS'
                  ? 'bg-white text-indigo-900'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
              Connected Roommates ({connectionsData.connections.length})
              {connectionsData.pending_received.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                  {connectionsData.pending_received.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {activeTab === 'DISCOVER' && (
        <>
          {/* Filters Bar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filter by Lifestyle & Habits
              </span>
              {(lifestyle || cleanliness || sleep || pets !== '' || smoking !== '' || location || minScore > 0) && (
                <button
                  onClick={() => {
                    setLifestyle('');
                    setCleanliness('');
                    setSleep('');
                    setPets('');
                    setSmoking('');
                    setLocation('');
                    setMinScore(0);
                  }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Target Area</label>
                <input
                  type="text"
                  placeholder="e.g. Patan, Baneshwor"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Lifestyle</label>
                <select
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Any Lifestyle</option>
                  <option value="QUIET">Quiet & Studious</option>
                  <option value="SOCIAL">Social & Outgoing</option>
                  <option value="FLEXIBLE">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Cleanliness</label>
                <select
                  value={cleanliness}
                  onChange={(e) => setCleanliness(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Any Cleanliness</option>
                  <option value="VERY_CLEAN">Very Clean</option>
                  <option value="MODERATE">Moderately Clean</option>
                  <option value="RELAXED">Relaxed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Sleep Schedule</label>
                <select
                  value={sleep}
                  onChange={(e) => setSleep(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Any Schedule</option>
                  <option value="EARLY_BIRD">Early Bird</option>
                  <option value="NIGHT_OWL">Night Owl</option>
                  <option value="FLEXIBLE">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Pets Friendly</label>
                <select
                  value={pets}
                  onChange={(e) => setPets(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Any</option>
                  <option value="true">Pet-Friendly</option>
                  <option value="false">No Pets</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Min Match %</label>
                <select
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="0">All Match Scores</option>
                  <option value="60">60% & Above</option>
                  <option value="75">75% & Above</option>
                  <option value="85">85% & Above (High Match)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Roommate Cards Grid */}
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium text-slate-500">Calculating compatibility vectors...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-white">No Roommates Matching Criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Try loosening your filter parameters to discover more people looking for flats in Kathmandu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((c) => {
                const score = c.compatibility?.score || 50;
                const scoreColor =
                  score >= 85
                    ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : score >= 70
                    ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                    : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';

                const isConnected = c.connection_status === 'CONNECTED';
                const isSent = c.connection_status?.startsWith('SENT');

                return (
                  <div
                    key={c.id}
                    className="relative group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Top gradient highlight */}
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      {/* Avatar & Score Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {c.avatar ? (
                              <img
                                src={c.avatar}
                                alt={c.full_name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 dark:border-slate-800"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                                {c.first_name?.[0] || 'U'}
                              </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 p-0.5 bg-white dark:bg-slate-900 rounded-full">
                              <ShieldCheck className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                            </div>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                              {c.full_name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate max-w-[140px]">
                              {c.tenant_profile?.occupation_status || 'Professional'}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {c.tenant_profile?.university_or_company || 'Kathmandu'}
                            </p>
                          </div>
                        </div>

                        {/* Compatibility Pill */}
                        <div className={`px-3 py-1.5 rounded-2xl border text-center shadow-xs ${scoreColor}`}>
                          <div className="text-base font-black leading-none">{score}%</div>
                          <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Match</div>
                        </div>
                      </div>

                      {/* Bio snippet */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic leading-relaxed">
                        "{c.tenant_profile?.bio || 'Looking for a tidy, peaceful flatmate in Kathmandu.'}"
                      </p>

                      {/* Lifestyle tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          {c.tenant_profile?.sleep_schedule === 'EARLY_BIRD' ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                          {c.tenant_profile?.sleep_schedule?.replace('_', ' ') || 'Flexible'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {c.tenant_profile?.cleanliness_level?.replace('_', ' ') || 'Clean'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {c.tenant_profile?.lifestyle_type || 'Balanced'}
                        </span>
                      </div>

                      {/* Preferred Locations */}
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">
                          {(c.tenant_profile?.preferred_locations || []).join(', ') || 'Kathmandu Valley'}
                        </span>
                      </div>

                      {/* Budget */}
                      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400">Budget Range</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          NPR {Number(c.tenant_profile?.min_budget || 10000).toLocaleString()} - {Number(c.tenant_profile?.max_budget || 25000).toLocaleString()}/mo
                        </span>
                      </div>

                      {/* Breakdown Trigger & Action */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBreakdown(c)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold transition text-center"
                        >
                          View 10 Factors
                        </button>

                        {isConnected ? (
                          <button
                            onClick={() => onStartChat?.(c.id)}
                            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> Message
                          </button>
                        ) : isSent ? (
                          <button
                            disabled
                            className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed"
                          >
                            Requested
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConnect(c.id)}
                            disabled={actionLoading === c.id}
                            className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
                          >
                            {actionLoading === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5" />}
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Connections Tab */}
      {activeTab === 'CONNECTIONS' && (
        <div className="space-y-6">
          {/* Pending Received Requests */}
          {connectionsData.pending_received.length > 0 && (
            <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-4">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" /> Incoming Roommate Requests ({connectionsData.pending_received.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectionsData.pending_received.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.requester?.full_name}</h4>
                      <p className="text-xs text-slate-500">{req.requester?.email}</p>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {req.compatibility_score}% Harmony Match
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(req.id, 'DECLINED')}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, 'ACCEPTED')}
                        className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connected Roommates */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mutual Connections</h3>
            {connectionsData.connections.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
                <Heart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No mutual connections yet</p>
                <p className="text-xs text-slate-500 mt-1">When you and another flatmate both connect, they appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connectionsData.connections.map((conn) => (
                  <div key={conn.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">{conn.target_user?.full_name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        {conn.compatibility_score}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{conn.target_user?.email}</p>
                    <button
                      onClick={() => onStartChat?.(conn.target_user?.id)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Open Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10-Factor Compatibility Modal */}
      {selectedBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Compatibility Matrix with {selectedBreakdown.full_name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBreakdown.compatibility?.score}% Harmony Score • {selectedBreakdown.compatibility?.summary}
                </p>
              </div>
              <button
                onClick={() => setSelectedBreakdown(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {Object.entries(selectedBreakdown.compatibility?.breakdown || {}).map(([key, item]: any) => (
                <div
                  key={key}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</span>
                      {item.is_synergy && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold text-[10px]">
                          High Synergy
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {item.score} / {item.max}
                    </span>
                    <span className="text-[10px] text-slate-400 block">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
