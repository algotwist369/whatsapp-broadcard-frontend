import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  const { user, isAuthenticated, token } = useAuthStore();

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const handleReconnect = useCallback(() => {
    if (connectionAttemptsRef.current < maxReconnectAttempts && isAuthenticated && user?.id && token) {
      connectionAttemptsRef.current++;
      const delay = Math.min(1000 * Math.pow(2, connectionAttemptsRef.current - 1), 10000); // Exponential backoff, max 10s
      
      console.log(`🔄 Attempting to reconnect (${connectionAttemptsRef.current}/${maxReconnectAttempts}) in ${delay}ms`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isAuthenticated && user?.id && token) {
          initializeSocket();
        }
      }, delay);
    } else {
      console.error('🔌 Max reconnection attempts reached');
      toast.error('Connection lost. Please refresh the page.', {
        duration: 5000,
        id: 'socket-connection-lost'
      });
    }
  }, [isAuthenticated, user?.id, token]);

  const initializeSocket = useCallback(() => {
    if (!isAuthenticated || !user?.id || !token) {
      return;
    }

    // Clean up existing connection
    cleanup();

    try {
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
      const socket = io(baseUrl, {
        transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
        autoConnect: true,
        forceNew: true,
        reconnection: false, // Handle reconnection manually
        timeout: 10000,
        upgrade: true,
        rememberUpgrade: true,
        auth: {
          token: token
        },
        extraHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });

      socketRef.current = socket;

      // Connection successful
      socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        connectionAttemptsRef.current = 0; // Reset attempts on successful connection
        
        socket.emit('join-room', user.id);
        console.log('📡 Joined room for user:', user.id);
        
        toast.success('Connected to real-time updates', {
          duration: 2000,
          id: 'socket-connected'
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          toast.error('Server disconnected. Please refresh the page.');
          return;
        }
        
        // Client-side disconnect, attempt reconnection
        if (isAuthenticated && user?.id && token) {
          handleReconnect();
        }
      });

      // Handle connection errors
      socket.on('connect_error', (error) => {
        // Only log auth errors, ignore connection attempts
        if (error.message.includes('Authentication')) {
          console.error('🔌 Socket authentication error:', error);
          toast.error('Authentication failed. Please login again.');
          return;
        }
        
        // Silently retry other connection errors
        if (isAuthenticated && user?.id && token) {
          handleReconnect();
        }
      });

      // Handle general errors
      socket.on('error', (error) => {
        console.error('🔌 Socket error:', error);
      });

      // Add debug listener for all events in development
      if (process.env.NODE_ENV === 'development') {
        socket.onAny((eventName, ...args) => {
          console.log('🔍 Socket event received:', eventName, args);
        });
      }

    } catch (error) {
      console.error('🔌 Failed to initialize socket:', error);
      handleReconnect();
    }
  }, [isAuthenticated, user?.id, token, cleanup, handleReconnect]);

  useEffect(() => {
    if (isAuthenticated && user?.id && token) {
      initializeSocket();
    } else {
      cleanup();
    }

    return cleanup;
  }, [isAuthenticated, user?.id, token, initializeSocket, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return socketRef.current;
}
