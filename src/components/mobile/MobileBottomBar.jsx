import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiHome, FiGrid, FiShoppingBag, FiTruck, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import myContext from '../../context/data/myContext';

function MobileBottomBar() {
  const context = useContext(myContext);
  const { mode, toggleMode, enquiries } = context;

  const location = useLocation();
  const cartItems = useSelector((state) => state.cart);
  const currentPath = location.pathname;

  const user = JSON.parse(localStorage.getItem('user'));
  const userEmail = user?.user?.email?.trim().toLowerCase();
  const userUid = user?.user?.uid;

  const hasReadyQuotation = (user && enquiries) ? enquiries.some(e =>
    e.status === 'QUOTATION_READY' &&
    ((userEmail && e.customerEmail?.trim().toLowerCase() === userEmail) || (userUid && e.customerUid === userUid))
  ) : false;

  const isActive = (path) => currentPath === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#211A19]/95 backdrop-blur-md border-t border-[#C6A15B]/30 px-2 py-2 text-white shadow-2xl flex justify-around items-center text-[10px] font-bold transition-all">

      <Link
        to="/"
        className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
          isActive('/') ? 'text-[#E5C158] bg-[#4A071B]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <FiHome className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        to="/allproducts"
        className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
          isActive('/allproducts') ? 'text-[#E5C158] bg-[#4A071B]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <FiGrid className="w-5 h-5" />
        <span>Sarees</span>
      </Link>

      <Link
        to="/cart"
        className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl relative transition-all ${
          isActive('/cart') ? 'text-[#E5C158] bg-[#4A071B]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <FiShoppingBag className="w-5 h-5" />
          {cartItems && cartItems.length > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#800020] text-amber-100 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#C6A15B]">
              {cartItems.length}
            </span>
          )}
        </div>
        <span>Cart</span>
      </Link>

      <Link
        to="/purchase-journey"
        className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl relative transition-all ${
          isActive('/purchase-journey') ? 'text-[#E5C158] bg-[#4A071B]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <div className="relative">
          <FiTruck className="w-5 h-5" />
          {hasReadyQuotation && (
            <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-gray-950 text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white animate-pulse">
              !
            </span>
          )}
        </div>
        <span>Journey</span>
      </Link>

      <button
        type="button"
        onClick={toggleMode}
        title={mode === 'dark' ? "Light Mode" : "Dark Mode"}
        className="flex flex-col items-center gap-1 px-2.5 py-1 text-gray-400 hover:text-amber-300"
      >
        {mode === 'dark' ? <FiSun className="w-5 h-5 text-amber-300" /> : <FiMoon className="w-5 h-5 text-[#C6A15B]" />}
        <span>Theme</span>
      </button>

      <Link
        to="/account"
        className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
          isActive('/account') ? 'text-[#E5C158] bg-[#4A071B]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <FiUser className="w-5 h-5" />
        <span>Account</span>
      </Link>

    </div>
  );
}

export default MobileBottomBar;
