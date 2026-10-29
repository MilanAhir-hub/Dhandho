import React, { useState } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  History,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Customer, customersService, UdhariPayment } from '../../services/api';

interface KhataTabProps {
  customers: Customer[];
  onRefresh: () => void;
}

const KhataTab: React.FC<KhataTabProps> = ({ customers, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [payingCustomer, setPayingCustomer] = useState<Customer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<UdhariPayment[]>([]);

  // Form states
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '' });
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const matches =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));
    return filterPendingOnly ? matches && c.udhari_balance > 0 : matches;
  });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newCustomer.name.trim()) {
      setErrorMsg('Customer name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await customersService.create(newCustomer);
      setIsAddCustomerOpen(false);
      setNewCustomer({ name: '', phone: '', address: '' });
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to add customer.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCustomer) return;
    setErrorMsg(null);

    if (paymentAmount <= 0) {
      setErrorMsg('Payment amount must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await customersService.payUdhari(
        payingCustomer.id,
        paymentAmount,
        paymentNote.trim() || undefined
      );
      setPayingCustomer(null);
      setPaymentAmount(0);
      setPaymentNote('');
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to record payment.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHistory = async (customer: Customer) => {
    setHistoryCustomer(customer);
    try {
      const history = await customersService.getUdhariHistory(customer.id);
      setPaymentHistory(history);
    } catch (err) {
      setPaymentHistory([]);
    }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customersService.delete(id);
      onRefresh();
    } catch (err: any) {
      alert('Could not delete customer.');
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#00a86b]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilterPendingOnly(!filterPendingOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterPendingOnly
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Pending Udhar Only ({customers.filter((c) => c.udhari_balance > 0).length})
          </button>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-[#00a86b] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Customer
          </button>
        </div>
      </div>

      {/* ── Customers List Table ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Pending Udhar</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No customers found. Add a customer to start tracking Udhar!
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{c.phone || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{c.address || '—'}</td>
                    <td className="py-3 px-4">
                      {c.udhari_balance > 0 ? (
                        <span className="font-mono font-black text-rose-600 text-sm">
                          ₹{c.udhari_balance.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs">
                          ₹0 (Settled)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {c.udhari_balance > 0 && (
                        <button
                          onClick={() => {
                            setPayingCustomer(c);
                            setPaymentAmount(c.udhari_balance);
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-[#00a86b] font-bold px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Pay Udhar
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenHistory(c)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                        title="Payment History"
                      >
                        <History className="w-3.5 h-3.5 inline mr-1" />
                        Ledger
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer inline-block align-middle"
                        title="Delete customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Customer Modal ───────────────────────────────────────── */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Customer</h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="e.g. Rameshbhai Patel"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00a86b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00a86b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Address / Society
                </label>
                <input
                  type="text"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="e.g. A-12 Shantinagar, Ahmedabad"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00a86b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#00a86b] hover:bg-[#059669] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Record Payment Modal ─────────────────────────────────────── */}
      {payingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Udhar Payment</h3>
              <button
                onClick={() => setPayingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 text-xs">
              <p className="text-slate-500">
                Customer: <strong className="text-slate-900">{payingCustomer.name}</strong>
              </p>
              <p className="text-slate-500">
                Current Due: <strong className="text-rose-600">₹{payingCustomer.udhari_balance}</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-base font-bold font-mono focus:outline-none focus:border-[#00a86b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Payment Note (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Paid via GPay / Cash"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00a86b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingCustomer(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#00a86b] hover:bg-[#059669] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Udhar History Modal ──────────────────────────────────────── */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Udhar Payment Ledger</h3>
                <p className="text-xs text-slate-500">{historyCustomer.name}</p>
              </div>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 max-h-60 overflow-y-auto space-y-2 text-xs">
              {paymentHistory.length === 0 ? (
                <p className="text-center text-slate-400 py-6">No payment history recorded yet.</p>
              ) : (
                paymentHistory.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">Payment Received</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(p.payment_date).toLocaleString()} • {p.note || 'No note'}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      +₹{p.amount_paid}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KhataTab;
