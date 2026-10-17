import React, { useContext, useState } from 'react';
import myContext from '../../context/data/myContext';
import { FiSearch, FiRotateCcw, FiFilter, FiLayers } from 'react-icons/fi';

function Filter() {
  const context = useContext(myContext);
  const {
    searchKey,
    setSearchKey,
    filterType,
    setFilterType,
    catalogues
  } = context;

  const [groupFilter, setGroupFilter] = useState('ALL');

  const resetFilters = () => {
    setSearchKey('');
    setFilterType('');
    setGroupFilter('ALL');
  };

  const handleGroupSelect = (group) => {
    setGroupFilter(group);
    if (group === 'ALL') {
      setFilterType('');
    } else if (group === 'PURE') {
      setFilterType('Pure');
    } else if (group === 'SEMI_ART') {
      setFilterType('Semi');
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl mt-8">
      <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-200/80 dark:border-gray-800 space-y-5">

        {/* Level 1: Collection Group Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-200/60 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FiLayers className="text-[#800020] dark:text-[#E5C158] w-5 h-5" />
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Browse Collections:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGroupSelect('ALL')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 shadow-sm ${
                groupFilter === 'ALL' && filterType === ''
                  ? 'bg-[#800020] text-amber-100 shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All 9 Collections (3,252 Sarees)
            </button>

            <button
              onClick={() => handleGroupSelect('PURE')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 shadow-sm ${
                groupFilter === 'PURE' || filterType.includes('Pure')
                  ? 'bg-[#800020] text-amber-100 shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              ✨ Pure Kanchipuram Silks (Cat A, B, C)
            </button>

            <button
              onClick={() => handleGroupSelect('SEMI_ART')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 shadow-sm ${
                groupFilter === 'SEMI_ART' || filterType.includes('Semi') || filterType.includes('Art')
                  ? 'bg-[#800020] text-amber-100 shadow-md scale-105'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              🌸 Semi & Art Silk Sarees (Cat D–I)
            </button>
          </div>
        </div>

        {/* Level 2: Specific Catalogue Selector & Search Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">

          {/* Specific Catalogue Dropdown */}
          <div className="lg:col-span-5 relative">
            <div className="flex items-center gap-2 mb-1.5">
              <FiFilter className="text-[#800020] dark:text-[#E5C158] w-3.5 h-3.5" />
              <label className="text-[11px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Filter By Catalogue:
              </label>
            </div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setGroupFilter('CUSTOM');
              }}
              className="w-full text-xs font-bold px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#800020] shadow-sm cursor-pointer"
            >
              <option value="">All 9 Catalogues (A through I)</option>
              {catalogues.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  Catalogue {cat.code}: {cat.name} ({cat.indicativePriceRange})
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <div className="flex items-center gap-2 mb-1.5">
              <FiSearch className="text-[#800020] dark:text-[#E5C158] w-3.5 h-3.5" />
              <label className="text-[11px] font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Search Saree Code / Color:
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="Search code (e.g., A-001, B-050, D-100) or color..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#800020] outline-none shadow-sm"
              />
              <FiSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Reset Button */}
          <div className="lg:col-span-2 flex items-end pt-5 lg:pt-0">
            <button
              onClick={resetFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-xs font-bold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <FiRotateCcw className="w-4 h-4 text-[#800020] dark:text-[#E5C158]" />
              <span>Reset</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Filter;
