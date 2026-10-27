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
    <div className="min-h-screen flex flex-col justify-between pb-16 md:pb-0">
      <div>
        <Navbar />
        <div className="content">
          {children}
        </div>
      </div>

      <Footer />

      <MobileBottomBar />

      <OnboardingPopup isOpen={showOnboarding} onClose={handleCloseOnboarding} />
    </div>
  );
}

export default Layout;
