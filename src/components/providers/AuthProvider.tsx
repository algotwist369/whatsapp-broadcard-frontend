'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Memoized loading component to prevent re-renders
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="loading-spinner mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Memoize public routes to prevent re-computation
  const publicRoutes = useMemo(() => [
    '/auth/login', 
    '/auth/register', 
    '/auth/forgot-password'
  ], []);
  
  const isPublicRoute = useMemo(() => 
    publicRoutes.includes(pathname), 
    [publicRoutes, pathname]
  );

  // Handle hydration - only run once
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Memoized auth initialization
  const initializeAuth = useCallback(async () => {
    try {
      await checkAuth();
    } finally {
      setHasCheckedAuth(true);
    }
  }, [checkAuth]);

  useEffect(() => {
    if (isHydrated && !hasCheckedAuth) {
      initializeAuth();
    }
  }, [initializeAuth, hasCheckedAuth, isHydrated]);

  // Memoized redirect logic
  const handleRedirects = useCallback(() => {
    if (!hasCheckedAuth || isLoading) return;

    if (!isAuthenticated && !isPublicRoute) {
      if (pathname !== '/auth/login') {
        router.push('/auth/login');
      }
    } else if (isAuthenticated && isPublicRoute) {
      if (pathname !== '/dashboard') {
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      }
    }
  }, [isAuthenticated, isPublicRoute, pathname, router, hasCheckedAuth, isLoading]);

  useEffect(() => {
    handleRedirects();
  }, [handleRedirects]);

  // Memoized loading state
  const shouldShowLoading = useMemo(() => 
    !isHydrated || isLoading || !hasCheckedAuth,
    [isHydrated, isLoading, hasCheckedAuth]
  );

  if (shouldShowLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
