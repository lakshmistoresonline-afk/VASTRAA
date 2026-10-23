import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import Loader from '../../components/loader/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import { FiShoppingBag, FiFileText, FiCheckCircle, FiShield, FiTruck, FiHelpCircle, FiArrowRight, FiRotateCcw } from 'react-icons/fi';

const FALLBACK_SAREE_IMG = "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

function PurchaseJourney() {
  const context = useContext(MyContext);
  const { loading, setLoading } = context;

  const [myEnquiries, setMyEnquiries] = useState([]);
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem('user'));
  const userEmail = authUser?.user?.email?.trim().toLowerCase();
  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');

  useEffect(() => {
    async function fetchMyJourneyData() {
      if (!userEmail) return;
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(fireDB, 'enquiries'));
        const list = [];
        querySnapshot.forEach((d) => {
          const data = d.data();
          const enqEmail = (data.customerEmail || data.email || '').trim().toLowerCase();
          if (enqEmail === userEmail) {
            list.push({ id: d.id, ...data });
          }
        });
        setMyEnquiries(list);
      } catch (err) {
        console.error("Error fetching customer journey data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyJourneyData();
  }, [userEmail]);

  // Determine smart next action based on actual state
  let primaryActionText = "Browse Sarees";
  let primaryActionRoute = "/allproducts";
  let primaryActionSub = "Explore our 9 Live Silk Saree Catalogues";

  const activeEnq = myEnquiries.length > 0 ? myEnquiries[0] : null;

  if (activeEnq) {
    const status = activeEnq.status || 'Pending';
    if (status === 'QUOTATION_READY' && activeEnq.quotationDetails) {
      primaryActionText = "Review Quotation";
      primaryActionRoute = "/order";
      primaryActionSub = "Showroom confirmed prices ready for your acceptance";
    } else if (status === 'QUOTATION_ACCEPTED') {
      primaryActionText = "Continue to Payment";
      primaryActionRoute = "/order";
      primaryActionSub = "Scan store UPI QR and submit UTR reference";
    } else if (status === 'PAYMENT_PENDING') {
      primaryActionText = "View Payment Status";
      primaryActionRoute = "/order";
      primaryActionSub = "Payment reference submitted — awaiting admin verification";
    } else if (status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || status === 'READY_FOR_DISPATCH') {
      primaryActionText = "View Order Status";
      primaryActionRoute = "/order";
      primaryActionSub = "Payment verified and order confirmed for dispatch";
    } else if (status === 'DISPATCHED' || activeEnq.trackingDetails) {
      primaryActionText = "Track Shipment";
      primaryActionRoute = "/order";
      primaryActionSub = "Order dispatched with courier AWB tracking details";
    } else {
      primaryActionText = "View Request Status";
      primaryActionRoute = "/order";
      primaryActionSub = "Showroom reviewing availability and prices";
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
          Vastraa • Assisted Shopping Onboarding
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F7F0E4]">
          My Purchase Journey
        </h1>
        <p className="text-xs text-amber-200/80 mt-2 max-w-xl mx-auto">
          Welcome back{authUser?.user?.email ? `, ${authUser.user.email}` : ''}! Track your silk saree selections from showroom review to doorstep delivery.
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
            <Link
              to={primaryActionRoute}
              className="flex-1 sm:flex-initial bg-[#800020] hover:bg-[#4A071B] text-amber-100 font-bold px-7 py-3.5 rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 border border-[#C6A15B]/40"
            >
              <span>{primaryActionText}</span>
              <FiArrowRight className="w-4 h-4 text-[#C6A15B]" />
            </Link>

            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-5 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-gray-300 dark:border-gray-700"
            >
              <FiHelpCircle className="w-4 h-4 text-[#800020] dark:text-[#C6A15B]" />
              <span>{showGuide ? "Hide Purchase Guide" : "View 6-Stage Guide"}</span>
            </button>
          </div>
        </div>

        {/* 6-Stage Purchase Guide (Collapsible or Toggleable) */}
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
                <p className="text-gray-500">Browse our 9 live handloom silk saree catalogues (A–I) curated from authentic showroom collections.</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">2</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Submit Cart</h4>
                <p className="text-gray-500">Add favorite sarees to your cart and submit your bag for showroom review. Cart submission does not require upfront payment.</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">3</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Showroom Review & Quote</h4>
                <p className="text-gray-500">Our team inspects physical availability, confirms unit prices, applies any cart discounts, and publishes a formal quotation.</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">4</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Quotation Acceptance</h4>
                <p className="text-gray-500">Review available items, confirmed prices, and net payable totals. Click Accept to confirm your delivery address.</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">5</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Payment Verification</h4>
                <p className="text-gray-500">Scan the store UPI QR code to pay the exact payable amount, then submit your UTR reference for manual bank verification.</p>
              </div>

              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border space-y-1.5 shadow-xs">
                <span className="w-6 h-6 rounded-full bg-[#800020] text-[#D4AF37] font-bold flex items-center justify-center text-xs">6</span>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Order Dispatch & Tracking</h4>
                <p className="text-gray-500">Once payment is verified, your order is packed and dispatched with real-time courier AWB tracking details.</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Requests & Progress Trackers */}
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
            Your Active Requests & Quotations ({myEnquiries.length})
          </h3>

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
              {myEnquiries.map((enq) => {
                const status = enq.status || 'Pending';
                const hasTracking = Boolean(enq.trackingDetails);
                const currentStage = getStageIndex(status, hasTracking);
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
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-bold px-3.5 py-1.5 rounded-full text-xs">
                          Status: {status}
                        </span>
                        {qDetails && (
                          <p className="text-xs font-extrabold text-[#800020] dark:text-[#E5C158] mt-1.5">
                            Net Payable: ₹{qDetails.finalPayable}
                          </p>
                        )}
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

                    <div className="pt-2 flex justify-end">
                      <Link
                        to="/order"
                        className="inline-flex items-center gap-1.5 bg-[#800020] hover:bg-[#67001a] text-amber-100 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
                      >
                        <span>Open Order Tracker & Actions →</span>
                      </Link>
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
