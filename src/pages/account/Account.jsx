import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import Loader from '../../components/loader/Loader';
import { toast } from 'react-toastify';
import { fireDB } from '../../firebase/FirebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { FiUser, FiPhone, FiMapPin, FiMail, FiSave, FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Account() {
  const context = useContext(MyContext);
  const { loading, setLoading } = context;

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    pincode: '',
    uid: ''
  });
  const [docId, setDocId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customerEnquiries, setCustomerEnquiries] = useState([]);

  const authUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    async function fetchProfileAndEnquiries() {
      if (!authUser || !authUser.user) return;
      try {
        setLoading(true);
        const usersRef = collection(fireDB, 'users');
        const q = query(usersRef, where('email', '==', authUser.user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setDocId(docSnap.id);
          setUserProfile({
            name: docSnap.data().name || '',
            email: docSnap.data().email || authUser.user.email,
            whatsapp: docSnap.data().whatsapp || '',
            address: docSnap.data().address || '',
            pincode: docSnap.data().pincode || '',
            uid: docSnap.data().uid || authUser.user.uid
          });
        } else {
          setUserProfile({
            name: '',
            email: authUser.user.email,
            whatsapp: '',
            address: '',
            pincode: '',
            uid: authUser.user.uid
          });
        }

        // Fetch enquiries / requests for this user
        const enqRef = collection(fireDB, 'enquiries');
        const enqSnap = await getDocs(enqRef);
        const myEnquiries = [];
        enqSnap.forEach(d => {
          const data = d.data();
          if (data.phone === userProfile.whatsapp || data.customerName?.toLowerCase() === userProfile.name?.toLowerCase()) {
            myEnquiries.push({ id: d.id, ...data });
          }
        });
        setCustomerEnquiries(myEnquiries);

      } catch (err) {
        console.error("Error fetching account data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileAndEnquiries();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!userProfile.name || !userProfile.whatsapp) {
      toast.error("Name and WhatsApp mobile number are required.");
      return;
    }

    try {
      setLoading(true);
      if (docId) {
        const userDocRef = doc(fireDB, 'users', docId);
        await updateDoc(userDocRef, {
          name: userProfile.name.trim(),
          whatsapp: userProfile.whatsapp.replace(/[^0-9]/g, ''),
          address: userProfile.address.trim(),
          pincode: userProfile.pincode.trim()
        });
      } else {
        // Create user doc if missing
        await addDoc(collection(fireDB, 'users'), {
          ...userProfile,
          role: 'customer',
          createdAt: new Date().toISOString()
        });
      }
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {loading && <Loader />}
      <div className="bg-[#4A071B] text-amber-50 py-12 px-4 text-center border-b-4 border-[#C6A15B]">
        <span className="text-[#C6A15B] font-bold text-xs uppercase tracking-widest block mb-1">
          Vastraa • Customer Account Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#F7F0E4]">
          My Account & Profile
        </h1>
        <p className="text-xs text-amber-200/80 mt-2 max-w-xl mx-auto">
          Manage your personal details, delivery address, and track your submitted bag review requests.
        </p>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-10">

        {/* Profile Card */}
        <div className="glass-card bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[#E9E1D5] dark:border-gray-800 shadow-xl space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-serif font-bold text-[#24211F] dark:text-white flex items-center gap-2">
              <FiUser className="text-[#800020] dark:text-[#C6A15B]" />
              <span>Customer Profile Information</span>
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-[#800020] dark:text-[#C6A15B] hover:underline"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full text-xs px-4 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                    placeholder="Ananya Nair"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Email (Read-Only)</label>
                  <input
                    type="email"
                    disabled
                    value={userProfile.email}
                    className="w-full text-xs px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">10-Digit WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={userProfile.whatsapp}
                    onChange={(e) => setUserProfile({ ...userProfile, whatsapp: e.target.value })}
                    className="w-full text-xs px-4 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                    placeholder="9746998785"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={userProfile.pincode}
                    onChange={(e) => setUserProfile({ ...userProfile, pincode: e.target.value })}
                    className="w-full text-xs px-4 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                    placeholder="680001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Registered Delivery Address</label>
                <textarea
                  rows={2}
                  value={userProfile.address}
                  onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                  className="w-full text-xs px-4 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                  placeholder="Enter street address, city, state"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#800020] hover:bg-[#67001a] text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4 text-[#C6A15B]" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold">Full Name</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{userProfile.name || "Not provided"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold">Email Address</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{userProfile.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold">WhatsApp Number</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{userProfile.whatsapp || "Not provided"}</span>
              </div>
              <div className="sm:col-span-3 space-y-1 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-gray-400 block font-semibold">Saved Delivery Address</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{userProfile.address ? `${userProfile.address} - ${userProfile.pincode}` : "No delivery address saved yet."}</span>
              </div>
            </div>
          )}
        </div>

        {/* Submitted Bag Review Requests / Enquiries */}
        <div className="glass-card bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[#E9E1D5] dark:border-gray-800 shadow-xl space-y-6">
          <h2 className="text-lg font-serif font-bold text-[#24211F] dark:text-white flex items-center gap-2">
            <FiShoppingBag className="text-[#800020] dark:text-[#C6A15B]" />
            <span>My Submitted Bag Reviews & Enquiries</span>
          </h2>

          <div className="text-center py-12 bg-[#FAF7F0] dark:bg-gray-800/50 rounded-2xl border border-dashed border-[#E9E1D5] dark:border-gray-700 space-y-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can track all your active bag review requests and order quotations under the <Link to="/order" className="text-[#800020] dark:text-[#C6A15B] font-bold hover:underline">Enquiries & Orders</Link> tracker.
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Account;
