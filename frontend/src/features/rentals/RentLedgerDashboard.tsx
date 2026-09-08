import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  Download,
  ShieldCheck,
  Building2,
  Loader2,
  X,
} from 'lucide-react';
import { rentalService, type Lease, type RentPayment } from '../../services/rentalService';

export const RentLedgerDashboard: React.FC = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated Payment Modal state
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'ESEWA' | 'KHALTI' | 'BANK_TRANSFER'>('ESEWA');
  const [paying, setPaying] = useState(false);

  // Receipt popup state
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  useEffect(() => {
    loadLeases();
  }, []);

  const loadLeases = async () => {
    setLoading(true);
    try {
      const data = await rentalService.getLeases();
      setLeases(data);
    } catch (err) {
      console.error('Failed to load leases', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async () => {
    if (!selectedPayment) return;
    setPaying(true);
    try {
      const res = await rentalService.simulatePayment(selectedPayment.id, {
        payment_method: paymentMethod,
        notes: `Simulated ${paymentMethod} payment via RoomMateHub`,
      });
      setActiveReceipt(res.receipt);
      setSelectedPayment(null);
      loadLeases();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to process rent payment.');
    } finally {
      setPaying(false);
    }
  };

  const activeLease = leases.find((l) => l.status === 'ACTIVE') || leases[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            Tenancy & Rent Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track active lease agreements, upcoming rent schedules, and instant digital payments.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500">Loading tenancy ledger...</p>
        </div>
      ) : !activeLease ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-white">No Active Lease Found</h3>
          <p className="text-xs text-slate-500 mt-1">Once a landlord approves your tenancy application, your lease will appear here.</p>
        </div>
      ) : (
        <>
          {/* Active Tenancy & Countdown Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lease Overview */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    Active Tenancy
                  </span>
                  <span className="text-xs text-slate-400">
                    {activeLease.start_date} to {activeLease.end_date}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-3">
                  {activeLease.property_details?.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeLease.property_details?.area}, {activeLease.property_details?.city} • {activeLease.room_number || 'Entire Flat'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Monthly Rent</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    NPR {Number(activeLease.monthly_rent).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Security Deposit</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    NPR {Number(activeLease.security_deposit).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Landlord</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                    {activeLease.landlord?.full_name}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">{activeLease.landlord?.email}</span>
                </div>
              </div>
            </div>

            {/* Next Due Rent & Pay Action Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 block">
                  Upcoming Rent Schedule
                </span>

                {activeLease.next_payment ? (
                  <div className="mt-4">
                    <div className="text-3xl font-black">
                      NPR {Number(activeLease.next_payment.amount).toLocaleString()}
                    </div>
                    <p className="text-xs text-indigo-100 mt-1">For {activeLease.next_payment.month_for}</p>

                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      Due in {activeLease.next_payment.days_left} days ({activeLease.next_payment.due_date})
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center py-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                    <p className="font-bold text-sm">All Rent Up to Date!</p>
                    <p className="text-xs text-indigo-200">No pending dues for this period.</p>
                  </div>
                )}
              </div>

              {activeLease.next_payment && (
                <button
                  onClick={() => {
                    const paymentObj = activeLease.payments.find((p) => p.id === activeLease.next_payment?.id);
                    if (paymentObj) setSelectedPayment(paymentObj);
                  }}
                  className="w-full py-3 bg-white hover:bg-slate-50 text-indigo-900 font-extrabold rounded-2xl shadow-lg transition text-sm flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" /> Pay Rent Digitally
                </button>
              )}
            </div>
          </div>

          {/* Payment History Ledger Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" /> Rent Payment Ledger
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase font-bold text-slate-400">
                    <th className="pb-3">Month</th>
                    <th className="pb-3">Due Date</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Method / Txn</th>
                    <th className="pb-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activeLease.payments.map((p) => (
                    <tr key={p.id} className="text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3.5 font-bold text-slate-900 dark:text-white">{p.month_for}</td>
                      <td className="py-3.5 text-slate-500">{p.due_date}</td>
                      <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                        NPR {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            p.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : p.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {p.transaction_reference ? (
                          <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {p.transaction_reference}
                          </span>
                        ) : (
                          'Pending Payment'
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        {p.status === 'PAID' ? (
                          <button
                            onClick={() =>
                              setActiveReceipt({
                                receipt_number: p.receipt_number || `RCPT-2026-${p.id}`,
                                transaction_reference: p.transaction_reference,
                                paid_amount: p.amount,
                                paid_date: p.paid_date,
                                property: activeLease.property_details?.title,
                                landlord: activeLease.landlord?.full_name,
                                tenant: activeLease.tenant?.full_name,
                              })
                            }
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            <Download className="w-3.5 h-3.5" /> View Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedPayment(p)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Payment Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pay Rent Digitally</h3>
                <p className="text-xs text-slate-500">{selectedPayment.month_for} • NPR {Number(selectedPayment.amount).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Gateway (Nepal)</label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ESEWA')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'ESEWA'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">e</div>
                  <span className="text-xs">eSewa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('KHALTI')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'KHALTI'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">K</div>
                  <span className="text-xs">Khalti</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">IPS</div>
                  <span className="text-xs">ConnectIPS</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Monthly Rent:</span>
                <strong>NPR {Number(selectedPayment.amount).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>Service Fee (RoomMateHub):</span>
                <span className="text-emerald-600 font-bold">NPR 0 (Free)</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                <span>Total Payable:</span>
                <span>NPR {Number(selectedPayment.amount).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePayRent}
              disabled={paying}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 transition text-sm flex items-center justify-center gap-2"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Authorize & Pay via {paymentMethod}
            </button>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Payment Receipt</h3>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Receipt No:</span>
                <strong>{activeReceipt.receipt_number}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <strong>{activeReceipt.transaction_reference}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">NPR {Number(activeReceipt.paid_amount).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Property:</span>
                <strong className="truncate max-w-[180px]">{activeReceipt.property}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Landlord:</span>
                <strong>{activeReceipt.landlord}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tenant:</span>
                <strong>{activeReceipt.tenant}</strong>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Print / Save PDF Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
