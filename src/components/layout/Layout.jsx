import React, { useState, useEffect } from 'react';
import Footer from '../footer/Footer';
import Navbar from '../navbar/Navbar';
import OnboardingPopup from '../onboarding/OnboardingPopup';
import MobileBottomBar from '../mobile/MobileBottomBar';

function Layout({children}) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem('show_onboarding_modal');
    if (flag === 'true') {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    sessionStorage.removeItem('show_onboarding_modal');
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between pb-16 md:pb-0 relative overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-full overflow-x-hidden">
        <Navbar />
        <div className="content w-full max-w-full">
          {children}
        </div>
      </div>

      {/* Item 3: Floating Desktop/Tablet WhatsApp Live Assistance Widget */}
      <a
        href="https://wa.me/919746998785?text=Hello%20Vastraa%2C%20I%20would%20like%20to%20enquire%20about%20silk%20saree%20availability."
        target="_blank"
        rel="noreferrer"
        title="Chat Live with Vastraa Store Assistance"
        className="hidden md:flex fixed bottom-8 right-8 z-40 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-emerald-300/40 items-center gap-2.5 group text-xs font-extrabold"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
        <span className="whitespace-nowrap">
          WhatsApp Assistance
        </span>
        <span className="text-base">💬</span>
      </a>

      <Footer />

      <MobileBottomBar />

      <OnboardingPopup isOpen={showOnboarding} onClose={handleCloseOnboarding} />
    </div>
  );
}

export default Layout;
