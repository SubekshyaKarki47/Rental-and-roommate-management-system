import React, { useState, useEffect } from 'react';
import { X, Building2, Loader2 } from 'lucide-react';
import { applicationService, type RentalApplication } from '../../services/applicationService';

interface ApplicationsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const ApplicationsManagerModal: React.FC<ApplicationsManagerModalProps> = ({
  isOpen,
  onClose,
  userRole = 'TENANT',
}) => {
  const [applications, setApplications] = useState<RentalApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [notesPrompt, setNotesPrompt] = useState<{ id: number; action: 'APPROVED' | 'REJECTED'; notes: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, filter]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplications(filter !== 'ALL' ? { status: filter } : undefined);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id: number) => {
    if (!window.confirm('Are you sure you want to withdraw this rental application?')) return;
    setActionLoading(id);
    try {
      await applicationService.withdrawApplication(id);
      loadApplications();
    } catch (err) {
      alert('Could not withdraw application.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (id: number, status: 'APPROVED' | 'REJECTED', notes: string) => {
    setActionLoading(id);
    try {
      await applicationService.updateStatus(id, { status, landlord_notes: notes });
      setNotesPrompt(null);
      loadApplications();
    } catch (err) {
      alert('Failed to update application status.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {userRole === 'LANDLORD' ? 'Tenant Applications' : 'My Rental Applications'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userRole === 'LANDLORD' ? 'Screen applicants, verify financial standings, and approve leases' : 'Track the status of your submitted tenancy requests'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-6 py-3 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-sm">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No applications found</p>
              <p className="text-xs text-slate-500">Applications submitted or received will show up here.</p>
            </div>
          ) : (
            applications.map((app) => {
              const statusColors = {
                PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-300',
                APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-300',
                REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-300',
                WITHDRAWN: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-300',
              };

              return (
                <div
                  key={app.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                        {app.property_details?.title || `Property #${app.property}`}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {app.property_details?.area}, {app.property_details?.city} • NPR {app.property_details?.monthly_rent?.toLocaleString()}/mo
                      </p>
                    </div>

                    {userRole === 'LANDLORD' && (
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Applicant</p>
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{app.tenant?.full_name}</p>
                        <p className="text-xs text-slate-400">{app.tenant?.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Financial & Move-in Highlights */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                    <div>
                      <span className="text-slate-400 block">Move-in Date</span>
                      <strong className="text-slate-800 dark:text-slate-200">{app.move_in_date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Monthly Income</span>
                      <strong className="text-slate-800 dark:text-slate-200">NPR {Number(app.monthly_income).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Employment</span>
                      <strong className="text-slate-800 dark:text-slate-200">{app.employment_status}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Credit Profile</span>
                      <strong className="text-slate-800 dark:text-slate-200">{app.credit_score_range}</strong>
                    </div>
                  </div>

                  {app.message && (
                    <p className="text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg text-slate-600 dark:text-slate-300 italic">
                      "{app.message}"
                    </p>
                  )}

                  {app.landlord_notes && (
                    <div className="text-xs bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                      <strong>Landlord Remarks:</strong> {app.landlord_notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {userRole === 'TENANT' && app.status === 'PENDING' && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        disabled={actionLoading === app.id}
                        className="px-4 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                      >
                        {actionLoading === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                      </button>
                    )}

                    {userRole === 'LANDLORD' && app.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNotesPrompt({ id: app.id, action: 'REJECTED', notes: '' })}
                          disabled={actionLoading === app.id}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition border border-rose-200 dark:border-rose-900"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setNotesPrompt({ id: app.id, action: 'APPROVED', notes: 'Application approved.' })}
                          disabled={actionLoading === app.id}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
                        >
                          Approve Tenant
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Note Prompt Modal for Landlord */}
        {notesPrompt && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-2xl space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {notesPrompt.action === 'APPROVED' ? 'Approve Application' : 'Reject Application'}
              </h4>
              <p className="text-xs text-slate-500">Provide optional remarks to the tenant:</p>
              <textarea
                rows={2}
                value={notesPrompt.notes}
                onChange={(e) => setNotesPrompt({ ...notesPrompt, notes: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                placeholder="Remarks..."
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setNotesPrompt(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(notesPrompt.id, notesPrompt.action, notesPrompt.notes)}
                  className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg ${
                    notesPrompt.action === 'APPROVED' ? 'bg-emerald-600' : 'bg-rose-600'
                  }`}
                >
                  Confirm {notesPrompt.action}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
