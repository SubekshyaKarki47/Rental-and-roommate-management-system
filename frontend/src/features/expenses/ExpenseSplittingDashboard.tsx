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
} from 'lucide-react';
import {
  expenseService,
  type Expense,
  type SimplifiedDebt,
} from '../../services/expenseService';

export const ExpenseSplittingDashboard: React.FC = () => {
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

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState('GROCERIES');
  const [savingExpense, setSavingExpense] = useState(false);

  // Settle Up Modal
  const [settleDebt, setSettleDebt] = useState<SimplifiedDebt | null>(null);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || Number(newAmount) <= 0) return;

    setSavingExpense(true);
    try {
      // Sample roommate user IDs (e.g. current user 2, and co-tenant 3)
      await expenseService.createExpense({
        title: newTitle.trim(),
        total_amount: Number(newAmount),
        category: newCategory,
        split_type: 'EQUAL',
        participant_ids: [2, 3], // 2 flatmates
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewAmount('');
      loadData();
    } catch (err) {
      alert('Failed to save expense.');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleSettleUp = async () => {
    if (!settleDebt) return;
    setSettling(true);
    try {
      await expenseService.settleUp({
        receiver: settleDebt.to_user_id,
        amount: settleDebt.amount,
        method: 'ESEWA',
        notes: `Settled NPR ${settleDebt.amount} via RoomMateHub`,
      });
      setSettleDebt(null);
      loadData();
    } catch (err) {
      alert('Failed to settle balance.');
    } finally {
      setSettling(false);
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
          onClick={() => setShowAddModal(true)}
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
            {stats.simplified_settlements.map((tx, idx) => (
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
                  onClick={() => setSettleDebt(tx)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                >
                  Settle Up
                </button>
              </div>
            ))}
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
            {expenses.map((exp) => (
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
                    <div className="flex gap-2 mt-1">
                      {exp.participants?.map((p) => (
                        <span
                          key={p.id}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            p.is_settled
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          }`}
                        >
                          {p.user?.full_name?.split(' ')[0]}: NPR {Number(p.share_amount).toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-base text-slate-900 dark:text-white">
                    NPR {Number(exp.total_amount).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{exp.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Shared Expense</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
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
                    onChange={(e) => setNewAmount(Number(e.target.value))}
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

              {newAmount && (
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex justify-between">
                  <span>Equal 2-Way Split:</span>
                  <strong>NPR {(Number(newAmount) / 2).toFixed(2)} / person</strong>
                </div>
              )}

              <button
                type="submit"
                disabled={savingExpense}
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
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Settle Balance</h3>
              <button onClick={() => setSettleDebt(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                NPR {Number(settleDebt.amount).toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Paying to <strong>{settleDebt.to_user_name}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Select Payment Method:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="p-3 rounded-xl border border-emerald-500 bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  eSewa Wallet
                </button>
                <button
                  type="button"
                  className="p-3 rounded-xl border border-purple-500 bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  Khalti Pay
                </button>
              </div>
            </div>

            <button
              onClick={handleSettleUp}
              disabled={settling}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
            >
              {settling ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm Payment & Mark Settled
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
