import React, { useContext, useState, useEffect } from 'react';
import myContext from '../../context/data/myContext';
import { FiSearch, FiRotateCcw, FiFilter, FiLayers, FiCheck } from 'react-icons/fi';

function Filter() {
  const context = useContext(myContext);
  const {
    searchKey,
    setSearchKey,
    filterType,
    setFilterType,
    catalogues,
    product
  } = context;

  const [activeTab, setActiveTab] = useState('ALL');
  const [localQuery, setLocalQuery] = useState(searchKey || '');

  // Keep localQuery in sync if searchKey is reset externally
  useEffect(() => {
    setLocalQuery(searchKey);
  }, [searchKey]);

  // Dynamic rotating image indices for single-saree showcase
  const [allIndex, setAllIndex] = useState(0);
  const [pureIndex, setPureIndex] = useState(0);
  const [semiIndex, setSemiIndex] = useState(0);

  const allSareeImages = product && product.length > 0 ? product.map(p => p.imageUrl).filter(Boolean) : [];
  const pureSareeImages = product && product.length > 0 ? product.filter(p => ['A', 'B', 'C'].includes(p.catalogueCode)).map(p => p.imageUrl).filter(Boolean) : [];
  const semiArtSareeImages = product && product.length > 0 ? product.filter(p => ['D', 'E', 'F', 'G', 'H', 'I'].includes(p.catalogueCode)).map(p => p.imageUrl).filter(Boolean) : [];

  // Set up dynamic rotation intervals (every 3.5 seconds)
  useEffect(() => {
    if (allSareeImages.length <= 1) return;
    const timer = setInterval(() => {
      setAllIndex((prev) => (prev + 1) % allSareeImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [allSareeImages.length]);

  useEffect(() => {
    if (pureSareeImages.length <= 1) return;
    const timer = setInterval(() => {
      setPureIndex((prev) => (prev + 1) % pureSareeImages.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [pureSareeImages.length]);

  useEffect(() => {
    if (semiArtSareeImages.length <= 1) return;
    const timer = setInterval(() => {
      setSemiIndex((prev) => (prev + 1) % semiArtSareeImages.length);
    }, 4100);
    return () => clearInterval(timer);
  }, [semiArtSareeImages.length]);

  const currentAllImg = allSareeImages[allIndex] || '/images/categories/pure-wedding-silks.jpg';
  const currentPureImg = pureSareeImages[pureIndex] || '/images/categories/pure-soft-silks.jpg';
  const currentSemiImg = semiArtSareeImages[semiIndex] || '/images/categories/art-semi-silks.jpg';

  const scrollToResults = () => {
    const element = document.getElementById('live-showcase');
    if (element) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const handleExecuteSearch = (e) => {
    if (e) e.preventDefault();
    setSearchKey(localQuery);
    scrollToResults();
  };

  const resetFilters = () => {
    setLocalQuery('');
    setSearchKey('');
    setFilterType('');
    setActiveTab('ALL');
  };

  const handleGroupSelect = (group) => {
    setActiveTab(group);
    if (group === 'ALL') {
      setFilterType('');
    } else if (group === 'PURE') {
      setFilterType('Pure');
    } else if (group === 'SEMI_ART') {
      setFilterType('Semi');
    }
    scrollToResults();
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl mt-8">
      <div className="glass-card p-6 sm:p-10 rounded-3xl shadow-xl border border-[#C6A15B]/30 dark:border-gray-800 space-y-8 bg-white dark:bg-gray-900 transition-colors">

        {/* Section Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-[#650A25] dark:text-[#C6A15B]">
            <FiLayers className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Handloom Curations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#211A19] dark:text-white">
            Browse Silk Collections
          </h2>
          <p className="text-xs text-[#77716A] dark:text-gray-400">
            Explore our handcrafted silk sarees, curated across timeless collections.
          </p>
        </div>

        {/* Dynamic Single-Saree Rotating Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

          {/* Card 1: All Collections */}
          <div
            onClick={() => handleGroupSelect('ALL')}
            className={`relative group rounded-2xl overflow-hidden border-2 cursor-pointer shadow-sm transition-all duration-300 flex items-end p-5 h-48 ${
              activeTab === 'ALL' && filterType === ''
                ? 'border-[#650A25] shadow-xl scale-[1.02]'
                : 'border-[#E9E1D5] dark:border-gray-800 hover:border-[#C6A15B]'
            }`}
          >
            <img
              key={currentAllImg}
              src={currentAllImg}
              alt="All Collections"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

            {activeTab === 'ALL' && filterType === '' && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#650A25] text-white flex items-center justify-center shadow-md z-20">
                <FiCheck className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="relative z-10 text-white w-full space-y-0.5">
              <h3 className="font-serif font-bold text-lg text-amber-50">All Collections</h3>
              <p className="text-[11px] text-amber-200/90 font-medium">Dynamic Live Curation</p>
            </div>
          </div>

          {/* Card 2: Pure Kanchipuram */}
          <div
            onClick={() => handleGroupSelect('PURE')}
            className={`relative group rounded-2xl overflow-hidden border-2 cursor-pointer shadow-sm transition-all duration-300 flex items-end p-5 h-48 ${
              activeTab === 'PURE' || filterType.includes('Pure')
                ? 'border-[#650A25] shadow-xl scale-[1.02]'
                : 'border-[#E9E1D5] dark:border-gray-800 hover:border-[#C6A15B]'
            }`}
          >
            <img
              key={currentPureImg}
              src={currentPureImg}
              alt="Pure Kanchipuram Silks"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

            {(activeTab === 'PURE' || filterType.includes('Pure')) && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#650A25] text-white flex items-center justify-center shadow-md z-20">
                <FiCheck className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="relative z-10 text-white w-full space-y-0.5">
              <h3 className="font-serif font-bold text-lg text-amber-50">Pure Kanchipuram</h3>
              <p className="text-[11px] text-amber-200/90 font-medium">Verified Pure Silks</p>
            </div>
          </div>

          {/* Card 3: Semi & Art Silk */}
          <div
            onClick={() => handleGroupSelect('SEMI_ART')}
            className={`relative group rounded-2xl overflow-hidden border-2 cursor-pointer shadow-sm transition-all duration-300 flex items-end p-5 h-48 ${
              activeTab === 'SEMI_ART' || filterType.includes('Semi')
                ? 'border-[#650A25] shadow-xl scale-[1.02]'
                : 'border-[#E9E1D5] dark:border-gray-800 hover:border-[#C6A15B]'
            }`}
          >
            <img
              key={currentSemiImg}
              src={currentSemiImg}
              alt="Semi & Art Silk Sarees"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

            {(activeTab === 'SEMI_ART' || filterType.includes('Semi')) && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#650A25] text-white flex items-center justify-center shadow-md z-20">
                <FiCheck className="w-3.5 h-3.5" />
              </div>
            )}

            <div className="relative z-10 text-white w-full space-y-0.5">
              <h3 className="font-serif font-bold text-lg text-amber-50">Semi & Art Silk</h3>
              <p className="text-[11px] text-amber-200/90 font-medium">Contemporary Weaves</p>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-[#E9E1D5] dark:border-gray-800"></div>

        {/* Filter & Search Bar Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">

          {/* Select Catalogue Dropdown */}
          <div className="lg:col-span-5 space-y-1.5">
            <div className="flex items-center gap-2">
              <FiFilter className="text-[#650A25] dark:text-[#C6A15B] w-4 h-4" />
              <label className="text-xs font-bold text-[#211A19] dark:text-gray-300 uppercase tracking-wider">
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
              className="w-full text-xs font-bold px-4 py-3.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 bg-[#FAF7F0] dark:bg-gray-800 text-[#211A19] dark:text-white outline-none focus:ring-2 focus:ring-[#650A25] shadow-sm cursor-pointer"
            >
              <option value="">All Collections</option>
              {catalogues.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name} — {cat.indicativePriceRange}
                </option>
              ))}
            </select>
          </div>

          {/* Search by code or category with explicit Search Button */}
          <div className="lg:col-span-5 space-y-1.5">
            <div className="flex items-center gap-2">
              <FiSearch className="text-[#650A25] dark:text-[#C6A15B] w-4 h-4" />
              <label className="text-xs font-bold text-[#211A19] dark:text-gray-300 uppercase tracking-wider">
                Search by code or category
              </label>
            </div>
            <form onSubmit={handleExecuteSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder="Try A-001, B-050 or a category name..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 bg-[#FAF7F0] dark:bg-gray-800 text-[#211A19] dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#650A25] outline-none shadow-sm placeholder:text-gray-400"
                />
                <FiSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-4" />
              </div>
              <button
                type="submit"
                className="bg-[#650A25] hover:bg-[#4A071B] text-amber-100 font-bold px-6 py-3.5 rounded-2xl text-xs transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
              >
                <FiSearch className="w-3.5 h-3.5 text-[#C6A15B]" />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Reset Button */}
          <div className="lg:col-span-2 flex items-end pt-5 lg:pt-6">
            <button
              onClick={resetFilters}
              className="w-full bg-[#FAF7F0] hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#211A19] dark:text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm border border-[#E9E1D5] dark:border-gray-700"
            >
              <FiRotateCcw className="w-4 h-4 text-[#650A25] dark:text-[#C6A15B]" />
              <span>Reset</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Filter;
