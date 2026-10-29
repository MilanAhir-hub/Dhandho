import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Package,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';
import { Product, Customer, Sale } from '../../services/api';

interface OverviewTabProps {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  onNavigateTab: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  products,
  customers,
  sales,
  onNavigateTab,
}) => {
  // Calculations from live backend data
  const totalSalesAmount = sales.reduce((acc, s) => acc + (s.total_amount || 0), 0);
  const totalUdharAmount = customers.reduce((acc, c) => acc + (c.udhari_balance || 0), 0);
  const lowStockItems = products.filter((p) => p.is_low_stock);
  const customersWithUdhar = customers.filter((c) => c.udhari_balance > 0);

  return (
    <div className="space-y-6">
      {/* ── Top Metrics Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">
              ₹{totalSalesAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {sales.length} Bills Generated
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00a86b] flex items-center justify-center">
            <TrendingUp className="h-6 w-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 2: Total Udhar Due */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Udhar Due</p>
            <p className="text-2xl font-black text-rose-600 font-mono mt-1">
              ₹{totalUdharAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              From {customersWithUdhar.length} customers
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <BookOpen className="h-6 w-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 3: Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
            <p className="text-2xl font-black text-amber-600 font-mono mt-1">
              {lowStockItems.length}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Need reordering soon
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Metric 4: Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">
              {products.length}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              In store inventory
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Package className="h-6 w-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* ── Action Shortcut Banner ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 to-[#00a86b] rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md shadow-emerald-700/20">
        <div>
          <h3 className="text-xl font-black">Ready to bill a customer?</h3>
          <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
            Use the Counter POS billing screen to create cash or udhari bills in seconds.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('pos')}
          className="bg-white text-emerald-800 font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-50 active:scale-95 transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Receipt className="h-4 w-4" />
          Open Billing Counter
        </button>
      </div>

      {/* ── Two Column: Recent Sales & Low Stock Alerts ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Bills */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-[#00a86b]" />
              <h4 className="font-bold text-slate-900 text-sm">Recent Sales Bills</h4>
            </div>
            <button
              onClick={() => onNavigateTab('pos')}
              className="text-xs font-bold text-[#00a86b] hover:underline flex items-center gap-1"
            >
              New Bill <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          {sales.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No bills created yet. Click "Open Billing Counter" to create your first bill!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sales.slice(-5).reverse().map((sale) => (
                <div key={sale.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Bill #{sale.id}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(sale.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {sale.payment_type === 'cash' ? (
                        <span className="text-emerald-600 font-semibold">Cash</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">Udhar</span>
                      )}
                    </p>
                  </div>
                  <span className="font-black text-slate-900 font-mono text-sm">
                    ₹{sale.total_amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Items */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h4 className="font-bold text-slate-900 text-sm">Low Stock Items</h4>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-[#00a86b] hover:underline flex items-center gap-1"
            >
              View Inventory <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              All inventory levels are healthy! No low stock alerts.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Min alert: {item.low_stock_alert} {item.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-rose-600 font-mono">
                      {item.stock_quantity} {item.unit} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OverviewTab;
