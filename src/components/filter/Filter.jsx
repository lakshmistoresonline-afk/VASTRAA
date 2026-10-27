import React, { useContext, useState } from 'react';
import myContext from '../../context/data/myContext';
import { CATALOGUES } from '../../data/catalogues';
import { FiSearch, FiFilter, FiCheckCircle } from 'react-icons/fi';
import ProductCard from '../productCard/ProductCard';

function Filter() {
  const context = useContext(myContext);
  const {
    product,
    searchKey,
    setSearchKey,
    filterType,
    setFilterType,
    filterPrice,
    setFilterPrice,
    syncStats
  } = context;

  const [activeTab, setActiveTab] = useState('SOFT');

  const scrollToResults = () => {
    const el = document.getElementById('catalogue-results');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Filter Toolbar Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E9E1D5] dark:border-gray-800 space-y-6">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-[10px] font-extrabold text-[#800020] dark:text-[#E5C158] uppercase tracking-widest block">
              Online Inventory Filter
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#24211F] dark:text-white">
              Browse Genuine Handloom Weaves
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Showroom Live Sync Active ({syncStats?.confirmedAvailable || product.length} In-Stock)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">

          {/* Select Catalogue Dropdown */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <FiFilter className="text-[#800020] dark:text-[#C6A15B] w-4 h-4" />
              <label className="text-xs font-bold text-[#24211F] dark:text-gray-300 uppercase tracking-wider">
                Select Catalogue
              </label>
            </div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setActiveTab('CUSTOM');
                scrollToResults();
              }}
              className="w-full text-xs font-bold px-4 py-3.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 bg-[#FAF7F0] dark:bg-gray-800 text-[#211A19] dark:text-white outline-none focus:ring-2 focus:ring-[#800020] shadow-sm cursor-pointer"
            >
              {CATALOGUES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Dropdown */}
          <div className="md:col-span-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[#800020] dark:text-[#C6A15B] font-bold text-xs">₹</span>
              <label className="text-xs font-bold text-[#24211F] dark:text-gray-300 uppercase tracking-wider">
                Select Price Range
              </label>
            </div>
            <select
              value={filterPrice}
              onChange={(e) => {
                setFilterPrice(e.target.value);
                setActiveTab('CUSTOM');
                scrollToResults();
              }}
              className="w-full text-xs font-bold px-4 py-3.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 bg-[#FAF7F0] dark:bg-gray-800 text-[#211A19] dark:text-white outline-none focus:ring-2 focus:ring-[#800020] shadow-sm cursor-pointer"
            >
              <option value="">All Prices</option>
              <option value="under_3000">Under ₹3,000</option>
              <option value="3000_6000">₹3,000 – ₹6,000</option>
              <option value="6000_15000">₹6,000 – ₹15,000</option>
              <option value="15000_20000">₹15,000 – ₹20,000</option>
              <option value="above_20000">Above ₹20,000</option>
            </select>
          </div>

          {/* Search by code or category */}
          <div className="md:col-span-4 space-y-1.5">
            <div className="flex items-center gap-2">
              <FiSearch className="text-[#800020] dark:text-[#C6A15B] w-4 h-4" />
              <label className="text-xs font-bold text-[#211A19] dark:text-gray-300 uppercase tracking-wider">
                Search by code or category
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => {
                  setSearchKey(e.target.value);
                  setActiveTab('CUSTOM');
                }}
                placeholder="e.g. A-001, Kanchipuram, Wedding..."
                className="flex-1 text-xs px-4 py-3.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 bg-[#FAF7F0] dark:bg-gray-800 text-[#211A19] dark:text-white outline-none focus:ring-2 focus:ring-[#800020] shadow-sm"
              />
              {searchKey && (
                <button
                  onClick={() => setSearchKey('')}
                  className="px-4 py-3.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-2xl text-xs font-bold hover:bg-gray-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Buttons */}
          <div className="md:col-span-2 flex gap-1.5">
            <button
              onClick={() => {
                setFilterType(CATALOGUES[0].name);
                setActiveTab('BRIDAL');
                scrollToResults();
              }}
              className={`flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                filterType === CATALOGUES[0].name
                  ? 'bg-[#800020] text-amber-100 shadow-md border border-[#C6A15B]/40'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Bridal Silks
            </button>
            <button
              onClick={() => {
                setFilterType(CATALOGUES[2].name);
                setActiveTab('SOFT');
                scrollToResults();
              }}
              className={`flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                filterType === CATALOGUES[2].name
                  ? 'bg-[#800020] text-amber-100 shadow-md border border-[#C6A15B]/40'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Soft Silks
            </button>
          </div>

        </div>

        {/* Item 4: Quick Price Filter Badges / Tags */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#800020] dark:text-[#E5C158] uppercase tracking-wider text-[11px] mr-1">
            Quick Price Tiers:
          </span>

          {[
            { label: 'All Prices', val: '' },
            { label: 'Under ₹3,000', val: 'under_3000' },
            { label: '₹3,000 – ₹6,000', val: '3000_6000' },
            { label: '₹6,000 – ₹15,000', val: '6000_15000' },
            { label: '₹15,000 – ₹20,000', val: '15000_20000' },
            { label: 'Above ₹20,000 (Bridal)', val: 'above_20000' }
          ].map((tier) => (
            <button
              key={tier.val}
              type="button"
              onClick={() => {
                setFilterPrice(tier.val);
                scrollToResults();
              }}
              className={`px-3.5 py-1.5 rounded-full font-bold transition-all text-[11px] border ${
                filterPrice === tier.val
                  ? 'bg-[#800020] text-amber-100 border-[#C6A15B]/40 shadow-sm'
                  : 'bg-[#FAF7F0] dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-[#E9E1D5] dark:border-gray-700 hover:border-[#800020]'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

      </div>

      {/* Catalogue Results Section */}
      <div id="catalogue-results" className="pt-6">
        <ProductCard isPaginated={true} itemsPerPage={24} />
      </div>
    </div>
  );
}

export default Filter;
