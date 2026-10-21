import React, { Fragment, useContext, useState } from 'react';
import { BsFillCloudSunFill } from 'react-icons/bs';
import { FiSun, FiMessageCircle, FiSearch, FiMenu, FiX, FiCheckCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import myContext from '../../context/data/myContext';
import { Dialog, Transition } from '@headlessui/react';

const Navbar = () => {
  const context = useContext(myContext);
  const { mode, toggleMode, storeInfo, searchKey, setSearchKey } = context;
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

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
    <div className="sticky top-0 z-50">
      {/* Top Announcement Bar */}
      <div className="maroon-gradient text-[#E5C158] text-xs py-2 px-4 border-b border-[#C5A46D]/30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-medium text-[11px] sm:text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Authentic Pure Silk Sarees • Pan India Express Shipping • Handloom Guarantee</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs">
            <span className="flex items-center gap-1">
              <FiCheckCircle className="text-emerald-400" /> Verified Live Inventory
            </span>
            <a
              href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#E5C158] hover:underline flex items-center gap-1 font-bold"
            >
              📞 Hotline / Enquiry: {storeInfo?.phone || "+91 97469 98785"}
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navbar */}
      <header className="glass-card shadow-lg transition-colors">
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="p-2.5 rounded-xl text-gray-700 dark:text-gray-200 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpen(true)}
            >
              <FiMenu className="w-6 h-6" />
            </button>

            {/* Store Brand Logo */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="bg-gradient-to-br from-[#800020] to-[#4A0012] text-[#E5C158] w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-serif font-black shadow-md border-2 border-[#C5A46D] group-hover:scale-105 transition-transform">
                V
              </div>
              <div>
                <h1 className="text-2xl font-serif font-extrabold text-[#24211F] dark:text-white leading-tight tracking-tight">
                  {storeInfo?.name || "Vastraa"}
                </h1>
                <p className="text-[10px] font-sans uppercase tracking-widest text-[#800020] dark:text-[#E5C158] font-bold">
                  {storeInfo?.coBrand || "A Co-Brand of Lakshmi Stores"} • Online Silk Store
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 bg-[#FAF7F0] dark:bg-gray-800/80 p-1.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700/50">
              <Link
                to="/"
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#24211F] dark:text-gray-200 hover:text-[#800020] dark:hover:text-[#E5C158] transition-all"
              >
                Home
              </Link>
              <Link
                to="/allproducts"
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#24211F] dark:text-gray-200 hover:text-[#800020] dark:hover:text-[#E5C158] transition-all"
              >
                Silk Sarees
              </Link>
              <Link
                to="/order"
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#24211F] dark:text-gray-200 hover:text-[#800020] dark:hover:text-[#E5C158] transition-all"
              >
                Enquiries & Orders
              </Link>

              {isAdmin && (
                <Link
                  to="/dashboard"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#800020] text-amber-100 shadow-md hover:bg-[#67001a] transition-all"
                >
                  Admin Portal
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Quick Search Trigger */}
              <div className="hidden md:flex items-center bg-[#FAF7F0] dark:bg-gray-800 rounded-xl px-3 py-2 border border-[#E9E1D5] dark:border-gray-700">
                <FiSearch className="text-gray-400 w-4 h-4 mr-2" />
                <input
                  type="text"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  placeholder="Search 3,250+ silk sarees..."
                  className="bg-transparent text-xs outline-none text-[#24211F] dark:text-white placeholder:text-gray-400 w-36 focus:w-48 transition-all"
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleMode}
                className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-[#800020] dark:hover:text-[#E5C158] transition-colors rounded-xl bg-[#FAF7F0] dark:bg-gray-800 border border-[#E9E1D5] dark:border-gray-700"
                title="Toggle Dark/Light Mode"
              >
                {mode === 'light' ? <FiSun className="w-4 h-4" /> : <BsFillCloudSunFill className="w-4 h-4 text-amber-400" />}
              </button>

              {/* Direct WhatsApp Hotline Button (Replaces Bag/Cart) */}
              <a
                href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=Hello%20Vastraa,%20I%20would%20like%20to%20enquire%20about%20silk%20saree%20availability.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all"
              >
                <FiMessageCircle className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              {user ? (
                <button
                  onClick={logout}
                  className="hidden sm:inline-block text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-rose-600 px-3 py-2"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-block border border-[#800020] text-[#800020] dark:border-[#E5C158] dark:text-[#E5C158] hover:bg-[#800020] hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Admin
                </Link>
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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-[#FAF7F0] dark:bg-gray-900 pb-12 shadow-2xl">
                <div className="flex px-5 pb-4 pt-6 justify-between items-center border-b border-[#E9E1D5] dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#800020] text-[#E5C158] w-10 h-10 rounded-lg flex items-center justify-center font-serif font-bold border border-[#C5A46D]">
                      V
                    </div>
                    <div>
                      <span className="text-lg font-serif font-bold text-[#24211F] dark:text-white block leading-tight">Vastraa</span>
                      <span className="text-[10px] text-[#77716A]">A Co-Brand of Lakshmi Stores</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setOpen(false)}
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3 px-5 py-6 text-sm font-semibold">
                  <Link to="/" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 text-[#24211F] dark:text-white">
                    🏠 Home
                  </Link>
                  <Link to="/allproducts" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 text-[#24211F] dark:text-white">
                    👗 Silk Sarees
                  </Link>
                  <Link to="/order" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 text-[#24211F] dark:text-white">
                    📩 Enquiries & Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl bg-[#800020] text-amber-100 font-bold">
                      🔑 Admin Dashboard
                    </Link>
                  )}

                  {user ? (
                    <button onClick={logout} className="block w-full text-left py-2.5 px-3 text-rose-600 font-bold">
                      🚪 Logout
                    </button>
                  ) : (
                    <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 rounded-xl text-[#800020] font-bold border border-[#800020] text-center mt-4">
                      Admin Sign In
                    </Link>
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
