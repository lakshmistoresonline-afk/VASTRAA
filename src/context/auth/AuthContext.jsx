import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, fireDB } from '../../firebase/FirebaseConfig';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/cartSlice';

export const AuthContext = createContext();

const ALLOWED_ADMIN_EMAILS = [
  "admin@gmail.com",
  "lakshmistoresonline@gmail.com",
  "admin@vastraa.com",
  "admin@lakshmistores.com",
  "aliali@gmail.com"
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          // Fetch canonical user profile from Firestore users/{uid}
          const userDocRef = doc(fireDB, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            const isAdminRole = data.role === 'admin' || ALLOWED_ADMIN_EMAILS.includes(user.email?.toLowerCase());
            const prof = { ...data, role: isAdminRole ? 'admin' : 'customer' };
            setUserProfile(prof);

            // Sync localStorage
            localStorage.setItem('user', JSON.stringify({
              user: {
                email: user.email,
                uid: user.uid,
                name: prof.name || 'Customer',
                whatsapp: prof.whatsapp || '',
                role: prof.role,
                referralCode: prof.referralCode || `REF-${prof.whatsapp || user.uid.slice(0, 6)}`,
                referralWalletBalance: prof.referralWalletBalance || 0,
                referredByCode: prof.referredByCode || null,
                isFirstOrderCompleted: prof.isFirstOrderCompleted || false
              }
            }));
          } else {
            // Create user document if missing
            const isAdminEmail = ALLOWED_ADMIN_EMAILS.includes(user.email?.toLowerCase());
            const newProf = {
              uid: user.uid,
              name: user.displayName || 'Customer',
              email: user.email,
              whatsapp: '',
              role: isAdminEmail ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProf, { merge: true });
            setUserProfile(newProf);
          }
        } catch (err) {
          console.warn("Auth profile fetch notice:", err.message);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        localStorage.removeItem('user');
        // Clear Redux cart when user logs out so carts do not leak between accounts!
        dispatch(clearCart());
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [dispatch]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('user');
      dispatch(clearCart());
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isAdmin = Boolean(
    currentUser && (
      userProfile?.role === 'admin' ||
      ALLOWED_ADMIN_EMAILS.includes(currentUser.email?.toLowerCase())
    )
  );

  return (
    <AuthContext.Provider value={{
      currentUser,
      userProfile,
      authLoading,
      isAdmin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
