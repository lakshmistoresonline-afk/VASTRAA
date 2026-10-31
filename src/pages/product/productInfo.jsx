import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/auth/AuthContext';
import { FiShoppingBag, FiCheckCircle, FiMessageCircle, FiArrowLeft, FiHelpCircle, FiX, FiShare2, FiZoomIn } from 'react-icons/fi';
import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import SareeImageThumbnail from '../../components/SareeImageThumbnail';

const FALLBACK_SAREE_IMG = "https://images.unsplash.com/photo-1610030469883-98e550d6193c?auto=format&fit=crop&w=1024&q=80";

function ProductInfo() {
  const context = useContext(MyContext);
  const { product, setLoading, storeInfo } = context;

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  const [saree, setSaree] = useState(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [imageZoomModalOpen, setImageZoomModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');

  useEffect(() => {
    if (product && product.length > 0) {
      const found = product.find((p) => p.id === id);
      if (found) setSaree(found);
    }
  }, [product, id]);

  const isInCart = saree ? cartItems.some(p => p.id === saree.id) : false;

  const addCart = (item) => {
    if (currentUser) {
      dispatch(addToCart(item));
      toast.success(`Added "${item.title}" to your Cart!`);
    } else {
      toast.info("Please sign in or create an account to add sarees to your Cart!");
      navigate("/login", { state: { from: location, itemToAdd: item } });
    }
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
      sareeId: saree.id,
      sareeTitle: saree.title,
      categoryName: saree.categoryName,
      imageUrl: saree.imageUrl || FALLBACK_SAREE_IMG,
      customerName: customerName.trim(),
      customerEmail: user?.user?.email || "",
      customerUid: user?.user?.uid || "",
      phone: cleanPhone,
      message: customerMessage.trim() || `Quick availability and price enquiry for Saree ID: ${saree.id} (${saree.title})`,
      createdAt: new Date().toISOString(),
      status: "Pending"
    };

    try {
      setLoading(true);
      await addDoc(collection(fireDB, 'enquiries'), enquiryData);
      toast.success("Availability enquiry sent to online store successfully!");
      setEnquiryModalOpen(false);
      setCustomerMessage('');
    } catch (err) {
      console.error("Enquiry submission error:", err);
      toast.error("Failed to submit enquiry. Please try WhatsApp hotline.");
    } finally {
      setLoading(false);
    }
  };

  if (!saree) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-base">Loading saree details or item not found...</p>
          <Link to="/allproducts" className="inline-block bg-[#800020] text-amber-100 px-6 py-3 rounded-xl text-xs font-bold">
            ← Back to Silk Sarees
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F0] dark:bg-gray-950 py-10 px-4 transition-colors">
        <div className="container mx-auto max-w-6xl space-y-8">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#800020] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Catalogues</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Left Column: Image with Click-to-Zoom Inspection */}
            <div className="lg:col-span-6">
              <div
                onClick={() => setImageZoomModalOpen(true)}
                className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C6A15B]/30 bg-gray-100 dark:bg-gray-800 cursor-pointer"
              >
                <SareeImageThumbnail
                  id={saree.id}
                  src={saree.imageUrl}
                  alt={saree.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-100 gap-2 font-bold text-xs backdrop-blur-[2px]">
                  <FiZoomIn className="w-8 h-8 text-[#C6A15B]" />
                  <span>Click to Inspect High-Res Zari & Weave</span>
                </div>
              </div>
            </div>

            {/* Right Column: Details & Pricing */}
            <div className="lg:col-span-6 space-y-6">

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#800020] text-[#C6A15B] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-[#C6A15B]/40">
                    Cat {saree.catalogueCode || 'A'} • {saree.categoryName}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
                    ✓ Verified Online Stock
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211F] dark:text-white leading-snug">
                  {saree.title}
                </h1>

                <p className="text-xs text-gray-400 font-mono mt-1">
                  Saree Code: <span className="font-bold text-gray-700 dark:text-gray-300">{saree.id}</span>
                </p>
              </div>

              {/* Price Information */}
              <div className="bg-amber-50/90 dark:bg-gray-800/90 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-2.5">
                <div className="flex justify-between text-xs text-[#77716A] dark:text-gray-300">
                  <span>Category Indicative Range:</span>
                  <span className="font-bold text-[#24211F] dark:text-white">{saree.indicativePriceRange}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-[#E9E1D5] dark:border-gray-700">
                  <span className="text-xs font-bold text-[#24211F] dark:text-gray-200">Showcase Price:</span>
                  <span className="text-2xl font-extrabold text-[#800020] dark:text-[#E5C158]">
                    {saree.price ? `₹${Number(saree.price).toLocaleString()}` : saree.indicativePriceRange}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 space-y-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 shadow-sm">
                <h3 className="font-bold text-[#24211F] dark:text-white uppercase tracking-wider text-[11px]">
                  Handloom Weave Guarantee
                </h3>
                <p>
                  {saree.description || `Exquisite ${saree.categoryName} handloom silk saree sourced directly from master weavers. Guaranteed pure silk luster with intricate zari pallu and matching unstitched blouse piece.`}
                </p>
              </div>

              {/* Add to Cart & WhatsApp Actions */}
              <div className="space-y-3 pt-2">
                {isInCart ? (
                  <button
                    onClick={() => navigate('/cart')}
                    type="button"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4 text-emerald-300" />
                    <span>Already in Cart · View Cart</span>
                  </button>
                ) : (
                  <button
                    onClick={() => addCart(saree)}
                    type="button"
                    className="w-full bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#C6A15B]/40"
                  >
                    <FiShoppingBag className="w-4 h-4 text-[#C6A15B]" />
                    <span>Add to Cart</span>
                  </button>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setEnquiryModalOpen(true)}
                    type="button"
                    className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-gray-300 dark:border-gray-700"
                  >
                    <FiHelpCircle className="w-4 h-4 text-[#800020] dark:text-[#C6A15B]" />
                    <span>Quick Availability Enquiry</span>
                  </button>

                  <a
                    href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=${encodeURIComponent(`Hello Vastraa, I am inquiring about Saree Code: ${saree.id} (${saree.title}) - Cat ${saree.catalogueCode}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span>WhatsApp Us</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const shareText = `✨ Check out this exquisite saree from Vastraa!\n🌸 ${saree.title} (${saree.categoryName})\n💰 Price: ₹${saree.price ? Number(saree.price).toLocaleString() : 'Enquiry'}\n👉 View Details: ${window.location.href}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                  }}
                  className="w-full bg-[#FAF7F0] dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-[#F3EFE6] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 border border-[#E9E1D5] dark:border-gray-700 transition-colors mt-2"
                >
                  <FiShare2 className="w-4 h-4 text-emerald-600" />
                  <span>Share Saree Link with Family on WhatsApp</span>
                </button>
              </div>

            </div>

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
              <span className="text-xs font-bold text-[#800020] dark:text-[#E5C158] uppercase">
                Online Saree Enquiry
              </span>
              <h3 className="font-serif font-bold text-lg text-gray-900 dark:text-white mt-0.5 line-clamp-1">
                {saree.title}
              </h3>
              <p className="text-xs text-gray-500 font-mono">ID: {saree.id}</p>
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
                  Send Enquiry to Online Store
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Item 2: High-Resolution Saree Image Zoom Inspection Modal */}
      {imageZoomModalOpen && saree && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="w-full max-w-4xl flex justify-between items-center text-white pb-3 border-b border-gray-800">
            <div>
              <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider block">
                High-Resolution Saree Inspection View
              </span>
              <h3 className="font-serif font-bold text-lg text-amber-50">
                {saree.title} (ID: {saree.id})
              </h3>
            </div>
            <button
              onClick={() => setImageZoomModalOpen(false)}
              className="p-2 text-gray-300 hover:text-white bg-gray-800/80 rounded-xl"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="relative max-w-3xl max-h-[80vh] overflow-auto rounded-3xl mt-4 border-2 border-[#C6A15B]/40 shadow-2xl bg-gray-950">
            <SareeImageThumbnail
              id={saree.id}
              src={saree.imageUrl}
              alt={saree.title}
              className="w-full h-auto object-contain cursor-zoom-in transition-transform duration-300 hover:scale-125"
            />
          </div>

          <p className="text-xs text-amber-200/80 pt-3 font-medium">
            💡 Hover over saree photo to inspect fine zari threads and border weave in detail.
          </p>
        </div>
      )}

    </Layout>
  );
}

export default ProductInfo;
