import React, { useState } from 'react';
import { Trip, Expense } from '../types';
import { auditTripExpensesAI } from '../../services/travelBrainService';
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Plus, 
  Sparkles, 
  Trash2, 
  DollarSign, 
  Receipt,
  Utensils,
  Train,
  Hotel,
  Ticket,
  ShoppingBag,
  Lightbulb,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface ExpenseViewProps {
  trip: Trip;
  onUpdateTrip: (updatedTrip: Trip) => void;
}

export const ExpenseView: React.FC<ExpenseViewProps> = ({ trip, onUpdateTrip }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'stay' | 'food' | 'transit' | 'activities' | 'shopping' | 'other'>('food');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    auditScore?: string;
    summaryText?: string;
    savingHacks?: string[];
  } | null>(null);

  const totalSpent = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budget = trip.totalBudget || 1;
  const remaining = budget - totalSpent;
  const burnPercent = Math.min(100, Math.round((totalSpent / budget) * 100));

  // Category totals
  const categoryTotals: Record<string, number> = {
    stay: 0,
    food: 0,
    transit: 0,
    activities: 0,
    shopping: 0,
    other: 0,
  };

  trip.expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: title.trim(),
      amount: parseFloat(amount) || 0,
      category,
      date,
      notes: notes.trim() || undefined,
    };

    onUpdateTrip({
      ...trip,
      expenses: [newExpense, ...trip.expenses],
    });

    setTitle('');
    setAmount('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleDeleteExpense = (id: string) => {
    onUpdateTrip({
      ...trip,
      expenses: trip.expenses.filter((e) => e.id !== id),
    });
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const data = await auditTripExpensesAI(trip);
      setAuditResult(data);
    } catch (err) {
      console.error('Failed to audit budget:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'food':
        return <Utensils className="h-4 w-4 text-orange-500" />;
      case 'transit':
        return <Train className="h-4 w-4 text-blue-500" />;
      case 'stay':
        return <Hotel className="h-4 w-4 text-amber-500" />;
      case 'activities':
        return <Ticket className="h-4 w-4 text-purple-500" />;
      case 'shopping':
        return <ShoppingBag className="h-4 w-4 text-emerald-500" />;
      default:
        return <Receipt className="h-4 w-4 text-stone-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Total Budget</span>
            <Wallet className="h-4 w-4 text-stone-400" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-stone-900">
            {trip.currencySymbol}{trip.totalBudget.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Currency: {trip.currency}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Total Spent</span>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold text-stone-900">
            {trip.currencySymbol}{totalSpent.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Burn rate: {burnPercent}% of total
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Remaining Funds</span>
            <PiggyBank className="h-4 w-4 text-emerald-600" />
          </div>
          <div className={`text-xl sm:text-2xl font-semibold ${remaining < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
            {trip.currencySymbol}{remaining.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {remaining < 0 ? 'Exceeded estimated budget' : 'Safe margin available'}
          </div>
        </div>
      </div>

      {/* Burn Rate Bar & AI Audit Action */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Budget Consumption</h3>
            <p className="text-xs text-stone-500">Visual progress of expenses vs trip allowance</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-ai-budget-audit"
              onClick={handleRunAudit}
              disabled={isAuditing}
              className="inline-flex items-center space-x-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 text-amber-600 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Auditing with Gemini...' : 'Gemini Financial Audit'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1 bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              burnPercent > 90 ? 'bg-red-500' : burnPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${burnPercent}%` }}
          />
        </div>

        {/* Category breakdown ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 text-center text-xs">
          {Object.entries(categoryTotals).map(([cat, val]) => (
            <div key={cat} className="p-2 rounded-lg bg-stone-50 border border-stone-100">
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">{cat}</span>
              <span className="font-semibold text-stone-800">
                {trip.currencySymbol}{val.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Gemini Financial Audit Result */}
        {auditResult && (
          <div className="mt-4 p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Gemini Financial Health: {auditResult.auditScore}
                </span>
              </div>
            </div>

            {auditResult.summaryText && (
              <p className="text-xs text-stone-800 leading-relaxed font-medium">
                {auditResult.summaryText}
              </p>
            )}

            {auditResult.savingHacks && auditResult.savingHacks.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-amber-950 uppercase tracking-wider block">
                  Insider Money-Saving Tactics:
                </span>
                {auditResult.savingHacks.map((hack, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2 text-xs text-amber-900 bg-white p-2.5 rounded-lg border border-amber-200/80"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{hack}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expenses Ledger Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            Transaction Ledger ({trip.expenses.length})
          </span>
          {trip.expenses.length > 0 && (
            <button
              onClick={() => {
                const header = ['ID', 'Date', 'Category', 'Description', 'Amount', 'Currency', 'Notes'];
                const rows = trip.expenses.map(e => [
                  `"${e.id}"`,
                  `"${e.date}"`,
                  `"${e.category}"`,
                  `"${(e.title || '').replace(/"/g, '""')}"`,
                  e.amount,
                  `"${trip.currency}"`,
                  `"${(e.notes || '').replace(/"/g, '""')}"`
                ]);
                const csv = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
                const encodedUri = encodeURI(csv);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', `${trip.destination.toLowerCase().replace(/\s+/g, '_')}_expenses_sheet.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
              title="Export expenses to CSV/Excel Spreadsheet"
            >
              <FileSpreadsheet size={13} />
              <span>Export Sheet (CSV)</span>
            </button>
          )}
        </div>

        {trip.expenses.length === 0 ? (
          <div className="text-center py-10 text-stone-400 text-xs">
            No expenses logged yet. Tap 'Log Expense' to keep track!
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {trip.expenses.map((exp) => (
              <div
                key={exp.id}
                id={`exp-row-${exp.id}`}
                className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-semibold text-stone-900 block truncate">
                      {exp.title}
                    </span>
                    <div className="flex items-center space-x-2 text-[11px] text-stone-400">
                      <span className="capitalize">{exp.category}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                      {exp.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[180px]">{exp.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-sm sm:text-base font-semibold text-stone-900">
                    {trip.currencySymbol}{exp.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="text-stone-300 hover:text-red-600 p-1 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-base font-semibold text-stone-900 mb-4">Log Travel Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Shinkansen Express Ticket"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Amount ({trip.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="food">Food & Dining</option>
                    <option value="transit">Transit & Transport</option>
                    <option value="stay">Lodging / Hotel</option>
                    <option value="activities">Tours & Tickets</option>
                    <option value="shopping">Shopping & Souvenirs</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paid cash at ticket window"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
