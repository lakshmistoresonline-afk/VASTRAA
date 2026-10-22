import React, { useContext, useState, useEffect } from 'react';
import myContext from '../../context/data/myContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { FiMessageCircle, FiSend, FiX, FiChevronLeft, FiChevronRight, FiHeart, FiCheckCircle, FiShoppingBag } from 'react-icons/fi';

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

function ProductCard({ limit = 0, isPaginated = true, itemsPerPage = 24 }) {
  const context = useContext(myContext);
  const { product, searchKey, filterType, storeInfo, addEnquiry } = context;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);

  // Reset to page 1 whenever filter or search key changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, filterType]);

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
    dispatch(addToCart(item));
    toast.success("Saree added to your Shopping Bag!");
  };

  // Enquiry modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    message: ''
  });

  const handleModalClose = () => {
    setSelectedProduct(null);
    setEnquirySuccess(false);
    setEnquiryForm({ customerName: '', phone: '', address: '', message: '' });
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = enquiryForm.phone.replace(/[^0-9]/g, '');

    if (!enquiryForm.customerName || enquiryForm.customerName.trim().length === 0) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp mobile number.");
      return;
    }

    toast.info("Submitting your enquiry...");

    const res = await addEnquiry({
      sareeId: selectedProduct.id,
      sareeTitle: selectedProduct.title,
      categoryName: selectedProduct.categoryName,
      imageUrl: selectedProduct.imageUrl,
      customerName: enquiryForm.customerName,
      phone: cleanPhone,
      address: enquiryForm.address,
      message: enquiryForm.message,
    });

    if (res && res.success) {
      setEnquirySuccess(true);
      toast.success("Enquiry received successfully!");
    } else {
      setEnquirySuccess(true);
      toast.success("Enquiry recorded!");
    }
  };

  const filteredProducts = product
    .filter((obj) => {
      if (!searchKey) return true;
      const key = searchKey.toLowerCase().trim();
      return (
        obj.title?.toLowerCase().includes(key) ||
        obj.categoryName?.toLowerCase().includes(key) ||
        obj.catalogueCode?.toLowerCase().includes(key) ||
        obj.id?.toLowerCase().includes(key)
      );
    })
    .filter((obj) => matchCategory(obj, filterType));

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
      element.scrollIntoView({ behavior: 'smooth' });
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
    <section id="live-showcase" className="py-12 bg-[#FAF7F0] dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E9E1D5] dark:border-gray-800">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Inventory Synced from Showroom</span>
            </div>
            <h2 className="text-3xl font-serif font-extrabold text-[#24211F] dark:text-white">
              Fresh from the Catalogue
            </h2>
            <p className="text-xs text-[#77716A] dark:text-gray-400 mt-1">
              Handpicked sarees from our latest showroom catalogue, updated in real time.
            </p>
          </div>

          <div className="text-xs font-bold text-[#77716A] dark:text-gray-300 bg-white dark:bg-gray-900 px-4 py-2.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 shadow-sm">
            <span>
              {filteredProducts.length > 0
                ? `Showing ${startItemNum}–${endItemNum} of ${filteredProducts.length} Verified Sarees`
                : 'Showing 0 Verified Sarees'}
            </span>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 space-y-3 shadow-sm">
            <p className="text-[#77716A] dark:text-gray-400 text-base font-medium">No sarees match your current search or category filter.</p>
            <p className="text-xs text-gray-400">Try resetting filters or searching for terms like "Pure Silk", "Soft Silk", or "Wedding".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((item) => {
              const {
                id,
                title,
                imageUrl,
                categoryName,
                catalogueCode,
                indicativePriceRange,
                price
              } = item;

              const isSaved = wishlist.includes(id);

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
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                      />

                      {/* Code Badge */}
                      <div className="absolute top-3 left-3 bg-[#800020] text-[#E5C158] border border-[#C5A46D]/60 text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm backdrop-blur-md">
                        Cat {catalogueCode}
                      </div>

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

                  {/* Dual Action CTAs: Add to Bag + Request Enquiry */}
                  <div className="p-4 pt-0 space-y-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      type="button"
                      className="w-full bg-[#302625] hover:bg-black text-[#C6A15B] font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 border border-[#C6A15B]/30"
                    >
                      <FiShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProduct(item);
                        setEnquirySuccess(false);
                      }}
                      type="button"
                      className="w-full bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold py-2.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 border border-[#C5A46D]/40"
                    >
                      <FiSend className="w-3.5 h-3.5 text-[#C5A46D]" />
                      <span>Request Enquiry</span>
                    </button>
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

        {/* Availability Enquiry Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-[#E9E1D5] dark:border-gray-800">
              <button
                onClick={handleModalClose}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2"
              >
                <FiX className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  className="w-16 h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
                />
                <div>
                  <span className="text-xs font-bold text-[#800020] dark:text-[#E5C158]">
                    {selectedProduct.categoryName}
                  </span>
                  <h3 className="font-serif font-bold text-[#24211F] dark:text-white text-base">
                    {selectedProduct.title}
                  </h3>
                  <p className="text-xs text-[#77716A] dark:text-gray-400">
                    Indicative Range: {selectedProduct.indicativePriceRange}
                  </p>
                </div>
              </div>

              {enquirySuccess ? (
                /* Success Confirmation State */
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                    <FiCheckCircle />
                  </div>
                  <h4 className="font-serif font-bold text-xl text-[#24211F] dark:text-white">
                    Enquiry Received Successfully!
                  </h4>
                  <p className="text-xs text-[#77716A] dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
                    Thank you, <span className="font-bold text-[#24211F] dark:text-white">{enquiryForm.customerName || "Valued Customer"}</span>. Our team has received your enquiry for <span className="font-bold text-[#800020] dark:text-[#E5C158]">{selectedProduct.title}</span>. We will assist you shortly via WhatsApp / Call.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=${encodeURIComponent(
                        `Hello Vastraa (Co-Brand of Lakshmi Stores), I just submitted an enquiry for saree ID: ${selectedProduct.id} (${selectedProduct.title}). Customer Name: ${enquiryForm.customerName}, Phone: ${enquiryForm.phone}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <FiMessageCircle className="w-4 h-4" />
                      <span>Chat Instantly on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleModalClose}
                      className="px-6 py-3.5 border border-[#E9E1D5] text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Close & Continue
                    </button>
                  </div>
                </div>
              ) : (
                /* Enquiry Form State */
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <h4 className="font-bold text-sm text-[#24211F] dark:text-white">
                    Send Availability & Price Enquiry to Vastraa
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.customerName}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, customerName: e.target.value })}
                      className="w-full text-xs sm:text-sm px-4 py-3 border border-[#E9E1D5] rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-[#800020] outline-none"
                      placeholder="e.g. Ananya Nair"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                      10-Digit WhatsApp Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      className="w-full text-xs sm:text-sm px-4 py-3 border border-[#E9E1D5] rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-[#800020] outline-none"
                      placeholder="e.g. 9746998785"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                      Delivery Address / Pincode (Optional for Shipping)
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.address}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, address: e.target.value })}
                      className="w-full text-xs sm:text-sm px-4 py-3 border border-[#E9E1D5] rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-[#800020] outline-none"
                      placeholder="Enter delivery address / city / pincode for shipping"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                      Message / Special Requests
                    </label>
                    <textarea
                      rows={2}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      className="w-full text-xs sm:text-sm px-4 py-3 border border-[#E9E1D5] rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-[#800020] outline-none"
                      placeholder="Ask about exact individual price, color variations, or matching blouse..."
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-[#800020] hover:bg-[#67001a] text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <FiSend className="w-4 h-4 text-[#C5A46D]" />
                      <span>Submit Direct Enquiry</span>
                    </button>

                    <a
                      href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=${encodeURIComponent(
                        `Hello Vastraa (Co-Brand of Lakshmi Stores), I am interested in saree ID: ${selectedProduct.id} (${selectedProduct.categoryName}). Photo: ${selectedProduct.imageUrl}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                    >
                      <FiMessageCircle className="w-4 h-4" />
                      <span>WhatsApp Now</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

export default ProductCard;
