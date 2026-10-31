import React, { Fragment, useContext, useState } from 'react';
import { FiMessageCircle, FiShoppingBag, FiMenu, FiX, FiCheckCircle, FiUser, FiShield, FiExternalLink, FiSun, FiMoon, FiHeart, FiSmartphone } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { Dialog, Transition } from '@headlessui/react';
import { useSelector } from 'react-redux';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { useAuth } from '../../context/auth/AuthContext';

const Navbar = () => {
  const { isStandalone, promptInstall } = usePwaInstall();
  const context = useContext(myContext);
  const { storeInfo, mode, toggleMode, enquiries } = context;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout: firebaseLogout, isAdmin: authIsAdmin, currentUser } = useAuth();

  const user = JSON.parse(localStorage.getItem('user'));
  const cartItems = useSelector((state) => state.cart);

  const logout = async () => {
    try {
      await firebaseLogout();
      setOpen(false);
      navigate('/login');
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      navigate('/login');
    }
  };

  const isAdmin = authIsAdmin ||
                  user?.user?.email === "admin@gmail.com" ||
                  user?.user?.email === "lakshmistoresonline@gmail.com" ||
                  user?.user?.email === "admin@vastraa.com" ||
                  user?.user?.email === "admin@lakshmistores.com" ||
                  user?.user?.email === "aliali@gmail.com";

  const userEmail = user?.user?.email?.trim().toLowerCase();
  const userUid = user?.user?.uid;

  const hasReadyQuotation = (!isAdmin && user && enquiries) ? enquiries.some(e =>
    e.status === 'QUOTATION_READY' &&
    ((userEmail && e.customerEmail?.trim().toLowerCase() === userEmail) || (userUid && e.customerUid === userUid))
  ) : false;

  return (
    <div className="sticky top-0 z-50 w-full shadow-md bg-[#211A19] dark:bg-gray-950">
      {/* Active Quotation Notification Banner */}
      {hasReadyQuotation && (
        <div className="bg-[#800020] text-amber-100 text-xs py-2 px-4 border-b border-[#C6A15B] shadow-lg animate-pulse">
          <div className="container mx-auto flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              ✨ Your Vastraa Saree Order Quotation is Ready for Review!
            </span>
            <Link
              to="/purchase-journey"
              className="bg-[#C6A15B] text-gray-950 font-extrabold px-3.5 py-1 rounded-xl hover:bg-white transition-colors text-[11px] shadow-sm"
            >
              Review Quotation & Proceed →
            </Link>
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-[#4A071B] text-[#C6A15B] text-[11px] sm:text-xs py-2 px-4 border-b border-[#C6A15B]/30 overflow-hidden">
        <div className="container mx-auto flex justify-between items-center w-full max-w-full">
          <div className="flex items-center gap-2 font-medium truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <span className="truncate">{isAdmin ? "🔒 Admin Command Center Active" : "✨ Refer & Earn: Give 5% OFF to Friends, Earn Saree Credits • Free Pan India Delivery"}</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs flex-shrink-0">
            <span className="flex items-center gap-1 text-amber-200">
              <FiCheckCircle className="text-emerald-400" /> Verified Online Collections
            </span>
            <span className="text-amber-200">
              Hotline: <strong className="text-white">+91 97469 98785</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="relative">
        <nav aria-label="Top" className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex h-20 items-center justify-between">

            {/* Left: Mobile Menu Button & Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-2 text-[#C6A15B] hover:text-white md:hidden focus:outline-none"
                onClick={() => setOpen(true)}
              >
                <FiMenu className="w-6 h-6" />
              </button>

              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#800020] via-[#650A25] to-[#4A071B] flex items-center justify-center border-2 border-[#C6A15B] shadow-lg group-hover:scale-105 transition-transform">
                  <span className="font-serif font-black text-amber-200 text-2xl tracking-tighter">V</span>
                </div>
                <div>
                  <span className="font-serif font-extrabold text-xl sm:text-2xl text-amber-100 tracking-wider block leading-tight">
                    VASTRAA
                  </span>
                  <span className="text-[9px] text-[#C6A15B] uppercase tracking-widest block font-medium">
                    Lakshmi Stores • Thrissur
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                to="/"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-[#C6A15B] transition-all"
              >
                Home
              </Link>
              <Link
                to="/allproducts"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-[#C6A15B] transition-all"
              >
                Catalogues (A–I)
              </Link>

              {user && (
                <>
                  <Link
                    to="/purchase-journey"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-100 transition-all flex items-center gap-1 bg-[#4A071B] border border-[#C6A15B]/30"
                  >
                    <span>Purchase Journey</span>
                    {hasReadyQuotation && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </Link>

                  {!isAdmin && (
                    <Link
                      to="/account"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-[#C6A15B] transition-all"
                    >
                      My Account
                    </Link>
                  )}
                  {!isStandalone && (
                    <button
                      type="button"
                      onClick={promptInstall}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-200 hover:text-white bg-[#4A071B] hover:bg-[#650A25] border border-[#C6A15B]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Install Vastraa App on Phone"
                    >
                      <FiSmartphone className="w-3.5 h-3.5 text-[#C6A15B]" />
                      <span>Install App</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

              {!isAdmin && (
                <>
                  {/* Wishlist Button */}
                  <Link
                    to="/wishlist"
                    className="relative flex items-center gap-1.5 bg-[#302625] hover:bg-[#4A071B] text-[#C6A15B] hover:text-white px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all border border-[#C6A15B]/30"
                    title="View Saved Favorites"
                  >
                    <FiHeart className="w-4 h-4 text-rose-500 fill-current" />
                    <span className="hidden lg:inline">Wishlist</span>
                  </Link>

                  {/* Shopping Cart Button */}
                  <Link
                    to="/cart"
                    className="relative flex items-center gap-2 bg-[#650A25] hover:bg-[#4A071B] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all border border-[#C6A15B]/40"
                  >
                    <FiShoppingBag className="w-4 h-4 text-[#C6A15B]" />
                    <span className="hidden sm:inline">Cart</span>
                    <span className="bg-[#C6A15B] text-gray-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                      {cartItems.length}
                    </span>
                  </Link>

                  {/* Direct WhatsApp Hotline Button */}
                  <a
                    href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=${encodeURIComponent('Hello Vastraa, I would like to enquire about silk saree availability.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden md:flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
                  >
                    <FiMessageCircle className="w-4 h-4 text-white" />
                    <span>WhatsApp</span>
                  </a>
                </>
              )}

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleMode}
                title={mode === 'dark' ? "Switch to Light Luxury Theme" : "Switch to Dark Theme"}
                className="p-2.5 rounded-xl bg-[#302625] text-[#C6A15B] hover:text-white border border-[#C6A15B]/30 transition-all flex items-center justify-center"
              >
                {mode === 'dark' ? <FiSun className="w-4 h-4 text-amber-300" /> : <FiMoon className="w-4 h-4 text-[#C6A15B]" />}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={isAdmin ? "/dashboard" : "/account"}
                    className="hidden xl:inline-flex items-center gap-1 text-xs font-bold text-[#C6A15B] bg-[#302625] px-3 py-2 rounded-xl border border-[#C6A15B]/30 max-w-[160px] truncate hover:underline"
                    title={isAdmin ? "Admin Profile" : "View My Account"}
                  >
                    <FiUser className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{user?.user?.email || "Account"}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-xs font-bold text-gray-300 hover:text-rose-400 px-3 py-2 transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex items-center gap-1 text-[#C6A15B] hover:text-white text-xs font-bold px-3 py-2 transition-all"
                  >
                    <FiUser className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/admin-login"
                    className="hidden sm:inline-block border border-[#C6A15B] text-[#C6A15B] hover:bg-[#650A25] hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all"
                  >
                    Admin
                  </Link>
                </div>
              )}
            </div>

          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-[#211A19] pb-12 shadow-2xl text-white">
                <div className="flex px-4 pt-5 pb-2 justify-between items-center border-b border-[#C6A15B]/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#800020] border border-[#C6A15B] flex items-center justify-center font-serif font-black text-amber-200">
                      V
                    </div>
                    <span className="font-serif font-bold text-lg text-amber-100">VASTRAA</span>
                  </div>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 px-4 py-6">
                  <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-bold text-gray-200 hover:bg-[#4A071B]"
                  >
                    Home
                  </Link>
                  <Link
                    to="/allproducts"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-bold text-gray-200 hover:bg-[#4A071B]"
                  >
                    Browse 9 Live Catalogues (A–I)
                  </Link>

                  {user ? (
                    <>
                      <Link
                        to="/purchase-journey"
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2 rounded-xl text-sm font-bold text-amber-300 bg-[#4A071B] border border-[#C6A15B]/30"
                      >
                        Purchase Journey Portal
                      </Link>
                      {!isAdmin && (
                        <Link
                          to="/account"
                          onClick={() => setOpen(false)}
                          className="block px-3 py-2 rounded-xl text-sm font-bold text-gray-200 hover:bg-[#4A071B]"
                        >
                          My Account Profile
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/dashboard"
                          onClick={() => setOpen(false)}
                          className="block px-3 py-2 rounded-xl text-sm font-bold text-amber-200 bg-[#800020]"
                        >
                          Admin Command Dashboard
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-950/40"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="pt-4 border-t border-gray-800 space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setOpen(false)}
                        className="block w-full text-center bg-[#800020] text-amber-100 px-4 py-3 rounded-xl font-bold text-sm shadow-md"
                      >
                        Sign In / Register
                      </Link>
                      <Link
                        to="/admin-login"
                        onClick={() => setOpen(false)}
                        className="block w-full text-center border border-[#C6A15B] text-[#C6A15B] px-4 py-2.5 rounded-xl font-bold text-xs"
                      >
                        Admin Portal
                      </Link>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default Navbar;
