import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { FiPhone, FiMessageCircle, FiCheckCircle } from 'react-icons/fi';

export default function Footer() {
  const context = useContext(myContext);
  const { storeInfo } = context;

  return (
    <footer className="bg-[#211A19] text-gray-300 body-font border-t-2 border-[#C6A15B]/40">
      <div className="container px-5 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 justify-between">

          {/* Col 1: Store Brand & Contact */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="bg-[#650A25] text-[#C6A15B] w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-serif font-black shadow-md border-2 border-[#C6A15B]">
                V
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#F7F0E4] leading-tight">
                  {storeInfo?.name || "Vastraa"}
                </h2>
                <p className="text-xs text-[#C6A15B] font-semibold">
                  {storeInfo?.coBrand || "A Co-Brand of Lakshmi Stores"} • Online Silk Store
                </p>
              </div>
            </div>

            <p className="text-xs text-amber-200/80 font-serif italic max-w-sm">
              "{storeInfo?.tagline || "Tradition. Elegance. Trust."}"
            </p>

            <div className="text-xs text-gray-400 space-y-2 pt-2">
              <p className="flex items-center gap-2">
                <FiPhone className="text-[#C6A15B] w-4 h-4 flex-shrink-0" />
                <span>Hotline: {storeInfo?.phone || "+91 97469 98785"}</span>
              </p>
              <p className="flex items-center gap-2">
                <FiMessageCircle className="text-[#C6A15B] w-4 h-4 flex-shrink-0" />
                <span>WhatsApp: {storeInfo?.whatsapp || "+91 97469 98785"}</span>
              </p>
            </div>
          </div>

          {/* Col 2: Showroom Guarantee Box */}
          <div className="lg:col-span-5 space-y-3 bg-[#302625] p-6 rounded-3xl border border-[#C6A15B]/30 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <FiCheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />
              Verified Showroom Curation
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed">
              Every saree in our catalogue is handpicked for exquisite fabric lustre, pure zari, and heritage craftsmanship.
            </p>
            <div className="pt-3 border-t border-[#4A071B] space-y-1">
              <span className="text-[#C6A15B] font-bold block">Handloom Guarantee</span>
              <span className="text-gray-400 text-[11px]">Trusted Since Generations</span>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#1A1413] py-5 border-t border-[#302625]">
        <div className="container mx-auto px-5 max-w-7xl flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} Vastraa — A Co-Brand of Lakshmi Stores. All rights reserved.</p>
          <div className="flex gap-6 font-semibold">
            <Link to="/allproducts" className="hover:text-white transition-colors">Silk Sarees</Link>
            <Link to="/order" className="hover:text-white transition-colors">Enquiries</Link>
            <Link to="/dashboard" className="text-[#C6A15B] hover:underline">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
