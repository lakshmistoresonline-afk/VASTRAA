import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import Loader from '../../components/loader/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, getDocsFromServer } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import { FiShoppingBag, FiFileText, FiCheckCircle, FiShield, FiTruck, FiHelpCircle, FiArrowRight, FiCheck, FiX, FiMessageCircle, FiSearch } from 'react-icons/fi';
import UpiQrCode from '../../components/payment/UpiQrCode';
import { sendAutomatedWhatsAppNotification, getWhatsAppDispatchUrl } from '../../services/whatsappService';

const FALLBACK_SAREE_IMG = "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

function PurchaseJourney() {
  const context = useContext(MyContext);
  const { loading, setLoading, product } = context;

  const [myEnquiries, setMyEnquiries] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const [utrInput, setUtrInput] = useState({});
  const [journeySearchTerm, setJourneySearchTerm] = useState('');
  const [journeyStatusFilter, setJourneyStatusFilter] = useState('');
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem('user'));
  const userEmail = authUser?.user?.email?.trim().toLowerCase();
  const userUid = authUser?.user?.uid;
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

  const fetchEnquiries = async () => {
    if (!userEmail && !userUid) return;
    try {
      setLoading(true);

      // Fetch user's registered WhatsApp phone number for robust multi-criteria matching
      let userPhone = '';
      try {
        let usersSnap;
        try {
          usersSnap = await getDocsFromServer(collection(fireDB, 'users'));
        } catch {
          usersSnap = await getDocs(collection(fireDB, 'users'));
        }
        usersSnap.forEach((docSnap) => {
          const uData = docSnap.data();
          if ((userEmail && uData.email?.trim().toLowerCase() === userEmail) || (userUid && uData.uid === userUid)) {
            if (uData.whatsapp) userPhone = uData.whatsapp.replace(/[^0-9]/g, '');
          }
        });
      } catch (uErr) {
        console.warn("Could not fetch user profile for phone matching:", uErr);
      }

      // Force fresh server read to prevent stale offline cache on login/refresh
      let querySnapshot;
      try {
        querySnapshot = await getDocsFromServer(collection(fireDB, 'enquiries'));
      } catch {
        querySnapshot = await getDocs(collection(fireDB, 'enquiries'));
      }

      const list = [];
      querySnapshot.forEach((d) => {
        const data = d.data();
        const enqEmail = (data.customerEmail || data.email || '').trim().toLowerCase();
        const enqUid = data.customerUid;
        const enqPhone = (data.phone || '').replace(/[^0-9]/g, '');

        const matchesEmail = userEmail && enqEmail === userEmail;
        const matchesUid = userUid && enqUid === userUid;
        const matchesPhone = userPhone && enqPhone && enqPhone === userPhone;

        if (matchesEmail || matchesUid || matchesPhone) {
          list.push({ id: d.id, ...data });
        }
      });
      setMyEnquiries(list);
    } catch (err) {
      console.error("Error fetching customer journey data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [userEmail, userUid]);

  const handleCustomerResponse = async (enqId, responseType) => {
    try {
      setLoading(true);
      const enqRef = doc(fireDB, 'enquiries', enqId);
      await updateDoc(enqRef, {
        status: responseType === 'accept' ? 'QUOTATION_ACCEPTED' : 'QUOTATION_DECLINED',
        customerResponseAt: new Date().toISOString()
      });
      toast.success(responseType === 'accept' ? "Quotation accepted! Please complete payment via store QR code below." : "Quotation declined.");
      fetchEnquiries();
    } catch (err) {
      toast.error("Failed to update response: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUtrSubmit = async (enqId) => {
    const refText = utrInput[enqId];
    if (!refText || refText.trim() === '') {
      toast.error("Please enter your UPI reference or UTR number.");
      return;
    }
    try {
      setLoading(true);
      const enqRef = doc(fireDB, 'enquiries', enqId);
      await updateDoc(enqRef, {
        status: 'PAYMENT_PENDING',
        paymentReference: refText.trim(),
        paymentSubmittedAt: new Date().toISOString()
      });

      // Dispatch automated WhatsApp alert to store admin 9746998785 on customer payment submission
      const adminWhatsAppMsg = `💳 CUSTOMER PAYMENT SUBMITTED!\nCustomer: ${authUser?.user?.name || userEmail}\nPhone: ${userEmail}\nUTR/Ref: ${refText.trim()}\nPlease verify payment in Admin Control Panel!`;
      await sendAutomatedWhatsAppNotification("919746998785", adminWhatsAppMsg, {
        type: "CUSTOMER_PAYMENT_SUBMITTED",
        autoOpenWindow: true
      });

      toast.success("Payment reference submitted for admin verification!");
      fetchEnquiries();
    } catch (err) {
      toast.error("Failed to submit payment reference: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerStageWhatsAppMessage = (enq) => {
    const status = enq.status || 'Pending';
    const ref = enq.message ? enq.message.split('.')[0] : (enq.id || 'VASTRAA-REQ');

    if (status === 'QUOTATION_READY' && enq.quotationDetails) {
      return `Hello Vastraa team, I am reviewing my quotation for ${ref} (Net Payable: ₹${enq.quotationDetails.finalPayable}). I have a question regarding my order.`;
    }
    if (status === 'QUOTATION_ACCEPTED' || status === 'PAYMENT_PENDING') {
      const utr = enq.paymentReference ? ` (UTR: ${enq.paymentReference})` : '';
      return `Hello Vastraa team, I am following up on my payment${utr} for order ${ref}. Please confirm payment receipt.`;
    }
    if (status === 'DISPATCHED' || enq.trackingDetails) {
      return `Hello Vastraa team, I am following up on the courier shipment tracking for my order ${ref}.`;
    }
    return `Hello Vastraa team, I am following up on my saree review request ${ref} (${enq.customerName || userEmail}).`;
  };

  // Determine smart next action based on actual state
  let primaryActionText = "Browse Sarees";
  let primaryActionRoute = "/allproducts";
  let primaryActionSub = "Explore our 9 Live Silk Saree Catalogues";

  const activeEnq = myEnquiries.length > 0 ? myEnquiries[0] : null;

  if (activeEnq) {
    const status = activeEnq.status || 'Pending';
    if (status === 'QUOTATION_READY' && activeEnq.quotationDetails) {
      primaryActionText = "Review Quotation Below";
      primaryActionRoute = "#requests-section";
      primaryActionSub = "Online store confirmed prices ready for your acceptance";
    } else if (status === 'QUOTATION_ACCEPTED') {
      primaryActionText = "Complete Payment Below";
      primaryActionRoute = "#requests-section";
      primaryActionSub = "Scan store UPI QR and submit UTR reference";
    } else if (status === 'PAYMENT_PENDING') {
      primaryActionText = "View Payment Status";
      primaryActionRoute = "#requests-section";
      primaryActionSub = "Payment reference submitted — awaiting admin verification";
    } else if (status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || status === 'READY_FOR_DISPATCH') {
      primaryActionText = "View Order Status";
      primaryActionRoute = "#requests-section";
      primaryActionSub = "Payment verified and order confirmed for dispatch";
    } else if (status === 'DISPATCHED' || activeEnq.trackingDetails) {
      primaryActionText = "Track Shipment";
      primaryActionRoute = "#requests-section";
      primaryActionSub = "Order dispatched with courier AWB tracking details";
    } else {
      primaryActionText = "View Request Status";
      primaryActionRoute = "#requests-section";
      primaryActionSub = "Online store reviewing availability and prices";
    }
  } else if (cartItems.length > 0) {
    primaryActionText = "Continue to Cart";
    primaryActionRoute = "/cart";
    primaryActionSub = "You have selected sarees waiting in your cart";
  }

  // 6-stage helper
  const getStageIndex = (status, hasTracking) => {
    if (status === 'DISPATCHED' || hasTracking) return 5;
    if (status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || status === 'READY_FOR_DISPATCH') return 4;
    if (status === 'QUOTATION_ACCEPTED' || status === 'PAYMENT_PENDING') return 4;
    if (status === 'QUOTATION_READY') return 3;
    if (status === 'Pending' || status === 'QUOTATION_DRAFT') return 2;
    return 1;
  };

  return (
    <Layout>
      {loading && <Loader />}

      {/* Hero Banner */}
      <div className="bg-[#4A071B] text-amber-50 py-12 px-4 text-center border-b-4 border-[#C6A15B]">
        <span className="text-[#C6A15B] font-bold text-xs uppercase tracking-widest block mb-1">
          Vastraa • Customer Purchase Journey & Tracker
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F7F0E4]">
          My Purchase Journey & Order Tracker
        </h1>
        <p className="text-xs text-amber-200/80 mt-2 max-w-xl mx-auto">
          Welcome back{authUser?.user?.email ? `, ${authUser.user.email}` : ''}! Track your silk saree selections, quotations, payments, and dispatch tracking in one place.
        </p>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">

        {/* Smart Next Action Banner */}
        <div className="glass-card bg-gradient-to-br from-white to-[#FAF7F0] dark:from-gray-900 dark:to-gray-800 p-8 rounded-3xl border border-[#C6A15B]/30 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <span className="bg-[#800020] text-[#D4AF37] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase">
              Recommended Next Step
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 dark:text-white">
              {primaryActionText}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {primaryActionSub}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {primaryActionRoute.startsWith('#') ? (
              <a
                href={primaryActionRoute}
                className="flex-1 sm:flex-initial bg-[#800020] hover:bg-[#4A071B] text-amber-100 font-bold px-7 py-3.5 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 border border-[#C6A15B]/40"
              >
                <span>{primaryActionText}</span>
                <FiArrowRight className="w-4 h-4 text-[#C6A15B]" />
              </a>
            ) : (
              <Link
                to={primaryActionRoute}
                className="flex-1 sm:flex-initial bg-[#800020] hover:bg-[#4A071B] text-amber-100 font-bold px-7 py-3.5 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 border border-[#C6A15B]/40"
              >
                <span>{primaryActionText}</span>
                <FiArrowRight className="w-4 h-4 text-[#C6A15B]" />
              </Link>
            )}

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-5 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-gray-300 dark:border-gray-700"
            >
              <FiHelpCircle className="w-4 h-4 text-[#800020] dark:text-[#C6A15B]" />
              <span>{showGuide ? "Hide Purchase Guide" : "View 6-Stage Guide"}</span>
            </button>
          </div>
        </div>

        {/* 6-Stage Purchase Guide */}
        {showGuide && (
          <div className="bg-[#FAF7F0] dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 shadow-md space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white">
                How Vastraa Assisted Shopping Works
              </h3>
              <button onClick={() => setShowGuide(false)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">
                ✕ Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">1</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Explore Sarees</h4>
                <p className="text-gray-500">Browse our 9 live handloom silk saree catalogues (A–I) curated from authentic online collections.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">2</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Submit Cart</h4>
                <p className="text-gray-500">Add favorite sarees to your cart and submit your bag for online review. Cart submission does not require upfront payment.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">3</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Online Stock Review</h4>
                <p className="text-gray-500">Our team inspects physical saree availability, applies any cart discounts, and confirms order totals.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">4</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Order Acceptance</h4>
                <p className="text-gray-500">Review available items, confirmed order totals, and click Accept to confirm your delivery address.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">5</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Payment Verification</h4>
                <p className="text-gray-500">Scan the store UPI QR code to pay the exact payable amount, then submit your UTR reference for manual bank verification.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">6</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Order Dispatch & Tracking</h4>
                <p className="text-gray-500">Once payment is verified, your order is packed and dispatched with real-time courier AWB tracking details.</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Requests & Full Order / Quotation Tracker Section */}
        <div id="requests-section" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
              Your Active Requests & Quotations ({myEnquiries.length})
            </h3>
          </div>

          {/* Item 3: Customer Request Search & Status Filter Bar */}
          {myEnquiries.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 shadow-md flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
              {/* Search Input */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  value={journeySearchTerm}
                  onChange={(e) => setJourneySearchTerm(e.target.value)}
                  placeholder="Search by saree title or ref..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-[#FAF7F0] dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
                />
                <FiSearch className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setJourneyStatusFilter('')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] ${
                    !journeyStatusFilter ? 'bg-[#800020] text-amber-100 shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All ({myEnquiries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setJourneyStatusFilter('READY')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] ${
                    journeyStatusFilter === 'READY' ? 'bg-[#800020] text-amber-100 shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Ready for Review
                </button>
                <button
                  type="button"
                  onClick={() => setJourneyStatusFilter('AWAITING_PAYMENT')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] ${
                    journeyStatusFilter === 'AWAITING_PAYMENT' ? 'bg-[#800020] text-amber-100 shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Awaiting Payment
                </button>
                <button
                  type="button"
                  onClick={() => setJourneyStatusFilter('DISPATCHED')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] ${
                    journeyStatusFilter === 'DISPATCHED' ? 'bg-[#800020] text-amber-100 shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Dispatched & Tracked
                </button>
              </div>
            </div>
          )}

          {myEnquiries.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 text-center space-y-4 shadow-sm">
              <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-gray-800 dark:text-white font-bold text-base">No Active Purchase Requests Found</p>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Explore our 9 live handloom silk saree catalogues and submit your cart for review to begin your purchase journey.
              </p>
              <div className="pt-2">
                <Link to="/allproducts" className="inline-block bg-[#800020] text-amber-100 px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#67001a] transition-all">
                  Browse Silk Sarees →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {myEnquiries.filter((enq) => {
                if (!journeySearchTerm) return true;
                const term = journeySearchTerm.toLowerCase().trim();
                return (enq.sareeTitle || '').toLowerCase().includes(term) ||
                       (enq.message || '').toLowerCase().includes(term) ||
                       (enq.id || '').toLowerCase().includes(term);
              }).filter((enq) => {
                if (!journeyStatusFilter) return true;
                const s = enq.status || 'Pending';
                if (journeyStatusFilter === 'READY') return s === 'QUOTATION_READY';
                if (journeyStatusFilter === 'AWAITING_PAYMENT') return s === 'QUOTATION_ACCEPTED' || s === 'PAYMENT_PENDING';
                if (journeyStatusFilter === 'DISPATCHED') return s === 'DISPATCHED' || Boolean(enq.trackingDetails);
                return true;
              }).map((enq) => {
                const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '919746998785';
                const status = enq.status || 'Pending';
                const hasTracking = Boolean(enq.trackingDetails);
                const currentStage = getStageIndex(status, hasTracking);
                const isReady = status === 'QUOTATION_READY' && enq.quotationDetails;
                const isAccepted = status === 'QUOTATION_ACCEPTED';
                const isPaymentPending = status === 'PAYMENT_PENDING';
                const isVerified = status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED';
                const isDispatched = status === 'DISPATCHED' || hasTracking;
                const qDetails = enq.quotationDetails;

                const stages = [
                  "Choose Sarees",
                  "Submit Cart",
                  "Showroom Review",
                  "Quotation Acceptance",
                  "Payment Verification",
                  "Dispatch & Tracking"
                ];

                return (
                  <div key={enq.id} className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 shadow-lg space-y-6">

                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-[10px] font-bold text-[#800020] dark:text-[#E5C158] uppercase tracking-wider block">
                          Request Reference: {enq.message ? enq.message.split('.')[0] : enq.id}
                        </span>
                        <h4 className="font-serif font-bold text-gray-900 dark:text-white text-base">
                          {enq.sareeTitle}
                        </h4>
                        <p className="text-[11px] text-gray-400">
                          Submitted: {enq.createdAt ? new Date(enq.createdAt).toLocaleString() : 'Recent'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          isDispatched ? 'bg-indigo-700 text-white' :
                          isVerified ? 'bg-emerald-600 text-white' :
                          isAccepted || isPaymentPending ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                          isReady ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {isDispatched ? "📦 Order Dispatched & In Transit" :
                           isVerified ? "✓ Order Confirmed & Payment Verified" :
                           isPaymentPending ? "⏳ Payment Under Admin Verification" :
                           isAccepted ? "✓ Quotation Accepted" :
                           isReady ? "⭐ Quotation Ready for Review" : `Status: ${status}`}
                        </span>
                      </div>
                    </div>

                    {/* 6-Stage Visual Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <span>Stage {currentStage} of 6</span>
                        <span className="text-[#800020] dark:text-[#E5C158]">{stages[currentStage - 1]}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {stages.map((stName, sIdx) => {
                          const stepNum = sIdx + 1;
                          const isDone = stepNum < currentStage;
                          const isCurrent = stepNum === currentStage;
                          return (
                            <div key={sIdx} className="space-y-1">
                              <div className={`h-2 rounded-full transition-all ${
                                isDone ? 'bg-emerald-600' : isCurrent ? 'bg-[#800020] animate-pulse' : 'bg-gray-200 dark:bg-gray-800'
                              }`} />
                              <span className={`block text-[9px] font-semibold truncate ${
                                isCurrent ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-400'
                              }`}>
                                {stName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping & Tracking Details (If Dispatched) */}
                    {isDispatched && enq.trackingDetails && (
                      <div className="bg-indigo-50 dark:bg-gray-800/90 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-3 text-xs">
                        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-sm">
                          <FiTruck className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                          <span>Shipment & Courier Tracking Details</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                          <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Courier Service</span>
                            <span className="font-bold text-gray-900 dark:text-white text-sm">{enq.trackingDetails.courierName}</span>
                          </div>
                          <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">AWB / Consignment ID</span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm select-all">{enq.trackingDetails.awbNumber}</span>
                          </div>
                          <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border">
                            <span className="text-gray-500 block text-[10px] uppercase font-bold">Courier Booked Date</span>
                            <span className="font-bold text-gray-900 dark:text-white text-sm">{enq.trackingDetails.courierBookedDate || 'Recently Dispatched'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        Requested Sarees & Availability
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(enq.cartItems || [{ id: enq.sareeId, title: enq.sareeTitle, imageUrl: enq.imageUrl }]).map((item, idx) => {
                          const evaluated = qDetails?.items?.[idx];
                          const liveP = product ? product.find(p => p.id === item.id) : null;
                          const imgUrl = liveP?.imageUrl || item.imageUrl || FALLBACK_SAREE_IMG;

                          return (
                            <div key={idx} className="bg-[#FAF7F0] dark:bg-gray-800/80 p-4 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={imgUrl}
                                  alt={item.title}
                                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_SAREE_IMG; }}
                                  className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-2xl shadow-md border border-[#E9E1D5] flex-shrink-0"
                                />
                                <div className="space-y-1">
                                  <span className="font-serif font-bold text-xs text-gray-900 dark:text-white line-clamp-2">{item.title}</span>
                                  <span className="text-[10px] text-gray-500 font-mono block">ID: {item.id}</span>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                {evaluated ? (
                                  <div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${evaluated.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                      {evaluated.isAvailable ? "Available" : "Unavailable"}
                                    </span>
                                    <p className="text-sm font-extrabold text-[#800020] dark:text-[#E5C158] mt-1.5">
                                      {evaluated.isAvailable ? `₹${evaluated.confirmedPrice}` : "Excluded"}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">Awaiting Price</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quotation Calculation Summary (If Published) */}
                    {isReady && qDetails && (
                      <div className="bg-amber-50/90 dark:bg-gray-800/90 p-5 rounded-2xl border border-amber-200 dark:border-gray-700 space-y-2.5 text-xs">
                        <div className="flex justify-between text-gray-600 dark:text-gray-300 font-medium">
                          <span>Available Items Subtotal:</span>
                          <span className="font-bold text-gray-900 dark:text-white">₹{qDetails.subtotal}</span>
                        </div>

                        <div className="flex justify-between text-gray-600 dark:text-gray-300 font-medium">
                          <span>Admin Discount ({qDetails.discountType === 'percentage' ? `${qDetails.discountValue}%` : `Fixed ₹${qDetails.discountValue}`}):</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">- ₹{qDetails.discountAmount}</span>
                        </div>

                        <div className="flex justify-between text-gray-600 dark:text-gray-300 font-medium">
                          <span>Confirmed Delivery Charges:</span>
                          <span className="font-bold text-gray-900 dark:text-white">{qDetails.deliveryCharge > 0 ? `₹${qDetails.deliveryCharge}` : 'FREE (₹0)'}</span>
                        </div>

                        <div className="pt-3 border-t border-amber-200 dark:border-gray-700 flex justify-between items-center font-serif font-extrabold text-base text-[#24211F] dark:text-white">
                          <span>Net Payable Amount:</span>
                          <span className="text-xl text-[#800020] dark:text-[#E5C158]">₹{qDetails.finalPayable}</span>
                        </div>

                        {!isAccepted && !isPaymentPending && !isVerified && !isDispatched && (
                          <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => handleCustomerResponse(enq.id, 'accept')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                            >
                              <FiCheck className="w-4 h-4" />
                              <span>Accept Quotation & Confirm Address</span>
                            </button>

                            <button
                              onClick={() => handleCustomerResponse(enq.id, 'decline')}
                              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                            >
                              <FiX className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* QR Payment & UTR Submission (If Accepted) */}
                    {(isAccepted || isPaymentPending || isVerified || isDispatched) && qDetails && !isVerified && !isDispatched && (
                      <div className="bg-emerald-50 dark:bg-gray-800 p-6 rounded-2xl border border-emerald-200 dark:border-gray-700 space-y-4 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                          <FiShield className="w-5 h-5" />
                          <span>Store QR Code Payment Instructions</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <UpiQrCode amount={qDetails.finalPayable} />

                          <div className="space-y-3">
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              Scan the store QR code using any UPI app (Google Pay, PhonePe, Paytm) to pay exactly <span className="font-bold text-[#800020] dark:text-[#E5C158]">₹{qDetails.finalPayable}</span>. Then enter your UTR / Transaction Reference below.
                            </p>

                            {isPaymentPending ? (
                              <div className="bg-amber-100 text-amber-900 p-3.5 rounded-xl font-bold text-center">
                                ⏳ Payment Reference Submitted. Awaiting Admin Verification.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                                  UPI / UTR Transaction Reference *
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={utrInput[enq.id] || ''}
                                    onChange={(e) => setUtrInput({ ...utrInput, [enq.id]: e.target.value })}
                                    placeholder="e.g. UPI/432198765432"
                                    className="flex-1 px-3.5 py-2.5 rounded-xl border dark:bg-gray-900 dark:border-gray-700 dark:text-white font-mono"
                                  />
                                  <button
                                    onClick={() => handleUtrSubmit(enq.id)}
                                    className="bg-[#800020] hover:bg-[#67001a] text-white px-5 py-2.5 rounded-xl font-bold shadow-sm"
                                  >
                                    Submit UTR
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Follow-up */}
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-mono">Ref: {enq.message ? enq.message.split('.')[0] : enq.id}</span>
                      <a
                        href={getWhatsAppDispatchUrl("919746998785", getCustomerStageWhatsAppMessage(enq))}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                        title="Contact Store Hotline on WhatsApp (Stage Pre-Filled Draft)"
                      >
                        <FiMessageCircle className="w-4 h-4" />
                        <span>Contact Store on WhatsApp</span>
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}

export default PurchaseJourney;
