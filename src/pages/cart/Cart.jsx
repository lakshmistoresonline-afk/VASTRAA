import React, { useContext, useEffect, useState } from 'react'
import myContext from '../../context/data/myContext';
import Layout from '../../components/layout/Layout';
import { useDispatch, useSelector } from 'react-redux';
import { deleteFromCart } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '../../firebase/FirebaseConfig';
import Modal from '../../components/model/Model';

function Cart() {
  const context = useContext(myContext)
  const { mode, setLoading } = context;

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart);

  const deleteCart = (item) => {
    dispatch(deleteFromCart(item));
    toast.success("Item removed from cart");
  }

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const [totalAmount, setTotalAmount] = useState(0);
  useEffect(() => {
    let temp = 0;
    cartItems.forEach((cartItem) => {
      temp = temp + parseInt(cartItem.price || 0);
    });
    setTotalAmount(temp);
  }, [cartItems]);

  // Free shipping for all customers
  const shipping = 0;
  const grandTotal = totalAmount;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const buyNow = async () => {
    const addressInfo = {
      name,
      address,
      pinCode,
      phoneNumber,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    };

    if (addressInfo.name === "" || addressInfo.address === "" || addressInfo.pinCode === "" || addressInfo.phoneNumber === "") {
      return toast.error("All fields are required", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });   
    }

    const orderInfo = {
      cartItems,
      addressInfo,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      email: JSON.parse(localStorage.getItem("user")).user.email,
      userid: JSON.parse(localStorage.getItem("user")).user.uid,
    };

    try {
      setLoading(true);
      const orderRef = collection(fireDB, 'order');
      await addDoc(orderRef, orderInfo);
      toast.success("Order placed successfully!");
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Firebase order error");
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div>
        <div className="min-h-screen bg-[#FAF7F0] dark:bg-gray-950 pt-5 pb-16" style={{ backgroundColor: mode === 'dark' ? '#111827' : '', color: mode === 'dark' ? 'white' : '' }}>
          <h1 className="mb-10 text-center text-3xl font-serif font-bold text-[#24211F] dark:text-white">Shopping Bag</h1>

          <div className="mx-auto max-w-5xl justify-center px-6 md:flex md:space-x-6 xl:px-0">
            <div className="rounded-2xl md:w-2/3">
              {cartItems.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 text-center shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Your shopping bag is currently empty.</p>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  const { title, price, description, imageUrl } = item;
                  return (
                    <div key={index} className="justify-between mb-6 rounded-2xl border border-[#E9E1D5] dark:border-gray-800 drop-shadow-sm bg-white p-6 sm:flex sm:justify-start" style={{ backgroundColor: mode === 'dark' ? 'rgb(17, 24, 39)' : '', color: mode === 'dark' ? 'white' : '' }}>
                      <img src={imageUrl} alt="product-image" className="w-full rounded-xl sm:w-40 aspect-[3/4] object-cover" />
                      <div className="sm:ml-4 sm:flex sm:w-full sm:justify-between">
                        <div className="mt-5 sm:mt-0">
                          <h2 className="text-base font-serif font-bold text-[#24211F]" style={{ color: mode === 'dark' ? 'white' : '' }}>{title}</h2>
                          <h2 className="text-xs text-gray-500 mt-1">{description}</h2>
                          <p className="mt-2 text-sm font-extrabold text-[#800020] dark:text-[#E5C158]">
                            {price ? `₹${price}` : "Price on Enquiry"}
                          </p>
                        </div>
                        <div onClick={() => deleteCart(item)} className="mt-4 flex justify-between sm:space-y-6 sm:mt-0 sm:block sm:space-x-6 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 hover:text-rose-600 transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 h-full rounded-2xl border border-[#E9E1D5] bg-white p-6 shadow-sm md:mt-0 md:w-1/3" style={{ backgroundColor: mode === 'dark' ? 'rgb(17, 24, 39)' : '', color: mode === 'dark' ? 'white' : '' }}>
              <div className="mb-2 flex justify-between text-xs font-semibold">
                <p className="text-gray-700" style={{ color: mode === 'dark' ? 'white' : '' }}>Subtotal</p>
                <p className="text-gray-900 font-bold" style={{ color: mode === 'dark' ? 'white' : '' }}>₹{totalAmount}</p>
              </div>

              {/* Shipping is 100% Free */}
              <div className="flex justify-between text-xs font-semibold">
                <p className="text-gray-700" style={{ color: mode === 'dark' ? 'white' : '' }}>Shipping</p>
                <p className="text-emerald-600 font-extrabold uppercase" style={{ color: mode === 'dark' ? '#34d399' : '' }}>FREE</p>
              </div>

              <hr className="my-4 border-[#E9E1D5] dark:border-gray-800" />

              <div className="flex justify-between mb-4">
                <p className="text-base font-bold text-[#24211F]" style={{ color: mode === 'dark' ? 'white' : '' }}>Total Amount</p>
                <div>
                  <p className="mb-1 text-base font-extrabold text-[#800020] dark:text-[#E5C158]" style={{ color: mode === 'dark' ? '#E5C158' : '' }}>₹{grandTotal}</p>
                </div>
              </div>

              <Modal
                name={name}
                address={address}
                pinCode={pinCode}
                phoneNumber={phoneNumber}
                setName={setName}
                setAddress={setAddress}
                setPinCode={setPinCode}
                setPhoneNumber={setPhoneNumber}
                buyNow={buyNow}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Cart;
