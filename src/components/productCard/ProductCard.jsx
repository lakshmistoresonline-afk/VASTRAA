import React, { useContext, useState } from 'react';
import myContext from '../../context/data/myContext';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, deleteFromCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiCheckCircle, FiHelpCircle, FiMessageCircle, FiX } from 'react-icons/fi';
import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';

const FALLBACK_SAREE_IMG = "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

function ProductCard({ item }) {
  const context = useContext(myContext);
  const { setLoading, storeInfo } = context;

  const { id, title, categoryName, indicativePriceRange, price, imageUrl, catalogueCode, stockStatus } = item;
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);
  const isInCart = cartItems.some(p => p.id === id);

  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');

  const addCart = (sareeItem) => {
    dispatch(addToCart(sareeItem));
    toast.success(`Added "${sareeItem.title}" to your shopping bag!`);
  };

  const removeCart = (sareeItem) => {
    dispatch(deleteFromCart(sareeItem));
    toast.info(`Removed "${sareeItem.title}" from your shopping bag.`);
  };

  const handleQuickEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Please provide your name and WhatsApp phone number.");
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const enquiryData = {
      sareeId: id,
      sareeTitle: title,
      categoryName: categoryName,
      imageUrl: imageUrl || FALLBACK_SAREE_IMG,
      customerName: customerName.trim(),
      customerEmail: user?.user?.email || "",
      customerUid: user?.user?.uid || "",
      phone: cleanPhone,
      message: customerMessage.trim() || `Quick availability and price enquiry for Saree ID: ${id} (${title})`,
      createdAt: new Date().toISOString(),
      status: "Pending"
    };

    try {
      setLoading(true);
      await addDoc(collection(fireDB, 'enquiries'), enquiryData);
      toast.success("Availability enquiry sent to showroom successfully!");
      setEnquiryModalOpen(false);
      setCustomerMessage('');
    } catch (err) {
      console.error("Enquiry submission error:", err);
      toast.error("Failed to submit enquiry. Please try WhatsApp hotline.");
    } finally {
      setLoading(false);
    }
  };

  const isConfirmedStock = stockStatus === 'CONFIRMED_AVAILABLE';

  return (
    <div className="glass-card bg-white dark:bg-gray-900 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group">

      {/* Top Image & Badge Container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-100 dark:bg-gray-800">
        <img
          onClick={() => navigate(`/productinfo/${id}`)}
          src={imageUrl || FALLBACK_SAREE_IMG}
          alt={title}
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_SAREE_IMG; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          loading="lazy"
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
      <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
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

          {/* Individual Saree Price & Indicative Range */}
          <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-2.5 rounded-xl text-xs space-y-1.5 border border-[#E9E1D5] dark:border-gray-700/50">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-500">Saree Price:</span>
              <span className="font-serif font-extrabold text-sm text-[#800020] dark:text-[#E5C158]">
                {price ? `₹${price.toLocaleString()}` : indicativePriceRange}
              </span>
            </div>
            <div className="flex justify-between text-[#77716A] dark:text-gray-400 text-[10px] pt-1 border-t border-[#E9E1D5] dark:border-gray-700">
              <span>Catalogue Range:</span>
              <span className="font-semibold">{indicativePriceRange}</span>
            </div>
          </div>
        </div>

        {/* Actions CTA */}
        <div className="space-y-2 pt-2">
          {isInCart ? (
            <button
              onClick={() => navigate('/cart')}
              type="button"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4 text-emerald-300" />
              <span>Already in Cart · View Cart</span>
            </button>
          ) : (
            <button
              onClick={() => addCart(item)}
              type="button"
              className="w-full bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold py-3 px-3 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#C6A15B]/40"
            >
              <FiShoppingBag className="w-4 h-4 text-[#C6A15B]" />
              <span>Add to Shopping Bag</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setEnquiryModalOpen(true)}
              type="button"
              className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold py-2 px-2 rounded-xl text-[11px] transition-colors flex items-center justify-center gap-1 border border-gray-300 dark:border-gray-700"
            >
              <FiHelpCircle className="w-3.5 h-3.5 text-[#800020] dark:text-[#C6A15B]" />
              <span>Quick Enquiry</span>
            </button>

            <a
              href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=${encodeURIComponent(`Hello Vastraa, I would like to check availability and price for Saree Code: ${id} (${title}) - Cat ${catalogueCode}`)}`}
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs"
              title="Enquire on WhatsApp"
            >
              <FiMessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

      </div>

      {/* Quick Enquiry Modal */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-[#E9E1D5] dark:border-gray-800 space-y-5">
            <button
              onClick={() => setEnquiryModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white p-2"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#800020] dark:text-[#E5C158] uppercase">
                Showroom Saree Enquiry
              </span>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mt-0.5 line-clamp-1">
                {title}
              </h3>
              <p className="text-xs text-gray-500 font-mono">ID: {id}</p>
            </div>

            <form onSubmit={handleQuickEnquirySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ananya Nair"
                  className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  10-Digit WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9746998785"
                  className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Specific Question (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  placeholder="Ask about blouse piece, color shade, or custom pairing..."
                  className="w-full px-3.5 py-3 rounded-xl border dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(false)}
                  className="px-5 py-3 border font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#800020] hover:bg-[#67001a] text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all"
                >
                  Send Enquiry to Showroom
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default ProductCard;
