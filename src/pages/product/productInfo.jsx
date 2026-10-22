import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { FiMessageCircle, FiMaximize2, FiX, FiCheckCircle, FiShoppingBag } from 'react-icons/fi';

function ProductInfo() {
  const context = useContext(MyContext);
  const { product, storeInfo, lastVerifiedAt } = context;
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const [saree, setSaree] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (product && product.length > 0) {
      const found = product.find((item) => item.id === params.id);
      if (found) {
        setSaree(found);
      }
    }
  }, [product, params.id]);

  const isInCart = saree ? cart.some(item => item.id === saree.id) : false;

  const handleAddToCart = () => {
    if (isInCart) {
      toast.info("This saree is already in your shopping bag.");
      navigate('/cart');
    } else {
      dispatch(addToCart(saree));
      toast.success("Saree added to your Shopping Bag!");
    }
  };

  if (!saree) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading saree details from live catalogue...</p>
        </div>
      </Layout>
    );
  }

  const isAvailable = saree.stockStatus === 'CONFIRMED_AVAILABLE';
  const isUnknown = saree.stockStatus === 'UNKNOWN';

  return (
    <Layout>
      <section className="py-12 bg-[#FAF7F0] dark:bg-gray-950 transition-colors min-h-screen">
        <div className="container px-5 mx-auto max-w-6xl">

          <div className="glass-card rounded-3xl shadow-2xl overflow-hidden border border-[#E9E1D5] dark:border-gray-800 p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* Left Column: Image Viewer */}
              <div className="lg:col-span-6 space-y-4">
                <div className="relative aspect-[3/4] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-inner group border border-[#E9E1D5] dark:border-gray-700">
                  <img
                    alt={saree.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    src={saree.imageUrl}
                    onClick={() => setIsZoomed(true)}
                  />

                  <button
                    onClick={() => setIsZoomed(true)}
                    className="absolute bottom-4 right-4 bg-black/70 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-all"
                  >
                    <FiMaximize2 className="w-4 h-4 text-[#C5A46D]" />
                    <span>Click to Enlarge</span>
                  </button>

                  <div className="absolute top-4 left-4 bg-[#800020] text-[#E5C158] border border-[#C5A46D]/60 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md">
                    Cat {saree.catalogueCode}
                  </div>
                </div>

                <div className="bg-amber-50/80 dark:bg-gray-800/80 p-3.5 rounded-2xl text-xs text-gray-600 dark:text-gray-300 flex justify-between items-center border border-[#E9E1D5] dark:border-gray-700">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                    <FiCheckCircle className="text-emerald-500 w-4 h-4" /> Live Inventory Verified Item
                  </span>
                  <span className="font-mono text-gray-500 dark:text-gray-400">
                    Verified: {lastVerifiedAt ? new Date(lastVerifiedAt).toLocaleDateString() : 'Live'}
                  </span>
                </div>
              </div>

              {/* Right Column: Saree Details & Bag Action */}
              <div className="lg:col-span-6 space-y-6">

                <div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <span className="text-[#800020] dark:text-[#E5C158] font-extrabold text-xs uppercase tracking-wider">
                      {saree.categoryName}
                    </span>
                    {isAvailable ? (
                      <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        ✓ Live In Stock
                      </span>
                    ) : isUnknown ? (
                      <span className="bg-amber-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        Confirm Availability
                      </span>
                    ) : (
                      <span className="bg-rose-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        Unavailable
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#24211F] dark:text-white leading-snug">
                    {saree.title}
                  </h1>

                  <p className="text-xs text-gray-400 font-mono mt-1">
                    Saree Code: <span className="font-bold text-gray-700 dark:text-gray-300">{saree.id}</span>
                  </p>
                </div>

                {/* Price Information */}
                <div className="bg-amber-50/90 dark:bg-gray-800/90 p-5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-xs text-[#77716A] dark:text-gray-300">
                    <span>Category Indicative Range:</span>
                    <span className="font-bold text-[#24211F] dark:text-white">{saree.indicativePriceRange}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#E9E1D5] dark:border-gray-700">
                    <span className="text-xs font-bold text-[#24211F] dark:text-gray-200">Individual Saree Price:</span>
                    <span className="text-xl font-extrabold text-[#800020] dark:text-[#E5C158]">
                      {saree.price ? `₹${saree.price}` : "Price on Enquiry"}
                    </span>
                  </div>
                </div>

                {/* Add to Bag & WhatsApp Actions */}
                <div className="space-y-3 pt-2">
                  {isInCart ? (
                    <button
                      onClick={() => navigate('/cart')}
                      type="button"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle className="w-4 h-4 text-emerald-300" />
                      <span>Already in Bag · View Bag</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      type="button"
                      className="w-full bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#C5A46D]/40"
                    >
                      <FiShoppingBag className="w-4 h-4 text-[#C5A46D]" />
                      <span>Add to Shopping Bag</span>
                    </button>
                  )}

                  <a
                    href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=${encodeURIComponent(
                      `Hello Vastraa (Co-Brand of Lakshmi Stores), I am interested in saree ID: ${saree.id} (${saree.categoryName}). Photo: ${saree.imageUrl}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span>Enquire via WhatsApp</span>
                  </a>
                </div>

                {/* Showroom Details */}
                <div className="space-y-2 text-xs text-[#77716A] dark:text-gray-300 pt-4 border-t border-[#E9E1D5] dark:border-gray-800">
                  <p className="font-bold text-[#24211F] dark:text-white uppercase tracking-wider">Showroom & Product Overview:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Brand: Vastraa (A Co-Brand of Lakshmi Stores)</li>
                    <li>Catalogue Category: {saree.categoryName}</li>
                    <li>Saree Code Identifier: {saree.id}</li>
                    <li>Direct Assistance via WhatsApp & Shopping Bag Review</li>
                  </ul>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* High Res Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold"
            >
              <FiX className="w-6 h-6" />
            </button>
            <img
              src={saree.imageUrl}
              alt={saree.title}
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            <p className="text-white text-xs mt-3 font-serif font-bold text-center">
              {saree.title} — Vastraa High Resolution View
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ProductInfo;
