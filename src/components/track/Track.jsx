import React from 'react';

function Track() {
  return (
    <section className="py-12 bg-white dark:bg-gray-800 transition-colors border-t border-b border-gray-100 dark:border-gray-700">
      <div className="container px-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

          <div className="p-6 bg-amber-50/50 dark:bg-gray-700/50 rounded-2xl border border-amber-100 dark:border-gray-600 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#800020] text-[#D4AF37] rounded-full flex items-center justify-center text-xl font-bold">
              ✨
            </div>
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1">
              100% Pure Silk Handlooms
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Guaranteed pure Kanchipuram silk mark certified weaving from master weavers.
            </p>
          </div>

          <div className="p-6 bg-amber-50/50 dark:bg-gray-700/50 rounded-2xl border border-amber-100 dark:border-gray-600 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#800020] text-[#D4AF37] rounded-full flex items-center justify-center text-xl font-bold">
              📍
            </div>
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1">
              Round West, Thrissur Showroom
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Visit our physical store in the cultural capital of Kerala or order directly online.
            </p>
          </div>

          <div className="p-6 bg-amber-50/50 dark:bg-gray-700/50 rounded-2xl border border-amber-100 dark:border-gray-600 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-3 bg-[#800020] text-[#D4AF37] rounded-full flex items-center justify-center text-xl font-bold">
              📸
            </div>
            <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1">
              Live Google Photos Sync
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Every photo displayed reflects genuine current showroom stock from store owners.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Track;
