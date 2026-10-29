import React, { useState } from 'react';
import {
  Truck,
  Plus,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';
import {
  Product,
  Supplier,
  Purchase,
  suppliersService,
  purchasesService,
} from '../../services/api';

interface PurchasesTabProps {
  products: Product[];
  suppliers: Supplier[];
  purchases: Purchase[];
  onRefresh: () => void;
}

const PurchasesTab: React.FC<PurchasesTabProps> = ({
  products,
  suppliers,
  purchases,
  onRefresh,
}) => {
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isAddPurchaseOpen, setIsAddPurchaseOpen] = useState(false);

  // New supplier form
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', company_name: '' });

  // New purchase order form
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<
    { product_id: number; quantity: number; unit_price: number }[]
  >([]);
  const [purchaseNote, setPurchaseNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!supplierForm.name.trim()) {
      setErrorMsg('Supplier name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await suppliersService.create(supplierForm);
      setIsAddSupplierOpen(false);
      setSupplierForm({ name: '', phone: '', company_name: '' });
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to add supplier.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPurchaseItem = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    setPurchaseItems([
      ...purchaseItems,
      {
        product_id: defaultProduct.id,
        quantity: 10,
        unit_price: defaultProduct.buying_price,
      },
    ]);
  };

  const updatePurchaseItem = (index: number, field: string, val: number) => {
    const updated = [...purchaseItems];
    (updated[index] as any)[field] = val;
    setPurchaseItems(updated);
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (purchaseItems.length === 0) {
      setErrorMsg('Please add at least one product to the purchase order.');
      return;
    }

    try {
      setIsSubmitting(true);
      await purchasesService.create({
        supplier_id: selectedSupplierId,
        items: purchaseItems,
        note: purchaseNote.trim() || undefined,
      });
      setIsAddPurchaseOpen(false);
      setPurchaseItems([]);
      setPurchaseNote('');
      onRefresh();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to record purchase.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Action Bar ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Stock In & Suppliers</h3>
          <p className="text-xs text-slate-500">Record incoming inventory from wholesalers & distributors.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddSupplierOpen(true)}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Supplier
          </button>
          <button
            onClick={() => {
              setIsAddPurchaseOpen(true);
              if (purchaseItems.length === 0) handleAddPurchaseItem();
            }}
            className="bg-[#00a86b] hover:bg-[#059669] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Truck className="w-4 h-4 stroke-[2.2]" />
            Record Stock In
          </button>
        </div>
      </div>

      {/* ── Two Columns: Recent Purchases & Supplier List ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Purchases Orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h4 className="font-bold text-slate-900 text-sm mb-3">Recent Purchase Invoices</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Items Count</th>
                  <th className="py-2.5 px-3">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchases.slice().reverse().map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-bold text-slate-900">PO #{po.id}</td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(po.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3">{po.items?.length || 0} products</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        ₹{po.total_amount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suppliers List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-slate-900 text-sm">Suppliers & Wholesalers</h4>
            <span className="text-xs text-slate-400 font-semibold">{suppliers.length} Total</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
            {suppliers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No suppliers added yet.</p>
            ) : (
              suppliers.map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">{s.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{s.company_name || 'Distributor'}</p>
                  {s.phone && <p className="text-[10px] text-slate-400 mt-1">Phone: {s.phone}</p>}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── Add Supplier Modal ───────────────────────────────────────── */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Wholesaler / Supplier</h3>
              <button
                onClick={() => setIsAddSupplierOpen(false)}
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

            <form onSubmit={handleAddSupplier} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="e.g. Mukeshbhai Shah"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00a86b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Agency / Company Name
                </label>
                <input
                  type="text"
                  value={supplierForm.company_name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, company_name: e.target.value })}
                  placeholder="e.g. Gujarat Oil Distributors"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00a86b]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="e.g. 9825012345"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00a86b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#00a86b] hover:bg-[#059669] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Record Stock In Purchase Modal ───────────────────────────── */}
      {isAddPurchaseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fade-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Record Stock In (Purchase)</h3>
              <button
                onClick={() => setIsAddPurchaseOpen(false)}
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

            <form onSubmit={handleCreatePurchase} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Select Supplier
                </label>
                <select
                  value={selectedSupplierId ?? ''}
                  onChange={(e) =>
                    setSelectedSupplierId(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00a86b]"
                >
                  <option value="">Direct / Cash Purchase</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.company_name || 'Agency'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 uppercase">Items Purchased</span>
                  <button
                    type="button"
                    onClick={handleAddPurchaseItem}
                    className="text-xs font-bold text-[#00a86b] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                {purchaseItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <select
                      value={item.product_id}
                      onChange={(e) => updatePurchaseItem(idx, 'product_id', Number(e.target.value))}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => updatePurchaseItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900"
                    />

                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updatePurchaseItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      placeholder="Cost ₹"
                      className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-900 font-mono"
                    />

                    <button
                      type="button"
                      onClick={() => removePurchaseItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPurchaseOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || purchaseItems.length === 0}
                  className="px-5 py-2 bg-[#00a86b] hover:bg-[#059669] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PurchasesTab;
