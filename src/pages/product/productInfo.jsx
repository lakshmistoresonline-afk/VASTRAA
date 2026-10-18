import React, { useContext, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMessageCircle, FiSend, FiMaximize2, FiX, FiCheckCircle } from 'react-icons/fi';

function ProductInfo() {
  const context = useContext(MyContext);
  const { product, storeInfo, lastVerifiedAt, addEnquiry } = context;
  const params = useParams();

  const [saree, setSaree] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const [enquiryForm, setEnquiryForm] = useState({
    customerName: '',
    phone: '',
    address: '',
    message: ''
  });

  useEffect(() => {
    if (product && product.length > 0) {
      const found = product.find((item) => item.id === params.id);
      if (found) {
        setSaree(found);
      }
    }
  }, [product, params.id]);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = enquiryForm.phone.replace(/[^0-9]/g, '');

    if (!enquiryForm.customerName || enquiryForm.customerName.trim().length === 0) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const res = await addEnquiry({
      sareeId: saree.id,
      sareeTitle: saree.title,
      categoryName: saree.categoryName,
      imageUrl: saree.imageUrl,
      customerName: enquiryForm.customerName,
      phone: cleanPhone,
      address: enquiryForm.address,
      message: enquiryForm.message
    });

    if (res.success) {
      setEnquiryForm({ customerName: '', phone: '', address: '', message: '' });
    }
  };

  if (!saree) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading saree details from Google Photos live catalogue...</p>
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
                    <FiCheckCircle className="text-emerald-500 w-4 h-4" /> Google Photos Catalogue Item
                  </span>
                  <span className="font-mono text-gray-500 dark:text-gray-400">
                    Verified: {lastVerifiedAt ? new Date(lastVerifiedAt).toLocaleDateString() : 'Live'}
                  </span>
                </div>
              </div>

              {/* Right Column: Saree Details & Enquiry Form */}
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

                {/* Showroom Details */}
                <div className="space-y-2 text-xs text-[#77716A] dark:text-gray-300">
                  <p className="font-bold text-[#24211F] dark:text-white uppercase tracking-wider">Showroom & Product Overview:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Brand: Vastraa (A Co-Brand of Lakshmi Stores)</li>
                    <li>Location: Round West, Thrissur, Kerala, India - 680001</li>
                    <li>Catalogue Category: {saree.categoryName}</li>
                    <li>Saree Code Identifier: {saree.id}</li>
                    <li>Direct Showroom Assistance via WhatsApp & Enquiry Form</li>
                  </ul>
                </div>

                {/* Direct Enquiry Form */}
                <div className="border-t border-[#E9E1D5] dark:border-gray-800 pt-6 space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#24211F] dark:text-white">
                    Send Direct Showroom Enquiry
                  </h3>

                  <form onSubmit={handleEnquirySubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={enquiryForm.customerName}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, customerName: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-[#E9E1D5] rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
                          placeholder="Ananya Nair"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                          10-Digit Mobile / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={enquiryForm.phone}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 border border-[#E9E1D5] rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
                          placeholder="9746998785"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                        Delivery Address / Location
                      </label>
                      <input
                        type="text"
                        value={enquiryForm.address}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, address: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 border border-[#E9E1D5] rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
                        placeholder="Thrissur, Kochi, Ernakulam, or International"
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
                        className="w-full text-xs px-3.5 py-2.5 border border-[#E9E1D5] rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
                        placeholder="Ask about exact individual price, color variations, or matching blouse..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-[#800020] hover:bg-[#67001a] text-white font-bold py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <FiSend className="w-4 h-4 text-[#C5A46D]" />
                        <span>Submit Direct Enquiry</span>
                      </button>

                      <a
                        href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=${encodeURIComponent(
                          `Hello Vastraa (Co-Brand of Lakshmi Stores), I am interested in saree ID: ${saree.id} (${saree.categoryName}). Photo: ${saree.imageUrl}`
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
