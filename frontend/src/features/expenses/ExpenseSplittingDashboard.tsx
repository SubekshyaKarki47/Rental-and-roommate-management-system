import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Wifi,
  Zap,
  ShoppingBag,
  Home,
  CheckCircle2,
  Users,
  Loader2,
  X,
  Trash2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import {
  expenseService,
  type Expense,
  type SimplifiedDebt,
} from '../../services/expenseService';
import { roommateService } from '../../services/roommateService';
import { useAuth } from '../../context/AuthContext';

interface RoommateOption {
  id: number;
  name: string;
  email: string;
  isConnected?: boolean;
}

export const ExpenseSplittingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<{
    total_spent: number;
    you_owe: number;
    others_owe_you: number;
    net_balance: number;
    simplified_settlements: SimplifiedDebt[];
  }>({
    total_spent: 0,
    you_owe: 0,
    others_owe_you: 0,
    net_balance: 0,
    simplified_settlements: [],
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState('GROCERIES');
  const [savingExpense, setSavingExpense] = useState(false);

  // Dynamic Roommate Participants
  const [availableRoommates, setAvailableRoommates] = useState<RoommateOption[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([]);
  const [loadingRoommates, setLoadingRoommates] = useState(false);
  const [roommateSearch, setRoommateSearch] = useState('');

  // Settle Up Modal
  const [settleDebt, setSettleDebt] = useState<SimplifiedDebt | null>(null);
  const [settling, setSettling] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'ESEWA' | 'KHALTI' | 'CASH' | 'BANK'>('ESEWA');
  const [settlingParticipantId, setSettlingParticipantId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
    loadRoommates();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, statsData] = await Promise.all([
        expenseService.getExpenses(),
        expenseService.getDashboardStats(),
      ]);
      setExpenses(expData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoommates = async () => {
    setLoadingRoommates(true);
    try {
      const candidateMap = new Map<number, RoommateOption>();

      // 1. Try to load confirmed connections first
      try {
        const connData = await roommateService.getConnections();
        if (connData?.connections) {
          for (const conn of connData.connections) {
            const other = conn.requester?.id === user?.id ? conn.target_user : conn.requester;
            if (other && other.id && other.id !== user?.id) {
              candidateMap.set(other.id, {
                id: other.id,
                name: other.full_name || other.email || `Roommate #${other.id}`,
                email: other.email || '',
                isConnected: true,
              });
            }
          }
        }
      } catch (e) {
        // connections endpoint might not have matches yet
      }

      // 2. Discover other platform tenants/flatmates
      try {
        const discoverData = await roommateService.discoverRoommates();
        if (Array.isArray(discoverData)) {
          for (const cand of discoverData) {
            const isSelf =
              cand.id === user?.id ||
              (user?.email && cand.email?.toLowerCase() === user.email.toLowerCase()) ||
              (user?.full_name && cand.full_name?.toLowerCase().trim() === user.full_name.toLowerCase().trim());

            if (!isSelf && !candidateMap.has(cand.id)) {
              candidateMap.set(cand.id, {
                id: cand.id,
                name: cand.full_name || cand.email || `Tenant #${cand.id}`,
                email: cand.email || '',
                isConnected: cand.connection_status === 'CONNECTED',
              });
            }
          }
        }
      } catch (e) {
        console.warn('Could not load discoverable roommates', e);
      }

      setAvailableRoommates(Array.from(candidateMap.values()));
    } catch (err) {
      console.error('Failed to load available roommates', err);
    } finally {
      setLoadingRoommates(false);
    }
  };

  const handleDeleteExpense = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await expenseService.deleteExpense(id);
      await loadData();
    } catch (err: any) {
      console.error('Failed to delete expense', err);
      alert(err.response?.data?.detail || 'Failed to delete expense.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || Number(newAmount) <= 0) return;

    if (selectedParticipantIds.length === 0) {
      alert('Please select at least one roommate to split this expense with.');
      return;
    }

    setSavingExpense(true);
    try {
      // The current logged-in user + selected roommates
      const participant_ids = user?.id
        ? [user.id, ...selectedParticipantIds]
        : selectedParticipantIds;

      await expenseService.createExpense({
        title: newTitle.trim(),
        total_amount: Number(newAmount),
        category: newCategory,
        split_type: 'EQUAL',
        participant_ids,
      });

      setShowAddModal(false);
      setNewTitle('');
      setNewAmount('');
      setSelectedParticipantIds([]);
      setRoommateSearch('');
      await loadData();
    } catch (err: any) {
      console.error('Failed to save expense', err);
      alert(err.response?.data?.detail || 'Failed to save expense.');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleSettleUp = async () => {
    if (!settleDebt) return;
    setSettling(true);
    try {
      // Send both payer (debtor) and receiver (creditor) so backend marks the exact split obligation as settled
      await expenseService.settleUp({
        payer: settleDebt.from_user_id,
        receiver: settleDebt.to_user_id,
        amount: settleDebt.amount,
        method: paymentMethod,
        notes: `Settled NPR ${settleDebt.amount} between ${settleDebt.from_user_name} and ${settleDebt.to_user_name}`,
      });
      setSettleDebt(null);
      await loadData();
    } catch (err: any) {
      console.error('Failed to settle balance', err);
      alert(err.response?.data?.detail || 'Failed to settle balance.');
    } finally {
      setSettling(false);
    }
  };

  const handleSettleParticipantDirectly = async (participantId: number, name: string, shareAmount: number) => {
    if (!window.confirm(`Mark NPR ${Number(shareAmount).toLocaleString()} for ${name} as settled?`)) {
      return;
    }
    setSettlingParticipantId(participantId);
    try {
      await expenseService.settleParticipant(participantId);
      await loadData();
    } catch (err: any) {
      console.error('Failed to mark share as settled', err);
      alert(err.response?.data?.detail || 'Failed to mark share as settled.');
    } finally {
      setSettlingParticipantId(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'INTERNET':
        return <Wifi className="w-4 h-4 text-indigo-500" />;
      case 'UTILITIES':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'GROCERIES':
        return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
      case 'HOUSEHOLD':
        return <Home className="w-4 h-4 text-blue-500" />;
      default:
        return <Receipt className="w-4 h-4 text-purple-500" />;
    }
  };

  const filteredRoommates = availableRoommates.filter((rm) => {
    // Current user is always the payer and never in the split-with list
    if (user?.id && rm.id === user.id) return false;
    if (user?.email && rm.email && rm.email.toLowerCase() === user.email.toLowerCase()) return false;
    if (user?.full_name && rm.name && rm.name.toLowerCase().trim() === user.full_name.toLowerCase().trim()) return false;
    if (!roommateSearch) return true;
    const q = roommateSearch.toLowerCase();
    return rm.name.toLowerCase().includes(q) || rm.email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
            Shared Household Expenses
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Split bills penny-perfect, track shared groceries & WiFi, and settle balances seamlessly.
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            if (availableRoommates.length === 0) {
              loadRoommates();
            }
          }}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Add Shared Expense
        </button>
      </div>

      {/* Fintech KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Household Spent</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            NPR {stats.total_spent.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> You Owe
          </span>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-400">
            NPR {stats.you_owe.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Others Owe You
          </span>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
            NPR {stats.others_owe_you.toLocaleString()}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-400">Net Standing</span>
          <div
            className={`text-2xl font-black ${
              stats.net_balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {stats.net_balance >= 0 ? '+' : ''}NPR {stats.net_balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Simplified Debts Matrix */}
      {stats.simplified_settlements.length > 0 && (
        <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Minimal Debt Settlement Path
            </h3>
            <span className="text-[11px] text-indigo-500 font-medium">Simplified transactions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.simplified_settlements.map((tx, idx) => {
              const isReceiver = tx.is_current_user_receiver;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 flex items-center justify-between shadow-xs"
                >
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-white">{tx.from_user_name}</strong> owes{' '}
                      <strong className="text-slate-900 dark:text-white">{tx.to_user_name}</strong>
                    </p>
                    <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                      NPR {Number(tx.amount).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSettleDebt(tx);
                      setPaymentMethod('ESEWA');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                  >
                    {isReceiver ? 'Mark Received' : 'Settle Up'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Shared Bills</h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-xs">Loading shared expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm">No shared expenses logged yet</p>
            <p className="text-xs">Log internet, utilities, or grocery receipts to begin tracking.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenses.map((exp) => {
              const isPayer = !user || exp.paid_by?.id === user.id;
              return (
                <div key={exp.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                      {getCategoryIcon(exp.category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{exp.title}</h4>
                      <p className="text-xs text-slate-500">
                        Paid by <strong>{exp.paid_by?.full_name}</strong> • {exp.date}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                        {exp.participants?.map((p) => {
                          const isPayerOfExpense = exp.paid_by?.id === user?.id;
                          const isCurrentParticipant = p.user?.id === user?.id;
                          const canSettleThis = (isPayerOfExpense || isCurrentParticipant) && !p.is_settled;

                          if (p.is_settled) {
                            return (
                              <span
                                key={p.id}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                {isCurrentParticipant ? 'You' : p.user?.full_name?.split(' ')[0]}: Settled
                              </span>
                            );
                          }

                          return (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40"
                            >
                              <span>
                                {isCurrentParticipant ? 'You' : p.user?.full_name?.split(' ')[0]}: NPR {Number(p.share_amount).toLocaleString()}
                              </span>
                              {canSettleThis && (
                                <button
                                  type="button"
                                  onClick={() => handleSettleParticipantDirectly(p.id, p.user?.full_name || 'Roommate', p.share_amount)}
                                  disabled={settlingParticipantId === p.id}
                                  className="hover:underline text-[9px] font-bold text-rose-800 dark:text-rose-300 ml-0.5 pl-1 border-l border-rose-300/60 flex items-center gap-0.5"
                                  title="Mark this split share as settled"
                                >
                                  {settlingParticipantId === p.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    'Mark Paid'
                                  )}
                                </button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-black text-base text-slate-900 dark:text-white">
                        NPR {Number(exp.total_amount).toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">{exp.category}</span>
                    </div>

                    {isPayer && (
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(exp.id, exp.title)}
                        disabled={deletingId === exp.id}
                        title="Delete this expense entry"
                        aria-label="Delete this expense"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                      >
                        {deletingId === exp.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Shared Expense</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedParticipantIds([]);
                  setRoommateSearch('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Expense Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WorldLink 200Mbps WiFi / Groceries"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Total Amount (NPR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="2500"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="GROCERIES">Groceries & Food</option>
                    <option value="UTILITIES">Water & Electricity</option>
                    <option value="INTERNET">WiFi / Internet</option>
                    <option value="HOUSEHOLD">Cleaning Supplies</option>
                    <option value="ENTERTAINMENT">Outings</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Participant Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Split With (Roommates)
                  </label>
                  {availableRoommates.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedParticipantIds.length === availableRoommates.length) {
                          setSelectedParticipantIds([]);
                        } else {
                          setSelectedParticipantIds(availableRoommates.map((r) => r.id));
                        }
                      }}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      {selectedParticipantIds.length === availableRoommates.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {/* Always show Current User as Payer */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold">{user?.full_name || 'You'}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                      Payer
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Included</span>
                </div>

                {/* Filter / Search if more than 3 roommates */}
                {availableRoommates.length > 3 && (
                  <input
                    type="text"
                    placeholder="Search roommates by name..."
                    value={roommateSearch}
                    onChange={(e) => setRoommateSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}

                {/* Available Roommates List */}
                {loadingRoommates ? (
                  <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> Loading roommates...
                  </div>
                ) : availableRoommates.length === 0 ? (
                  <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                    No other roommates found. Connect with flatmates in the Roommates section to split expenses.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-slate-100 dark:border-slate-800 rounded-xl p-1.5">
                    {filteredRoommates.map((rm) => {
                      const isSelected = selectedParticipantIds.includes(rm.id);
                      return (
                        <label
                          key={rm.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedParticipantIds((prev) =>
                                  prev.includes(rm.id)
                                    ? prev.filter((id) => id !== rm.id)
                                    : [...prev, rm.id]
                                );
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="truncate">
                              <span className="block truncate">{rm.name}</span>
                              <span className="text-[10px] text-slate-400 font-normal block truncate">{rm.email}</span>
                            </div>
                          </div>
                          {rm.isConnected && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                              Connected
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Split Breakdown */}
              {selectedParticipantIds.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Please check at least one roommate to split this bill with.</span>
                </div>
              ) : newAmount && Number(newAmount) > 0 ? (
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex justify-between items-center">
                  <span>
                    Equal Split ({1 + selectedParticipantIds.length} people: You + {selectedParticipantIds.length}{' '}
                    {selectedParticipantIds.length === 1 ? 'roommate' : 'roommates'}):
                  </span>
                  <strong className="font-bold text-sm">
                    NPR {(Number(newAmount) / (1 + selectedParticipantIds.length)).toFixed(2)} / person
                  </strong>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={savingExpense || selectedParticipantIds.length === 0 || !newAmount || Number(newAmount) <= 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
              >
                {savingExpense && <Loader2 className="w-4 h-4 animate-spin" />}
                Save & Split Evenly
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Settle Up Modal */}
      {settleDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {settleDebt.is_current_user_receiver ? 'Confirm Payment Received' : 'Settle Balance'}
              </h3>
              <button onClick={() => setSettleDebt(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                NPR {Number(settleDebt.amount).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {settleDebt.is_current_user_receiver ? (
                  <>Received payment from <strong>{settleDebt.from_user_name}</strong></>
                ) : (
                  <>Paying to <strong>{settleDebt.to_user_name}</strong></>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Select Payment Method:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ESEWA')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'ESEWA'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  eSewa Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('KHALTI')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'KHALTI'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Khalti Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'CASH'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Cash / In Person
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK')}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'BANK'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Bank Transfer
                </button>
              </div>
            </div>

            <button
              onClick={handleSettleUp}
              disabled={settling}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
            >
              {settling ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {settleDebt.is_current_user_receiver
                ? 'Confirm Received & Mark Settled'
                : 'Confirm Payment & Mark Settled'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
