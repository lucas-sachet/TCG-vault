'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    function registerServiceWorker() {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((error: unknown) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    if (document.readyState === 'complete') {
      registerServiceWorker();
      return;
    }

    window.addEventListener('load', registerServiceWorker);

    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  return null;
}
