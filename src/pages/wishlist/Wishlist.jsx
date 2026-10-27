import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import SingleProductCard from '../../components/productCard/ProductCard';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(saved);
  }, []);

  const handleClearWishlist = () => {
    localStorage.setItem('wishlist', JSON.stringify([]));
    setWishlistItems([]);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F0] dark:bg-gray-950 py-10 px-4 transition-colors">
        <div className="container mx-auto max-w-7xl space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E9E1D5] dark:border-gray-800 pb-6">
            <div>
              <span className="text-xs font-bold text-[#800020] dark:text-[#E5C158] uppercase tracking-widest block">
                Saved Favorites
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-gray-900 dark:text-white mt-1">
                Your Saved Saree Wishlist ({wishlistItems.length})
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Handpicked sarees bookmarked for wedding selection and family review.
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearWishlist}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 border border-rose-200 dark:border-rose-900 px-4 py-2 rounded-xl transition-colors"
              >
                Clear Wishlist
              </button>
            )}
          </div>

          {/* Wishlist Grid */}
          {wishlistItems.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 text-center space-y-4 shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                <FiHeart />
              </div>
              <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Click the heart icon on any saree while browsing our 9 live handloom catalogues to save your favorites here.
              </p>
              <div className="pt-2">
                <Link
                  to="/allproducts"
                  className="inline-flex items-center gap-2 bg-[#800020] text-amber-100 px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#67001a] transition-all shadow-md"
                >
                  <span>Explore Silk Sarees</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <SingleProductCard key={item.id} item={item} />
              ))}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

export default Wishlist;
