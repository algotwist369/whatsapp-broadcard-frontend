'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const NoSSRComponent = ({ children, fallback = null }: NoSSRProps) => {
  return <>{children}</>;
};

// Export with dynamic import to disable SSR
export const NoSSR = dynamic(() => Promise.resolve(NoSSRComponent), {
  ssr: false,
  loading: () => null
});
