import React, { useState, useEffect } from 'react';
import {
  Wrench,
  CheckCircle,
  PlusCircle,
  Loader2,
  X,
  Zap,
  Droplets,
  Flame,
} from 'lucide-react';
import {
  maintenanceService,
  type MaintenanceTicket,
} from '../../services/maintenanceService';

export const MaintenanceDashboard: React.FC<{ userRole?: string }> = ({ userRole: _userRole = 'TENANT' }) => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [stats, setStats] = useState({ total: 0, submitted: 0, in_progress: 0, resolved: 0, emergency: 0 });
  const [loading, setLoading] = useState(true);

  // Detail / Discussion modal
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  // New Ticket Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('PLUMBING');
  const [priority, setPriority] = useState('MEDIUM');
  const [creating, setCreating] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [tData, sData] = await Promise.allSettled([
        maintenanceService.getTickets(),
        maintenanceService.getStats(),
      ]);
      const rawTickets = tData.status === 'fulfilled' ? tData.value : [];
      const ticketList: MaintenanceTicket[] = Array.isArray(rawTickets)
        ? rawTickets
        : Array.isArray((rawTickets as any)?.results)
        ? (rawTickets as any).results
        : [];
      setTickets(ticketList);

      if (sData.status === 'fulfilled' && sData.value && typeof sData.value.total === 'number') {
        setStats(sData.value);
      } else {
        setStats({
          total: ticketList.length,
          submitted: ticketList.filter((t) => t.status === 'SUBMITTED' || (t.status as string) === 'OPEN').length,
          in_progress: ticketList.filter((t) => t.status === 'IN_PROGRESS').length,
          resolved: ticketList.filter((t) => t.status === 'RESOLVED').length,
          emergency: ticketList.filter((t) => t.priority === 'EMERGENCY').length,
        });
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setCreating(true);
    try {
      await maintenanceService.createTicket({
        property: 1, // sample active property
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      await loadTickets();
    } catch (err) {
      console.error('Failed to create ticket', err);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      const updated = await maintenanceService.updateTicketStatus(selectedTicket.id, {
        status: newStatus,
        resolution_notes: newStatus === 'RESOLVED' ? 'Issue repaired by certified technician.' : undefined,
      });
      setSelectedTicket(updated);
      await loadTickets();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newComment.trim() || commenting) return;

    setCommenting(true);
    try {
      const commentObj = await maintenanceService.addComment(selectedTicket.id, newComment.trim());
      setSelectedTicket({
        ...selectedTicket,
        comments: [...selectedTicket.comments, commentObj],
      });
      setNewComment('');
    } catch (err) {
      alert('Failed to add comment.');
    } finally {
      setCommenting(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'PLUMBING':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'ELECTRICAL':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'APPLIANCE':
        return <Flame className="w-4 h-4 text-orange-500" />;
      default:
        return <Wrench className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            Maintenance & Repairs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Report maintenance issues, track technician visits, and converse directly with landlords.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Log Maintenance Ticket
        </button>
      </div>

      {/* KPI Stats */}
      {(() => {
        const safeTickets = Array.isArray(tickets) ? tickets : [];
        const filteredTickets = safeTickets.filter((t) => {
          if (filter === 'active') return t.status !== 'RESOLVED';
          if (filter === 'resolved') return t.status === 'RESOLVED';
          return true;
        });

        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-xs font-semibold text-slate-400">Total Logged</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {stats.total || safeTickets.length}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">In Progress</span>
                <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{stats.in_progress}</div>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Resolved</span>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.resolved}</div>
              </div>
              <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Emergency</span>
                <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">{stats.emergency}</div>
              </div>
            </div>

            {/* Tickets List */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Active & Past Tickets</h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      filter === 'all'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    All ({safeTickets.length})
                  </button>
                  <button
                    onClick={() => setFilter('active')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      filter === 'active'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Active ({safeTickets.filter((t) => t.status !== 'RESOLVED').length})
                  </button>
                  <button
                    onClick={() => setFilter('resolved')}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      filter === 'resolved'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Resolved ({safeTickets.filter((t) => t.status === 'RESOLVED').length})
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                  <p className="text-xs">Loading maintenance tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CheckCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm">
                    {filter === 'active' ? 'All active repairs resolved!' : 'No maintenance issues reported'}
                  </p>
                  <p className="text-xs">Everything in the tenancy is running smoothly.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
                          {getCategoryIcon(t.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.title}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                t.priority === 'EMERGENCY'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                  : t.priority === 'HIGH'
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {t.property_details?.title || 'Rental Unit'} • Reported by {t.tenant?.full_name || 'Tenant'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-xs ${
                            t.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {t.status}
                        </span>
                        <span className="text-xs text-indigo-600 font-semibold hidden sm:inline">View Thread →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* Ticket Details & Discussion Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                    #{selectedTicket.id} {selectedTicket.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{selectedTicket.priority} Priority</span>
                </div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mt-1">{selectedTicket.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged on {new Date(selectedTicket.created_at).toLocaleDateString()} by {selectedTicket.tenant?.full_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Description box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {selectedTicket.description}
              </div>

              {/* Resolution Notes if any */}
              {selectedTicket.resolution_notes && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300">
                  <strong>Resolution Update:</strong> {selectedTicket.resolution_notes}
                </div>
              )}

              {/* Status Update for Landlords */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Current Status: {selectedTicket.status}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-bold"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('RESOLVED')}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              {/* Discussion Comments Thread */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Technician & Landlord Updates</h4>
                {selectedTicket.comments?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes posted yet.</p>
                ) : (
                  selectedTicket.comments?.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                        <span>{c.user?.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Comment Input */}
            <form onSubmit={handleAddComment} className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post update or instructions..."
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || commenting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Log Maintenance Issue</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser tripping circuit breaker"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="PLUMBING">Plumbing & Water</option>
                    <option value="ELECTRICAL">Electrical & Wiring</option>
                    <option value="APPLIANCE">Appliances</option>
                    <option value="STRUCTURAL">Doors / Locks</option>
                    <option value="INTERNET">WiFi / Router</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium (Normal)</option>
                    <option value="HIGH">High (Urgent)</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description & Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe location of problem, timing, and symptoms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
