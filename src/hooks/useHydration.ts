'use client';

import { useState, useEffect } from 'react';

export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Clean up browser extension attributes that cause hydration mismatches
    const cleanupExtensions = () => {
      if (typeof window !== 'undefined') {
        // Remove problematic attributes added by browser extensions
        // First, remove explicit bis_skin_checked attributes via selector
        const bisElements = document.querySelectorAll('[bis_skin_checked]');
        bisElements.forEach(element => {
          element.removeAttribute('bis_skin_checked');
        });

        // Then, scan all elements for attributes that start with patterns
        const allElements = document.getElementsByTagName('*');
        Array.from(allElements).forEach((element) => {
          Array.from(element.attributes).forEach(attr => {
            if (
              attr.name.startsWith('__processed_') ||
              attr.name.includes('extension') ||
              attr.name.includes('browser')
            ) {
              element.removeAttribute(attr.name);
            }
          });
        });
      }
    };

    // Use requestAnimationFrame for better timing
    const timer = requestAnimationFrame(() => {
      cleanupExtensions();
      setIsHydrated(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  return isHydrated;
};
