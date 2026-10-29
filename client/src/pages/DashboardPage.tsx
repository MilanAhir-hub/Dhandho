import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  LayoutDashboard,
  Receipt,
  Package,
  BookOpen,
  Truck,
  LogOut,
  RefreshCw,
  Home,
} from 'lucide-react';
import {
  Product,
  Customer,
  Sale,
  Supplier,
  Purchase,
  productsService,
  customersService,
  salesService,
  suppliersService,
  purchasesService,
} from '../services/api';

import OverviewTab from '../components/dashboard/OverviewTab';
import PosBillingTab from '../components/dashboard/PosBillingTab';
import ProductsTab from '../components/dashboard/ProductsTab';
import KhataTab from '../components/dashboard/KhataTab';
import PurchasesTab from '../components/dashboard/PurchasesTab';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'pos' | 'products' | 'khata' | 'purchases'>('overview');

  // Backend state
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // User state
  const userStr = localStorage.getItem('dhandho_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const storeName = user?.username || 'Sharma Kirana Store';

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [pData, cData, sData, supData, poData] = await Promise.all([
        productsService.getAll().catch(() => []),
        customersService.getAll().catch(() => []),
        salesService.getAll().catch(() => []),
        suppliersService.getAll().catch(() => []),
        purchasesService.getAll().catch(() => []),
      ]);

      setProducts(pData);
      setCustomers(cData);
      setSales(sData);
      setSuppliers(supData);
      setPurchases(poData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dhandho_user');
    navigate('/');
  };

  const handleSaleCreated = (newSale: Sale) => {
    setSales([...sales, newSale]);
    // Refresh products and customers since backend automatically updates stock and udhari_balance
    fetchAllData();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Billing', icon: Receipt },
    { id: 'products', label: 'Products & Stock', icon: Package },
    { id: 'khata', label: 'Khata & Udhar', icon: BookOpen },
    { id: 'purchases', label: 'Stock In (Purchases)', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col selection:bg-[#e8f7ee] selection:text-[#00a86b]">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[#00a86b] flex items-center justify-center text-white shadow-xs group-hover:bg-[#059669] transition-all">
              <Store className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">
              Dhandho<span className="text-[#00a86b]">.</span>
            </span>
          </Link>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800">{storeName}</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#00a86b] bg-[#e8f7ee] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00a86b] animate-pulse" />
              Counter Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={fetchAllData}
            title="Refresh live data"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Website
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout: Sidebar & Content ─────────────────────────── */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 gap-6">
        
        {/* Left Navigation Tabs */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-1 sticky top-24">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
              Store Operations
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#00a86b] text-white shadow-xs shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Mobile Tabs selector */}
          <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#00a86b] text-white'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          {activeTab === 'overview' && (
            <OverviewTab
              products={products}
              customers={customers}
              sales={sales}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'pos' && (
            <PosBillingTab
              products={products}
              customers={customers}
              onSaleCreated={handleSaleCreated}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab products={products} onRefresh={fetchAllData} />
          )}

          {activeTab === 'khata' && (
            <KhataTab customers={customers} onRefresh={fetchAllData} />
          )}

          {activeTab === 'purchases' && (
            <PurchasesTab
              products={products}
              suppliers={suppliers}
              purchases={purchases}
              onRefresh={fetchAllData}
            />
          )}
        </main>

      </div>
    </div>
  );
};

export default DashboardPage;
