'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Clean up browser extension attributes before mounting
    const cleanupExtensions = () => {
      if (typeof window !== 'undefined') {
        // Remove explicit bis_skin_checked attributes
        const bisElements = document.querySelectorAll('[bis_skin_checked]');
        bisElements.forEach(element => {
          element.removeAttribute('bis_skin_checked');
        });

        // Scan all elements and remove suspicious attributes
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
      setHasMounted(true);
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
