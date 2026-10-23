import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import Loader from '../../components/loader/Loader';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiClock, FiFileText, FiMessageCircle, FiCheck, FiX, FiShield } from 'react-icons/fi';

const FALLBACK_SAREE_IMG = "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

const Order = () => {
  const context = useContext(MyContext);
  const { loading, setLoading, product } = context;

  const [firestoreEnquiries, setFirestoreEnquiries] = useState([]);
  const [utrInput, setUtrInput] = useState({});

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(fireDB, 'enquiries'));
      const list = [];
      querySnapshot.forEach((d) => {
        const data = d.data();
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
      toast.success("Payment reference submitted for admin verification!");
      fetchEnquiries();
    } catch (err) {
      toast.error("Failed to submit payment reference: " + err.message);
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
                const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '919746998785';
                const isReady = enq.status === 'QUOTATION_READY' && enq.quotationDetails;
                const isAccepted = enq.status === 'QUOTATION_ACCEPTED';
                const isPaymentPending = enq.status === 'PAYMENT_PENDING';
                const isVerified = enq.status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED';
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
                          isVerified ? 'bg-emerald-600 text-white' :
                          isAccepted || isPaymentPending ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' :
                          isReady ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {isVerified ? "✓ Order Confirmed & Payment Verified" :
                           isPaymentPending ? "⏳ Payment Under Admin Verification" :
                           isAccepted ? "✓ Quotation Accepted" :
                           isReady ? "⭐ Quotation Ready for Review" : `Status: ${enq.status || "Pending"}`}
                        </span>
                      </div>
                    </div>

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

                        {!isAccepted && !isPaymentPending && !isVerified && (
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
                    {(isAccepted || isPaymentPending || isVerified) && qDetails && (
                      <div className="bg-emerald-50 dark:bg-gray-800 p-6 rounded-2xl border border-emerald-200 dark:border-gray-700 space-y-4 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                          <FiShield className="w-5 h-5" />
                          <span>Store QR Code Payment Instructions</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border text-center space-y-2">
                            <div className="w-36 h-36 bg-gray-100 dark:bg-gray-800 rounded-xl mx-auto flex flex-col items-center justify-center border p-2 shadow-inner">
                              <span className="font-serif font-extrabold text-[#800020] dark:text-[#E5C158] text-base">VASTRAA</span>
                              <span className="text-[10px] text-gray-500 font-mono mt-1">UPI QR CODE</span>
                              <span className="text-[11px] font-bold text-gray-900 dark:text-white mt-1">₹{qDetails.finalPayable}</span>
                            </div>
                            <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200">
                              Payee: Srinath Rajkiran
                            </p>
                            <p className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold select-all">
                              UPI ID: srinathrajkiran007-2@okaxis
                            </p>
                          </div>

                          <div className="space-y-3">
                            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                              Scan the store QR code using any UPI app (Google Pay, PhonePe, Paytm) to pay exactly <span className="font-bold text-[#800020] dark:text-[#E5C158]">₹{qDetails.finalPayable}</span>. Then enter your UTR / Transaction Reference below.
                            </p>

                            {isVerified ? (
                              <div className="bg-emerald-600 text-white p-3.5 rounded-xl font-bold text-center">
                                ✓ Payment Verified & Order Confirmed!
                              </div>
                            ) : isPaymentPending ? (
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
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello Vastraa team, I am following up on my bag review request (${enq.customerName}).`)}` }
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
