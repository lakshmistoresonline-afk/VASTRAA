import React, { useContext } from 'react';
import myContext from '../../../context/data/myContext';
import Layout from '../../../components/layout/Layout';
import DashboardTab from './DashboardTab';
import { FiImage, FiMessageCircle, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

function Dashboard() {
  const context = useContext(myContext);
  const { product, catalogues, enquiries, storeInfo } = context;

  const totalSarees = product ? product.length : 0;
  const totalEnquiries = enquiries ? enquiries.length : 0;

  // Calculate Sales Revenue Analytics
  const confirmedOrders = enquiries ? enquiries.filter(e =>
    e.status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' ||
    e.status === 'READY_FOR_DISPATCH' ||
    e.status === 'DISPATCHED' ||
    e.trackingDetails
  ) : [];

  const totalGrossRevenue = confirmedOrders.reduce((sum, order) => {
    return sum + (order.quotationDetails?.finalPayable || 0);
  }, 0);

  const conversionRate = totalEnquiries > 0
    ? Math.round((confirmedOrders.length / totalEnquiries) * 100)
    : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F0] dark:bg-gray-950 py-8 px-4 transition-colors">
        <div className="container mx-auto max-w-7xl space-y-6">

          {/* Compact High-Contrast Executive Header Banner */}
          <div className="bg-gradient-to-r from-[#4A071B] via-[#650A25] to-[#800020] text-white p-7 rounded-3xl shadow-xl border-b-4 border-[#C6A15B] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-[#C6A15B] text-gray-950 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Vastraa Owner Command Center
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white mt-2 leading-tight">
                Online Live Inventory & Order Management
              </h1>
              <p className="text-xs text-amber-200 font-medium mt-1 flex items-center gap-1">
                <span>📍 {storeInfo?.location || "Online Silk Store"}</span>
              </p>
            </div>

            <div className="bg-black/50 backdrop-blur-md border border-[#C6A15B]/40 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2.5 text-white shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Online Cloud Feed: <strong className="text-emerald-300 font-bold">Connected & Active</strong></span>
            </div>
          </div>

          {/* Streamlined Single-Row KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <div className="glass-card p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3.5 bg-white dark:bg-gray-900">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <FiDollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Confirmed Gross Sales
                </span>
                <p className="text-xl font-serif font-extrabold text-[#800020] dark:text-[#E5C158] mt-0.5">
                  ₹{totalGrossRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">{confirmedOrders.length} Paid Orders</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3.5 bg-white dark:bg-gray-900">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                <FiMessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Active Pipeline
                </span>
                <p className="text-xl font-serif font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {totalEnquiries} Orders
                </p>
                <p className="text-[10px] text-gray-400 font-bold">Action Required</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3.5 bg-white dark:bg-gray-900">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-[#800020] dark:text-[#E5C158] rounded-2xl">
                <FiImage className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Live Inventory
                </span>
                <p className="text-xl font-serif font-extrabold text-gray-900 dark:text-white mt-0.5">
                  {totalSarees} Sarees
                </p>
                <p className="text-[10px] text-gray-400 font-bold">{catalogues.length} Catalogues A–I</p>
              </div>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center gap-3.5 bg-white dark:bg-gray-900">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Conversion Ratio
                </span>
                <p className="text-xl font-serif font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {conversionRate}%
                </p>
                <p className="text-[10px] text-emerald-600 font-bold">Fulfillment Rate</p>
              </div>
            </div>

          </div>

          {/* Spacious Main Dashboard Tabs Component */}
          <DashboardTab />

        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
