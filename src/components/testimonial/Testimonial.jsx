import React from 'react';

function Testimonial() {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container px-5 mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <span className="text-[#800020] dark:text-[#E5C158] font-semibold text-xs uppercase tracking-widest block mb-1">
            Customer Appreciation
          </span>
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
            Trusted Across India & Beyond
          </h2>
          <div className="w-16 h-1 bg-[#800020] mx-auto my-3 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center flex flex-col justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-300 italic mb-4 leading-relaxed">
              "We bought our daughter's bridal Kanchipuram wedding silk saree from Vastraa. The weave purity, rich gold zari, and live catalogue preview made our shopping effortless!"
            </p>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Lakshmi Menon</h3>
              <p className="text-[10px] text-gray-500">Kochi, Kerala</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center flex flex-col justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-300 italic mb-4 leading-relaxed">
              "Outstanding collection of soft silks and fancy Kanchipuram sarees! Being able to enquire on WhatsApp directly for exact prices with saree photos made international ordering so smooth."
            </p>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Dr. Radhika Pillai</h3>
              <p className="text-[10px] text-gray-500">Dubai & India</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 text-center flex flex-col justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-300 italic mb-4 leading-relaxed">
              "Best online saree collection! Their Gift Butta and Art Silk collection is amazing for wedding gifting. Highly recommend Vastraa for authentic silk saree shopping."
            </p>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">Anitha Varrier</h3>
              <p className="text-[10px] text-gray-500">Kerala, India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonial;
