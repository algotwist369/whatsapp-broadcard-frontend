'use client';

import { useEffect } from 'react';
import { useWhatsAppStore } from '@/store/whatsappStore';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';

interface WhatsAppProviderProps {
  children: React.ReactNode;
}

export function WhatsAppProvider({ children }: WhatsAppProviderProps) {
  const { fetchStatus, setSocket } = useWhatsAppStore();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const socket = useSocket();

  // Set up socket for real-time updates
  useEffect(() => {
    if (socket) {
      setSocket(socket);
      console.log('🔌Socket set up for WhatsApp real-time updates');
    }
  }, [socket, setSocket]);

  useEffect(() => {
    // Only fetch WhatsApp status if user is authenticated
    if (isAuthenticated && !authLoading) {
      console.log('WhatsApp Provider: Fetching initial status...');
      fetchStatus();

      // No periodic polling - rely on WebSocket for real-time updates
      // Only fetch status once on mount, then let WebSocket handle updates
    }
  }, [fetchStatus, isAuthenticated, authLoading]);

  return <>{children}</>;
}
