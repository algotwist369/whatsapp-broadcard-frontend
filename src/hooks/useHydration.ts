'use client';

import { useState, useEffect } from 'react';

export const useHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Use a small delay to ensure all browser extensions have finished
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return isHydrated;
};
