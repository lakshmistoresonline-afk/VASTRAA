import React, { useContext } from 'react';
import myContext from '../../../context/data/myContext';
import Layout from '../../../components/layout/Layout';
import DashboardTab from './DashboardTab';
import { FiGrid, FiImage, FiCheckCircle, FiMessageCircle, FiTrendingUp, FiShoppingBag, FiLayers } from 'react-icons/fi';

function Dashboard() {
  const context = useContext(myContext);
  const { product, catalogues, syncStats, enquiries, storeInfo } = context;

  const totalSarees = product ? product.length : 0;
  const totalEnquiries = enquiries ? enquiries.length : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F0] dark:bg-gray-950 py-10 px-4 transition-colors">
        <div className="container mx-auto max-w-7xl space-y-8">

          {/* Header Banner */}
          <div className="maroon-gradient text-white p-8 rounded-3xl shadow-xl border-b-4 border-[#D4AF37] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="bg-[#D4AF37] text-gray-950 text-[11px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
                Lakshmi Stores Thrissur • Owner Admin Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-amber-50 mt-2">
                Online Live Inventory Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
                📍 {storeInfo?.location || "Round West, Thrissur, Kerala"}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-amber-300/30 px-5 py-3 rounded-2xl text-xs flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online Cloud Feed Status: <strong className="text-emerald-300">Connected & Active</strong></span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="glass-card p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-rose-100 dark:bg-rose-900/30 text-[#800020] dark:text-[#E5C158] rounded-2xl">
                <FiGrid className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Catalogues
                </span>
                <p className="text-2xl font-serif font-extrabold text-gray-900 dark:text-white mt-0.5">
                  {catalogues.length} Catalogues
                </p>
                <p className="text-[10px] text-gray-400">A, B & C Collections</p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <FiImage className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Live Sarees
                </span>
                <p className="text-2xl font-serif font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {totalSarees} Photos
                </p>
                <p className="text-[10px] text-gray-400">Online Live Inventory Feed</p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <FiCheckCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  In-Stock Verified
                </span>
                <p className="text-2xl font-serif font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {syncStats ? syncStats.confirmedAvailable : totalSarees} Sarees
                </p>
                <p className="text-[10px] text-gray-400">Confirmed Available</p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="p-3.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                <FiMessageCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Enquiries
                </span>
                <p className="text-2xl font-serif font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {totalEnquiries} Requests
                </p>
                <p className="text-[10px] text-gray-400">Customer Price Requests</p>
              </div>
            </div>

          </div>

          {/* Main Dashboard Tabs Component */}
          <DashboardTab />

        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
