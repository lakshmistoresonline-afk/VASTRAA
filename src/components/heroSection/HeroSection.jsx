import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiAward } from 'react-icons/fi';

const HeroSection = () => {
  return (
    <section className="relative bg-[#FAF7F0] dark:bg-gray-950 transition-colors border-b border-[#E9E1D5] dark:border-gray-800">

      {/* Desktop Editorial Saree-Only Banner Container */}
      <div className="container mx-auto px-4 max-w-7xl py-8 md:py-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E9E1D5] dark:border-gray-800 bg-white dark:bg-gray-900 min-h-[500px] lg:min-h-[560px] flex items-center">

          {/* Background Saree-Only Fabric Photograph (No Models/People) */}
          <div className="absolute inset-0 z-0">
            <picture>
              <source media="(max-width: 768px)" srcSet="/images/hero/hero-mobile.jpg" />
              <img
                src="/images/hero/hero-desktop.jpg"
                alt="Vastraa - Pure Kanchipuram Handloom Silk Saree Weave"
                className="w-full h-full object-cover object-right filter brightness-95"
              />
            </picture>
            {/* Soft Warm Gradient Overlay for Left Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F0] via-[#FAF7F0]/90 lg:via-[#FAF7F0]/75 to-transparent dark:from-gray-950 dark:via-gray-950/90 lg:dark:via-gray-950/75"></div>
          </div>

          {/* Left Text Content Area */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl space-y-6">

            {/* Live Catalogue Tag */}
            <div className="inline-flex items-center gap-2 bg-[#800020]/10 dark:bg-[#D4AF37]/20 border border-[#800020]/20 dark:border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#800020] dark:text-[#E5C158] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>HANDLOOM SILK WEAVES</span>
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

            {/* Single Primary CTA */}
            <div className="pt-2">
              <Link
                to="/allproducts"
                className="inline-flex bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-xs sm:text-sm items-center gap-2 border border-[#C5A46D]/40"
              >
                <span>Explore the Collection</span>
                <FiArrowRight className="w-4 h-4 text-[#C5A46D]" />
              </Link>
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
