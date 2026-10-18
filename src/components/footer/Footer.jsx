import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { FiPhone, FiMessageCircle, FiCheckCircle } from 'react-icons/fi';

export default function Footer() {
  const context = useContext(myContext);
  const { storeInfo, catalogues, setFilterType } = context;

  return (
    <footer className="bg-slate-950 text-gray-300 body-font border-t-4 border-[#D4AF37]">
      <div className="container px-5 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Col 1: Store Brand & Contact */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="bg-[#800020] text-[#D4AF37] w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-serif font-black shadow-md border-2 border-[#D4AF37]">
                V
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-white leading-tight">
                  {storeInfo?.name || "Vastraa"}
                </h2>
                <p className="text-xs text-[#D4AF37] font-semibold">
                  {storeInfo?.coBrand || "A Co-Brand of Lakshmi Stores"} • Online Silk Store
                </p>
              </div>
            </div>

            <p className="text-xs text-amber-200/80 font-serif italic max-w-sm">
              "{storeInfo?.tagline || "Tradition. Elegance. Trust."}"
            </p>

            <div className="text-xs text-gray-400 space-y-2 pt-2">
              <p className="flex items-center gap-2">
                <FiPhone className="text-[#D4AF37] w-4 h-4 flex-shrink-0" />
                <span>Hotline: {storeInfo?.phone || "+91 97469 98785"}</span>
              </p>
              <p className="flex items-center gap-2">
                <FiMessageCircle className="text-[#D4AF37] w-4 h-4 flex-shrink-0" />
                <span>WhatsApp: {storeInfo?.whatsapp || "+91 97469 98785"}</span>
              </p>
            </div>
          </div>

          {/* Col 2: Catalogues Directory (A through I) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="title-font font-bold text-[#D4AF37] tracking-wider text-xs uppercase mb-4">
              All 9 Silk Catalogues (A through I)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {catalogues.map((cat) => (
                <Link
                  key={cat.id}
                  to="/allproducts"
                  onClick={() => setFilterType(cat.name)}
                  className="hover:text-[#E5C158] transition-colors flex items-center gap-2 text-gray-300 truncate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0"></span>
                  <span className="truncate">Cat {cat.code}: {cat.name} ({cat.indicativePriceRange})</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3: Live Sync Box */}
          <div className="lg:col-span-3 space-y-3 bg-slate-900 p-6 rounded-3xl border border-slate-800 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <FiCheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />
              Live Online Sync Active
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Our online website inventory is synchronized in real-time with verified Vastraa silk saree feeds.
            </p>
            <div className="pt-3 border-t border-slate-800 space-y-1">
              <span className="text-[#D4AF37] font-bold block">100% Handloom Assurance</span>
              <span className="text-gray-400 text-[11px]">Pure & Fine Silk Weaves</span>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-slate-900/90 py-5 border-t border-slate-800">
        <div className="container mx-auto px-5 max-w-7xl flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} Vastraa — A Co-Brand of Lakshmi Stores. All rights reserved.</p>
          <div className="flex gap-6 font-semibold">
            <Link to="/allproducts" className="hover:text-white transition-colors">Silk Sarees</Link>
            <Link to="/order" className="hover:text-white transition-colors">Enquiries</Link>
            <Link to="/dashboard" className="text-[#D4AF37] hover:underline">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
