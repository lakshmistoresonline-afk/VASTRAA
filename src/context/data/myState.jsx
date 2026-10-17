import React, { useEffect, useState } from 'react'
import MyContext from './myContext'
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { toast } from 'react-toastify';
import { fireDB } from '../../firebase/FirebaseConfig';
import { CATALOGUES, STORE_INFO } from '../../data/catalogues';
import { syncAllCatalogues, revalidateItemStock } from '../../services/stockSyncService';

const MyState = (props) => {
  const [mode, setMode] = useState('light');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    if (mode === 'light') {
      setMode('dark');
      document.body.style.backgroundColor = 'rgb(17, 24, 39)';
    } else {
      setMode('light');
      document.body.style.backgroundColor = 'white';
    }
  }

  // Google Photos Synced Inventory
  const [product, setProduct] = useState([]);
  const [syncStats, setSyncStats] = useState(null);
  const [lastVerifiedAt, setLastVerifiedAt] = useState(null);
  const [catalogues, setCatalogues] = useState(CATALOGUES);

  // Customer Enquiries and Orders
  const [enquiries, setEnquiries] = useState([]);
  const [order, setOrder] = useState([]);
  const [user, setUser] = useState([]);

  // Filters
  const [searchKey, setSearchKey] = useState('');
  const [filterType, setFilterType] = useState('');
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
      toast.error("Failed to refresh Google Photos catalogue");
    } finally {
      setLoading(false);
    }
  };

  // Fetch enquiries from Firestore
  const getEnquiriesData = async () => {
    try {
      const q = query(collection(fireDB, "enquiries"));
      const data = onSnapshot(q, (snapshot) => {
        let enquiryArray = [];
        snapshot.forEach((doc) => {
          enquiryArray.push({ ...doc.data(), id: doc.id });
        });
        setEnquiries(enquiryArray);
      }, (err) => {
        console.warn("Firestore enquiries subscription notice:", err.message);
      });
      return () => data();
    } catch (err) {
      console.error("Error fetching enquiries:", err);
    }
  };

  // Fetch orders from Firestore
  const getOrderData = async () => {
    try {
      const result = await getDocs(collection(fireDB, "order"));
      const ordersArray = [];
      result.forEach((doc) => {
        ordersArray.push({ ...doc.data(), id: doc.id });
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
      result.forEach((doc) => {
        usersArray.push({ ...doc.data(), id: doc.id });
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
      // Revalidate stock status first
      const validation = await revalidateItemStock(enquiryData.sareeId);

      const payload = {
        ...enquiryData,
        validatedStockStatus: validation.stockStatus,
        createdAt: new Date().toISOString(),
        status: "Pending"
      };

      await addDoc(collection(fireDB, "enquiries"), payload);
      toast.success("Enquiry submitted successfully! Our Thrissur team will contact you shortly.");
      getEnquiriesData();
      return { success: true, validation };
    } catch (err) {
      console.error("Error adding enquiry:", err);
      toast.error("Error submitting enquiry. Please try WhatsApp directly.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update Enquiry Status
  const updateEnquiryStatus = async (id, status) => {
    try {
      setLoading(true);
      await updateDoc(doc(fireDB, "enquiries", id), { status });
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
      await deleteDoc(doc(fireDB, "enquiries", id));
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
    getEnquiriesData();
    getOrderData();
    getUserData();
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
