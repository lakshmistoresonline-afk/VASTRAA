import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiAward, FiSmartphone } from 'react-icons/fi';
import extractedData from '../../data/extractedSarees.json';
import SareeImageThumbnail from '../SareeImageThumbnail';
import { usePwaInstall } from '../../hooks/usePwaInstall';

const HeroSection = () => {
  const { isStandalone, promptInstall } = usePwaInstall();

  // Use actual verified individual saree photo from Catalogue A (Zero models / 100% saree fabric)
  const heroSareeUrl = extractedData.A?.[0]?.imageUrl || "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

  return (
    <section className="relative bg-[#FAF7F0] dark:bg-gray-950 transition-colors border-b border-[#E9E1D5] dark:border-gray-800">

      {/* Desktop Editorial Saree-Only Banner Container */}
      <div className="container mx-auto px-4 max-w-7xl py-8 md:py-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E9E1D5] dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[500px] lg:min-h-[560px] flex items-center">

          {/* Background Saree-Only Fabric Photograph (No Models/People) */}
          <div className="absolute inset-0 z-0">
            <SareeImageThumbnail
              id="hero_saree_banner"
              src={heroSareeUrl}
              alt="Vastraa - Pure Kanchipuram Handloom Silk Saree Weave"
              className="w-full h-full object-cover object-center filter brightness-95"
            />
            {/* Soft Warm Gradient Overlay for Left Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F0] via-[#FAF7F0]/95 lg:via-[#FAF7F0]/85 to-transparent dark:from-gray-950 dark:via-gray-950/95 lg:dark:via-gray-950/85"></div>
          </div>

          {/* Left Text Content Area */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl space-y-6">

            {/* Live Catalogue Tag + Referral Offer Badge */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="inline-flex items-center gap-2 bg-[#800020]/10 dark:bg-[#D4AF37]/20 border border-[#800020]/20 dark:border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#800020] dark:text-[#E5C158] backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>HANDLOOM SILK WEAVES</span>
              </div>

              <Link
                to="/account"
                className="inline-flex items-center gap-1.5 bg-emerald-600/10 dark:bg-emerald-500/20 border border-emerald-600/30 text-emerald-800 dark:text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-extrabold hover:underline"
              >
                <span>🎁 5% Friend Welcome Pass • Refer & Earn Saree Rewards</span>
              </Link>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-[#24211F] dark:text-amber-50 leading-[1.12]">
              Timeless Traditions. <br />
              <span className="text-[#800020] dark:text-[#E5C158]">Modern Elegance.</span>
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base text-[#77716A] dark:text-amber-100/80 font-normal leading-relaxed max-w-lg">
              Discover authentic Kanchipuram Pure Silk, Soft Silk, and Art Silk sarees woven for every occasion, celebration, and individual style.
            </p>

            {/* Primary CTAs: Explore Collection + Install Vastraa App */}
            <div className="pt-2 flex flex-wrap gap-3 items-center">
              <Link
                to="/allproducts"
                className="inline-flex bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold px-7 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm items-center gap-2 border border-[#C5A46D]/40"
              >
                <span>Explore the Collection</span>
                <FiArrowRight className="w-4 h-4 text-[#C5A46D]" />
              </Link>

              {!isStandalone && (
                <button
                  type="button"
                  onClick={promptInstall}
                  className="inline-flex bg-[#FAF7F0] dark:bg-gray-800 hover:bg-gray-100 text-gray-900 dark:text-white font-extrabold px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm items-center gap-2 border border-[#C6A15B]/40 cursor-pointer"
                  title="Install Vastraa App directly on your phone home screen"
                >
                  <FiSmartphone className="w-4 h-4 text-[#800020] dark:text-[#E5C158]" />
                  <span>Install App on Phone</span>
                </button>
              )}
            </div>

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E9E1D5] dark:border-gray-800 text-xs text-[#77716A] dark:text-gray-400">
              <div className="flex items-center gap-2">
                <FiTruck className="text-[#800020] dark:text-[#E5C158] w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-bold text-[#24211F] dark:text-white text-[11px]">Free Shipping</p>
                  <p className="text-[10px]">Pan India</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FiShield className="text-[#800020] dark:text-[#E5C158] w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-bold text-[#24211F] dark:text-white text-[11px]">Authentic Quality</p>
                  <p className="text-[10px]">Handloom Sarees</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FiAward className="text-[#800020] dark:text-[#E5C158] w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="font-bold text-[#24211F] dark:text-white text-[11px]">Handloom Guarantee</p>
                  <p className="text-[10px]">Trusted Since Generations</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </section>
  );
};

export default HeroSection;
