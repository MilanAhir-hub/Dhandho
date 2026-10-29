import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Menu, X, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300">
      <header
        className={`pointer-events-auto transition-all duration-300 ease-out bg-white/95 backdrop-blur-md rounded-full border border-slate-200/80 ${
          isScrolled
            ? 'mt-2.5 sm:mt-3 w-[92%] sm:w-[86%] max-w-5xl h-13 sm:h-14 px-4 sm:px-6 shadow-xl shadow-slate-900/10'
            : 'mt-4 sm:mt-5 w-[94%] sm:w-[90%] max-w-6xl h-16 sm:h-17 px-5 sm:px-8 shadow-md shadow-slate-900/5'
        } flex items-center justify-between`}
      >
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
          <div
            className={`rounded-xl bg-[#00a86b] flex items-center justify-center text-white shadow-xs group-hover:bg-[#059669] transition-all duration-300 ${
              isScrolled ? 'w-8 h-8' : 'w-9 h-9'
            }`}
          >
            <Store className={`stroke-[2.2] transition-all ${isScrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </div>
          <span
            className={`font-black text-slate-900 tracking-tight transition-all duration-300 ${
              isScrolled ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            }`}
          >
            Dhandho<span className="text-[#00a86b]">.</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`font-semibold text-slate-600 hover:text-slate-900 transition-colors ${
                isScrolled ? 'text-xs lg:text-sm' : 'text-sm'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-4 sm:gap-5">
          {localStorage.getItem('dhandho_user') ? (
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-1.5 bg-[#00a86b] hover:bg-[#059669] text-white font-bold rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 ${
                isScrolled
                  ? 'text-xs px-4 py-2'
                  : 'text-xs sm:text-sm px-5 py-2.5'
              }`}
            >
              Go to Dashboard
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`font-semibold text-slate-700 hover:text-slate-900 transition-colors ${
                  isScrolled ? 'text-xs sm:text-sm' : 'text-sm'
                }`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`inline-flex items-center gap-1.5 bg-[#00a86b] hover:bg-[#059669] text-white font-bold rounded-full shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 ${
                  isScrolled
                    ? 'text-xs px-4 py-2'
                    : 'text-xs sm:text-sm px-5 py-2.5'
                }`}
              >
                Start Free
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Hamburger */}
        <button
          className="md:hidden p-1.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Navigation"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer Dropdown */}
      {isMobileOpen && (
        <div className="pointer-events-auto md:hidden fixed top-20 left-4 right-4 bg-white/98 backdrop-blur-md border border-slate-200/90 rounded-2xl px-5 py-4 shadow-2xl flex flex-col gap-2.5 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-700 py-2 border-b border-slate-100"
              onClick={() => setIsMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <Link
              to="/login"
              className="flex-1 text-center text-xs font-bold text-slate-700 border border-slate-200 py-2.5 rounded-full"
              onClick={() => setIsMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center text-xs font-bold text-white bg-[#00a86b] py-2.5 rounded-full shadow-sm"
              onClick={() => setIsMobileOpen(false)}
            >
              Start Free →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
