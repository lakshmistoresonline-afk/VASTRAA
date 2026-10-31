import React, { useContext, useState, useEffect } from 'react';
import myContext from '../../context/data/myContext';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { FiShoppingBag, FiCheckCircle, FiShare2, FiMessageCircle, FiHeart } from 'react-icons/fi';
import SareeImageThumbnail from '../SareeImageThumbnail';

function SingleProductCard({ item }) {
  const { id, title, categoryName, price, imageUrl, catalogueCode, stockStatus } = item || {};
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(list.some(p => p.id === id));
  }, [id]);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isWishlisted) {
      const updated = list.filter(p => p.id !== id);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsWishlisted(false);
      toast.info(`Removed "${title}" from your Wishlist`);
    } else {
      const updated = [...list, item];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsWishlisted(true);
      toast.success(`Saved "${title}" to your Wishlist ❤️`);
    }
  };

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const isInCart = cartItems.some(p => p.id === id);

  const addCart = (sareeItem) => {
    if (currentUser) {
      dispatch(addToCart(sareeItem));
      toast.success(`Added "${sareeItem.title}" to your Cart!`);
    } else {
      toast.info("Please sign in or create an account to add sarees to your Cart!");
      navigate("/login", { state: { from: location, itemToAdd: sareeItem } });
    }
  };

  const isConfirmedStock = stockStatus === 'CONFIRMED_AVAILABLE';

  const handleShareWhatsApp = (e) => {
    e.stopPropagation();
    const shareText = `✨ Look at this beautiful handloom silk saree from Vastraa!\n🌸 ${title} (${categoryName})\n💰 Price: ₹${price ? Number(price).toLocaleString() : 'Enquiry'}\n👉 View Saree Details: ${window.location.origin}/productinfo/${id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="glass-card bg-white dark:bg-gray-900 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">

      {/* Top Image & Badge Container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-100 dark:bg-gray-800">
        <SareeImageThumbnail
          id={id}
          src={imageUrl}
          alt={title}
          onClick={() => navigate(`/productinfo/${id}`)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
        />

        {/* Catalogue & Stock Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="bg-[#800020]/90 backdrop-blur-md text-[#C6A15B] px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm border border-[#C6A15B]/30">
            Cat {catalogueCode || 'A'}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm ${
            isConfirmedStock ? 'bg-emerald-600/90 text-white' : 'bg-amber-600/90 text-white'
          }`}>
            {isConfirmedStock ? '✓ In Stock' : '? Check Stock'}
          </span>
        </div>

        {/* Item 2: Wishlist Heart Floating Button */}
        <button
          onClick={toggleWishlist}
          type="button"
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 border ${
            isWishlisted
              ? 'bg-rose-600 text-white border-rose-400'
              : 'bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:text-rose-600'
          }`}
        >
          <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Item C: WhatsApp Share Floating Button */}
        <button
          onClick={handleShareWhatsApp}
          type="button"
          title="Share saree on WhatsApp"
          className="absolute top-14 right-3 z-10 w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 border border-emerald-300/40"
        >
          <FiShare2 className="w-4 h-4" />
        </button>
      </div>

      {/* Saree Details */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold text-[#800020] dark:text-[#E5C158] uppercase tracking-wider block truncate">
            {categoryName}
          </span>

          <h3
            onClick={() => navigate(`/productinfo/${id}`)}
            className="font-serif text-sm font-bold text-[#24211F] dark:text-white line-clamp-1 hover:text-[#800020] dark:hover:text-[#E5C158] transition-colors cursor-pointer"
          >
            {title}
          </h3>

          {/* Individual Saree Price */}
          <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-3 rounded-xl text-xs flex justify-between items-center border border-[#E9E1D5] dark:border-gray-700/50">
            <span className="text-xs font-bold text-gray-500">Saree Price:</span>
            <span className="font-serif font-extrabold text-base text-[#800020] dark:text-[#E5C158]">
              {price ? `₹${Number(price).toLocaleString()}` : 'Price on Enquiry'}
            </span>
          </div>
        </div>

        {/* Actions CTA */}
        <div className="pt-1 flex gap-2">
          {isInCart ? (
            <button
              onClick={() => navigate('/cart')}
              type="button"
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4 text-emerald-300" />
              <span>In Cart · View Cart</span>
            </button>
          ) : (
            <button
              onClick={() => addCart(item)}
              type="button"
              className="flex-1 bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold py-3.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#C6A15B]/40"
            >
              <FiShoppingBag className="w-4 h-4 text-[#C6A15B]" />
              <span>Add to Cart</span>
            </button>
          )}

          <button
            onClick={handleShareWhatsApp}
            type="button"
            className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
            title="Share with Family on WhatsApp"
          >
            <FiMessageCircle className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

function ProductCard(props) {
  const context = useContext(myContext);
  const { product, searchKey, filterType, filterPrice, sortPrice } = context;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = props.itemsPerPage || 24;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, filterType, filterPrice, sortPrice]);

  // If item is passed directly as prop
  if (props.item) {
    return <SingleProductCard item={props.item} />;
  }

  // Item B: Multi-Attribute Saree Search (Color, Fabric, Category, ID, Title, Description)
  const filteredProducts = product ? product.filter((obj) => {
    if (!searchKey) return true;
    const term = searchKey.toLowerCase().trim();
    return (obj.title?.toLowerCase() || '').includes(term) ||
           (obj.categoryName?.toLowerCase() || '').includes(term) ||
           (obj.id?.toLowerCase() || '').includes(term) ||
           (obj.description?.toLowerCase() || '').includes(term) ||
           (obj.catalogueCode?.toLowerCase() || '').includes(term);
  }).filter((obj) => {
    if (!filterType || filterType === '' || filterType === 'All Collections') return true;
    return obj.categoryName?.toLowerCase().includes(filterType.toLowerCase()) ||
           obj.catalogueCode?.toLowerCase() === filterType.toLowerCase();
  }).filter((obj) => {
    if (!filterPrice) return true;
    const p = Number(obj.price) || 0;
    if (filterPrice === 'under_3000') return p < 3000;
    if (filterPrice === '3000_6000') return p >= 3000 && p <= 6000;
    if (filterPrice === '6000_15000') return p > 6000 && p <= 15000;
    if (filterPrice === '15000_20000') return p > 15000 && p <= 20000;
    if (filterPrice === 'above_20000') return p > 20000;
    return true;
  }) : [];

  if (sortPrice === 'asc') {
    filteredProducts.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
  } else if (sortPrice === 'desc') {
    filteredProducts.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const el = document.getElementById('catalogue-results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-xs font-medium">
          No matching silk sarees found. Try adjusting your search or category filters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((item) => (
              <SingleProductCard key={item.id} item={item} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
              <span className="text-gray-600 dark:text-gray-300">
                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} Sarees (Page {currentPage} of {totalPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-white rounded-xl disabled:opacity-40 font-bold transition-all"
                >
                  ← Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pNum = currentPage;
                  if (currentPage <= 3) pNum = idx + 1;
                  else if (currentPage >= totalPages - 2) pNum = totalPages - 4 + idx;
                  else pNum = currentPage - 2 + idx;

                  if (pNum < 1 || pNum > totalPages) return null;

                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-9 h-9 rounded-xl font-bold transition-all text-xs ${
                        currentPage === pNum
                          ? 'bg-[#800020] text-amber-100 shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-4 py-2 bg-[#800020] hover:bg-[#67001a] text-white rounded-xl disabled:opacity-40 font-bold transition-all shadow-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProductCard;
