import React, { useContext, useState, useEffect } from 'react';
import myContext from '../../context/data/myContext';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiCheckCircle } from 'react-icons/fi';
import SareeImageThumbnail from '../SareeImageThumbnail';

function SingleProductCard({ item }) {
  const { id, title, categoryName, price, imageUrl, catalogueCode, stockStatus } = item || {};
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const isInCart = cartItems.some(p => p.id === id);

  const addCart = (sareeItem) => {
    dispatch(addToCart(sareeItem));
    toast.success(`Added "${sareeItem.title}" to your shopping bag!`);
  };

  const isConfirmedStock = stockStatus === 'CONFIRMED_AVAILABLE';

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
        <div className="pt-1">
          {isInCart ? (
            <button
              onClick={() => navigate('/cart')}
              type="button"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Already in Cart · View Cart</span>
            </button>
          ) : (
            <button
              onClick={() => addCart(item)}
              type="button"
              className="w-full bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold py-3.5 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#C6A15B]/40"
            >
              <FiShoppingBag className="w-4 h-4 text-[#C6A15B]" />
              <span>Add to Shopping Bag</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}

function ProductCard(props) {
  const context = useContext(myContext);
  const { product, searchKey, filterType, filterPrice } = context;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = props.itemsPerPage || 24;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKey, filterType, filterPrice]);

  // If item is passed directly as prop
  if (props.item) {
    return <SingleProductCard item={props.item} />;
  }

  // Otherwise render catalogue grid with search & filter
  const filteredProducts = product ? product.filter((obj) => {
    if (!searchKey) return true;
    return obj.title?.toLowerCase().includes(searchKey.toLowerCase()) ||
           obj.categoryName?.toLowerCase().includes(searchKey.toLowerCase()) ||
           obj.id?.toLowerCase().includes(searchKey.toLowerCase());
  }).filter((obj) => {
    if (!filterType) return true;
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
