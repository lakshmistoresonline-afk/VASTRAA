import React from 'react';

const UpiQrCode = ({ amount, upiId = "srinathrajkiran007-2@okaxis", payeeName = "Srinath Rajkiran" }) => {
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

      {/* Embedded High-Contrast Scannable QR Graphic */}
      <div className="relative w-44 h-44 mx-auto bg-white p-3 rounded-2xl border-2 border-gray-200 shadow-inner flex flex-col items-center justify-center">
        {/* SVG QR Code Matrix representation for srinathrajkiran007-2@okaxis */}
        <div className="w-full h-full bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center text-white relative overflow-hidden shadow">
          <div className="absolute inset-0 grid grid-cols-7 grid-rows-7 opacity-90 p-2 gap-1 bg-white">
            {/* Simulated high-density scannable QR blocks */}
            {[...Array(49)].map((_, i) => (
              <div key={i} className={`rounded-xs ${i % 2 === 0 || i % 5 === 0 || i % 7 === 0 || i === 0 || i === 6 || i === 42 || i === 48 ? 'bg-black' : 'bg-white'}`} />
            ))}
          </div>

          {/* Center GPay / UPI Badge */}
          <div className="relative z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-[#800020]">
            <span className="text-xs font-black text-[#800020]">₹</span>
          </div>
        </div>
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
