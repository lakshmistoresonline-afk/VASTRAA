import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MyContext from '../../context/data/myContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, fireDB } from '../../firebase/FirebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Loader from '../../components/loader/Loader';
import { FiUser, FiLock, FiMail, FiPhone, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

function CustomerLogin() {
  const context = useContext(MyContext);
  const { loading, setLoading } = context;

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleCustomerAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && (!name || !whatsapp))) {
      toast.error("Please fill in all required fields, including WhatsApp number.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = whatsapp.replace(/[^0-9]/g, '');

    if (isRegistering && cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp mobile number.");
      return;
    }

    try {
      setLoading(true);
      if (isRegistering) {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const userDoc = {
          name: name.trim(),
          uid: res.user.uid,
          email: cleanEmail,
          whatsapp: cleanPhone,
          role: 'customer',
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(fireDB, "users"), userDoc);
        toast.success("Customer account created successfully!");
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
        toast.success("Welcome back to Vastraa!");
      }

      sessionStorage.setItem("show_onboarding_modal", "true");
      localStorage.setItem("user", JSON.stringify({ user: { email: cleanEmail, uid: auth.currentUser?.uid } }));
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Customer auth error:", err.message);
      toast.error("Authentication failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address above first, then click Forgot Password.");
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      toast.success("Password reset instructions sent to your email.");
    } catch (err) {
      toast.error("Failed to send reset email: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#211A19] px-4 py-12">
      {loading && <Loader />}
      <div className="glass-card bg-[#302625] border border-[#C6A15B]/30 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl space-y-6 text-white">

        <div className="text-center space-y-2">
          <div className="bg-gradient-to-br from-[#650A25] to-[#4A071B] text-[#C6A15B] w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-3xl font-serif font-black shadow border border-[#C6A15B]">
            V
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#F7F0E4]">Vastraa</h1>
          <p className="text-xs text-[#C6A15B]">
            {isRegistering ? "Create Customer Account" : "Shopper Sign In & Cart Access"}
          </p>
        </div>

        <form onSubmit={handleCustomerAuth} className="space-y-4">
          {isRegistering && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-900 border border-gray-700 pl-10 pr-4 py-3 w-full rounded-xl text-white text-xs placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#C6A15B]"
                    placeholder="e.g. Ananya Nair"
                  />
                  <FiUser className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">10-Digit WhatsApp Mobile Number *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="bg-gray-900 border border-gray-700 pl-10 pr-4 py-3 w-full rounded-xl text-white text-xs placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#C6A15B]"
                    placeholder="e.g. 9746998785"
                  />
                  <FiPhone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-900 border border-gray-700 pl-10 pr-4 py-3 w-full rounded-xl text-white text-xs placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#C6A15B]"
                placeholder="ananya@example.com"
              />
              <FiMail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-300">Password *</label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#C6A15B] hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-900 border border-gray-700 pl-10 pr-10 py-3 w-full rounded-xl text-white text-xs placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#C6A15B]"
                placeholder="••••••••"
              />
              <FiLock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#650A25] hover:bg-[#4A071B] text-amber-100 font-bold py-3.5 rounded-xl text-xs transition-colors shadow-lg border border-[#C6A15B]/40 flex items-center justify-center gap-2"
          >
            <span>{isRegistering ? "Create Customer Account" : "Sign In"}</span>
            <FiArrowRight className="w-4 h-4 text-[#C6A15B]" />
          </button>
        </form>

        <div className="border-t border-gray-800 pt-4 text-center text-xs space-y-2">
          {isRegistering ? (
            <p className="text-gray-400">
              Already have an account?{' '}
              <button onClick={() => setIsRegistering(false)} className="text-[#C6A15B] font-bold hover:underline">
                Sign In
              </button>
            </p>
          ) : (
            <p className="text-gray-400">
              New to Vastraa?{' '}
              <button onClick={() => setIsRegistering(true)} className="text-[#C6A15B] font-bold hover:underline">
                Register a New Account
              </button>
            </p>
          )}

          <div className="pt-2">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              ← Return to Storefront Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CustomerLogin;
