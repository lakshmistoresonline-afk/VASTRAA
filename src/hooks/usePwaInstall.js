import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      toast.info("📱 On iOS Safari: Tap the Share button 􀈂 at the bottom ➔ Select 'Add to Home Screen' ⊕ to install Vastraa!", {
        autoClose: 8000
      });
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        toast.success("✨ Thank you for installing Vastraa App!");
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback for browsers or when prompt is already captured
      toast.info("📱 To install Vastraa: Open your browser menu (⋮) ➔ Select 'Install App' or 'Add to Home Screen'");
    }
  };

  return { isInstallable, isStandalone, promptInstall };
}
