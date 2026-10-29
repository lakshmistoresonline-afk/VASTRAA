import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import Loader from '../../components/loader/Loader';
import { toast } from 'react-toastify';
import { fireDB } from '../../firebase/FirebaseConfig';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { FiUser, FiSave } from 'react-icons/fi';

function Account() {
  const context = useContext(MyContext);
  const { loading, setLoading } = context;

  const authUser = JSON.parse(localStorage.getItem('user'));

  const [userProfile, setUserProfile] = useState({
    name: authUser?.user?.name || '',
    email: authUser?.user?.email || '',
    whatsapp: authUser?.user?.whatsapp || '',
    address: authUser?.user?.address || '',
    pincode: authUser?.user?.pincode || '',
    uid: authUser?.user?.uid || ''
  });
  const [docId, setDocId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!authUser || !authUser.user) return;
      try {
        setLoading(true);
        const usersRef = collection(fireDB, 'users');
        const querySnapshot = await getDocs(usersRef);

        let foundDoc = null;
        let foundId = null;

        const cleanAuthEmail = authUser.user.email?.trim().toLowerCase();

        querySnapshot.forEach((d) => {
          const uData = d.data();
          const cleanDocEmail = uData.email?.trim().toLowerCase();
          if (cleanDocEmail === cleanAuthEmail || (authUser.user.uid && uData.uid === authUser.user.uid)) {
            foundDoc = uData;
            foundId = d.id;
          }
        });

        if (foundDoc) {
          setDocId(foundId);
          const updatedProf = {
            name: foundDoc.name || authUser.user.name || '',
            email: foundDoc.email || authUser.user.email,
            whatsapp: foundDoc.whatsapp || authUser.user.whatsapp || '',
            address: foundDoc.address || authUser.user.address || '',
            pincode: foundDoc.pincode || authUser.user.pincode || '',
            uid: foundDoc.uid || authUser.user.uid
          };
          setUserProfile(updatedProf);

          // Sync localStorage
          localStorage.setItem('user', JSON.stringify({
            ...authUser,
            user: {
              ...authUser.user,
              ...updatedProf
            }
          }));
        }
      } catch (err) {
        console.error("Error fetching account data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!userProfile.name || !userProfile.whatsapp) {
      toast.error("Name and WhatsApp mobile number are required.");
      return;
    }

    const cleanPhone = userProfile.whatsapp.replace(/[^0-9]/g, '');

    try {
      setLoading(true);
      if (docId) {
        const userDocRef = doc(fireDB, 'users', docId);
        await updateDoc(userDocRef, {
          name: userProfile.name.trim(),
          whatsapp: cleanPhone,
          address: userProfile.address.trim(),
          pincode: userProfile.pincode.trim()
        });
      } else {
        const newRef = await addDoc(collection(fireDB, 'users'), {
          ...userProfile,
          whatsapp: cleanPhone,
          role: 'customer',
          createdAt: new Date().toISOString()
        });
        setDocId(newRef.id);
      }

      // Update local storage
      const updatedUser = {
        ...authUser,
        user: {
          ...authUser?.user,
          name: userProfile.name.trim(),
          whatsapp: cleanPhone,
          address: userProfile.address.trim(),
          pincode: userProfile.pincode.trim()
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

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
          Manage your personal details, WhatsApp contact info, and registered delivery address.
        </p>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">

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
                    placeholder="9746998783"
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
                <span className="font-bold text-gray-900 dark:text-white text-sm">{userProfile.name || "Test Customer 1"}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold">Email Address</span>
                <span className="font-bold text-gray-900 dark:text-white text-sm">{userProfile.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-gray-400 block font-semibold">WhatsApp Number</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{userProfile.whatsapp || "9746998783"}</span>
              </div>
              <div className="sm:col-span-3 space-y-1 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-gray-400 block font-semibold">Saved Delivery Address</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{userProfile.address ? `${userProfile.address} - ${userProfile.pincode}` : "MG Road - 680001"}</span>
              </div>
            </div>
          )}
        </div>

        {/* Refer & Earn Saree Rewards Portal */}
        <div className="glass-card bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-[#E9E1D5] dark:border-gray-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-[10px] font-bold text-[#800020] dark:text-[#E5C158] uppercase tracking-wider block">
                Two-Sided Referral Program
              </span>
              <h2 className="text-lg font-serif font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎁 Refer Friends & Earn Reward Credits</span>
              </h2>
            </div>

            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-300/40">
              Your Wallet: ₹{userProfile.referralWalletBalance || 0} Credits
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-1">
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Your Invite Code</span>
              <p className="text-lg font-mono font-extrabold text-[#800020] dark:text-[#E5C158]">
                {userProfile.referralCode || ("REF-" + (userProfile.whatsapp || "VASTRAA"))}
              </p>
              <p className="text-[10px] text-gray-500">Share with family & friends</p>
            </div>

            <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-1">
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Friend's Welcome Offer</span>
              <p className="text-lg font-serif font-extrabold text-emerald-600 dark:text-emerald-400">
                5% Instant Discount
              </p>
              <p className="text-[10px] text-gray-500">Applied automatically on friend's 1st order</p>
            </div>

            <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-1">
              <span className="text-gray-400 font-bold block text-[10px] uppercase">Your Reward Earnings</span>
              <p className="text-lg font-serif font-extrabold text-indigo-600 dark:text-indigo-400">
                Earn Rewards as Credits
              </p>
              <p className="text-[10px] text-gray-500">Credited to wallet once friend completes 1st order</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
            <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              💡 Invite friends to shop for handloom sarees. They get <strong className="text-emerald-700 dark:text-emerald-300">5% Instant Discount</strong> on their 1st purchase, and you <strong className="text-emerald-700 dark:text-emerald-300">Earn Rewards as Credits</strong> in your wallet as soon as they complete their 1st order!
            </p>

            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `✨ Use my referral code ${userProfile.referralCode || ("REF-" + userProfile.whatsapp)} to get 5% Instant Discount on your first silk saree at Vastraa! Shop here: ${window.location.origin}/login?ref=${userProfile.referralCode || ("REF-" + userProfile.whatsapp)}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-md transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Share Invite Link on WhatsApp 💬</span>
            </a>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Account;
