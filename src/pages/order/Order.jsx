import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import Loader from '../../components/loader/Loader';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiClock, FiFileText, FiMessageCircle, FiCheck, FiX } from 'react-icons/fi';

const FALLBACK_SAREE_IMG = "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

const Order = () => {
  const context = useContext(MyContext);
  const { loading, setLoading, order } = context;

  const [firestoreEnquiries, setFirestoreEnquiries] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(fireDB, 'enquiries'));
      const list = [];
      querySnapshot.forEach((d) => {
        const data = d.data();
        // If user is logged in, show their enquiries or all for demo convenience
        list.push({ id: d.id, ...data });
      });
      setFirestoreEnquiries(list);
    } catch (err) {
      console.error("Error fetching enquiries from Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleCustomerResponse = async (enqId, responseType) => {
    try {
      setLoading(true);
      const enqRef = doc(fireDB, 'enquiries', enqId);
      await updateDoc(enqRef, {
        status: responseType === 'accept' ? 'QUOTATION_ACCEPTED' : 'QUOTATION_DECLINED',
        customerResponseAt: new Date().toISOString()
      });
      toast.success(responseType === 'accept' ? "Quotation accepted! Proceeding to address confirmation & payment." : "Quotation declined.");
      fetchEnquiries();
    } catch (err) {
      toast.error("Failed to update response: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {loading && <Loader />}

      <div className="bg-[#4A071B] text-amber-50 py-10 px-4 text-center border-b-4 border-[#C6A15B]">
        <span className="text-[#C6A15B] font-bold text-xs uppercase tracking-widest block mb-1">
          Vastraa • Customer Tracker & Quotations
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F7F0E4]">
          Your Submitted Bag Reviews & Quotations
        </h1>
        <p className="text-xs text-amber-200/80 mt-1">
          Review availability, confirmed item prices, cart discounts, and net payable totals.
        </p>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl min-h-[60vh]">
        {firestoreEnquiries && firestoreEnquiries.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-white mb-4">
              Submitted Requests & Published Quotations ({firestoreEnquiries.length})
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {firestoreEnquiries.map((enq) => {
                const isReady = enq.status === 'QUOTATION_READY' && enq.quotationDetails;
                const isAccepted = enq.status === 'QUOTATION_ACCEPTED';
                const qDetails = enq.quotationDetails;

                return (
                  <div
                    key={enq.id}
                    className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-md border border-[#E9E1D5] dark:border-gray-800 space-y-5"
                  >
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-[10px] font-extrabold text-[#800020] dark:text-[#E5C158] uppercase tracking-wider">
                          Enquiry / Bag Submission
                        </span>
                        <h3 className="font-serif font-bold text-gray-900 dark:text-white text-base">
                          {enq.customerName || "Customer"} — <span className="font-mono text-xs text-gray-500">{enq.phone}</span>
                        </h3>
                        <p className="text-[11px] text-gray-400">
                          Submitted: {enq.createdAt ? new Date(enq.createdAt).toLocaleString() : 'Recent'}
                        </p>
                      </div>

                      <div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                          isAccepted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                          isReady ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {isAccepted ? "✓ Quotation Accepted" : isReady ? "⭐ Quotation Ready for Review" : `Status: ${enq.status || "Pending"}`}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                        Requested Sarees & Availability
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(enq.cartItems || [{ id: enq.sareeId, title: enq.sareeTitle, imageUrl: enq.imageUrl }]).map((item, idx) => {
                          const evaluated = qDetails?.items?.[idx];
                          return (
                            <div key={idx} className="bg-[#FAF7F0] dark:bg-gray-800/80 p-3.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.imageUrl || FALLBACK_SAREE_IMG}
                                  alt=""
                                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_SAREE_IMG; }}
                                  className="w-12 h-16 object-cover rounded-xl border shadow-xs"
                                />
                                <div>
                                  <span className="font-serif font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{item.title}</span>
                                  <span className="text-[10px] text-gray-500">ID: {item.id}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                {evaluated ? (
                                  <div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${evaluated.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                      {evaluated.isAvailable ? "Available" : "Unavailable"}
                                    </span>
                                    <p className="text-xs font-extrabold text-[#800020] dark:text-[#E5C158] mt-1">
                                      {evaluated.isAvailable ? `₹${evaluated.confirmedPrice}` : "Excluded"}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">Awaiting Price</span>
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

                        {!isAccepted && (
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

                    {/* WhatsApp Follow-up */}
                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-mono">Ref: {enq.message ? enq.message.split('.')[0] : enq.id}</span>
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello Vastraa team, I am following up on my bag review request (${enq.customerName}).`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        <FiMessageCircle className="w-4 h-4" />
                        <span>Contact Store on WhatsApp</span>
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 text-gray-500 text-sm space-y-4 shadow-sm">
            <FiFileText className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-base font-bold text-gray-800 dark:text-white">No Submitted Bag Reviews Found</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Add sarees to your cart and submit your bag for admin review to receive formal itemized quotations here.
            </p>
            <div className="pt-2">
              <Link to="/allproducts" className="inline-block bg-[#800020] text-amber-100 px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#67001a] transition-all">
                Browse Silk Sarees →
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Order;
