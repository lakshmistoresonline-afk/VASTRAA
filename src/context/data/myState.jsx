import React, { useEffect, useState } from 'react'
import MyContext from './myContext'
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify';
import { fireDB } from '../../firebase/FirebaseConfig';
import { CATALOGUES, STORE_INFO } from '../../data/catalogues';
import { syncAllCatalogues, revalidateItemStock } from '../../services/stockSyncService';

const MyState = (props) => {
  const [mode, setMode] = useState(localStorage.getItem('theme') || 'light');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#FAF7F0';
    }
  }, [mode]);

  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setMode('light');
      localStorage.setItem('theme', 'light');
    }
  };

  // Google Photos Synced Inventory
  const [product, setProduct] = useState([]);
  const [syncStats, setSyncStats] = useState(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState(null);
  const [catalogues, setCatalogues] = useState(CATALOGUES);

  // Customer Enquiries and Orders (Admin Data)
  const [enquiries, setEnquiries] = useState([]);
  const [order, setOrder] = useState([]);
  const [user, setUser] = useState([]);

  // Filters
  const [searchKey, setSearchKey] = useState('');
  const [filterType, setFilterType] = useState('Kanchipuram Pure Soft Silk Sarees');
  const [filterPrice, setFilterPrice] = useState('');

  // Initial Sync from Google Photos Catalogue
  const performCatalogueSync = async (options = {}) => {
    setLoading(true);
    try {
      const cache = await syncAllCatalogues(options);
      setProduct(cache.items);
      setSyncStats(cache.syncStats);
      setLastVerifiedAt(cache.lastVerifiedAt);
    } catch (err) {
      console.error("Failed to sync catalogues:", err);
      toast.error("Failed to refresh catalogue feed");
    } finally {
      setLoading(false);
    }
  };

  // Helper to load local enquiries from localStorage
  const getLocalEnquiries = () => {
    try {
      return JSON.parse(localStorage.getItem('vastraa_enquiries') || '[]');
    } catch (_e) {
      return [];
    }
  };

  // Fetch enquiries from Firestore & merge with localStorage
  const getEnquiriesData = async () => {
    try {
      const q = query(collection(fireDB, "enquiries"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let firestoreArray = [];
        snapshot.forEach((docItem) => {
          firestoreArray.push({ ...docItem.data(), id: docItem.id });
        });

        // Merge with local enquiries
        const localItems = getLocalEnquiries();
        const merged = [...firestoreArray];

        for (const local of localItems) {
          if (!merged.some(f => f.sareeId === local.sareeId && f.phone === local.phone && f.createdAt === local.createdAt)) {
            merged.push(local);
          }
        }

        // Sort newest first
        merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setEnquiries(merged);
      }, (err) => {
        console.warn("Firestore enquiries subscription notice:", err.message);
        setEnquiries(getLocalEnquiries());
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Error fetching enquiries:", err);
      setEnquiries(getLocalEnquiries());
    }
  };

  // Fetch orders from Firestore
  const getOrderData = async () => {
    try {
      const result = await getDocs(collection(fireDB, "order"));
      const ordersArray = [];
      result.forEach((docItem) => {
        ordersArray.push({ ...docItem.data(), id: docItem.id });
      });
      setOrder(ordersArray);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch users from Firestore
  const getUserData = async () => {
    try {
      const result = await getDocs(collection(fireDB, "users"));
      const usersArray = [];
      result.forEach((docItem) => {
        usersArray.push({ ...docItem.data(), id: docItem.id });
      });
      setUser(usersArray);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Submit Customer Availability & Price Enquiry
  const addEnquiry = async (enquiryData) => {
    setLoading(true);
    try {
      const validation = await revalidateItemStock(enquiryData.sareeId);

      const payload = {
        ...enquiryData,
        validatedStockStatus: validation.stockStatus || "CONFIRMED_AVAILABLE",
        createdAt: new Date().toISOString(),
        status: "Pending"
      };

      // Always save to localStorage immediately for instant local persistence
      const currentLocals = getLocalEnquiries();
      const newLocal = { ...payload, id: `local_enq_${Date.now()}` };
      localStorage.setItem('vastraa_enquiries', JSON.stringify([newLocal, ...currentLocals]));

      // Attempt Firestore save with a 2.5-second timeout
      const firestorePromise = addDoc(collection(fireDB, "enquiries"), payload);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));

      await Promise.race([firestorePromise, timeoutPromise]);

      toast.success("Enquiry submitted successfully! Our team will contact you shortly.");
      return { success: true, validation };
    } catch (err) {
      console.warn("Firestore save fallback notice:", err.message);
      toast.success("Enquiry submitted successfully! Our team will contact you shortly.");
      return { success: true, local: true };
    } finally {
      setLoading(false);
    }
  };

  // Update Enquiry Status
  const updateEnquiryStatus = async (id, status) => {
    try {
      setLoading(true);
      if (id.startsWith('local_enq_')) {
        const locals = getLocalEnquiries().map(item => item.id === id ? { ...item, status } : item);
        localStorage.setItem('vastraa_enquiries', JSON.stringify(locals));
      } else {
        await updateDoc(doc(fireDB, "enquiries", id), { status });
      }
      toast.success("Enquiry status updated");
      getEnquiriesData();
    } catch (err) {
      console.error("Error updating enquiry status:", err);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // Delete Enquiry
  const deleteEnquiry = async (id) => {
    try {
      setLoading(true);
      if (id.startsWith('local_enq_')) {
        const locals = getLocalEnquiries().filter(item => item.id !== id);
        localStorage.setItem('vastraa_enquiries', JSON.stringify(locals));
      } else {
        await deleteDoc(doc(fireDB, "enquiries", id));
      }
      toast.success("Enquiry deleted");
      getEnquiriesData();
    } catch (err) {
      console.error("Error deleting enquiry:", err);
      toast.error("Failed to delete enquiry");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (item) => {
    try {
      setLoading(true);
      await deleteDoc(doc(fireDB, "order", item.id));
      toast.success("Order deleted successfully");
      getOrderData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performCatalogueSync();
  }, []);

  return (
    <MyContext.Provider value={{
      mode,
      toggleMode,
      loading,
      setLoading,
      product,
      catalogues,
      syncStats,
      lastVerifiedAt,
      triggerSync: performCatalogueSync,
      enquiries,
      getEnquiriesData,
      getOrderData,
      getUserData,
      addEnquiry,
      updateEnquiryStatus,
      deleteEnquiry,
      order,
      deleteOrder,
      user,
      searchKey,
      setSearchKey,
      filterType,
      setFilterType,
      filterPrice,
      setFilterPrice,
      storeInfo: STORE_INFO
    }}>
      {props.children}
    </MyContext.Provider>
  )
}

export default MyState;
