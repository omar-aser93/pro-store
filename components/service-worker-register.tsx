'use client';
import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Only register in production
    if (process.env.NODE_ENV !== 'production') {
      // In development: always unregister any existing service worker
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      });
      console.log('Service Worker skipped in development');
      return;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers not supported');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered successfully:', registration);

        // Check for updates every hour
        setInterval(() => {
          registration.update().then(() => {
            console.log('Service Worker update check completed');
          });
        }, 60 * 60 * 1000); // 1 hour

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, prompt user to reload
                if (confirm('A new version of Prostore is available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });

        // Handle controller changes (when SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker now controlling the page');
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    // Wait for page load to register SW
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerServiceWorker);
    } else {
      registerServiceWorker();
    }

    // Cleanup function
    return () => {
      // Optional: Unregister service worker if needed
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister());
      });
    };
  }, []);

  return null;
}