'use client';
import { useState, useEffect } from 'react';

// Define type for the prompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}


// Detect iOS Safari
function isIos() {
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !('MSStream' in window)
  );
}

// Detect standalone (already installed)
function isInStandaloneMode() {
  const nav = window.navigator as NavigatorStandalone;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true
  );
}

// Number of days to snooze after dismiss
const DISMISS_SNOOZE_DAYS = 7;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    // Check if recently dismissed
    const lastDismiss = localStorage.getItem('pwa-prompt-dismissed');
    if (lastDismiss) {
      const lastTime = parseInt(lastDismiss, 10);
      const diffDays = (Date.now() - lastTime) / (1000 * 60 * 60 * 24);
      if (diffDays < DISMISS_SNOOZE_DAYS) {
        // Still within snooze window
        return;
      }
    }

    // Handle Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e as BeforeInstallPromptEvent);

    if (!isInStandaloneMode() && !isIos()) {
        setTimeout(() => setShowInstallBanner(true), 3000);
    }
    };

    // Handle installed
    const handleAppInstalled = () => {
      console.log('PWA installed');
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Handle iOS
    if (isIos() && !isInStandaloneMode()) {
      setTimeout(() => setShowIosBanner(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setShowInstallBanner(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    // Store dismissal time to snooze
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const handleDismissClick = () => {
    setShowInstallBanner(false);
    setShowIosBanner(false);
    // Store dismissal time to snooze
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // ✅ Android / Chrome banner
  if (showInstallBanner) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-sm z-50 animate-in slide-in-from-bottom-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-lg">📱</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Install Prostore App
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Get the best experience with quick access and offline functionality.
            </p>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-yellow-500 text-gray-900 px-3 py-2 rounded text-sm font-medium hover:bg-yellow-600 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismissClick}
            className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    );
  }

  // ✅ iOS Safari guide banner
  if (showIosBanner) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-sm z-50 animate-in slide-in-from-bottom-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-lg">🍏</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Add Prostore to Home Screen
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Tap <span className="font-bold">Share</span> (⬆️) then
              <span className="font-bold"> “Add to Home Screen”</span>
            </p>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleDismissClick}
            className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return null;
}
