import React from 'react';

const UpiQrCode = ({ amount, upiId = "srinathrajkiran007-2@okaxis", payeeName = "Srinath Rajkiran" }) => {
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border-2 border-[#C6A15B]/40 text-center space-y-4 shadow-xl max-w-sm mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#800020] text-[#C6A15B] flex items-center justify-center font-serif font-black text-sm border border-[#C6A15B]">
            V
          </div>
          <span className="font-serif font-extrabold text-[#24211F] dark:text-white text-sm">Vastraa Pay</span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider">
          Verified UPI
        </span>
      </div>

      {/* Primary: User's Exact Store QR Code Asset (/srinath-qr.png) with API Fallback */}
      <div className="relative w-44 h-44 mx-auto bg-white p-2 rounded-2xl border-2 border-gray-200 shadow-inner flex items-center justify-center">
        <img
          src="/srinath-qr.png"
          alt="Srinath Rajkiran UPI QR Code"
          className="w-40 h-40 object-contain rounded-xl mx-auto"
          onError={(e) => {
            // Fallback to dynamic QR API if static asset is not yet placed in public/
            e.target.onerror = null;
            e.target.src = qrApiUrl;
          }}
        />
      </div>

      <div className="space-y-1 bg-[#FAF7F0] dark:bg-gray-800/80 p-3.5 rounded-2xl border border-[#E9E1D5] dark:border-gray-700">
        <p className="text-xs font-extrabold text-gray-900 dark:text-white">
          Payee: <span className="text-[#800020] dark:text-[#E5C158]">{payeeName}</span>
        </p>
        <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 select-all">
          {upiId}
        </p>
        <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
          <span className="text-gray-500">Amount to Pay:</span>
          <span className="font-serif font-extrabold text-base text-[#800020] dark:text-[#E5C158]">₹{amount}</span>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        Scan with Google Pay, PhonePe, Paytm or any UPI App to pay securely.
      </p>
    </div>
  );
};

export default UpiQrCode;
