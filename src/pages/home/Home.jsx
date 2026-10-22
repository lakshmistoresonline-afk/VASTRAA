import React from 'react';
import Layout from '../../components/layout/Layout';
import HeroSection from '../../components/heroSection/HeroSection';
import CategoryExplorer from '../../components/categoryExplorer/CategoryExplorer';
import { FiShield, FiTruck, FiCheckCircle } from 'react-icons/fi';

const Home = () => {
  return (
    <Layout>
      {/* Section A: Compact Hero Banner */}
      <HeroSection />

      {/* Section B & C: Shop by Type & All Collection Selector */}
      <CategoryExplorer />

      {/* Section E: Compact Verified Trust Strip */}
      <section className="bg-white dark:bg-gray-900 border-y border-[#C6A15B]/20 dark:border-gray-800 py-8 transition-colors">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">

            <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-gray-800/50 border border-[#C6A15B]/20 dark:border-gray-800">
              <div className="p-3 bg-[#650A25]/10 text-[#650A25] dark:text-[#C6A15B] rounded-xl text-xl">
                <FiTruck />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#211A19] dark:text-white">Pan India Free Shipping</h4>
                <p className="text-[11px] text-[#77716A] dark:text-gray-400">Express delivery across India</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-gray-800/50 border border-[#C6A15B]/20 dark:border-gray-800">
              <div className="p-3 bg-[#650A25]/10 text-[#650A25] dark:text-[#C6A15B] rounded-xl text-xl">
                <FiShield />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#211A19] dark:text-white">Handloom Silk Purity</h4>
                <p className="text-[11px] text-[#77716A] dark:text-gray-400">Authentic pure & fine silk weaves</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-gray-800/50 border border-[#C6A15B]/20 dark:border-gray-800">
              <div className="p-3 bg-[#650A25]/10 text-[#650A25] dark:text-[#C6A15B] rounded-xl text-xl">
                <FiCheckCircle />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#211A19] dark:text-white">Direct Showroom Assistance</h4>
                <p className="text-[11px] text-[#77716A] dark:text-gray-400">Instant WhatsApp & online enquiry</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
