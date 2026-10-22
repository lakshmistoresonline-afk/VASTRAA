import React, { useContext, useState, useEffect } from 'react';
import myContext from '../../context/data/myContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { FiX, FiChevronLeft, FiChevronRight, FiHeart, FiCheckCircle, FiShoppingBag } from 'react-icons/fi';

const FALLBACK_SAREE_IMG = "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

/**
 * Bulletproof category matching helper
 */
function matchCategory(obj, filter) {
  if (!filter) return true;

  if (obj.categoryName === filter || obj.catalogueCode === filter) return true;

  const cleanFilter = filter.toLowerCase().trim();
  const cleanCatName = (obj.categoryName || '').toLowerCase().trim();
  const cleanCatCode = (obj.catalogueCode || '').toLowerCase().trim();

  if (cleanCatCode === cleanFilter || cleanCatName === cleanFilter) return true;

  if (cleanFilter === 'pure' && ['A', 'B', 'C'].includes(obj.catalogueCode)) {
    return true;
  }

  if (cleanFilter === 'semi' && ['D', 'E', 'F', 'G', 'H', 'I'].includes(obj.catalogueCode)) {
    return true;
  }

  return cleanCatName.includes(cleanFilter) || cleanFilter.includes(cleanCatName);
}

/**
 * Smart Search Helper with Natural Category Keyword Mapping
 */
function matchesSearch(obj, query) {
  if (!query) return true;
  const q = query.toLowerCase().trim();

  // 1. Direct match on ID, title, category name, or code
  if (
    obj.title?.toLowerCase().includes(q) ||
    obj.categoryName?.toLowerCase().includes(q) ||
    obj.catalogueCode?.toLowerCase().includes(q) ||
    obj.id?.toLowerCase().includes(q)
  ) {
    return true;
  }

  // 2. Smart Category Keyword Mappings
  if ((q.includes('pure') || q.includes('wedding')) && ['A', 'B', 'C'].includes(obj.catalogueCode)) {
    return true;
  }
  if (q.includes('semi') && ['D', 'E', 'F', 'G', 'H', 'I'].includes(obj.catalogueCode)) {
    return true;
  }
  if (q.includes('art') && ['F', 'G', 'H', 'I'].includes(obj.catalogueCode)) {
    return true;
  }
  if (q.includes('fancy') && ['B', 'E'].includes(obj.catalogueCode)) {
    return true;
  }
  if (q.includes('soft') && obj.catalogueCode === 'C') {
    return true;
  }

  return false;
}

function ProductCard({ limit = 0, isPaginated = true, itemsPerPage = 24 }) {
  const context = useContext(myContext);
  const { product, searchKey, filterType } = context;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);

  // Reset to page 1 whenever filter or search key changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, filterType]);

  // Automatically scroll to results section when filterType changes
  useEffect(() => {
    if (filterType !== undefined) {
      const element = document.getElementById('live-showcase');
      if (element) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        element.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    }
  }, [filterType]);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
      toast.info("Removed from Wishlist");
    } else {
      setWishlist([...wishlist, id]);
      toast.success("Saved to Wishlist!");
    }
  };

  const handleAddToCart = (item) => {
    const exists = cart.some(cartItem => cartItem.id === item.id);
    if (exists) {
      toast.info("This saree is already in your shopping bag.");
      navigate('/cart');
    } else {
      dispatch(addToCart(item));
      toast.success("Saree added to your Shopping Bag!");
    }
  };

  const filteredProducts = product
    .filter((obj) => matchCategory(obj, filterType))
    .filter((obj) => matchesSearch(obj, searchKey));

  // Pagination calculation
  const effectivePerPage = isPaginated ? itemsPerPage : (limit || 24);
  const totalPages = Math.ceil(filteredProducts.length / effectivePerPage) || 1;

  const displayProducts = isPaginated
    ? filteredProducts.slice((currentPage - 1) * effectivePerPage, currentPage * effectivePerPage)
    : filteredProducts.slice(0, limit || 24);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const element = document.getElementById('live-showcase');
    if (element) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  // Helper for pagination page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  const startItemNum = (currentPage - 1) * effectivePerPage + 1;
  const endItemNum = Math.min(currentPage * effectivePerPage, filteredProducts.length);

  return (
    <section id="live-showcase" className="py-12 bg-[#FAF7F0] dark:bg-gray-950 transition-colors scroll-mt-28">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E9E1D5] dark:border-gray-800">
          <div>
            <span className="text-[#800020] dark:text-[#E5C158] font-bold text-[11px] uppercase tracking-widest block mb-1">
              Handcrafted Silks
            </span>
            <h2 className="text-3xl font-serif font-extrabold text-[#24211F] dark:text-white">
              Fresh from the Collection
            </h2>
            <p className="text-xs text-[#77716A] dark:text-gray-400 mt-1">
              Handpicked silk sarees from our exclusive curation.
            </p>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 space-y-3 shadow-sm">
            <p className="text-[#77716A] dark:text-gray-400 text-base font-medium">No sarees match your current search or category filter.</p>
            <p className="text-xs text-gray-400">Try resetting filters or searching for terms like "Pure Silk", "Soft Silk", "Wedding", or "Semi".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((item) => {
              const {
                id,
                title,
                imageUrl,
                categoryName,
                indicativePriceRange,
                price
              } = item;

              const isSaved = wishlist.includes(id);
              const isInCart = cart.some(cartItem => cartItem.id === id);

              return (
                <div
                  key={id}
                  className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-[#E9E1D5] dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-[#C5A46D] transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image Box */}
                    <div
                      onClick={() => navigate(`/productinfo/${id}`)}
                      className="relative aspect-[3/4] overflow-hidden bg-[#FAF7F0] dark:bg-gray-800 cursor-pointer"
                    >
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={imageUrl || FALLBACK_SAREE_IMG}
                        alt={title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_SAREE_IMG;
                        }}
                      />

                      {/* Wishlist Heart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                          isSaved
                            ? 'bg-[#800020] text-rose-300'
                            : 'bg-white/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 hover:text-[#800020]'
                        }`}
                        title="Save to Wishlist"
                      >
                        <FiHeart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Saree Details */}
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-extrabold text-[#800020] dark:text-[#E5C158] uppercase tracking-wider block truncate">
                        {categoryName}
                      </span>

                      <h3
                        onClick={() => navigate(`/productinfo/${id}`)}
                        className="font-serif text-sm font-bold text-[#24211F] dark:text-white line-clamp-1 hover:text-[#800020] dark:hover:text-[#E5C158] transition-colors cursor-pointer"
                      >
                        {title}
                      </h3>

                      {/* Indicative Range Box */}
                      <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-2.5 rounded-xl text-xs space-y-1 border border-[#E9E1D5] dark:border-gray-700/50">
                        <div className="flex justify-between text-[#77716A] dark:text-gray-300 text-[11px]">
                          <span>Indicative Range:</span>
                          <span className="font-bold text-[#24211F] dark:text-white">{indicativePriceRange}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-[#800020] dark:text-[#E5C158] text-xs pt-1 border-t border-[#E9E1D5] dark:border-gray-700">
                          <span>Individual Price:</span>
                          <span>{price ? `₹${price}` : "Price on Enquiry"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Single Unified Cart Action CTA (Add to Bag / Already in Bag) */}
                  <div className="p-4 pt-0">
                    {isInCart ? (
                      <button
                        onClick={() => navigate('/cart')}
                        type="button"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <FiCheckCircle className="w-4 h-4 text-emerald-300" />
                        <span>Already in Bag · View Bag</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        type="button"
                        className="w-full bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold py-3 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#C5A46D]/40"
                      >
                        <FiShoppingBag className="w-4 h-4 text-[#C5A46D]" />
                        <span>Add to Bag</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Modern Pagination Controls */}
        {isPaginated && totalPages > 1 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E9E1D5] dark:border-gray-800">
            <p className="text-xs text-[#77716A] dark:text-gray-400 font-medium">
              Showing <span className="font-bold text-[#24211F] dark:text-white">{startItemNum}</span> to{' '}
              <span className="font-bold text-[#24211F] dark:text-white">{endItemNum}</span> of{' '}
              <span className="font-bold text-[#24211F] dark:text-white">{filteredProducts.length}</span> Sarees
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E9E1D5] dark:border-gray-800 bg-white dark:bg-gray-800 text-[#24211F] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all shadow-sm"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {getPageNumbers().map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-2 py-1 text-xs text-gray-400 font-bold">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                      currentPage === pageNum
                        ? 'bg-[#800020] text-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-[#24211F] dark:text-gray-200 border border-[#E9E1D5] dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E9E1D5] dark:border-gray-800 bg-white dark:bg-gray-800 text-[#24211F] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all shadow-sm"
              >
                <span>Next</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default ProductCard;
