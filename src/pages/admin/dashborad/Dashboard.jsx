import React, { useContext } from 'react';
import myContext from '../../../context/data/myContext';
import Layout from '../../../components/layout/Layout';
import DashboardTab from './DashboardTab';
import { FiGrid, FiImage, FiCheckCircle, FiMessageCircle, FiTrendingUp, FiShoppingBag, FiDollarSign, FiAward, FiShield, FiBarChart2 } from 'react-icons/fi';

function Dashboard() {
  const context = useContext(myContext);
  const { product, catalogues, syncStats, enquiries, storeInfo } = context;

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

  const averageOrderValue = confirmedOrders.length > 0
    ? Math.round(totalGrossRevenue / confirmedOrders.length)
    : 0;

  // Item 3: Category-Wise Revenue Breakdown Calculation
  const categoryRevenues = catalogues.map((cat) => {
    const catOrders = confirmedOrders.filter(enq => {
      const items = enq.quotationDetails?.items || enq.cartItems || [];
      return items.some(item => {
        const liveItem = product?.find(p => p.id === item.id);
        return liveItem?.catalogueCode === cat.code || enq.categoryName?.includes(cat.name);
      });
    });

    const revenue = catOrders.reduce((sum, enq) => sum + (enq.quotationDetails?.finalPayable || 0), 0);
    const count = catOrders.length;
    const sharePct = totalGrossRevenue > 0 ? Math.round((revenue / totalGrossRevenue) * 100) : 0;

    return {
      ...cat,
      revenue,
      count,
      sharePct
    };
  });

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
                <p className="text-[10px] text-gray-400">A through I Collections</p>
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
                  Pipeline Requests
                </span>
                <p className="text-2xl font-serif font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {totalEnquiries} Orders
                </p>
                <p className="text-[10px] text-gray-400">Active Order Requests</p>
              </div>
            </div>

          </div>

          {/* Sales Revenue Analytics & Monthly Summary Bar */}
          <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 rounded-2xl text-xl font-bold">
                  <FiTrendingUp />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
                    Sales Revenue & Fulfillment Analytics
                  </h3>
                  <p className="text-xs text-gray-500">
                    Gross revenue calculations from verified customer payments & completed dispatches.
                  </p>
                </div>
              </div>

              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-300/40">
                ✓ Live Payment Sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-1">
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold block">
                  Confirmed Gross Revenue
                </span>
                <p className="text-2xl font-serif font-extrabold text-[#800020] dark:text-[#E5C158]">
                  ₹{totalGrossRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold">From {confirmedOrders.length} Verified Orders</p>
              </div>

              <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-1">
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold block">
                  Average Order Value (AOV)
                </span>
                <p className="text-2xl font-serif font-extrabold text-indigo-600 dark:text-indigo-400">
                  ₹{averageOrderValue.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 font-semibold">Per Confirmed Customer Order</p>
              </div>

              <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-1">
                <span className="text-gray-500 uppercase tracking-wider text-[10px] font-bold block">
                  Order Conversion Rate
                </span>
                <p className="text-2xl font-serif font-extrabold text-emerald-600 dark:text-emerald-400">
                  {totalEnquiries > 0 ? Math.round((confirmedOrders.length / totalEnquiries) * 100) : 0}%
                </p>
                <p className="text-[10px] text-gray-500 font-semibold">Pipeline Completion Ratio</p>
              </div>
            </div>

            {/* Item 3: Category-Wise Revenue Breakdown Chart */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-serif font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <FiBarChart2 className="text-[#800020] dark:text-[#E5C158]" />
                  <span>Category-Wise Revenue Share (Catalogues A–I)</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  {catalogues.length} Collections Tracked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {categoryRevenues.slice(0, 6).map((cat) => (
                  <div key={cat.id} className="bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                        Cat {cat.code} - {cat.name}
                      </span>
                      <span className="font-mono font-extrabold text-[#800020] dark:text-[#E5C158]">
                        ₹{cat.revenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#800020] dark:bg-[#C6A15B] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, cat.sharePct)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>{cat.count} Confirmed Orders</span>
                      <span className="font-bold">{cat.sharePct}% Revenue Share</span>
                    </div>
                  </div>
                ))}
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
