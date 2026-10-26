import React, { useContext, useEffect, useState } from 'react';
import myContext from '../../context/data/myContext';
import Layout from '../../components/layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { deleteFromCart, clearCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import { FiShoppingBag, FiTrash2, FiSend, FiCheckCircle, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Cart() {
  const context = useContext(myContext);
  const { setLoading, storeInfo } = context;

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  const deleteCart = (item) => {
    dispatch(deleteFromCart(item));
    toast.info("Item removed from cart");
  };

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [requestRef, setRequestRef] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // Automatically fetch customer profile from Firestore if authenticated
  useEffect(() => {
    async function fetchCustomerProfile() {
      if (!user || !user.user) return;
      try {
        const querySnapshot = await getDocs(collection(fireDB, 'users'));
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.email === user.user.email || data.uid === user.user.uid) {
            if (data.name && !customerName) setCustomerName(data.name);
            if (data.whatsapp && !phoneNumber) setPhoneNumber(data.whatsapp);
          }
        });
      } catch (err) {
        console.warn("Could not retrieve customer profile for autofill:", err);
      }
    }
    fetchCustomerProfile();
  }, [user]);

  const cartSubtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const submitCartForReview = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your shopping cart is empty.");
      return;
    }

    if (!customerName.trim() || !phoneNumber.trim() || !address.trim()) {
      toast.error("Please provide your name, WhatsApp number, and delivery address.");
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit WhatsApp mobile number.");
      return;
    }

    const referenceId = "VAST-REQ-" + Math.floor(100000 + Math.random() * 900000);

    const enquiryInfo = {
      sareeId: "MULTIPLE_CART_ITEMS",
      sareeTitle: `Shopping Cart Review Request (${cartItems.length} items)`,
      categoryName: "Multi-Item Cart Submission",
      imageUrl: cartItems[0]?.imageUrl || "",
      cartItems: cartItems.map(i => ({
        id: i.id,
        title: i.title,
        imageUrl: i.imageUrl,
        categoryName: i.categoryName,
        indicativePriceRange: i.indicativePriceRange,
        price: i.price || 0
      })),
      customerName: customerName,
      customerEmail: user?.user?.email || "",
      customerUid: user?.user?.uid || "",
      phone: cleanPhone,
      message: `Cart Ref: ${referenceId}. Estimated Subtotal: ₹${cartSubtotal}. Items: ${cartItems.map(i => `${i.title} (${i.id} - ₹${i.price || 0})`).join(' | ')}. Delivery Address: ${address} - Pincode: ${pinCode}`,
      createdAt: new Date().toISOString(),
      status: "Pending"
    };

    try {
      setLoading(true);
      await addDoc(collection(fireDB, 'enquiries'), enquiryInfo);

      setRequestRef(referenceId);
      setSubmittedSuccess(true);
      dispatch(clearCart());
      toast.success("Cart submitted for review successfully!");
      setLoading(false);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Unable to submit cart. Please try again or contact WhatsApp hotline.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF7F0] dark:bg-gray-950 py-12 px-4 transition-colors">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-2 mb-10">
            <span className="text-[#800020] dark:text-[#E5C158] font-bold text-xs uppercase tracking-widest block">
              Assisted Shopping Cart
            </span>
            <h1 className="text-3xl font-serif font-extrabold text-[#24211F] dark:text-white">
              Your Selected Silk Sarees
            </h1>
            <p className="text-xs text-[#77716A] dark:text-gray-400">
              Submit your cart for item availability and price confirmation. Final quotation provided before payment.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="glass-card max-w-xl mx-auto p-8 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 text-center space-y-6 shadow-xl bg-white dark:bg-gray-900">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                <FiCheckCircle />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-[#24211F] dark:text-white">
                  Cart Submitted for Review!
                </h2>
                <p className="text-xs text-[#77716A] dark:text-gray-300">
                  Reference ID: <span className="font-mono font-bold text-[#800020] dark:text-[#E5C158]">{requestRef}</span>
                </p>
                <p className="text-xs text-[#77716A] dark:text-gray-300 leading-relaxed pt-2">
                  Thank you, <span className="font-bold">{customerName}</span>. Our showroom team has received your enquiry for your selected sarees and will publish your formal quotation shortly.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${storeInfo?.whatsappFormatted || '919746998785'}?text=${encodeURIComponent(
                    `Hello Vastraa, I have submitted my shopping cart for review. Reference: ${requestRef}. Name: ${customerName}, Phone: ${phoneNumber}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span>Follow up on WhatsApp</span>
                </a>

                <Link
                  to="/allproducts"
                  className="px-6 py-3.5 border border-[#E9E1D5] text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  Browse More Sarees
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Left Column: Cart Items */}
              <div className="lg:col-span-7 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 p-10 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 text-center shadow-sm space-y-4">
                    <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Your shopping cart is currently empty.</p>
                    <Link
                      to="/allproducts"
                      className="inline-block bg-[#800020] text-amber-100 font-bold px-6 py-3 rounded-xl text-xs shadow-md hover:bg-[#67001a] transition-all"
                    >
                      Explore Silk Sarees
                    </Link>
                  </div>
                ) : (
                  cartItems.map((item, index) => {
                    const { id, title, categoryName, indicativePriceRange, price, imageUrl } = item;
                    return (
                      <div key={id || index} className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <img
                            src={imageUrl}
                            alt={title}
                            className="w-20 h-24 object-cover rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold text-[#800020] dark:text-[#E5C158] uppercase tracking-wider block">
                              {categoryName}
                            </span>
                            <h3 className="font-serif font-bold text-sm text-[#24211F] dark:text-white line-clamp-1">
                              {title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Catalogue Range: <span className="font-bold">{indicativePriceRange}</span>
                            </p>
                            <p className="text-xs font-extrabold text-[#800020] dark:text-[#E5C158] pt-0.5">
                              {price ? `₹${Number(price).toLocaleString()}` : indicativePriceRange}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteCart(item)}
                          className="p-2.5 text-gray-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Remove item"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Submission Form for Admin Review */}
              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-[#E9E1D5] dark:border-gray-800 p-6 sm:p-8 shadow-sm space-y-5 sticky top-28">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#24211F] dark:text-white">
                      Submit Cart for Admin Review
                    </h3>
                    <p className="text-xs text-[#77716A] dark:text-gray-400 mt-1 leading-relaxed">
                      Submit your selected sarees for availability and price confirmation. You can review the final quotation before payment.
                    </p>
                  </div>

                  <div className="bg-[#FAF7F0] dark:bg-gray-800/80 p-4 rounded-2xl space-y-2 border border-[#E9E1D5] dark:border-gray-700 text-xs">
                    <div className="flex justify-between text-[#77716A] dark:text-gray-300">
                      <span>Selected Sarees:</span>
                      <span className="font-bold text-[#24211F] dark:text-white">{cartItems.length} Items</span>
                    </div>
                    <div className="flex justify-between text-[#77716A] dark:text-gray-300">
                      <span>Estimated Subtotal:</span>
                      <span className="font-bold text-[#800020] dark:text-[#E5C158]">₹{cartSubtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#77716A] dark:text-gray-300">
                      <span>Shipping:</span>
                      <span className="font-bold text-emerald-600 uppercase">FREE (₹0)</span>
                    </div>
                    <div className="pt-2 border-t border-[#E9E1D5] dark:border-gray-700 flex justify-between font-extrabold text-[#24211F] dark:text-white text-sm">
                      <span>Estimated Total:</span>
                      <span className="text-[#800020] dark:text-[#E5C158]">₹{cartSubtotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <form onSubmit={submitCartForReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#E9E1D5] dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
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
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#E9E1D5] dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
                        placeholder="e.g. 9746998785"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#24211F] dark:text-gray-300 mb-1">
                        Delivery Address & Pincode *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 rounded-xl border border-[#E9E1D5] dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-[#800020]"
                        placeholder="Enter full address, city, and pincode"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={cartItems.length === 0}
                      className="w-full bg-[#800020] hover:bg-[#67001a] text-amber-100 font-extrabold py-4 px-4 rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 border border-[#C5A46D]/40 disabled:opacity-50"
                    >
                      <FiSend className="w-4 h-4 text-[#C5A46D]" />
                      <span>Submit Cart for Admin Review</span>
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

export default Cart;
