import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Printer,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Product, Customer, Sale, salesService } from '../../services/api';

interface PosBillingTabProps {
  products: Product[];
  customers: Customer[];
  onSaleCreated: (newSale: Sale) => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

const PosBillingTab: React.FC<PosBillingTabProps> = ({
  products,
  customers,
  onSaleCreated,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [paymentType, setPaymentType] = useState<'cash' | 'udhari'>('cash');
  const [note, setNote] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Filter products by search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Cart operations
  const addToCart = (product: Product) => {
    setErrorMsg(null);
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        setErrorMsg(`Only ${product.stock_quantity} ${product.unit} available in stock.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.stock_quantity <= 0) {
        setErrorMsg(`"${product.name}" is out of stock.`);
        return;
      }
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: number, qty: number) => {
    setErrorMsg(null);
    const item = cart.find((i) => i.product.id === productId);
    if (!item) return;

    if (qty > item.product.stock_quantity) {
      setErrorMsg(`Cannot add more than ${item.product.stock_quantity} ${item.product.unit}.`);
      return;
    }

    if (qty <= 0) {
      setCart(cart.filter((i) => i.product.id !== productId));
    } else {
      setCart(
        cart.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.selling_price * item.quantity,
    0
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cart.length === 0) {
      setErrorMsg('Please add at least one item to the bill.');
      return;
    }

    if (paymentType === 'udhari' && !selectedCustomerId) {
      setErrorMsg('Please select a customer to add this bill to their Khata / Udhar.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        customer_id: selectedCustomerId,
        payment_type: paymentType,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        note: note.trim() || undefined,
      };

      const sale = await salesService.create(payload);
      onSaleCreated(sale);
      setCompletedSale(sale);
      setCart([]);
      setNote('');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to complete sale.';
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* ── Left Item Selection (7 cols) ────────────────────────────── */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search grocery item (e.g. Aata, Oil, Salt, Chai)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00a86b] focus:ring-2 focus:ring-[#00a86b]/20"
          />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock_quantity <= 0;
            return (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={isOutOfStock}
                className={`text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isOutOfStock
                    ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-slate-200/80 hover:border-[#00a86b] hover:shadow-md cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {p.category || 'Grocery'}
                    </span>
                    {p.is_low_stock && (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Stock: {p.stock_quantity} {p.unit}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <span className="font-black text-slate-900 font-mono text-sm">
                    ₹{p.selling_price}
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-[#e8f7ee] text-[#00a86b] flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right Cart & Bill Summary (5 cols) ───────────────────────── */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between min-h-[500px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#00a86b]" />
              <h3 className="font-bold text-slate-900 text-sm">Active Counter Bill</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Feedback */}
          {errorMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cart Table */}
          {cart.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Your cart is empty. Click on any item on the left to start billing!
            </div>
          ) : (
            <div className="py-3 space-y-2.5 max-h-[220px] overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-800 line-clamp-1">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400">
                      ₹{item.product.selling_price} / {item.product.unit}
                    </p>
                  </div>

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="text-slate-500 hover:text-slate-900 font-bold px-1"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-900 font-mono w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="text-slate-500 hover:text-slate-900 font-bold px-1"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right w-16 pl-2">
                    <p className="font-black text-slate-900 font-mono">
                      ₹{item.product.selling_price * item.quantity}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bill Settings & Checkout ────────────────────────────────── */}
        <form onSubmit={handleCheckout} className="pt-3 border-t border-slate-100 space-y-3">
          {/* Customer Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Select Customer
            </label>
            <select
              value={selectedCustomerId ?? ''}
              onChange={(e) =>
                setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#00a86b]"
            >
              <option value="">Walk-in Customer (Cash)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} — Udhar: ₹{c.udhari_balance}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentType('cash')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                paymentType === 'cash'
                  ? 'bg-emerald-50 border-[#00a86b] text-[#00a86b]'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              ✓ Cash Paid
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('udhari')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                paymentType === 'udhari'
                  ? 'bg-rose-50 border-rose-500 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              + Add to Khata
            </button>
          </div>

          {/* Total Row */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-500">Bill Total</span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full bg-[#00a86b] hover:bg-[#059669] text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Bill...
              </>
            ) : (
              <>
                Generate Bill
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* ── Generated Bill Receipt Modal ─────────────────────────────── */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-fade-up">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-[#e8f7ee] text-[#00a86b] flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-black text-slate-900 text-lg">Bill Generated!</h3>
              <p className="text-xs text-slate-400">Bill #{completedSale.id} • Dhandho Counter</p>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Date & Time:</span>
                <span className="font-mono text-slate-800">
                  {new Date(completedSale.sale_date).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Mode:</span>
                <span className="font-bold text-slate-800 uppercase">
                  {completedSale.payment_type}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-base text-slate-900">
                <span>Amount:</span>
                <span className="font-mono text-[#00a86b]">₹{completedSale.total_amount}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 border border-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex-1 bg-[#00a86b] text-white font-bold py-2 rounded-xl text-xs hover:bg-[#059669] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PosBillingTab;
