import React from 'react'

function Track() {
  return (
    <div>
      <section className="text-gray-600 body-font">
        <div className="container px-5 py-8 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">

            <div className="p-6 bg-amber-50/50 dark:bg-gray-700/50 rounded-2xl border border-amber-100 dark:border-gray-600 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#800020] text-[#D4AF37] rounded-full flex items-center justify-center text-xl font-bold">
                🏛️
              </div>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1">
                Authentic Handloom Weaves
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Directly from premier handloom silk weavers.
              </p>
            </div>

            <div className="p-6 bg-amber-50/50 dark:bg-gray-700/50 rounded-2xl border border-amber-100 dark:border-gray-600 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#800020] text-[#D4AF37] rounded-full flex items-center justify-center text-xl font-bold">
                📦
              </div>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1">
                Pan India Doorstep Express
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Safely packed with full transit insurance across all Indian states.
              </p>
            </div>

            <div className="p-6 bg-amber-50/50 dark:bg-gray-700/50 rounded-2xl border border-amber-100 dark:border-gray-600 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-3 bg-[#800020] text-[#D4AF37] rounded-full flex items-center justify-center text-xl font-bold">
                📸
              </div>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mb-1">
                Live Online Sync
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Every photo displayed reflects genuine current online stock from store owners.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

export default Track
