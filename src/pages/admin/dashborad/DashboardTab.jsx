import React, { useContext, useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import myContext from '../../../context/data/myContext';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiSearch, FiTrash2, FiExternalLink, FiMessageCircle, FiFileText, FiCheck, FiX, FiColumns, FiList, FiShield, FiTruck, FiUserCheck, FiTrendingUp, FiEdit3, FiFilter } from 'react-icons/fi';
import { doc, updateDoc, addDoc, collection, getDocs } from 'firebase/firestore';
import { fireDB } from '../../../firebase/FirebaseConfig';
import SareeImageThumbnail from '../../../components/SareeImageThumbnail';
import { sendAutomatedWhatsAppNotification, getWhatsAppDispatchUrl } from '../../../services/whatsappService';

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
    deleteEnquiry,
    storeInfo,
    loading,
    setLoading
  } = context;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(''); // Default: '' (All Collections)
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('');
  const [activeQuickTab, setActiveQuickTab] = useState('ALL');
  const [adminSortPrice, setAdminSortPrice] = useState(''); // '', 'asc', 'desc'

  const [adminInventoryPage, setAdminInventoryPage] = useState(1);
  const [adminItemsPerPage, setAdminItemsPerPage] = useState(25);

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

  // Item 3: Automated WhatsApp Notification Logs State
  const [whatsappLogs, setWhatsappLogs] = useState([]);

  // Item 4: Bulk Category Price Adjustment Modal State
  const [bulkPriceModalOpen, setBulkPriceModalOpen] = useState(false);
  const [bulkCategoryCode, setBulkCategoryCode] = useState('A');
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState('set_range'); // 'set_range', 'add_flat', 'sub_flat', 'add_percent'
  const [bulkAdjustmentAmount, setBulkAdjustmentAmount] = useState(500);
  const [bulkMinPrice, setBulkMinPrice] = useState(24000);
  const [bulkMaxPrice, setBulkMaxPrice] = useState(28000);

  const kanbanRef = React.useRef(null);

  useEffect(() => {
    if (getEnquiriesData) getEnquiriesData();
    if (getOrderData) getOrderData();
    if (getUserData) getUserData();

    async function fetchWhatsAppLogs() {
      try {
        const qSnap = await getDocs(collection(fireDB, 'whatsapp_jobs'));
        const logs = [];
        qSnap.forEach(d => {
          logs.push({ id: d.id, ...d.data() });
        });
        logs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setWhatsappLogs(logs);
      } catch (err) {
        console.warn("WhatsApp logs fetch notice:", err.message);
      }
    }
    fetchWhatsAppLogs();
  }, [getEnquiriesData, getOrderData, getUserData]);

  // Auto-scroll Kanban board to latest active stage column
  useEffect(() => {
    if (enquiries && enquiries.length > 0 && kanbanRef.current) {
      let maxActiveCol = 0;
      enquiries.forEach((enq) => {
        const s = enq.status || 'Pending';
        let colIdx = 0;
        if (s === 'DISPATCHED' || enq.trackingDetails) colIdx = 5;
        else if (s === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || s === 'READY_FOR_DISPATCH') colIdx = 4;
        else if (s === 'PAYMENT_PENDING' || s === 'QUOTATION_ACCEPTED') colIdx = 3;
        else if (s === 'QUOTATION_READY') colIdx = 2;
        else if (s === 'QUOTATION_DRAFT') colIdx = 1;

        if (colIdx > maxActiveCol) maxActiveCol = colIdx;
      });

      if (maxActiveCol > 0) {
        const timer = setTimeout(() => {
          if (kanbanRef.current) {
            kanbanRef.current.scrollTo({ left: maxActiveCol * 320, behavior: 'smooth' });
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [enquiries, enquiryViewMode]);

  const handleSyncClick = async () => {
    toast.info("Syncing online catalogues...");
    await triggerSync();
    toast.success("Catalogue sync complete!");
  };

  const openQuotationModal = async (enq) => {
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

    // Compute customer history, LTV & Referral Wallet Credits in real-time
    let walletBal = 0;
    let refCode = '';
    let refBy = '';

    try {
      const uSnap = await getDocs(collection(fireDB, 'users'));
      uSnap.forEach((uDoc) => {
        const uData = uDoc.data();
        const enqEmail = (enq.customerEmail || enq.email || '').trim().toLowerCase();
        const cleanP = (enq.phone || '').replace(/[^0-9]/g, '');
        if ((enqEmail && uData.email?.trim().toLowerCase() === enqEmail) || (cleanP && uData.whatsapp === cleanP)) {
          walletBal = uData.referralWalletBalance || 0;
          refCode = uData.referralCode || '';
          refBy = uData.referredByCode || '';
        }
      });
    } catch (uErr) {
      console.warn("User wallet lookup notice:", uErr.message);
    }

    if (enquiries && enquiries.length > 0) {
      const past = enquiries.filter(e => e.id !== enq.id && (e.phone === enq.phone || e.customerName?.toLowerCase() === enq.customerName?.toLowerCase()));
      const pastOrdersCount = past.length;
      const lifetimeValue = past.reduce((sum, e) => sum + (e.quotationDetails?.finalPayable || 0), 0);
      const isVip = pastOrdersCount > 0 || lifetimeValue > 15000;
      setCustomerLtvInfo({ pastOrdersCount, lifetimeValue, isVip, walletBal, refCode, refBy });
    } else {
      setCustomerLtvInfo({ pastOrdersCount: 0, lifetimeValue: 0, isVip: false, walletBal, refCode, refBy });
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

    const items = quotationModalEnquiry.cartItems || [{ id: quotationModalEnquiry.sareeId, title: quotationModalEnquiry.sareeTitle, imageUrl: quotationModalEnquiry.imageUrl }];

    // Validate that every available item has a valid numeric price > 0
    let hasAvailableItem = false;
    let hasInvalidPrice = false;

    items.forEach((item, idx) => {
      const isAvail = itemAvailabilities[idx] === true;
      const rawP = itemPrices[idx];
      const p = parseFloat(rawP);

      if (isAvail) {
        hasAvailableItem = true;
        if (isNaN(p) || p <= 0) {
          hasInvalidPrice = true;
        }
      }
    });

    if (!hasAvailableItem) {
      toast.error("Please mark at least one saree as confirmed available before publishing quotation.");
      return;
    }

    if (hasInvalidPrice) {
      toast.error("Please enter a valid positive price (> ₹0) for all confirmed available sarees.");
      return;
    }

    const discPct = parseFloat(discountPercentage) || 0;
    if (isNaN(discPct) || discPct < 0 || discPct > 100) {
      toast.error("Invalid discount percentage. Must be between 0% and 100%.");
      return;
    }

    const shipping = parseFloat(deliveryCharge) || 0;
    if (isNaN(shipping) || shipping < 0) {
      toast.error("Invalid delivery charge. Cannot be negative.");
      return;
    }

    const waPopup = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null;

    try {
      let subtotal = 0;
      const evaluatedItems = items.map((item, idx) => {
        const isAvail = itemAvailabilities[idx] === true;
        const price = isAvail ? (parseFloat(itemPrices[idx]) || 0) : 0;
        if (isAvail) {
          subtotal += price;
        }
        return {
          ...item,
          isAvailable: isAvail,
          confirmedPrice: price
        };
      });

      const discountAmt = Math.round((subtotal * discPct) / 100);
      const finalPayable = Math.max(0, subtotal - discountAmt + shipping);
      const nextVersion = (quotationModalEnquiry.quotationDetails?.version || 0) + 1;

      const enqRef = doc(fireDB, 'enquiries', quotationModalEnquiry.id);
      await updateDoc(enqRef, {
        status: "QUOTATION_READY",
        updatedAt: new Date().toISOString(),
        quotationDetails: {
          items: evaluatedItems,
          subtotal,
          discountType: 'percentage',
          discountValue: discPct,
          discountAmount: discountAmt,
          deliveryCharge: shipping,
          finalPayable,
          publishedAt: new Date().toISOString(),
          version: nextVersion
        }
      });

      // Automated WhatsApp Template Dispatch on Publication
      const cleanPhone = quotationModalEnquiry.phone ? quotationModalEnquiry.phone.replace(/[^0-9]/g, '') : '919746998785';
      const whatsAppMsg = `Hello ${quotationModalEnquiry.customerName || 'Valued Customer'}, your formal Vastraa quotation is ready! Net Payable: ₹${finalPayable}. Please sign in to your customer account to review availability and accept.`;
      const waUrl = getWhatsAppDispatchUrl(cleanPhone, whatsAppMsg);

      if (waPopup && !waPopup.closed) {
        waPopup.location.href = waUrl;
      }

      await sendAutomatedWhatsAppNotification(cleanPhone, whatsAppMsg, {
        customerName: quotationModalEnquiry.customerName,
        type: "QUOTATION_READY",
        autoOpenWindow: false
      });

      toast.success(`Quotation published & WhatsApp template dispatched to ${quotationModalEnquiry.customerName} (${cleanPhone})!`);
      setQuotationModalEnquiry(null);
      if (getEnquiriesData) getEnquiriesData();
    } catch (err) {
      console.error("Publish quotation error:", err);
      toast.error("Failed to publish quotation: " + err.message);
    }
  };

  const handleVerifyPaymentAndConfirmOrder = async (enq) => {
    const waPopup = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null;

    try {
      const enqRef = doc(fireDB, 'enquiries', enq.id);
      await updateDoc(enqRef, {
        status: "PAYMENT_VERIFIED_ORDER_CONFIRMED",
        paymentVerifiedAt: new Date().toISOString()
      });

      // Automated WhatsApp Dispatch to Customer on Payment Verification
      const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '919746998785';
      const whatsAppMsg = `✓ Hello ${enq.customerName || 'Valued Customer'}, your payment for Vastraa order (Ref: ${enq.message ? enq.message.split('.')[0] : enq.id}) has been verified successfully! Your order is confirmed and sent for express fulfillment.`;
      const waUrl = getWhatsAppDispatchUrl(cleanPhone, whatsAppMsg);

      if (waPopup && !waPopup.closed) {
        waPopup.location.href = waUrl;
      }

      await sendAutomatedWhatsAppNotification(cleanPhone, whatsAppMsg, {
        customerName: enq.customerName,
        type: "PAYMENT_VERIFIED",
        autoOpenWindow: false
      });

      // Referrer Reward Calculation: If customer was referred by someone, credit 1% of net payable to Referrer Wallet
      const finalPayableAmt = enq.quotationDetails?.finalPayable || 0;
      const cleanCustomerEmail = (enq.customerEmail || enq.email || '').trim().toLowerCase();

      try {
        const usersSnap = await getDocs(collection(fireDB, 'users'));
        let customerUserDoc = null;
        let customerUserDocId = null;

        usersSnap.forEach((uDoc) => {
          const uData = uDoc.data();
          if (cleanCustomerEmail && uData.email?.trim().toLowerCase() === cleanCustomerEmail) {
            customerUserDoc = uData;
            customerUserDocId = uDoc.id;
          }
        });

        if (customerUserDoc && customerUserDoc.referredByCode) {
          const referrerCode = customerUserDoc.referredByCode.trim().toUpperCase();
          const rewardAmount = Math.max(10, Math.round((finalPayableAmt * 1) / 100)); // 1% of net order value

          let referrerDoc = null;
          let referrerDocId = null;

          usersSnap.forEach((uDoc) => {
            const uData = uDoc.data();
            if (uData.referralCode?.trim().toUpperCase() === referrerCode) {
              referrerDoc = uData;
              referrerDocId = uDoc.id;
            }
          });

          if (referrerDoc && referrerDocId) {
            const currentBal = Number(referrerDoc.referralWalletBalance) || 0;
            const newBal = currentBal + rewardAmount;
            const currentReferredCount = Number(referrerDoc.referredCount) || 0;

            await updateDoc(doc(fireDB, 'users', referrerDocId), {
              referralWalletBalance: newBal,
              referredCount: currentReferredCount + 1
            });

            // Dispatch automated WhatsApp notification to the Referrer
            const referrerPhone = referrerDoc.whatsapp ? referrerDoc.whatsapp.replace(/[^0-9]/g, '') : '919746998785';
            const referrerMsg = `🎉 Congratulations ${referrerDoc.name || 'Valued Customer'}! Your friend ${enq.customerName || 'Customer'} completed a Vastraa saree order of ₹${finalPayableAmt.toLocaleString()}. 1% Saree Reward Credits (+₹${rewardAmount}) have been added to your Vastraa wallet! Total Balance: ₹${newBal.toLocaleString()}.`;

            await sendAutomatedWhatsAppNotification(referrerPhone, referrerMsg, {
              customerName: referrerDoc.name,
              type: "REFERRAL_CREDIT_EARNED",
              autoOpenWindow: false
            });

            console.log(`✓ Credited 1% reward (₹${rewardAmount}) to referrer ${referrerDoc.name} (${referrerCode})`);
          }

          if (customerUserDocId) {
            await updateDoc(doc(fireDB, 'users', customerUserDocId), {
              isFirstOrderCompleted: true
            });
          }
        }
      } catch (refErr) {
        console.warn("Referral credit calculation notice:", refErr.message);
      }

      toast.success("Payment verified & automated WhatsApp confirmation sent!");
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

    const waPopup = typeof window !== 'undefined' ? window.open('about:blank', '_blank') : null;

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

      // Automated WhatsApp Dispatch to Customer on Order Dispatch
      const cleanPhone = trackingModalEnquiry.phone ? trackingModalEnquiry.phone.replace(/[^0-9]/g, '') : '919746998785';
      const whatsAppMsg = `📦 Hello ${trackingModalEnquiry.customerName || 'Valued Customer'}, your Vastraa silk saree order has been dispatched via ${courierName.trim()}! Tracking AWB: ${awbNumber.trim()}. Booked Date: ${courierBookedDate}. Track live in your Purchase Journey portal!`;
      const waUrl = getWhatsAppDispatchUrl(cleanPhone, whatsAppMsg);

      if (waPopup && !waPopup.closed) {
        waPopup.location.href = waUrl;
      }

      await sendAutomatedWhatsAppNotification(cleanPhone, whatsAppMsg, {
        customerName: trackingModalEnquiry.customerName,
        type: "ORDER_DISPATCHED",
        autoOpenWindow: false
      });

      toast.success("Shipping details saved & automated WhatsApp tracking dispatched!");
      setTrackingModalEnquiry(null);
      if (getEnquiriesData) getEnquiriesData();
    } catch (err) {
      toast.error("Failed to save tracking details: " + err.message);
    }
  };

  function getNonLinearShuffledPrice(idString, minP, maxP) {
    let num = 0;
    for (let i = 0; i < idString.length; i++) {
      num = (num * 31 + idString.charCodeAt(i)) >>> 0;
    }
    num ^= num >>> 16;
    num = Math.imul(num, 0x85ebca6b) >>> 0;
    num ^= num >>> 13;
    num = Math.imul(num, 0xc2b2ae35) >>> 0;
    num ^= num >>> 16;

    const range = maxP - minP;
    if (range <= 0) return minP;
    const steps = Math.floor(range / 50);
    const stepIndex = num % (steps + 1);
    return minP + (stepIndex * 50);
  }

  // Item 4: Handle Bulk Category Price & Min-Max Range Adjustment
  const handleBulkPriceUpdate = async () => {
    const targetCat = catalogues.find(c => c.code === bulkCategoryCode);
    if (!targetCat) return;

    const itemsToUpdate = product ? product.filter(p => p.catalogueCode === bulkCategoryCode) : [];
    if (itemsToUpdate.length === 0) {
      toast.error(`No sarees found in Catalogue Cat ${bulkCategoryCode}.`);
      return;
    }

    try {
      setLoading(true);
      const val = parseFloat(bulkAdjustmentAmount) || 0;
      let count = 0;

      for (const item of itemsToUpdate) {
        let currentP = Number(item.price) || item.minPrice || 0;
        let newP = currentP;

        if (bulkAdjustmentType === 'set_range') {
          const minP = parseFloat(bulkMinPrice) || 1000;
          const maxP = parseFloat(bulkMaxPrice) || minP;
          newP = getNonLinearShuffledPrice(item.id, minP, maxP);
        } else if (bulkAdjustmentType === 'add_flat') {
          newP = currentP + val;
        } else if (bulkAdjustmentType === 'sub_flat') {
          newP = Math.max(0, currentP - val);
        } else if (bulkAdjustmentType === 'add_percent') {
          newP = currentP + Math.round((currentP * val) / 100);
        }

        // Round to nearest 50
        newP = Math.round(newP / 50) * 50;

        try {
          const productRef = doc(fireDB, 'products', item.id);
          await updateDoc(productRef, {
            price: newP,
            minPrice: bulkAdjustmentType === 'set_range' ? parseFloat(bulkMinPrice) : item.minPrice,
            maxPrice: bulkAdjustmentType === 'set_range' ? parseFloat(bulkMaxPrice) : item.maxPrice
          });
        } catch {
          await addDoc(collection(fireDB, 'products'), {
            ...item,
            price: newP,
            minPrice: bulkAdjustmentType === 'set_range' ? parseFloat(bulkMinPrice) : item.minPrice,
            maxPrice: bulkAdjustmentType === 'set_range' ? parseFloat(bulkMaxPrice) : item.maxPrice
          });
        }
        count++;
      }

      toast.success(`Updated prices for ${count} sarees in Cat ${bulkCategoryCode} successfully!`);
      setBulkPriceModalOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error("Bulk price update error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Stage-Specific Drafted WhatsApp Message Generator
  const getStageSpecificWhatsAppMessage = (enq) => {
    const customerName = enq.customerName || 'Valued Customer';
    const status = enq.status || 'Pending';
    const orderRef = enq.message ? enq.message.split('.')[0] : (enq.id || 'VASTRAA-ORDER');

    if (status === 'QUOTATION_READY' && enq.quotationDetails) {
      const amount = enq.quotationDetails.finalPayable || 0;
      return `Hello ${customerName}, your formal Vastraa quotation for ${orderRef} is ready! Net Payable: ₹${amount.toLocaleString()}. Please sign in to your customer account under "Purchase Journey" to review and accept.`;
    }

    if (status === 'QUOTATION_ACCEPTED') {
      const amount = enq.quotationDetails?.finalPayable || 0;
      return `Hello ${customerName}, your quotation for Vastraa order ${orderRef} (Net Payable: ₹${amount.toLocaleString()}) has been accepted! Please complete payment via our store UPI QR code and submit your UTR reference in your account.`;
    }

    if (status === 'PAYMENT_PENDING') {
      const utr = enq.paymentReference || 'Submitted';
      return `Hello ${customerName}, we received your UPI/UTR payment reference (${utr}) for Vastraa order ${orderRef}. Our accounts team is currently verifying the payment.`;
    }

    if (status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || status === 'READY_FOR_DISPATCH') {
      return `✓ Hello ${customerName}, your payment for Vastraa order ${orderRef} has been verified successfully! Your order is confirmed and sent for express handloom packing and dispatch.`;
    }

    if (status === 'DISPATCHED' || enq.trackingDetails) {
      const courier = enq.trackingDetails?.courierName || 'Express Courier';
      const awb = enq.trackingDetails?.awbNumber || 'In Transit';
      const date = enq.trackingDetails?.courierBookedDate || 'Today';
      return `📦 Hello ${customerName}, your Vastraa silk saree order ${orderRef} has been dispatched via ${courier}! Tracking AWB: ${awb}. Booked Date: ${date}. Track live in your Purchase Journey portal!`;
    }

    // Default Stage 1 / Stage 2 (Pending Stock Review)
    return `Hello ${customerName}, we have received your Vastraa saree review request (${enq.sareeTitle || orderRef}). Our showroom team is currently verifying live stock availability and preparing your quotation.`;
  };

  const filteredInventory = product ? product.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return p.title.toLowerCase().includes(term) ||
           p.categoryName.toLowerCase().includes(term) ||
           p.id.toLowerCase().includes(term);
  }).filter((p) => {
    if (!selectedCategoryFilter || selectedCategoryFilter === '' || selectedCategoryFilter === 'All Collections') return true;
    return p.categoryName.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
           p.catalogueCode?.toLowerCase() === selectedCategoryFilter.toLowerCase();
  }).filter((p) => {
    if (!selectedPriceFilter) return true;
    const pr = Number(p.price) || 0;
    if (selectedPriceFilter === 'under_3000') return pr < 3000;
    if (selectedPriceFilter === '3000_6000') return pr >= 3000 && pr <= 6000;
    if (selectedPriceFilter === '6000_15000') return pr > 6000 && pr <= 15000;
    if (selectedPriceFilter === '15000_20000') return pr > 15000 && pr <= 20000;
    if (selectedPriceFilter === 'above_20000') return pr > 20000;
    return true;
  }) : [];

  if (adminSortPrice === 'asc') {
    filteredInventory.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (adminSortPrice === 'desc') {
    filteredInventory.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }

  useEffect(() => {
    setAdminInventoryPage(1);
  }, [searchTerm, selectedCategoryFilter, selectedPriceFilter, adminSortPrice, adminItemsPerPage]);

  const totalAdminInventoryPages = Math.ceil(filteredInventory.length / adminItemsPerPage);
  const adminStartIndex = (adminInventoryPage - 1) * adminItemsPerPage;
  const paginatedInventory = filteredInventory.slice(adminStartIndex, adminStartIndex + adminItemsPerPage);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <Tabs defaultIndex={2}>

        {/* Tab Headers */}
        <div className="bg-gray-100/80 dark:bg-gray-950 p-4 border-b border-gray-200 dark:border-gray-800">
          <TabList className="flex flex-wrap gap-2 text-xs font-extrabold">
            <Tab className="px-5 py-3 rounded-2xl cursor-pointer outline-none transition-all selected:bg-[#800020] selected:text-white bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm">
              📸 Online Albums ({catalogues.length})
            </Tab>
            <Tab className="px-5 py-3 rounded-2xl cursor-pointer outline-none transition-all selected:bg-[#800020] selected:text-white bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm">
              👗 Live Inventory ({product ? product.length : 0})
            </Tab>
            <Tab className="px-5 py-3 rounded-2xl cursor-pointer outline-none transition-all selected:bg-[#800020] selected:text-white bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm">
              📩 Order Processing Pipeline ({enquiries ? enquiries.length : 0})
            </Tab>
            <Tab className="px-5 py-3 rounded-2xl cursor-pointer outline-none transition-all selected:bg-[#800020] selected:text-white bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 shadow-sm">
              ⚙️ Store Settings & Revenue Analytics
            </Tab>
          </TabList>
        </div>

        {/* Tab 1: Online Catalogues */}
        <TabPanel className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                Online Catalogue Sources
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
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
                Live Synced Saree Inventory ({filteredInventory.length} Sarees)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Filter and manage live prices across all online collections.
              </p>
            </div>
          </div>

          {/* Admin Live Inventory Filter Toolbar */}
          <div className="bg-[#FAF7F0] dark:bg-gray-800 p-5 rounded-3xl border border-[#E9E1D5] dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end text-xs shadow-xs">

            {/* Select Catalogue */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="block font-bold text-[#211A19] dark:text-gray-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <FiFilter className="text-[#800020] dark:text-[#C6A15B]" /> SELECT CATALOGUE
              </label>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => {
                  setSelectedCategoryFilter(e.target.value);
                  setActiveQuickTab(e.target.value === '' ? 'ALL' : 'CUSTOM');
                }}
                className="w-full font-bold px-3.5 py-3 rounded-2xl border border-[#E9E1D5] dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#800020] cursor-pointer shadow-xs"
              >
                <option value="">All Collections ({product ? product.length : 3252} Sarees)</option>
                {catalogues.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    Cat {cat.code} - {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="block font-bold text-[#211A19] dark:text-gray-300 uppercase tracking-wider text-[11px]">
                ₹ SELECT PRICE RANGE
              </label>
              <select
                value={selectedPriceFilter}
                onChange={(e) => {
                  setSelectedPriceFilter(e.target.value);
                  setActiveQuickTab('CUSTOM');
                }}
                className="w-full font-bold px-3.5 py-3 rounded-2xl border border-[#E9E1D5] dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#800020] cursor-pointer shadow-xs"
              >
                <option value="">All Prices</option>
                <option value="under_3000">Under ₹3,000</option>
                <option value="3000_6000">₹3,000 – ₹6,000</option>
                <option value="6000_15000">₹6,000 – ₹15,000</option>
                <option value="15000_20000">₹15,000 – ₹20,000</option>
                <option value="above_20000">Above ₹20,000</option>
              </select>
            </div>

            {/* Search by Code or Category */}
            <div className="lg:col-span-3 space-y-1.5">
              <label className="block font-bold text-[#211A19] dark:text-gray-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <FiSearch className="text-[#800020] dark:text-[#C6A15B]" /> SEARCH BY CODE OR CATEGORY
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g. A-001, Kanchipuram..."
                  className="w-full font-medium pl-3.5 pr-8 py-3 rounded-2xl border border-[#E9E1D5] dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#800020] shadow-xs text-xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons: Bulk Margin Tool & Sort Toggle */}
            <div className="lg:col-span-3 flex items-center gap-2 justify-start lg:justify-end flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setBulkPriceModalOpen(true)}
                className="bg-[#800020] hover:bg-[#67001a] text-amber-100 px-3.5 py-3 rounded-2xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-1 border border-[#C6A15B]/40 whitespace-nowrap flex-shrink-0"
                title="Bulk Adjust Prices for a Saree Catalogue"
              >
                <span>Bulk Margin Tool 🏷️</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!adminSortPrice) setAdminSortPrice('asc');
                  else if (adminSortPrice === 'asc') setAdminSortPrice('desc');
                  else setAdminSortPrice('');
                }}
                title="Click to toggle sorting: Low to High → High to Low → Default Order"
                className={`px-3.5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-1 border shadow-sm flex-shrink-0 whitespace-nowrap ${
                  adminSortPrice === 'asc'
                    ? 'bg-[#800020] text-amber-100 border-[#C6A15B]/40 ring-2 ring-[#C6A15B]/30'
                    : adminSortPrice === 'desc'
                    ? 'bg-[#4A071B] text-amber-100 border-[#C6A15B]/40 ring-2 ring-[#C6A15B]/30'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-[#E9E1D5] dark:border-gray-700'
                }`}
              >
                <span>
                  {adminSortPrice === 'asc'
                    ? 'Low ➔ High ↑'
                    : adminSortPrice === 'desc'
                    ? 'High ➔ Low ↓'
                    : 'Sort Price ↕'}
                </span>
              </button>
            </div>

          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800 max-h-[70vh] overflow-y-auto">
            <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white uppercase text-[10px] tracking-wider font-extrabold sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-5 py-4">Saree Photo</th>
                  <th className="px-5 py-4">Saree ID / Title</th>
                  <th className="px-5 py-4">Catalogue Category</th>
                  <th className="px-5 py-4">Showcase Price</th>
                  <th className="px-5 py-4">Stock Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-medium">
                {paginatedInventory.map((item) => {
                  const isAvailable = item.stockStatus === 'CONFIRMED_AVAILABLE';
                  const isUnknown = item.stockStatus === 'UNKNOWN';

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-5 py-4">
                        <SareeImageThumbnail
                          id={item.id}
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-48 h-64 sm:w-56 sm:h-72 object-cover rounded-2xl border-3 border-[#C6A15B] dark:border-gray-700 shadow-xl hover:scale-110 hover:z-20 transition-all duration-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold text-gray-900 dark:text-white block">{item.title}</span>
                        <span className="text-[10px] font-mono text-gray-400">ID: {item.id}</span>
                      </td>
                      <td className="px-5 py-3 font-bold text-[#800020] dark:text-[#E5C158]">
                        Cat {item.catalogueCode} - {item.categoryName}
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

          {/* Admin Live Inventory Table Pagination Footer */}
          {totalAdminInventoryPages > 1 && (
            <div className="bg-[#FAF7F0] dark:bg-gray-800 p-4 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 dark:text-gray-300">
                  Showing {adminStartIndex + 1}–{Math.min(adminStartIndex + adminItemsPerPage, filteredInventory.length)} of {filteredInventory.length} Sarees
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-normal">Rows per page:</span>
                  <select
                    value={adminItemsPerPage}
                    onChange={(e) => setAdminItemsPerPage(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg border dark:bg-gray-900 dark:border-gray-700 dark:text-white font-bold cursor-pointer outline-none"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={adminInventoryPage === 1}
                  onClick={() => setAdminInventoryPage(adminInventoryPage - 1)}
                  className="px-3.5 py-1.5 bg-white dark:bg-gray-900 hover:bg-gray-100 text-gray-800 dark:text-white rounded-xl border border-gray-300 dark:border-gray-700 disabled:opacity-40 font-bold transition-all"
                >
                  ← Previous
                </button>
                <span className="px-3 py-1 bg-[#800020] text-amber-100 rounded-xl">
                  Page {adminInventoryPage} of {totalAdminInventoryPages}
                </span>
                <button
                  disabled={adminInventoryPage === totalAdminInventoryPages}
                  onClick={() => setAdminInventoryPage(adminInventoryPage + 1)}
                  className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#67001a] text-white rounded-xl disabled:opacity-40 font-bold transition-all shadow-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </TabPanel>

        {/* Tab 3: Customer Enquiries */}
        <TabPanel className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
              Order Processing & Fulfillment Pipeline ({enquiries ? enquiries.length : 0})
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
            /* ALL 6 PIPELINE STAGES VISIBLE ON ONE PAGE WITHOUT SCROLLING */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 pb-6 pt-2 px-1">
              {['Pending Review', 'QUOTATION_DRAFT', 'QUOTATION_READY', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED_ORDER_CONFIRMED', 'DISPATCHED'].map((colStatus, cIdx) => {
                const colTitles = {
                  'Pending Review': '1. Pending Stock',
                  'QUOTATION_DRAFT': '2. Stock Verified',
                  'QUOTATION_READY': '3. Ready Payment',
                  'PAYMENT_PENDING': '4. Awaiting Payment',
                  'PAYMENT_VERIFIED_ORDER_CONFIRMED': '5. Confirmed & Ready',
                  'DISPATCHED': '6. Dispatched & Tracked'
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

                // Sort order entries in each stage by latest timestamp first
                colEnquiries.sort((a, b) => {
                  const tA = new Date(a.updatedAt || a.paymentSubmittedAt || a.createdAt || 0).getTime();
                  const tB = new Date(b.updatedAt || b.paymentSubmittedAt || b.createdAt || 0).getTime();
                  return tB - tA;
                });

                return (
                  <div key={cIdx} className={`bg-gray-50/90 dark:bg-gray-800/80 rounded-2xl p-3 border border-gray-200 dark:border-gray-700 space-y-2.5 shadow-sm min-w-0 ${headerBorders[colStatus]}`}>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-serif font-bold text-[11px] text-gray-900 dark:text-white truncate">
                        {colTitles[colStatus]}
                      </h3>
                      <span className="bg-[#800020] text-[#D4AF37] px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-xs flex-shrink-0">
                        {colEnquiries.length}
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-0.5">
                      {colEnquiries.length === 0 ? (
                        <p className="text-[10px] text-gray-400 text-center py-6">No requests in stage</p>
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

                              <div className="pt-2 flex flex-col gap-1.5 border-t border-gray-100 dark:border-gray-800">
                                {isDispatched ? (
                                  <button
                                    onClick={() => openTrackingModal(enq)}
                                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-1.5 px-2 rounded-xl text-[10px] font-bold shadow-xs flex items-center justify-center gap-1"
                                    title="Edit Shipping AWB / Tracking"
                                  >
                                    <FiTruck className="text-indigo-200 w-3 h-3" />
                                    <span>{enq.trackingDetails ? "Edit Tracking" : "Add Tracking"}</span>
                                  </button>
                                ) : isConfirmedOrVerified ? (
                                  <button
                                    onClick={() => openTrackingModal(enq)}
                                    className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-1.5 px-2 rounded-xl text-[10px] font-bold shadow-xs flex items-center justify-center gap-1"
                                    title="Add Shipping AWB / Tracking"
                                  >
                                    <FiTruck className="text-indigo-200 w-3 h-3" />
                                    <span>{enq.trackingDetails ? "Edit Tracking" : "Add Tracking"}</span>
                                  </button>
                                ) : isAwaitingPayment ? (
                                  <button
                                    onClick={() => setPaymentVerifyModalEnquiry(enq)}
                                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-1.5 px-2 rounded-xl text-[10px] font-bold shadow-xs flex items-center justify-center gap-1"
                                  >
                                    <FiShield className="text-emerald-300 w-3 h-3" />
                                    <span>Verify Payment</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openQuotationModal(enq)}
                                    className="w-full bg-[#800020] hover:bg-[#67001a] text-white py-1.5 px-2 rounded-xl text-[10px] font-bold shadow-xs flex items-center justify-center gap-1"
                                  >
                                    <FiFileText className="text-[#D4AF37] w-3 h-3" />
                                    <span>Review & Quote</span>
                                  </button>
                                )}

                                <a
                                  href={getWhatsAppDispatchUrl(cleanPhone, getStageSpecificWhatsAppMessage(enq))}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2 rounded-xl text-[10px] font-bold shadow-xs flex items-center justify-center gap-1"
                                  title="WhatsApp Customer Stage Pre-Filled Draft"
                                >
                                  <FiMessageCircle className="w-3 h-3" />
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
                                    <SareeImageThumbnail
                                      key={idx}
                                      id={ci.id}
                                      src={imgUrl}
                                      alt={ci.title}
                                      className="w-28 h-40 sm:w-32 sm:h-44 object-cover rounded-2xl border-2 border-[#C6A15B] dark:border-gray-700 shadow-md hover:scale-110 transition-transform duration-300 cursor-pointer"
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
                                  <SareeImageThumbnail
                                    id={enq.sareeId}
                                    src={imgUrl}
                                    alt={enq.sareeTitle}
                                    className="w-28 h-40 sm:w-32 sm:h-44 object-cover rounded-2xl border-2 border-[#C6A15B] dark:border-gray-700 shadow-md hover:scale-110 transition-transform duration-300 cursor-pointer"
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
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(getStageSpecificWhatsAppMessage(enq))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold text-[11px] shadow-sm transition-all"
                            title="Chat with customer on WhatsApp (Stage Pre-Filled Draft)"
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

        {/* Tab 4: Store Settings & Revenue Analytics */}
        <TabPanel className="p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
            Store Settings & Revenue Analytics
          </h2>

          <div className="bg-gray-50 dark:bg-gray-800/60 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
              Store & Payment Configuration
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block font-bold">Store Brand Name:</span>
                <span className="text-gray-900 dark:text-white font-semibold text-sm">{storeInfo?.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">Online Store Location:</span>
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

          {/* Category-Wise Revenue Breakdown Chart inside Tab 4 */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 text-xs shadow-sm">
            <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <FiTrendingUp className="text-[#800020] dark:text-[#E5C158]" />
              <span>Catalogue Collection Revenue Performance (A–I)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {catalogues.map((cat) => {
                const confirmedOrders = enquiries ? enquiries.filter(e =>
                  (e.status === 'PAYMENT_VERIFIED_ORDER_CONFIRMED' || e.status === 'READY_FOR_DISPATCH' || e.status === 'DISPATCHED' || e.trackingDetails)
                ) : [];

                const totalGrossRevenue = confirmedOrders.reduce((sum, order) => sum + (order.quotationDetails?.finalPayable || 0), 0);

                const catOrders = confirmedOrders.filter(enq => {
                  const items = enq.quotationDetails?.items || enq.cartItems || [];
                  return items.some(item => {
                    const liveItem = product?.find(p => p.id === item.id);
                    return liveItem?.catalogueCode === cat.code || enq.categoryName?.includes(cat.name);
                  });
                });

                const revenue = catOrders.reduce((sum, enq) => sum + (enq.quotationDetails?.finalPayable || 0), 0);
                const sharePct = totalGrossRevenue > 0 ? Math.round((revenue / totalGrossRevenue) * 100) : 0;

                return (
                  <div key={cat.id} className="bg-gray-50 dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">
                        Cat {cat.code} - {cat.name}
                      </span>
                      <span className="font-mono font-extrabold text-[#800020] dark:text-[#E5C158]">
                        ₹{revenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#800020] dark:bg-[#C6A15B] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, sharePct)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>{catOrders.length} Confirmed Orders</span>
                      <span className="font-bold">{sharePct}% Share</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Item 3: Automated WhatsApp Dispatches Log Table */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 text-xs shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FiMessageCircle className="text-emerald-600" />
                <span>Automated WhatsApp Dispatch Logs ({whatsappLogs.length})</span>
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full">
                ✓ Live Cloud Queue
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
              <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white uppercase text-[10px] tracking-wider font-extrabold sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Recipient Number</th>
                    <th className="px-4 py-3">Customer / Dispatch Type</th>
                    <th className="px-4 py-3">Message Payload Preview</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {whatsappLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        No automated WhatsApp dispatches recorded yet.
                      </td>
                    </tr>
                  ) : (
                    whatsappLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-gray-400">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-blue-600 dark:text-blue-400 font-mono">
                          +{log.recipientPhone}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-gray-800 dark:text-gray-200">
                          {log.customerName || log.type || "Automated Alert"}
                        </td>
                        <td className="px-4 py-2.5 max-w-xs truncate text-gray-500">
                          {log.message}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                            ✓ {log.status || "DISPATCHED"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-gray-500 block">Total Past Orders:</span>
                  <span className="font-extrabold text-gray-900 dark:text-white text-sm">{customerLtvInfo.pastOrdersCount} Orders</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Lifetime Value (LTV):</span>
                  <span className="font-extrabold text-[#800020] dark:text-[#E5C158] text-sm">₹{customerLtvInfo.lifetimeValue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Available Saree Wallet:</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">₹{(customerLtvInfo.walletBal || 0).toLocaleString()}</span>
                </div>
              </div>

              {customerLtvInfo.refBy && (
                <div className="bg-emerald-100/70 dark:bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex justify-between items-center">
                  <span>🎁 Customer registered via Referral Pass ({customerLtvInfo.refBy})</span>
                  <span>5% Welcome Discount Eligible</span>
                </div>
              )}

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
                          className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-2xl shadow-md border-2 border-[#E9E1D5] dark:border-gray-700 flex-shrink-0"
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

      {/* Item 4: Bulk Category Price Adjustment Modal */}
      {bulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-gray-200 dark:border-gray-800 space-y-6 text-xs">
            <button
              onClick={() => setBulkPriceModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2"
            >
              <FiX className="w-6 h-6" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#800020] dark:text-[#E5C158] uppercase">
                Bulk Margin Tool
              </span>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mt-1">
                Bulk Category Price Adjustment
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Adjust prices across an entire catalogue collection in one click.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Select Catalogue Collection:
                </label>
                <select
                  value={bulkCategoryCode}
                  onChange={(e) => setBulkCategoryCode(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-bold"
                >
                  {catalogues.map((cat) => (
                    <option key={cat.id} value={cat.code}>
                      Cat {cat.code} - {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Adjustment Type:
                </label>
                <select
                  value={bulkAdjustmentType}
                  onChange={(e) => setBulkAdjustmentType(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-semibold"
                >
                  <option value="set_range">Set Min–Max Price Range (₹)</option>
                  <option value="add_flat">Increase Price (+ Flat Amount in ₹)</option>
                  <option value="sub_flat">Decrease Price (- Flat Amount in ₹)</option>
                  <option value="add_percent">Increase Margin (+ Percentage %)</option>
                </select>
              </div>

              {bulkAdjustmentType === 'set_range' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      New Minimum Price (₹):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bulkMinPrice}
                      onChange={(e) => setBulkMinPrice(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-bold"
                      placeholder="24000"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      New Maximum Price (₹):
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={bulkMaxPrice}
                      onChange={(e) => setBulkMaxPrice(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-bold"
                      placeholder="32000"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Adjustment Value ({bulkAdjustmentType === 'add_percent' ? '%' : '₹'}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bulkAdjustmentAmount}
                    onChange={(e) => setBulkAdjustmentAmount(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono font-bold"
                    placeholder="500"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setBulkPriceModalOpen(false)}
                className="px-5 py-3 border text-xs font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBulkPriceUpdate}
                className="bg-[#800020] hover:bg-[#67001a] text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
              >
                <FiCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Apply Bulk Price Update</span>
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
