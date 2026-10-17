import React, { useContext } from 'react';
import Layout from '../../components/layout/Layout';
import MyContext from '../../context/data/myContext';
import Loader from '../../components/loader/Loader';

const Order = () => {
  const context = useContext(MyContext);
  const { loading, enquiries, order } = context;

  return (
    <Layout>
      {loading && <Loader />}

      <div className="bg-[#800020] text-white py-10 px-4 text-center border-b-4 border-[#D4AF37]">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold">
          Customer Availability & Price Enquiries
        </h1>
        <p className="text-xs text-amber-200/80 mt-1">
          Tracking submitted requests for Lakshmi Stores Thrissur
        </p>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl min-h-[60vh]">
        {enquiries && enquiries.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-white mb-4">
              Your Submitted Enquiries ({enquiries.length})
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {enquiries.map((enq, index) => (
                <div
                  key={enq.id || index}
                  className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    {enq.imageUrl && (
                      <img
                        src={enq.imageUrl}
                        alt={enq.sareeTitle}
                        className="w-16 h-20 object-cover rounded-lg border shadow-sm"
                      />
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-[#800020] dark:text-[#E5C158] uppercase">
                        {enq.categoryName}
                      </span>
                      <h3 className="font-serif font-bold text-gray-900 dark:text-white text-base">
                        {enq.sareeTitle}
                      </h3>
                      <p className="text-xs text-gray-500">Saree ID: {enq.sareeId}</p>
                      <p className="text-xs text-gray-500">Contact: {enq.customerName} ({enq.phone})</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 font-bold px-3 py-1 rounded-full text-xs">
                      Status: {enq.status || "Pending Thrissur Confirmation"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Submitted: {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : order && order.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-serif text-gray-900 dark:text-white mb-4">
              Your Orders ({order.length})
            </h2>
            {order.map((ord, idx) => (
              <div key={ord.id || idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border">
                <p className="text-xs font-bold text-gray-800 dark:text-white">Order Date: {ord.date}</p>
                <div className="mt-2 space-y-2">
                  {ord.cartItems?.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-3 items-center text-xs">
                      <img src={item.imageUrl} alt="" className="w-10 h-12 object-cover rounded" />
                      <div>
                        <p className="font-bold">{item.title}</p>
                        <p className="text-gray-500">Price: ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border text-gray-500 text-sm">
            <p className="text-base font-bold text-gray-800 dark:text-white mb-1">No Active Enquiries Found</p>
            <p className="text-xs text-gray-500">
              Browse our 9 Live Saree Catalogues to submit an availability & price request to Lakshmi Stores Thrissur.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Order;
