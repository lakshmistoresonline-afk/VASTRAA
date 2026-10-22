import React, { Fragment, useContext, useState } from 'react';
import { FiMessageCircle, FiShoppingBag, FiMenu, FiX, FiCheckCircle, FiUser } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { Dialog, Transition } from '@headlessui/react';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const context = useContext(myContext);
  const { storeInfo } = context;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const cartItems = useSelector((state) => state.cart);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isAdmin = user?.user?.email === "admin@gmail.com" ||
                  user?.user?.email === "lakshmistoresonline@gmail.com" ||
                  user?.user?.email === "admin@vastraa.com" ||
                  user?.user?.email === "admin@lakshmistores.com" ||
                  user?.user?.email === "aliali@gmail.com";

  return (
    <div className="sticky top-0 z-50 w-full shadow-md bg-[#211A19] dark:bg-gray-950">
      {/* Top Announcement Bar */}
      <div className="bg-[#4A071B] text-[#C6A15B] text-[11px] sm:text-xs py-2 px-4 border-b border-[#C6A15B]/30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Timeless Silk Sarees • Pan India Express Shipping • Handloom Guarantee</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs">
            <span className="flex items-center gap-1 text-amber-200">
              <FiCheckCircle className="text-emerald-400" /> Verified Showroom Collections
            </span>
            <a
              href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#C6A15B] hover:underline flex items-center gap-1 font-bold"
            >
              📞 Hotline: {storeInfo?.phone || "+91 97469 98785"}
            </a>
          </div>
        </div>
      </div>

      {/* Main Opaque Navigation Bar */}
      <header className="bg-[#211A19] dark:bg-gray-900 border-b border-[#302625] dark:border-gray-800 transition-colors">
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="p-2.5 rounded-xl text-gray-200 lg:hidden hover:bg-white/10"
              onClick={() => setOpen(true)}
            >
              <FiMenu className="w-6 h-6 text-[#C6A15B]" />
            </button>

            {/* Store Brand Logo */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="bg-gradient-to-br from-[#650A25] to-[#4A071B] text-[#C6A15B] w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-serif font-black shadow-md border-2 border-[#C6A15B] group-hover:scale-105 transition-transform">
                V
              </div>
              <div>
                <h1 className="text-2xl font-serif font-extrabold text-[#F7F0E4] leading-tight tracking-tight">
                  {storeInfo?.name || "Vastraa"}
                </h1>
                <p className="text-[10px] font-sans uppercase tracking-widest text-[#C6A15B] font-bold">
                  {storeInfo?.coBrand || "A Co-Brand of Lakshmi Stores"} • Online Silk Store
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 bg-[#302625] dark:bg-gray-800 p-1.5 rounded-2xl border border-[#C6A15B]/30">
              <Link
                to="/"
                className="px-5 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-[#C6A15B] transition-all"
              >
                Home
              </Link>
              <Link
                to="/allproducts"
                className="px-5 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-[#C6A15B] transition-all"
              >
                Silk Sarees
              </Link>
              <Link
                to="/order"
                className="px-5 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-[#C6A15B] transition-all"
              >
                Enquiries & Orders
              </Link>
              {user && (
                <Link
                  to="/account"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-gray-200 hover:text-[#C6A15B] transition-all"
                >
                  My Account
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/dashboard"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#650A25] text-amber-100 shadow-md hover:bg-[#4A071B] transition-all border border-[#C6A15B]/40"
                >
                  Admin Portal
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">

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

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/account"
                    className="hidden xl:inline-flex items-center gap-1 text-xs font-bold text-[#C6A15B] bg-[#302625] px-3 py-2 rounded-xl border border-[#C6A15B]/30 max-w-[160px] truncate hover:underline"
                    title="View My Account"
                  >
                    <FiUser className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{user?.user?.email || "Account"}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="text-xs font-bold text-gray-300 hover:text-rose-400 px-3 py-2 transition-colors"
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

      {/* Mobile Drawer */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
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
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-[#211A19] text-white pb-12 shadow-2xl border-r border-[#C6A15B]/30">
                <div className="flex px-5 pb-4 pt-6 justify-between items-center border-b border-[#302625]">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#650A25] text-[#C6A15B] w-10 h-10 rounded-lg flex items-center justify-center font-serif font-bold border border-[#C6A15B]">
                      V
                    </div>
                    <div>
                      <span className="text-lg font-serif font-bold text-white block leading-tight">Vastraa</span>
                      <span className="text-[10px] text-[#C6A15B]">A Co-Brand of Lakshmi Stores</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-white"
                    onClick={() => setOpen(false)}
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3 px-5 py-6 text-sm font-semibold">
                  {user && (
                    <div className="bg-[#302625] p-3 rounded-xl border border-[#C6A15B]/30 text-xs text-[#C6A15B] mb-2 truncate">
                      👤 Signed in as: <span className="font-bold text-white">{user?.user?.email}</span>
                    </div>
                  )}

                  <Link to="/" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-white/10 text-gray-200">
                    🏠 Home
                  </Link>
                  <Link to="/allproducts" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-white/10 text-gray-200">
                    👗 Silk Sarees
                  </Link>
                  <Link to="/cart" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-white/10 text-gray-200 flex justify-between items-center">
                    <span>🛍️ Shopping Cart</span>
                    <span className="bg-[#C6A15B] text-gray-950 px-2 py-0.5 rounded-full text-xs font-extrabold">{cartItems.length}</span>
                  </Link>
                  <Link to="/order" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-white/10 text-gray-200">
                    📩 Enquiries & Orders
                  </Link>
                  {user && (
                    <Link to="/account" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-white/10 text-gray-200">
                      👤 My Account / Profile
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl bg-[#650A25] text-amber-100 font-bold border border-[#C6A15B]/40">
                      🔑 Admin Dashboard
                    </Link>
                  )}

                  {user ? (
                    <button onClick={logout} className="block w-full text-left py-2.5 px-3 text-rose-400 font-bold">
                      🚪 Logout
                    </button>
                  ) : (
                    <div className="pt-2 space-y-2">
                      <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl bg-[#650A25] text-amber-100 font-bold text-center">
                        👤 Customer Sign In / Register
                      </Link>
                      <Link to="/admin-login" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl border border-[#C6A15B] text-[#C6A15B] font-bold text-center">
                        🔑 Admin Portal Sign In
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

Navbar.displayName = 'Navbar';

export default Navbar;
