import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: { name?: string; phone?: string }) => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await authApi.login({ email, password });
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success('Login successful!');
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || error.message || 'Login failed';
          toast.error(message);
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          const response = await authApi.register(userData);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            localStorage.setItem('token', token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            toast.success('Registration successful!');
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || error.message || 'Registration failed';
          toast.error(message);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        toast.success('Logged out successfully');
      },

      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true });
          const response = await authApi.updateProfile(profileData);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isLoading: false,
            });
            toast.success('Profile updated successfully!');
          } else {
            throw new Error(response.message || 'Profile update failed');
          }
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.message || error.message || 'Profile update failed';
          toast.error(message);
          throw error;
        }
      },

      checkAuth: async () => {
        const { token, user, isLoading } = get();

        // Prevent multiple simultaneous auth checks
        if (isLoading) {
          return;
        }

        // If we have persisted data, use it immediately
        if (token && user) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }

        // Otherwise, check with the server
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          set({ isLoading: true });
          const response = await authApi.getCurrentUser();

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: storedToken,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
