import React, { useContext, useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import myContext from '../../../context/data/myContext';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiSearch, FiTrash2, FiExternalLink, FiMessageCircle } from 'react-icons/fi';

function DashboardTab() {
  const context = useContext(myContext);
  const {
    product,
    catalogues,
    syncStats,
    lastVerifiedAt,
    triggerSync,
    enquiries,
    getEnquiriesData,
    getOrderData,
    getUserData,
    updateEnquiryStatus,
    deleteEnquiry,
    storeInfo,
    loading
  } = context;

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (getEnquiriesData) getEnquiriesData();
    if (getOrderData) getOrderData();
    if (getUserData) getUserData();
  }, []);

  const handleSyncClick = async () => {
    toast.info("Syncing showroom catalogues...");
    await triggerSync();
    toast.success("Catalogue sync complete!");
  };

  const filteredInventory = product ? product.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <Tabs defaultIndex={0}>

        {/* Tab Headers */}
        <div className="bg-gray-100/80 dark:bg-gray-950 p-4 border-b border-gray-200 dark:border-gray-800">
          <TabList className="flex flex-wrap gap-2 text-xs font-extrabold">
            <Tab className="px-5 py-3 rounded-2xl cursor-pointer outline-none transition-all selected:bg-[#800020] selected:text-white bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm">
              📸 Showroom Albums ({catalogues.length})
            </Tab>
            <Tab className="px-5 py-3 rounded-2xl cursor-pointer outline-none transition-all selected:bg-[#800020] selected:text-white bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm">
              👗 Live Inventory ({product ? product.length : 0})
            </Tab>
            <Tab className="px-5 py-3 rounded-2xl cursor-pointer outline-none transition-all selected:bg-[#800020] selected:text-white bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm">
              📩 Customer Enquiries ({enquiries ? enquiries.length : 0})
            </Tab>
            <Tab className="px-5 py-3 rounded-2xl cursor-pointer outline-none transition-all selected:bg-[#800020] selected:text-white bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm">
              ⚙️ Store Settings
            </Tab>
          </TabList>
        </div>

        {/* Tab 1: Showroom Catalogues */}
        <TabPanel className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                Showroom Catalogue Sources
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Last Verified Sync: {lastVerifiedAt ? new Date(lastVerifiedAt).toLocaleString() : 'Just now'}
              </p>
            </div>

            <button
              onClick={handleSyncClick}
              disabled={loading}
              className="bg-[#800020] hover:bg-[#67001a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 text-[#D4AF37] ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? "Syncing Cloud..." : "Trigger Catalogue Refresh"}</span>
            </button>
          </div>

          {/* Sync Stats Summary Box */}
          {syncStats && (
            <div className="bg-amber-50/80 dark:bg-gray-800/80 border border-amber-200 dark:border-gray-700 rounded-2xl p-5 text-xs text-gray-700 dark:text-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-gray-500 block">Total Catalogues:</span>
                <span className="font-bold text-gray-900 dark:text-white text-lg">{syncStats.totalCatalogues}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Confirmed In-Stock:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{syncStats.confirmedAvailable}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Detected Removals:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 text-lg">{syncStats.unavailable}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Unknown / Failed:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 text-lg">{syncStats.unknown}</span>
              </div>
            </div>
          )}

          {/* Catalogues Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white uppercase text-[10px] tracking-wider font-extrabold">
                <tr>
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">Catalogue Category</th>
                  <th className="px-5 py-4">Price Range</th>
                  <th className="px-5 py-4">Album Source URLs</th>
                  <th className="px-5 py-4 text-right">Items Synced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-medium">
                {catalogues.map((cat) => {
                  const catItemsCount = product ? product.filter(p => p.catalogueCode === cat.code).length : 0;
                  return (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-5 py-4 font-extrabold text-[#800020] dark:text-[#E5C158]">
                        Cat {cat.code}
                      </td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                        {cat.name}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">
                        {cat.indicativePriceRange}
                      </td>
                      <td className="px-5 py-4 max-w-xs truncate">
                        {cat.albums.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <span>Album {i + 1}</span>
                            <FiExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </td>
                      <td className="px-5 py-4 text-right font-extrabold text-gray-900 dark:text-white text-sm">
                        {catItemsCount} Sarees
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabPanel>

        {/* Tab 2: Live Inventory */}
        <TabPanel className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
              Live Synced Saree Inventory ({filteredInventory.length} Sarees)
            </h2>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by Saree ID or Category..."
                className="w-full pl-9 pr-4 py-2.5 border rounded-2xl text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
              />
              <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 max-h-[70vh] overflow-y-auto">
            <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white uppercase text-[10px] tracking-wider font-extrabold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4">Saree Photo</th>
                  <th className="px-5 py-4">Saree ID / Title</th>
                  <th className="px-5 py-4">Catalogue Category</th>
                  <th className="px-5 py-4">Indicative Range</th>
                  <th className="px-5 py-4">Stock Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-medium">
                {filteredInventory.map((item) => {
                  const isAvailable = item.stockStatus === 'CONFIRMED_AVAILABLE';
                  const isUnknown = item.stockStatus === 'UNKNOWN';

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-5 py-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                          loading="lazy"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold text-gray-900 dark:text-white block">{item.title}</span>
                        <span className="text-[10px] font-mono text-gray-400">ID: {item.id}</span>
                      </td>
                      <td className="px-5 py-3 font-bold text-[#800020] dark:text-[#E5C158]">
                        Cat {item.catalogueCode} - {item.categoryName}
                      </td>
                      <td className="px-5 py-3">
                        {item.indicativePriceRange}
                      </td>
                      <td className="px-5 py-3">
                        {isAvailable ? (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold px-3 py-1 rounded-full text-[10px]">
                            ✓ Live In Stock
                          </span>
                        ) : isUnknown ? (
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-bold px-3 py-1 rounded-full text-[10px]">
                            ? Confirm Stock
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 font-bold px-3 py-1 rounded-full text-[10px]">
                            ✕ Removed / Sold Out
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabPanel>

        {/* Tab 3: Customer Enquiries */}
        <TabPanel className="p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
            Customer Availability & Price Enquiries ({enquiries ? enquiries.length : 0})
          </h2>

          {!enquiries || enquiries.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-xs font-medium">
              No customer availability enquiries received yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
              <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white uppercase text-[10px] tracking-wider font-extrabold">
                  <tr>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Customer Info</th>
                    <th className="px-5 py-4">Requested Saree</th>
                    <th className="px-5 py-4">Message</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action / WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-medium">
                  {enquiries.map((enq) => {
                    const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '919746998785';
                    const whatsappMsg = `Hello ${enq.customerName || 'Customer'}, regarding your enquiry for ${enq.sareeTitle || 'Saree'} (ID: ${enq.sareeId}) at Vastraa (Lakshmi Stores): `;

                    return (
                      <tr key={enq.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-5 py-4 whitespace-nowrap text-gray-500">
                          {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-gray-900 dark:text-white block">{enq.customerName}</span>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 block font-semibold">📞 {enq.phone}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {enq.imageUrl && (
                              <img src={enq.imageUrl} alt="" className="w-10 h-12 object-cover rounded-lg border shadow-sm" />
                            )}
                            <div>
                              <span className="font-bold text-gray-900 dark:text-white block">{enq.sareeTitle}</span>
                              <span className="text-[10px] text-gray-400 font-mono">ID: {enq.sareeId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-xs truncate">
                          {enq.message || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={enq.status || "Pending"}
                            onChange={(e) => updateEnquiryStatus(enq.id, e.target.value)}
                            className="text-xs px-3 py-1.5 rounded-xl border font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Fulfilled">Fulfilled</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right space-y-1 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row justify-end items-center">
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-sm transition-all"
                            title="Chat with customer on WhatsApp"
                          >
                            <FiMessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <button
                            onClick={() => deleteEnquiry(enq.id)}
                            className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                            title="Delete Enquiry"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabPanel>

        {/* Tab 4: Store Info */}
        <TabPanel className="p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
            Vastraa Store Settings
          </h2>

          <div className="glass-card p-8 rounded-3xl border border-gray-200 dark:border-gray-800 max-w-2xl space-y-5 text-xs">
            <div>
              <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Store Name:</span>
              <p className="text-base font-bold text-gray-900 dark:text-white">{storeInfo?.name}</p>
            </div>
            <div>
              <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">WhatsApp Hotline:</span>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{storeInfo?.whatsapp}</p>
            </div>
            <div>
              <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">Integration Status:</span>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Live catalogue sync active. Every photo displayed reflects verified silk saree stock.
              </p>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}

export default DashboardTab;
