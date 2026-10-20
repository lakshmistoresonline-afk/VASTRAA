import React from 'react';
import Layout from '../../components/layout/Layout';
import HeroSection from '../../components/heroSection/HeroSection';
import CategoryExplorer from '../../components/categoryExplorer/CategoryExplorer';
import ProductCard from '../../components/productCard/ProductCard';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiAward, FiCheckCircle } from 'react-icons/fi';

const Home = () => {
  return (
    <Layout>
      {/* Section A: Compact Hero Banner */}
      <HeroSection />

      {/* Section B & C: Shop by Type & All 9 Catalogue Selector */}
      <CategoryExplorer />

      {/* Section D: Featured Sarees (Compact preview - at most 4 items) */}
      <div className="bg-[#FAF7F0] dark:bg-gray-950 pt-6">
        <ProductCard limit={4} isPaginated={false} />

        <div className="flex justify-center pb-12">
          <Link to="/allproducts">
            <button className="bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold px-8 py-3.5 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-wider flex items-center gap-2 border border-[#C5A46D]/40">
              <span>View All Silk Sarees</span>
              <FiArrowRight className="w-4 h-4 text-[#C5A46D]" />
            </button>
          </Link>
        </div>
      </div>

      {/* Section E: Compact Verified Trust Strip */}
      <section className="bg-white dark:bg-gray-900 border-y border-[#E9E1D5] dark:border-gray-800 py-8 transition-colors">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">

            <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-gray-800/50 border border-[#E9E1D5] dark:border-gray-800">
              <div className="p-3 bg-[#800020]/10 text-[#800020] dark:text-[#E5C158] rounded-xl text-xl">
                <FiTruck />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#24211F] dark:text-white">Pan India Free Shipping</h4>
                <p className="text-[11px] text-[#77716A] dark:text-gray-400">Express delivery across India</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-gray-800/50 border border-[#E9E1D5] dark:border-gray-800">
              <div className="p-3 bg-[#800020]/10 text-[#800020] dark:text-[#E5C158] rounded-xl text-xl">
                <FiShield />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#24211F] dark:text-white">Handloom Silk Purity</h4>
                <p className="text-[11px] text-[#77716A] dark:text-gray-400">Authentic pure & fine silk weaves</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3.5 p-3 rounded-2xl bg-[#FAF7F0] dark:bg-gray-800/50 border border-[#E9E1D5] dark:border-gray-800">
              <div className="p-3 bg-[#800020]/10 text-[#800020] dark:text-[#E5C158] rounded-xl text-xl">
                <FiCheckCircle />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#24211F] dark:text-white">Direct Showroom Assistance</h4>
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
