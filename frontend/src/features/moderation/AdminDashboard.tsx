import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  moderationService,
  type AdminMetrics,
  type AdminReport,
} from '../../services/moderationService';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const data = await moderationService.getAdminMetrics();
      setMetrics(data.metrics);
      setReports(data.recent_reports);
    } catch (err) {
      console.error('Failed to load admin metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: number, status: string) => {
    setActionLoading(reportId);
    try {
      await moderationService.updateReport(reportId, {
        status,
        admin_notes: `Processed by Administrator on ${new Date().toLocaleDateString()}`,
      });
      loadAdminData();
    } catch (err) {
      alert('Failed to update report status.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">Loading administrative telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" /> Platform Governance & Operations
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
          Admin Moderation & Analytics Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Supervise user safety, verify landlord credentials, and resolve trust & fraud reports.
        </p>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400">Total Users</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.total_users}
            </div>
            <span className="text-[11px] text-slate-500">
              {metrics.total_tenants} Tenants • {metrics.total_landlords} Landlords
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-semibold text-slate-400">Total Properties</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.total_properties}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {metrics.active_properties} Active Listings
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Pending Landlord Verifications</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">
              {metrics.pending_verifications}
            </div>
            <span className="text-[11px] text-amber-600">ID & Citizenship Review</span>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Pending Reports</span>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
              {metrics.pending_reports}
            </div>
            <span className="text-[11px] text-rose-600">Trust & Safety Queue</span>
          </div>
        </div>
      )}

      {/* Reports Queue */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" /> Moderation & Reports Queue
        </h3>

        {reports.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-sm text-slate-800 dark:text-white">Safety Queue Clean</p>
            <p className="text-xs text-slate-500">No unresolved reports on the platform.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((r) => (
              <div key={r.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                      {r.reason}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported on {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    "{r.details}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Reporter: {r.reporter?.email} • Status: <strong>{r.status}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {r.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                        disabled={actionLoading === r.id}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                        disabled={actionLoading === r.id}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        Take Action / Resolve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
