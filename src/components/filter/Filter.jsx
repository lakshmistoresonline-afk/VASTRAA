import React, { useContext, useState } from 'react';
import myContext from '../../context/data/myContext';
import { CATALOGUES } from '../../data/catalogues';
import { FiSearch, FiFilter, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import ProductCard from '../productCard/ProductCard';

function Filter() {
  const context = useContext(myContext);
  const {
    product,
    searchKey,
    setSearchKey,
    filterType,
    setFilterType,
    syncStats
  } = context;

  const [activeTab, setActiveTab] = useState('ALL');

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
              Showroom Inventory Filter
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#24211F] dark:text-white">
              Browse Genuine Handloom Weaves ({product ? product.length : 0} Sarees)
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Google Photos Live Sync Active ({syncStats?.confirmedAvailable || product.length} In-Stock)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">

          {/* Select Catalogue Dropdown */}
          <div className="lg:col-span-4 space-y-1.5">
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
              <option value="">All Collections</option>
              {CATALOGUES.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search by code or category with explicit Search Button */}
          <div className="lg:col-span-5 space-y-1.5">
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

          {/* Quick Tabs: All / Wedding / Soft / Semi */}
          <div className="lg:col-span-3 flex gap-2">
            <button
              onClick={() => {
                setFilterType('');
                setSearchKey('');
                setActiveTab('ALL');
              }}
              className={`flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'ALL' && !filterType && !searchKey
                  ? 'bg-[#800020] text-white shadow-md border border-[#C6A15B]/40'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              All ({product.length})
            </button>
            <button
              onClick={() => {
                setFilterType('Wedding');
                setActiveTab('WEDDING');
                scrollToResults();
              }}
              className={`flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all ${
                filterType === 'Wedding'
                  ? 'bg-[#800020] text-white shadow-md border border-[#C6A15B]/40'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Bridal
            </button>
          </div>

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
