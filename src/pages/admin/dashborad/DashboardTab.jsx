import React, { useContext, useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import myContext from '../../../context/data/myContext';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiSearch, FiTrash2, FiExternalLink, FiMessageCircle, FiFileText, FiCheck, FiX, FiColumns, FiList, FiShield, FiTruck, FiUserCheck, FiTrendingUp, FiEdit3 } from 'react-icons/fi';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../../../firebase/FirebaseConfig';

const FALLBACK_SAREE_IMG = "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

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
  const [enquiryViewMode, setEnquiryViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [quotationModalEnquiry, setQuotationModalEnquiry] = useState(null);
  const [paymentVerifyModalEnquiry, setPaymentVerifyModalEnquiry] = useState(null);
  const [trackingModalEnquiry, setTrackingModalEnquiry] = useState(null);
  const [itemPrices, setItemPrices] = useState({});
  const [itemAvailabilities, setItemAvailabilities] = useState({});
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  // Customer History & LTV Info for Admin Quotation Editor
  const [customerLtvInfo, setCustomerLtvInfo] = useState({ pastOrdersCount: 0, lifetimeValue: 0, isVip: false });

  // Tracking modal form states (Courier Booked Date instead of Estimated Delivery)
  const [courierName, setCourierName] = useState('');
  const [awbNumber, setAwbNumber] = useState('');
  const [courierBookedDate, setCourierBookedDate] = useState('');

  // Live Inventory Price Editing Modal States
  const [editPriceModalItem, setEditPriceModalItem] = useState(null);
  const [newSareePrice, setNewSareePrice] = useState('');

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

  const openQuotationModal = (enq) => {
    setQuotationModalEnquiry(enq);
    const initialPrices = {};
    const initialAvail = {};
    const items = enq.cartItems || [{ id: enq.sareeId, title: enq.sareeTitle, imageUrl: enq.imageUrl }];
    items.forEach((item, idx) => {
      initialPrices[idx] = item.price || '';
      initialAvail[idx] = true; // default available
    });
    setItemPrices(initialPrices);
    setItemAvailabilities(initialAvail);
    setDiscountPercentage(0);
    setDeliveryCharge(0);

    // Compute customer history & LTV in real-time from enquiries array
    if (enquiries && enquiries.length > 0) {
      const past = enquiries.filter(e => e.id !== enq.id && (e.phone === enq.phone || e.customerName?.toLowerCase() === enq.customerName?.toLowerCase()));
      const pastOrdersCount = past.length;
      const lifetimeValue = past.reduce((sum, e) => sum + (e.quotationDetails?.finalPayable || 0), 0);
      const isVip = pastOrdersCount > 0 || lifetimeValue > 15000;
      setCustomerLtvInfo({ pastOrdersCount, lifetimeValue, isVip });
    } else {
      setCustomerLtvInfo({ pastOrdersCount: 0, lifetimeValue: 0, isVip: false });
    }
  };

  const openTrackingModal = (enq) => {
    setTrackingModalEnquiry(enq);
    setCourierName(enq.trackingDetails?.courierName || '');
    setAwbNumber(enq.trackingDetails?.awbNumber || '');
    setCourierBookedDate(enq.trackingDetails?.courierBookedDate || new Date().toISOString().split('T')[0]);
  };

  const openEditPriceModal = (item) => {
    setEditPriceModalItem(item);
    setNewSareePrice(item.price || item.minPrice || '');
  };

  const handleSaveInventoryPrice = async () => {
    if (!editPriceModalItem) return;
    const priceVal = parseFloat(newSareePrice);
    if (isNaN(priceVal) || priceVal < 0) {
      toast.error("Please enter a valid saree price.");
      return;
    }
    try {
      const productRef = doc(fireDB, 'products', editPriceModalItem.id);
      await updateDoc(productRef, { price: priceVal });
      toast.success(`Updated price for ${editPriceModalItem.title} to ₹${priceVal}!`);
      setEditPriceModalItem(null);
      window.location.reload();
    } catch (err) {
      try {
        await addDoc(collection(fireDB, 'products'), { ...editPriceModalItem, price: priceVal });
        toast.success(`Saved new product price successfully!`);
        setEditPriceModalItem(null);
        window.location.reload();
      } catch (ex) {
        toast.error("Failed to update price: " + ex.message);
      }
    }
  };

  const handlePublishQuotation = async () => {
    if (!quotationModalEnquiry) return;
    try {
      const items = quotationModalEnquiry.cartItems || [{ id: quotationModalEnquiry.sareeId, title: quotationModalEnquiry.sareeTitle, imageUrl: quotationModalEnquiry.imageUrl }];

      let subtotal = 0;
      const evaluatedItems = items.map((item, idx) => {
        const isAvail = itemAvailabilities[idx] !== false;
        const price = parseFloat(itemPrices[idx]) || 0;
        if (isAvail) {
          subtotal += price;
        }
        return {
          ...item,
          isAvailable: isAvail,
          confirmedPrice: price
        };
      });

      const discPct = parseFloat(discountPercentage) || 0;
      const discountAmt = Math.round((subtotal * discPct) / 100);
      const shipping = parseFloat(deliveryCharge) || 0;
      const finalPayable = Math.max(0, subtotal - discountAmt + shipping);

      const enqRef = doc(fireDB, 'enquiries', quotationModalEnquiry.id);
      await updateDoc(enqRef, {
        status: "QUOTATION_READY",
        quotationDetails: {
          items: evaluatedItems,
          subtotal,
          discountType: 'percentage',
          discountValue: discPct,
          discountAmount: discountAmt,
          deliveryCharge: shipping,
          finalPayable,
          publishedAt: new Date().toISOString(),
          version: 1
        }
      });

      // Automated WhatsApp Template Dispatch on Publication
      const cleanPhone = quotationModalEnquiry.phone ? quotationModalEnquiry.phone.replace(/[^0-9]/g, '') : '919746998785';
      const whatsAppMsg = `Hello ${quotationModalEnquiry.customerName || 'Valued Customer'}, your formal Vastraa quotation is ready! Net Payable: ₹${finalPayable}. Please sign in to your customer account to review availability and accept.`;

      await addDoc(collection(fireDB, 'whatsapp_jobs'), {
        recipientPhone: cleanPhone,
        customerName: quotationModalEnquiry.customerName,
        message: whatsAppMsg,
        amount: finalPayable,
        status: 'DISPATCHED_TEMPLATE',
        createdAt: new Date().toISOString()
      });

      toast.success(`Quotation published & WhatsApp template dispatched to ${quotationModalEnquiry.customerName} (${quotationModalEnquiry.phone})!`);
      setQuotationModalEnquiry(null);
      if (getEnquiriesData) getEnquiriesData();
    } catch (err) {
      console.error("Publish quotation error:", err);
      toast.error("Failed to publish quotation: " + err.message);
    }
  };

  const handleVerifyPaymentAndConfirmOrder = async (enq) => {
    try {
      const enqRef = doc(fireDB, 'enquiries', enq.id);
      await updateDoc(enqRef, {
        status: "PAYMENT_VERIFIED_ORDER_CONFIRMED",
        paymentVerifiedAt: new Date().toISOString()
      });
      toast.success("Payment verified successfully! Order confirmed and sent to fulfillment.");
      setPaymentVerifyModalEnquiry(null);
      if (getEnquiriesData) getEnquiriesData();
    } catch (err) {
      toast.error("Failed to verify payment: " + err.message);
    }
  };

  const handleSaveTrackingDetails = async () => {
    if (!trackingModalEnquiry) return;
    if (!courierName.trim() || !awbNumber.trim()) {
      toast.error("Please enter both courier service name and tracking AWB number.");
      return;
    }
    try {
      const enqRef = doc(fireDB, 'enquiries', trackingModalEnquiry.id);
      await updateDoc(enqRef, {
        status: "DISPATCHED",
        trackingDetails: {
          courierName: courierName.trim(),
          awbNumber: awbNumber.trim(),
          courierBookedDate: courierBookedDate.trim(),
          dispatchedAt: new Date().toISOString()
        }
      });
      toast.success("Shipping tracking details saved! Request moved to Dispatched stage.");
      setTrackingModalEnquiry(null);
      if (getEnquiriesData) getEnquiriesData();
    } catch (err) {
      toast.error("Failed to save tracking details: " + err.message);
    }
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
              📩 Quotation Pipeline & Enquiries ({enquiries ? enquiries.length : 0})
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
                  <th className="px-5 py-4">Showcase Price</th>
                  <th className="px-5 py-4">Stock Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
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
                          src={item.imageUrl || FALLBACK_SAREE_IMG}
                          alt={item.title}
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_SAREE_IMG; }}
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
                      <td className="px-5 py-3 font-extrabold text-[#800020] dark:text-[#E5C158]">
                        {item.price ? `₹${Number(item.price).toLocaleString()}` : 'Not Set'}
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
                            ✕ Sold Out
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => openEditPriceModal(item)}
                          className="bg-[#800020] hover:bg-[#67001a] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-xs transition-all inline-flex items-center gap-1"
                        >
                          <FiEdit3 className="w-3 h-3 text-[#D4AF37]" />
                          <span>Edit Price</span>
                        </button>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
              Quotation Pipeline & Customer Requests ({enquiries ? enquiries.length : 0})
            </h2>

            {/* View Mode Toggle: Kanban vs Table */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEnquiryViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  enquiryViewMode === 'kanban' ? 'bg-[#800020] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                <FiColumns className="w-3.5 h-3.5" />
                <span>Kanban Pipeline</span>
              </button>
              <button
                onClick={() => setEnquiryViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  enquiryViewMode === 'table' ? 'bg-[#800020] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                }`}
              >
                <FiList className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>

          {!enquiries || enquiries.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-xs font-medium">
              No customer availability enquiries or bag reviews received yet.
            </div>
          ) : enquiryViewMode === 'kanban' ? (
            /* 6-STAGE HORIZONTAL SCROLLABLE KANBAN PIPELINE BOARD */
            <div className="flex overflow-x-auto gap-5 pb-6 pt-2 px-1 snap-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {['Pending Review', 'QUOTATION_DRAFT', 'QUOTATION_READY', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED_ORDER_CONFIRMED', 'DISPATCHED'].map((colStatus, cIdx) => {
                const colTitles = {
                  'Pending Review': '1. Pending Review',
                  'QUOTATION_DRAFT': '2. Quotation Drafted',
                  'QUOTATION_READY': '3. Published (Ready)',
                  'PAYMENT_PENDING': '4. Awaiting Payment',
                  'PAYMENT_VERIFIED_ORDER_CONFIRMED': '5. Ready for Dispatch',
                  'DISPATCHED': '6. Dispatched'
                };

                const headerBorders = {
                  'Pending Review': 'border-t-4 border-t-[#800020]',
                  'QUOTATION_DRAFT': 'border-t-4 border-t-amber-500',
                  'QUOTATION_READY': 'border-t-4 border-t-blue-600',
                  'PAYMENT_PENDING': 'border-t-4 border-t-emerald-600',
                  'PAYMENT_VERIFIED_ORDER_CONFIRMED': 'border-t-4 border-t-purple-600',
                  'DISPATCHED': 'border-t-4 border-t-indigo-600'
                };

                const colEnquiries = enquiries.filter(enq => {
                  const s = enq.status || 'Pending';
                  if (colStatus === 'Pending Review') return s === 'Pending' || s === 'Pending Review';
                  if (colStatus === 'QUOTATION_DRAFT') return s === 'QUOTATION_DRAFT';
                  if (colStatus === 'QUOTATION_READY') return s === 'QUOTATION_READY';
                  if (colStatus === 'PAYMENT_PENDING') return s === 'PAYMENT_PENDING' || s === 'QUOTATION_ACCEPTED';
                  if (colStatus === 'PAYMENT_VERIFIED_ORDER_CONFIRMED') return s === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || s === 'READY_FOR_DISPATCH';
                  if (colStatus === 'DISPATCHED') return s === 'DISPATCHED' || enq.trackingDetails;
                  return false;
                });

                return (
                  <div key={cIdx} className={`bg-gray-50/90 dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 space-y-3 w-80 flex-shrink-0 snap-start shadow-sm ${headerBorders[colStatus]}`}>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-serif font-bold text-xs text-gray-900 dark:text-white">
                        {colTitles[colStatus]}
                      </h3>
                      <span className="bg-[#800020] text-[#D4AF37] px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs">
                        {colEnquiries.length}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                      {colEnquiries.length === 0 ? (
                        <p className="text-[11px] text-gray-400 text-center py-8">No requests in this stage</p>
                      ) : (
                        colEnquiries.map(enq => {
                          const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '919746998785';
                          const isAwaitingPayment = enq.status === 'QUOTATION_ACCEPTED' || enq.status === 'PAYMENT_PENDING';
                          const isConfirmedOrVerified = enq.status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || enq.status === 'READY_FOR_DISPATCH';
                          const isDispatched = enq.status === 'DISPATCHED' || enq.trackingDetails;

                          return (
                            <div key={enq.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md space-y-3 transition-transform hover:scale-[1.01]">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-gray-900 dark:text-white text-xs">{enq.customerName}</span>
                                <span className="text-[10px] text-gray-400 font-mono">{enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : ''}</span>
                              </div>
                              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">📞 {enq.phone}</p>
                              <div className="text-[11px] text-gray-700 dark:text-gray-200 font-medium line-clamp-2">
                                {enq.sareeTitle}
                              </div>

                              <div className="pt-2.5 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                                {isDispatched ? (
                                  <button
                                    onClick={() => openTrackingModal(enq)}
                                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm flex items-center gap-1.5"
                                    title="Edit Shipping AWB / Tracking"
                                  >
                                    <FiTruck className="text-indigo-200 w-3.5 h-3.5" />
                                    <span>{enq.trackingDetails ? "Edit Tracking" : "Add Tracking"}</span>
                                  </button>
                                ) : isConfirmedOrVerified ? (
                                  <button
                                    onClick={() => openTrackingModal(enq)}
                                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm flex items-center gap-1.5"
                                    title="Add Shipping AWB / Tracking"
                                  >
                                    <FiTruck className="text-indigo-200 w-3.5 h-3.5" />
                                    <span>{enq.trackingDetails ? "Edit Tracking" : "Add Tracking"}</span>
                                  </button>
                                ) : isAwaitingPayment ? (
                                  <button
                                    onClick={() => setPaymentVerifyModalEnquiry(enq)}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm flex items-center gap-1.5"
                                  >
                                    <FiShield className="text-emerald-300 w-3.5 h-3.5" />
                                    <span>Verify Payment</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openQuotationModal(enq)}
                                    className="bg-[#800020] hover:bg-[#67001a] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm flex items-center gap-1.5"
                                  >
                                    <FiFileText className="text-[#D4AF37] w-3.5 h-3.5" />
                                    <span>Review & Quote</span>
                                  </button>
                                )}

                                <a
                                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${enq.customerName}, regarding your Vastraa request: `)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm flex items-center gap-1"
                                  title="WhatsApp Customer"
                                >
                                  <FiMessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
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
                    const isAwaitingPayment = enq.status === 'QUOTATION_ACCEPTED' || enq.status === 'PAYMENT_PENDING';
                    const isConfirmedOrVerified = enq.status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || enq.status === 'READY_FOR_DISPATCH';
                    const isDispatched = enq.status === 'DISPATCHED' || enq.trackingDetails;

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
                          {enq.cartItems && enq.cartItems.length > 0 ? (
                            <div className="space-y-1.5">
                              <span className="font-bold text-gray-900 dark:text-white block">{enq.sareeTitle}</span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {enq.cartItems.map((ci, idx) => {
                                  const liveP = product ? product.find(p => p.id === ci.id) : null;
                                  const imgUrl = liveP?.imageUrl || ci.imageUrl || FALLBACK_SAREE_IMG;
                                  return (
                                    <img
                                      key={idx}
                                      src={imgUrl}
                                      alt=""
                                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_SAREE_IMG; }}
                                      className="w-16 h-20 object-cover rounded-xl border shadow-sm"
                                      title={ci.title}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              {(() => {
                                const liveP = product ? product.find(p => p.id === enq.sareeId) : null;
                                const imgUrl = liveP?.imageUrl || enq.imageUrl || FALLBACK_SAREE_IMG;
                                return (
                                  <img
                                    src={imgUrl}
                                    alt=""
                                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_SAREE_IMG; }}
                                    className="w-20 h-28 object-cover rounded-2xl border shadow-md"
                                  />
                                );
                              })()}
                              <div>
                                <span className="font-bold text-gray-900 dark:text-white block">{enq.sareeTitle}</span>
                                <span className="text-[10px] text-gray-400 font-mono">ID: {enq.sareeId}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 max-w-xs truncate">
                          {enq.message || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            enq.status === 'QUOTATION_READY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {enq.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right space-y-1 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row justify-end items-center">
                          {isDispatched ? (
                            <button
                              onClick={() => openTrackingModal(enq)}
                              className="inline-flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all"
                              title="Edit Tracking"
                            >
                              <FiTruck className="w-3.5 h-3.5 text-indigo-200" />
                              <span>Edit Tracking</span>
                            </button>
                          ) : isConfirmedOrVerified ? (
                            <button
                              onClick={() => openTrackingModal(enq)}
                              className="inline-flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all"
                              title="Add Tracking"
                            >
                              <FiTruck className="w-3.5 h-3.5 text-indigo-200" />
                              <span>Add Tracking</span>
                            </button>
                          ) : isAwaitingPayment ? (
                            <button
                              onClick={() => setPaymentVerifyModalEnquiry(enq)}
                              className="inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all"
                              title="Verify Payment"
                            >
                              <FiShield className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Verify Payment</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => openQuotationModal(enq)}
                              className="inline-flex items-center gap-1 bg-[#800020] hover:bg-[#67001a] text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all"
                              title="Review & Prepare Quotation"
                            >
                              <FiFileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Review & Quote</span>
                            </button>
                          )}
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all"
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

        {/* Tab 4: Store Settings */}
        <TabPanel className="p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
            Store & Payment Configuration
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block font-bold">Store Brand Name:</span>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">{storeInfo?.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">Co-Brand Association:</span>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">{storeInfo?.coBrand}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">Showroom Location:</span>
                <span className="text-gray-900 dark:text-white font-semibold">{storeInfo?.location}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">Customer Hotline / WhatsApp:</span>
                <span className="text-gray-900 dark:text-white font-semibold">{storeInfo?.phone}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">Verified UPI Payee Name:</span>
                <span className="text-gray-900 dark:text-white font-semibold text-emerald-600 dark:text-emerald-400">Srinath Rajkiran</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">Verified UPI ID:</span>
                <span className="text-gray-900 dark:text-white font-semibold text-emerald-600 dark:text-emerald-400">srinathrajkiran007-2@okaxis</span>
              </div>
            </div>
          </div>
        </TabPanel>

      </Tabs>

      {/* Admin Quotation Editor Modal */}
      {quotationModalEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setQuotationModalEnquiry(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#800020] dark:text-[#E5C158] uppercase">
                Admin Quotation Editor
              </span>
              <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                Review Request: {quotationModalEnquiry.customerName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                WhatsApp: {quotationModalEnquiry.phone} | Submitted: {quotationModalEnquiry.createdAt ? new Date(quotationModalEnquiry.createdAt).toLocaleString() : 'Recent'}
              </p>
            </div>

            {/* Customer History & Lifetime Value (LTV) Summary Card */}
            <div className="bg-[#FAF7F0] dark:bg-gray-800 p-4 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-serif font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
                  <FiUserCheck className="text-[#800020] dark:text-[#C6A15B]" />
                  <span>Customer Profile & Lifetime Value (LTV)</span>
                </span>
                <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  customerLtvInfo.isVip ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {customerLtvInfo.isVip ? "⭐ Repeat VIP Customer" : "🌱 First-Time Buyer"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-gray-500 block">Total Past Orders:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white text-sm">{customerLtvInfo.pastOrdersCount} Orders</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Lifetime Order Value (LTV):</span>
                  <span className="font-extrabold text-[#800020] dark:text-[#E5C158] text-sm">₹{customerLtvInfo.lifetimeValue}</span>
                </div>
              </div>

              {/* Smart Discount Recommendation Banner */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                  💡 {customerLtvInfo.lifetimeValue > 50000 ? "Suggested: Wedding VIP Discount (15%)" : customerLtvInfo.lifetimeValue > 15000 || customerLtvInfo.pastOrdersCount > 0 ? "Suggested: VIP Customer Discount (10%)" : "Suggested: Welcome Discount (5%)"}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDiscountPercentage(customerLtvInfo.lifetimeValue > 50000 ? 15 : customerLtvInfo.lifetimeValue > 15000 || customerLtvInfo.pastOrdersCount > 0 ? 10 : 5)}
                    className="bg-[#800020] hover:bg-[#67001a] text-amber-100 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-xs flex items-center gap-1"
                  >
                    <FiTrendingUp className="text-[#C6A15B]" />
                    <span>Apply Suggested ({customerLtvInfo.lifetimeValue > 50000 ? '15%' : customerLtvInfo.lifetimeValue > 15000 || customerLtvInfo.pastOrdersCount > 0 ? '10%' : '5%'})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Items review table */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Item-Level Availability & Pricing
              </h4>
              <div className="space-y-3">
                {(quotationModalEnquiry.cartItems || [{ id: quotationModalEnquiry.sareeId, title: quotationModalEnquiry.sareeTitle, imageUrl: quotationModalEnquiry.imageUrl }]).map((item, idx) => {
                  const liveP = product ? product.find(p => p.id === item.id) : null;
                  const itemImgUrl = liveP?.imageUrl || item.imageUrl || FALLBACK_SAREE_IMG;
                  return (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={itemImgUrl}
                          alt=""
                          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_SAREE_IMG; }}
                          className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-2xl shadow-md border border-gray-200 flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block text-sm">{item.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {item.id}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <select
                          value={itemAvailabilities[idx] !== false ? "available" : "unavailable"}
                          onChange={(e) => setItemAvailabilities({ ...itemAvailabilities, [idx]: e.target.value === 'available' })}
                          className="text-xs px-3 py-2 rounded-xl border font-bold bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                        >
                          <option value="available">✓ Available</option>
                          <option value="unavailable">✕ Unavailable</option>
                        </select>

                        {itemAvailabilities[idx] !== false && (
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs text-gray-400">₹</span>
                            <input
                              type="number"
                              min="0"
                              placeholder="Unit Price"
                              value={itemPrices[idx] || ''}
                              onChange={(e) => setItemPrices({ ...itemPrices, [idx]: e.target.value })}
                              className="w-28 text-xs pl-7 pr-3 py-2 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart-level discount (% only) & delivery */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cart Discount Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Confirmed Delivery Charges (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(e.target.value)}
                  placeholder="0 for Free Shipping"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Live Calculation Summary Preview */}
            <div className="bg-amber-50/80 dark:bg-gray-800/80 p-4 rounded-2xl border border-amber-200 dark:border-gray-700 space-y-2 text-xs">
              {(() => {
                const items = quotationModalEnquiry.cartItems || [{ id: quotationModalEnquiry.sareeId, title: quotationModalEnquiry.sareeTitle }];
                let subtotal = 0;
                items.forEach((item, idx) => {
                  if (itemAvailabilities[idx] !== false) {
                    subtotal += parseFloat(itemPrices[idx]) || 0;
                  }
                });
                const discPct = parseFloat(discountPercentage) || 0;
                const discountAmt = Math.round((subtotal * discPct) / 100);
                const shipping = parseFloat(deliveryCharge) || 0;
                const finalPayable = Math.max(0, subtotal - discountAmt + shipping);

                return (
                  <>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Available Items Subtotal:</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Discount Amount ({discPct}%):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">- ₹{discountAmt}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Delivery Charges:</span>
                      <span className="font-bold text-gray-900 dark:text-white">₹{shipping}</span>
                    </div>
                    <div className="pt-2 border-t border-amber-200 dark:border-gray-700 flex justify-between font-serif font-extrabold text-sm text-gray-900 dark:text-white">
                      <span>Net Payable Amount:</span>
                      <span className="text-base text-[#800020] dark:text-[#E5C158]">₹{finalPayable}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setQuotationModalEnquiry(null)}
                className="px-5 py-3 border text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel / Close
              </button>

              <button
                type="button"
                onClick={handlePublishQuotation}
                className="bg-[#800020] hover:bg-[#67001a] text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Publish Quotation to Customer</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin Payment Verification Modal */}
      {paymentVerifyModalEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200 dark:border-gray-800 space-y-6">
            <button
              onClick={() => setPaymentVerifyModalEnquiry(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1">
                <FiShield /> Manual Payment Verification
              </span>
              <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white mt-1">
                Order for: {paymentVerifyModalEnquiry.customerName}
              </h3>
              <p className="text-xs text-gray-500">
                Phone: {paymentVerifyModalEnquiry.phone}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-gray-800 p-4 rounded-2xl border border-amber-200 dark:border-gray-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Net Payable Amount:</span>
                <span className="font-extrabold text-[#800020] dark:text-[#E5C158] text-sm">
                  ₹{paymentVerifyModalEnquiry.quotationDetails?.finalPayable || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Store UPI Payee:</span>
                <span className="font-bold text-gray-900 dark:text-white">Srinath Rajkiran (srinathrajkiran007-2@okaxis)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer UTR Reference:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {paymentVerifyModalEnquiry.paymentReference || "Awaiting UTR / Cash Transfer"}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Please verify that you have received the exact amount in the store's bank or UPI account matching the customer's transfer reference before confirming this order.
            </p>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setPaymentVerifyModalEnquiry(null)}
                className="px-5 py-3 border text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleVerifyPaymentAndConfirmOrder(paymentVerifyModalEnquiry)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4 text-emerald-300" />
                <span>Verify Payment & Confirm Order</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin Tracking Details Modal (Courier Booked Date) */}
      {trackingModalEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200 dark:border-gray-800 space-y-6">
            <button
              onClick={() => setTrackingModalEnquiry(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1">
                <FiTruck /> Enter Shipping & Tracking Details
              </span>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mt-1">
                Customer: {trackingModalEnquiry.customerName}
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Courier Name / Service *
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Blue Dart / DTDC / Speed Post"
                  className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Tracking AWB / Consignment Number *
                </label>
                <input
                  type="text"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  placeholder="e.g. DLVH987654321"
                  className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Courier Booked Date (Dispatch Date) *
                </label>
                <input
                  type="date"
                  value={courierBookedDate}
                  onChange={(e) => setCourierBookedDate(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setTrackingModalEnquiry(null)}
                className="px-5 py-3 border text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveTrackingDetails}
                className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4 text-indigo-200" />
                <span>Save & Dispatch Order</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Inventory Saree Price Modal */}
      {editPriceModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-200 dark:border-gray-800 space-y-4">
            <button
              onClick={() => setEditPriceModalItem(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#800020] dark:text-[#E5C158] uppercase">
                Update Inventory Price
              </span>
              <h3 className="font-serif font-bold text-base text-gray-900 dark:text-white mt-0.5 line-clamp-1">
                {editPriceModalItem.title}
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">ID: {editPriceModalItem.id}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Individual Showcase Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs text-gray-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={newSareePrice}
                    onChange={(e) => setNewSareePrice(e.target.value)}
                    placeholder="e.g. 12499"
                    className="w-full text-xs pl-7 pr-3 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Catalogue Range: {editPriceModalItem.indicativePriceRange}
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setEditPriceModalItem(null)}
                className="px-4 py-2.5 border text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInventoryPrice}
                className="bg-[#800020] hover:bg-[#67001a] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <FiCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Save Price</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardTab;
