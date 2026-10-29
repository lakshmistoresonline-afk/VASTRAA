import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiArrowRight, FiCompass } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function OnboardingPopup({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleStartShopping = () => {
    onClose();
    navigate('/');
  };

  const handleViewJourney = () => {
    onClose();
    navigate('/purchase-journey');
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in-out duration-200 transform"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative w-full max-w-xl bg-[#302625] text-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#C6A15B]/40 max-h-[90vh] overflow-y-auto space-y-5">

              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                title="Close guide"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1.5 pt-1">
                <div className="w-10 h-10 bg-gradient-to-br from-[#650A25] to-[#4A071B] text-[#C6A15B] rounded-2xl mx-auto flex items-center justify-center text-lg font-serif font-black shadow border border-[#C6A15B]">
                  <FiCompass />
                </div>
                <span className="text-[10px] font-bold text-[#C6A15B] uppercase tracking-widest block">
                  Vastraa Assisted Shopping Guide
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F7F0E4]">
                  Welcome to VASTRAA
                </h2>
                <p className="text-xs text-amber-200/80 max-w-sm mx-auto">
                  Your personal silk saree shopping journey. Here is how to navigate and purchase with confidence:
                </p>
              </div>

              {/* 6 Stage Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-0.5">
                  <span className="w-5 h-5 rounded-full bg-[#650A25] text-[#C6A15B] font-bold flex items-center justify-center text-[10px] border border-[#C6A15B]/40">1</span>
                  <h4 className="font-bold text-white text-[11px]">Explore Sarees</h4>
                  <p className="text-[10px] text-gray-400">Browse our 9 live handloom silk saree catalogues (A–I).</p>
                </div>

                <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-0.5">
                  <span className="w-5 h-5 rounded-full bg-[#650A25] text-[#C6A15B] font-bold flex items-center justify-center text-[10px] border border-[#C6A15B]/40">2</span>
                  <h4 className="font-bold text-white text-[11px]">Submit Cart</h4>
                  <p className="text-[10px] text-gray-400">Add favourites to your cart and submit for online review.</p>
                </div>

                <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-0.5">
                  <span className="w-5 h-5 rounded-full bg-[#650A25] text-[#C6A15B] font-bold flex items-center justify-center text-[10px] border border-[#C6A15B]/40">3</span>
                  <h4 className="font-bold text-white text-[11px]">Online Stock Review</h4>
                  <p className="text-[10px] text-gray-400">Store team verifies physical stock availability for selected sarees.</p>
                </div>

                <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-0.5">
                  <span className="w-5 h-5 rounded-full bg-[#650A25] text-[#C6A15B] font-bold flex items-center justify-center text-[10px] border border-[#C6A15B]/40">4</span>
                  <h4 className="font-bold text-white text-[11px]">Order Acceptance</h4>
                  <p className="text-[10px] text-gray-400">Review verified in-stock items, total order summary, and confirm delivery address.</p>
                </div>

                <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-0.5">
                  <span className="w-5 h-5 rounded-full bg-[#650A25] text-[#C6A15B] font-bold flex items-center justify-center text-[10px] border border-[#C6A15B]/40">5</span>
                  <h4 className="font-bold text-white text-[11px]">Payment Verification</h4>
                  <p className="text-[10px] text-gray-400">Scan store QR code, pay exact amount, and submit UTR ref.</p>
                </div>

                <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-0.5">
                  <span className="w-5 h-5 rounded-full bg-[#650A25] text-[#C6A15B] font-bold flex items-center justify-center text-[10px] border border-[#C6A15B]/40">6</span>
                  <h4 className="font-bold text-white text-[11px]">Dispatch & Tracking</h4>
                  <p className="text-[10px] text-gray-400">Wait for payment verification, order confirmation, and AWB tracking.</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleStartShopping}
                  className="flex-1 bg-[#650A25] hover:bg-[#4A071B] text-amber-100 font-bold py-3 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-[#C6A15B]/40"
                >
                  <span>Got It, Start Shopping!</span>
                  <FiArrowRight className="w-4 h-4 text-[#C6A15B]" />
                </button>

                <button
                  type="button"
                  onClick={handleViewJourney}
                  className="px-4 py-3 bg-transparent hover:bg-white/5 text-[#C6A15B] font-bold rounded-xl text-xs transition-colors border border-[#C6A15B]/30 flex items-center justify-center"
                >
                  View Full Purchase Journey
                </button>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default OnboardingPopup;
