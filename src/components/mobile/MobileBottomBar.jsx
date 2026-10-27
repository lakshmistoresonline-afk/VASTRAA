import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiHome, FiGrid, FiShoppingBag, FiTruck, FiUser } from 'react-icons/fi';

function MobileBottomBar() {
  const location = useLocation();
  const cartItems = useSelector((state) => state.cart);
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#211A19]/95 backdrop-blur-md border-t border-[#C6A15B]/30 px-2 py-2 text-white shadow-2xl flex justify-around items-center text-[10px] font-bold transition-all">

      <Link
        to="/"
        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
          isActive('/') ? 'text-[#E5C158] bg-[#4A071B]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <FiHome className="w-5 h-5" />
        <span>Home</span>
      </Link>

      <Link
        to="/allproducts"
        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
          isActive('/allproducts') ? 'text-[#E5C158] bg-[#4A071B]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <FiGrid className="w-5 h-5" />
        <span>Sarees</span>
      </Link>

      <Link
        to="/cart"
        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl relative transition-all ${
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
        <span>Bag</span>
      </Link>

      <Link
        to="/purchase-journey"
        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
          isActive('/purchase-journey') ? 'text-[#E5C158] bg-[#4A071B]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <FiTruck className="w-5 h-5" />
        <span>Journey</span>
      </Link>

      <Link
        to="/account"
        className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
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
