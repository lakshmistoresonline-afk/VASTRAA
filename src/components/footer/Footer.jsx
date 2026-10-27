import React, { useContext } from 'react';
import myContext from '../../context/data/myContext';
import { Link } from 'react-router-dom';
import { FiPhone, FiMapPin, FiMessageCircle, FiCheckCircle } from 'react-icons/fi';

function Footer() {
  const context = useContext(myContext);
  const { storeInfo } = context;

  return (
    <footer className="bg-[#211A19] dark:bg-gray-950 text-gray-300 font-sans border-t border-[#302625] transition-colors">
      <div className="container mx-auto px-5 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Col 1: Brand Info & Contact */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#650A25] text-[#C6A15B] w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-xl border border-[#C6A15B]">
                V
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#F7F0E4] leading-tight">
                  {storeInfo?.name || "Vastraa"}
                </h2>
                <p className="text-xs text-[#C6A15B] font-semibold">
                  Online Silk Store
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
              Authentic handloom silk sarees curated directly from Lakshmi Stores master weavers. Pan India insured shipping with verified pure silk quality guarantee.
            </p>

            <div className="space-y-2 text-xs font-semibold pt-2 text-amber-200/90">
              <p className="flex items-center gap-2">
                <FiMapPin className="text-[#C6A15B] w-4 h-4 flex-shrink-0" />
                <span>Showroom Location: {storeInfo?.location || "Round West, Thrissur, Kerala"}</span>
              </p>
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

          {/* Col 2: Online Collections Guarantee Box */}
          <div className="lg:col-span-5 space-y-3 bg-[#302625] p-6 rounded-3xl border border-[#C6A15B]/30 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <FiCheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />
              Verified Online Collections Curation
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

      {/* Copyright & Developer Credits Bar */}
      <div className="bg-[#1A1413] py-5 border-t border-[#302625]">
        <div className="container mx-auto px-5 max-w-7xl flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} Vastraa. All rights reserved.</p>

          <p className="text-[#C6A15B] font-semibold text-[11px] text-center">
            Designed & Developed by <span className="font-bold text-white">Subramanian T S</span>, <span className="font-bold text-[#E5C158]">WebCraft Digital Solutions</span>
          </p>

          <div className="flex gap-6 font-semibold">
            <Link to="/allproducts" className="hover:text-white transition-colors">Silk Sarees</Link>
            <Link to="/purchase-journey" className="hover:text-white transition-colors">Purchase Journey</Link>
            <Link to="/dashboard" className="text-[#C6A15B] hover:underline">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
