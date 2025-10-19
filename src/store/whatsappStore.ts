import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { whatsappApi } from '@/lib/api';
import { WhatsAppConnection } from '@/types';
import { Socket } from 'socket.io-client';

interface WhatsAppStore {
  status: WhatsAppConnection | null;
  isConnected: boolean;
  isLoading: boolean;
  qrCode: string | null;
  pollingInterval: NodeJS.Timeout | null;
  statusCheckInterval: NodeJS.Timeout | null;
  websocketActive: boolean;
  
  // Actions
  setStatus: (status: WhatsAppConnection | null) => void;
  setIsConnected: (connected: boolean) => void;
  setQrCode: (qr: string | null) => void;
  fetchStatus: () => Promise<void>;
  connect: () => Promise<{ success: boolean; message: string; qr?: string | null | undefined }>;
  disconnect: () => Promise<{ success: boolean; message: string }>;
  refreshQR: () => Promise<{ success: boolean; qr?: string }>;
  sendTestMessage: (phoneNumber: string, message: string) => Promise<{ success: boolean; message: string }>;
  setSocket: (socket: Socket | null) => void;
  startConnectionPolling: () => void;
  stopConnectionPolling: () => void;
  startRestorationPolling: () => void;
  setStatusCheckInterval: (interval: NodeJS.Timeout | null) => void;
  stopStatusCheck: () => void;
}

export const useWhatsAppStore = create<WhatsAppStore>()(
  persist(
    (set, get) => ({
    status: null,
    isConnected: false,
    isLoading: false,
    qrCode: null,
    pollingInterval: null,
    statusCheckInterval: null,
    websocketActive: false,

          setStatus: (status) => {
            const currentState = get();
            
            // Deep comparison to prevent unnecessary re-renders
            const statusChanged = 
              currentState.status?.isConnected !== status?.isConnected ||
              currentState.status?.state !== status?.state ||
              currentState.status?.qr !== status?.qr ||
              currentState.isConnected !== (status?.isConnected || false) ||
              currentState.qrCode !== (status?.qr || null);
            
            if (statusChanged) {
              console.log('WhatsApp status changed:', {
                from: currentState.status,
                to: status,
                isConnected: status?.isConnected || false,
                state: status?.state,
                hasQR: !!status?.qr
              });
              
              set({ 
                status,
                isConnected: status?.isConnected || false,
                qrCode: status?.qr || null
              });
              
              // If status changed to restoring, start polling for updates
              if (status?.state === 'restoring' && currentState.status?.state !== 'restoring') {
                console.log('🔄 Status changed to restoring, starting restoration polling');
                get().startRestorationPolling();
              }
              
              // If connected, stop any polling
              if (status?.isConnected && currentState.pollingInterval) {
                console.log('✅ Connected, stopping polling');
                get().stopConnectionPolling();
              }
            }
          },

      setIsConnected: (connected) => {
        set({ isConnected: connected });
        if (get().status) {
          set({ 
            status: { 
              ...get().status!, 
              isConnected: connected 
            }
          });
        }
      },

      setQrCode: (qr) => {
        set({ qrCode: qr });
      },

      fetchStatus: async () => {
        try {
          // Check if user is authenticated before making API calls
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found, skipping WhatsApp status fetch');
            return;
          }

          // Skip API calls if WebSocket is active and we have recent status
          if (get().websocketActive && get().status) {
            console.log('WebSocket is active, skipping API call - using WebSocket for updates');
            return;
          }

          // Prevent multiple simultaneous calls with better tracking
          const currentState = get();
          if ((currentState as any).isFetching) {
            console.log('Skipping status fetch - already fetching');
            return;
          }
          
          // Set fetching flag
          set({ isLoading: true });
          (get() as any).isFetching = true;

          // Debounce to prevent excessive API calls
          const now = Date.now();
          if (now - (currentState as any).lastFetchTime < 5000) { // Reduced to 5 seconds
            console.log('Skipping status fetch - too soon since last fetch (5s debounce)');
            (get() as any).isFetching = false;
            set({ isLoading: false });
            return;
          }
          (get() as any).lastFetchTime = now;

          console.log('Fetching WhatsApp status (optimized)...');

          const response = await whatsappApi.getStatus();
          
          if (response.success && response.data) {
            console.log('WhatsApp status fetched from backend:', {
              isConnected: response.data.isConnected,
              state: response.data.state,
              hasQR: !!response.data.qr
            });
            
            get().setStatus(response.data);
          } else {
            console.log('Status API failed, assuming disconnected');
            get().setStatus({ isConnected: false, state: 'not_connected', qr: undefined });
          }
        } catch (error: any) {
          console.error('Error fetching WhatsApp status:', error);
          
          // Handle different error types gracefully
          if (error.name === 'AbortError') {
            console.log('WhatsApp status request timed out');
            return;
          }
          
          if (error.response?.status === 401) {
            console.log('Token expired, clearing WhatsApp status');
            get().setStatus({ isConnected: false, state: 'not_connected', qr: undefined });
            return;
          }
          
          if (error.response?.status >= 500) {
            console.log('Server error, will retry later');
            return;
          }
          
          // For other errors, don't update status to avoid overriding good state
          console.log('Network or other error, keeping current status');
        } finally {
          // Reset the fetching flag
          (get() as any).isFetching = false;
          set({ isLoading: false });
        }
      },

          connect: async () => {
            console.log('WhatsApp Store - Starting connection...');
            set({ isLoading: true });
            try {
              // First, try to initiate the connection with a shorter timeout
              const response = await whatsappApi.connect();
              if (response.success && response.data) {
                if (response.data.qr) {
                  console.log('WhatsApp Store - QR code received');
                  get().setQrCode(response.data.qr);
                }
                // Update status immediately with the response data
                get().setStatus({
                  isConnected: response.data.isConnected || false,
                  state: 'connecting',
                  qr: response.data.qr
                });
                
                // Start polling for connection status if not already connected
                if (!response.data.isConnected) {
                  get().startConnectionPolling();
                }
              }
              return {
                success: response.success,
                message: response.message || (response.success ? 'Connection successful' : 'Connection failed'),
                qr: response.data?.qr
              };
            } catch (error: any) {
              console.error('WhatsApp Store - Connect error:', error);
              
              // Handle timeout specifically
              if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                console.log('WhatsApp Store - Connection timeout, starting polling...');
                // Start polling for status instead of failing
                get().startConnectionPolling();
                return {
                  success: true,
                  message: 'Connection initiated, checking status...',
                  qr: null
                };
              }
              
              // Handle other connection errors
              if (error.response?.status === 401) {
                return {
                  success: false,
                  message: 'Authentication failed. Please login again.'
                };
              }
              
              // Handle 400 errors (bad request) - might be connection issues
              if (error.response?.status === 400) {
                console.log('WhatsApp Store - Bad request, starting polling as fallback...');
                get().startConnectionPolling();
                return {
                  success: true,
                  message: 'Connection initiated, checking status...',
                  qr: null
                };
              }
              
              return {
                success: false,
                message: error.response?.data?.message || 'Failed to connect WhatsApp'
              };
            } finally {
              set({ isLoading: false });
            }
          },

      disconnect: async () => {
        set({ isLoading: true });
        try {
          // Stop polling when disconnecting
          get().stopConnectionPolling();
          
          const response = await whatsappApi.disconnect();
          if (response.success) {
            get().setIsConnected(false);
            get().setQrCode(null);
            await get().fetchStatus();
          }
          return {
            success: response.success,
            message: response.message || (response.success ? 'Disconnected successfully' : 'Failed to disconnect')
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to disconnect WhatsApp'
          };
        } finally {
          set({ isLoading: false });
        }
      },

      refreshQR: async () => {
        try {
          const response = await whatsappApi.getQR();
          if (response.success && response.data) {
            if (response.data.qr) {
              console.log('WhatsApp Store - QR code refreshed from API');
              get().setQrCode(response.data.qr);
              // Also update the status immediately with the QR code
              get().setStatus({
                isConnected: response.data.isConnected || false,
                state: 'connecting',
                qr: response.data.qr
              });
            }
            return { success: true, qr: response.data.qr };
          }
          return { success: false, qr: undefined };
        } catch (error: any) {
          console.error('WhatsApp Store - Refresh QR error:', error);
          return { success: false, qr: undefined };
        }
      },

      sendTestMessage: async (phoneNumber: string, message: string) => {
        try {
          const response = await whatsappApi.sendTestMessage({ phoneNumber, message });
          return {
            success: response.success,
            message: response.message || (response.success ? 'Message sent successfully' : 'Failed to send message')
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to send message'
          };
        }
      },

      setSocket: (socket) => {
        if (socket) {
          // Mark WebSocket as active
          set({ websocketActive: true });
          
          // No debounce for real-time updates
          
          // No periodic status checks - rely on WebSocket for real-time updates
          // WebSocket events will handle all status changes
          
          // Listen for real-time WhatsApp status updates
          socket.on('whatsapp-status-update', (status: { isConnected: boolean; state: string; qr?: string | null }) => {
            console.log('📡 WebSocket status update received:', status);
            
            // Stop polling when we receive WebSocket updates
            if (get().pollingInterval) {
              get().stopConnectionPolling();
            }
            
            // Stop status check interval when we receive WebSocket updates
            if (get().statusCheckInterval) {
              get().stopStatusCheck();
            }
            
            // Update status immediately - no debounce for real-time updates
            get().setStatus({
              isConnected: status.isConnected,
              state: status.state,
              qr: status.qr || undefined
            });
            
            // Force a re-render by updating the store
            get().setIsConnected(status.isConnected);
            
            // Log important state changes
            if (status.isConnected && status.state === 'open') {
              console.log('🔒 WhatsApp connected via WebSocket - INSTANT UPDATE');
            } else if (!status.isConnected && (status.state === 'disconnected' || status.state === 'auth_error' || status.state === 'timeout')) {
              console.log('🔌 WhatsApp disconnected via WebSocket - INSTANT UPDATE:', status.state);
            }
          });

          // Add debug listener for all socket events
          socket.onAny((eventName, ...args) => {
            console.log('🔍 Socket event received:', eventName, args);
          });
        } else {
          // Clean up status check interval when socket is removed
          get().stopStatusCheck();
        }
      },

      startConnectionPolling: () => {
        const { pollingInterval } = get();
        
        // Clear any existing polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        
        let pollCount = 0;
        const maxPolls = 40; // Stop after 1 minute (40 * 1.5 seconds)
        
        // Start polling every 1.5 seconds for faster response
        const interval = setInterval(async () => {
          pollCount++;
          
          // Stop polling after max attempts
          if (pollCount > maxPolls) {
            get().stopConnectionPolling();
            return;
          }
          
          try {
            const response = await whatsappApi.getStatus();
            if (response.success && response.data) {
              get().setStatus(response.data);
              
              // Stop polling if connected or if there's an error
              if (response.data.isConnected || response.data.state === 'error') {
                get().stopConnectionPolling();
              }
            }
          } catch (error: any) {
            // Stop polling on authentication errors
            if (error.response?.status === 401) {
              get().stopConnectionPolling();
            }
          }
        }, 1500); // Poll every 1.5 seconds for faster response
        
        set({ pollingInterval: interval });
      },

      stopConnectionPolling: () => {
        const { pollingInterval } = get();
        if (pollingInterval) {
          clearInterval(pollingInterval);
          set({ pollingInterval: null });
        }
      },

      startRestorationPolling: () => {
        const { pollingInterval } = get();
        
        // Clear any existing polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        
        let pollCount = 0;
        const maxPolls = 20; // Poll for up to 30 seconds (20 * 1.5 seconds)
        
        console.log('🔄 Starting restoration polling...');
        
        // Start polling every 1.5 seconds
        const interval = setInterval(async () => {
          pollCount++;
          
          // Stop polling after max attempts
          if (pollCount > maxPolls) {
            console.log('⏰ Restoration polling timeout');
            get().stopConnectionPolling();
            return;
          }
          
          try {
            const response = await whatsappApi.getStatus();
            if (response.success && response.data) {
              console.log(`🔄 Restoration poll ${pollCount}/${maxPolls}:`, response.data);
              get().setStatus(response.data);
              
              // Stop polling if connected or if state changed from restoring
              if (response.data.isConnected || (response.data.state !== 'restoring' && response.data.state !== 'connecting')) {
                console.log('✅ Restoration complete or state changed, stopping polling');
                get().stopConnectionPolling();
              }
            }
          } catch (error: any) {
            console.error('Error during restoration polling:', error);
            // Stop polling on authentication errors
            if (error.response?.status === 401) {
              get().stopConnectionPolling();
            }
          }
        }, 1500); // Poll every 1.5 seconds
        
        set({ pollingInterval: interval });
      },

      setStatusCheckInterval: (interval) => {
        set({ statusCheckInterval: interval });
      },

      stopStatusCheck: () => {
        const { statusCheckInterval } = get();
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          set({ statusCheckInterval: null });
        }
      }
    }),
    {
      name: 'whatsapp-storage',
      partialize: (state) => ({
        // Don't persist connection status to avoid stale data
        // Always fetch fresh status from backend
        status: null,
        isConnected: false,
      }),
    }
  )
);
