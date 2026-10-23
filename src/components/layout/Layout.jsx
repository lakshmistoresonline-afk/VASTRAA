import React, { useState, useEffect } from 'react';
import Footer from '../footer/Footer';
import Navbar from '../navbar/Navbar';
import OnboardingPopup from '../onboarding/OnboardingPopup';

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
    <div>
        <Navbar />
      
        <div className="content">
            {children}
        </div>
        
      <Footer />

      <OnboardingPopup isOpen={showOnboarding} onClose={handleCloseOnboarding} />
    </div>
  );
}

export default Layout;
