import React from 'react';
import { Store, Heart } from 'lucide-react';

const FOOTER_LINKS = [
  {
    heading: 'Product',
    links: ['Features', 'Pricing', 'How it Works', 'Changelog'],
  },
  {
    heading: 'Support',
    links: ['Help Center', 'WhatsApp Support', 'Video Tutorials', 'FAQs'],
  },
  {
    heading: 'Company',
    links: ['About Us', 'Blog', 'Privacy Policy', 'Terms of Use'],
  },
];

const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-slate-400 pt-16 pb-8">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">

        {/* Brand column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Dhandho<span className="text-emerald-500">.</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Simple, smart Kirana store management for the Indian shopkeeper. Bill fast, track Udhar, manage stock.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            All systems operational
          </div>
        </div>

        {/* Links columns */}
        {FOOTER_LINKS.map(({ heading, links }) => (
          <div key={heading} className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300">{heading}</h4>
            {links.map((link) => (
              <a
                key={link}
                href="#"
                className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <p>© {new Date().getFullYear()} Dhandho. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> for Indian Kirana store owners.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
