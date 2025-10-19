import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsApi } from '@/lib/api';

export interface UserSettings {
  // Message Settings
  messageDelay: number; // Delay between messages in seconds
  maxRetries: number; // Maximum retry attempts for failed messages
  autoRetry: boolean; // Automatically retry failed messages
  
  // AI Settings
  aiEnabled: boolean; // Enable AI analysis
  spamDetection: boolean; // Enable spam detection
  messageRewriting: boolean; // Enable message rewriting
  aiModel: 'gpt-3.5-turbo' | 'gpt-4'; // AI model to use
  
  // WhatsApp Settings
  whatsappTimeout: number; // WhatsApp connection timeout in seconds
  qrRefreshInterval: number; // QR code refresh interval in seconds
  autoReconnect: boolean; // Automatically reconnect on disconnect
  
  // Notification Settings
  emailNotifications: boolean; // Email notifications
  pushNotifications: boolean; // Push notifications
  soundNotifications: boolean; // Sound notifications
  notificationTypes: {
    messageSent: boolean;
    messageFailed: boolean;
    bulkComplete: boolean;
    whatsappDisconnected: boolean;
  };
  
  // Regional Settings
  timezone: string; // User timezone
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  currency: string; // Currency code
  
  // Performance Settings
  batchSize: number; // Number of messages to process in one batch
  concurrentConnections: number; // Number of concurrent connections
  cacheEnabled: boolean; // Enable caching
  cacheDuration: number; // Cache duration in minutes
  
  // Security Settings
  sessionTimeout: number; // Session timeout in minutes
  requirePasswordChange: boolean; // Require password change
  twoFactorAuth: boolean; // Two-factor authentication
  loginAttempts: number; // Max login attempts
  
  // UI Settings
  theme: 'light' | 'dark' | 'auto';
  language: string;
  sidebarCollapsed: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
}

interface SettingsStore {
  settings: UserSettings;
  isLoading: boolean;
  isSaving: boolean;
  lastLoadTime: number;
  
  // Actions
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
  applySettings: (settings: UserSettings) => void;
  
  // Individual setting updates
  updateMessageSettings: (settings: Partial<Pick<UserSettings, 'messageDelay' | 'maxRetries' | 'autoRetry'>>) => void;
  updateAISettings: (settings: Partial<Pick<UserSettings, 'aiEnabled' | 'spamDetection' | 'messageRewriting' | 'aiModel'>>) => void;
  updateWhatsAppSettings: (settings: Partial<Pick<UserSettings, 'whatsappTimeout' | 'qrRefreshInterval' | 'autoReconnect'>>) => void;
  updateNotificationSettings: (settings: Partial<Pick<UserSettings, 'emailNotifications' | 'pushNotifications' | 'soundNotifications' | 'notificationTypes'>>) => void;
  updateRegionalSettings: (settings: Partial<Pick<UserSettings, 'timezone' | 'dateFormat' | 'timeFormat' | 'currency'>>) => void;
  updatePerformanceSettings: (settings: Partial<Pick<UserSettings, 'batchSize' | 'concurrentConnections' | 'cacheEnabled' | 'cacheDuration'>>) => void;
  updateSecuritySettings: (settings: Partial<Pick<UserSettings, 'sessionTimeout' | 'requirePasswordChange' | 'twoFactorAuth' | 'loginAttempts'>>) => void;
  updateUISettings: (settings: Partial<Pick<UserSettings, 'theme' | 'language' | 'sidebarCollapsed' | 'animationsEnabled' | 'compactMode'>>) => void;
}

const defaultSettings: UserSettings = {
  // Message Settings
  messageDelay: 2, // 2 seconds between messages
  maxRetries: 3,
  autoRetry: true,
  
  // AI Settings
  aiEnabled: true,
  spamDetection: true,
  messageRewriting: true,
  aiModel: 'gpt-3.5-turbo',
  
  // WhatsApp Settings
  whatsappTimeout: 60, // 60 seconds
  qrRefreshInterval: 5, // 5 seconds
  autoReconnect: true,
  
  // Notification Settings
  emailNotifications: true,
  pushNotifications: true,
  soundNotifications: true,
  notificationTypes: {
    messageSent: true,
    messageFailed: true,
    bulkComplete: true,
    whatsappDisconnected: true,
  },
  
  // Regional Settings
  timezone: 'Asia/Kolkata', // India timezone
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'INR',
  
  // Performance Settings
  batchSize: 10,
  concurrentConnections: 5,
  cacheEnabled: true,
  cacheDuration: 30, // 30 minutes
  
  // Security Settings
  sessionTimeout: 120, // 2 hours
  requirePasswordChange: false,
  twoFactorAuth: false,
  loginAttempts: 5,
  
  // UI Settings
  theme: 'light',
  language: 'en',
  sidebarCollapsed: false,
  animationsEnabled: true,
  compactMode: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,
      isSaving: false,
      lastLoadTime: 0,
      
      updateSettings: async (updates: Partial<UserSettings>) => {
        set({ isSaving: true });
        try {
          const currentSettings = get().settings;
          const newSettings = { ...currentSettings, ...updates };
          
          // Update local state immediately
          set({ settings: newSettings });
          
          // Apply settings changes immediately
          get().applySettings?.(newSettings);
          
          // Save to localStorage as backup
          localStorage.setItem('userSettings', JSON.stringify(newSettings));
          
          // Save to backend
          try {
            await settingsApi.updateSettings(newSettings);
            console.log('Settings saved to backend successfully');
          } catch (backendError) {
            console.warn('Failed to save settings to backend:', backendError);
            // Settings are still saved locally, so the user experience isn't affected
          }
          
          console.log('Settings updated:', updates);
        } catch (error) {
          console.error('Error updating settings:', error);
        } finally {
          set({ isSaving: false });
        }
      },
      
      resetSettings: async () => {
        set({ isSaving: true });
        try {
          // Update local state immediately
          set({ settings: defaultSettings });
          
          // Apply settings changes immediately
          get().applySettings(defaultSettings);
          
          // Save to localStorage as backup
          localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
          
          // Reset on backend
          try {
            await settingsApi.resetSettings();
            console.log('Settings reset on backend successfully');
          } catch (backendError) {
            console.warn('Failed to reset settings on backend:', backendError);
            // Settings are still reset locally
          }
          
          console.log('Settings reset to defaults');
        } catch (error) {
          console.error('Error resetting settings:', error);
        } finally {
          set({ isSaving: false });
        }
      },
      
      loadSettings: async () => {
        const currentState = get();
        
        // Debounce mechanism to prevent multiple rapid calls
        const now = Date.now();
        if (now - currentState.lastLoadTime < 2000) { // 2 seconds debounce
          console.log('Skipping settings load - too soon since last load');
          return;
        }
        
        // Prevent loading if already loading
        if (currentState.isLoading) {
          console.log('Settings already loading, skipping');
          return;
        }
        
        set({ lastLoadTime: now, isLoading: true });
        
        try {
          // Check if user is authenticated before making API calls
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found, loading settings from localStorage');
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
              const parsedSettings = JSON.parse(savedSettings);
              set({ settings: parsedSettings });
              get().applySettings(parsedSettings);
            }
            return;
          }

          // Try to load from backend first
          try {
            const response = await settingsApi.getSettings();
            if (response.success && response.data) {
              set({ settings: response.data });
              get().applySettings(response.data);
              console.log('Settings loaded from backend');
              return;
            }
          } catch (backendError: any) {
            // Handle 401 errors specifically
            if (backendError.response?.status === 401) {
              console.log('Authentication failed, loading settings from localStorage');
              localStorage.removeItem('token');
            } else {
              console.log('Backend settings not available, loading from localStorage');
            }
          }
          
          // Fallback to localStorage
          const savedSettings = localStorage.getItem('userSettings');
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            set({ settings: parsedSettings });
            get().applySettings(parsedSettings);
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      saveSettings: async () => {
        set({ isSaving: true });
        try {
          const settings = get().settings;
          
          // Check if user is authenticated before saving to backend
          const token = localStorage.getItem('token');
          if (token) {
            // Save to backend
            try {
              await settingsApi.updateSettings(settings);
              console.log('Settings saved to backend');
            } catch (backendError: any) {
              if (backendError.response?.status === 401) {
                console.log('Authentication failed, saving to localStorage only');
                localStorage.removeItem('token');
              } else {
                console.log('Backend save failed, saving to localStorage only');
              }
            }
          } else {
            console.log('No token found, saving to localStorage only');
          }
          
          // Also save to localStorage as backup
          localStorage.setItem('userSettings', JSON.stringify(settings));
          get().applySettings(settings);
          console.log('Settings saved');
        } catch (error) {
          console.error('Error saving settings:', error);
        } finally {
          set({ isSaving: false });
        }
      },
      
      // Individual setting update methods
      updateMessageSettings: async (settings) => {
        await get().updateSettings(settings);
      },
      
      updateAISettings: async (settings) => {
        await get().updateSettings(settings);
      },
      
      updateWhatsAppSettings: async (settings) => {
        await get().updateSettings(settings);
      },
      
      updateNotificationSettings: async (settings) => {
        await get().updateSettings(settings);
      },
      
      updateRegionalSettings: async (settings) => {
        await get().updateSettings(settings);
      },
      
      updatePerformanceSettings: async (settings) => {
        await get().updateSettings(settings);
      },
      
      updateSecuritySettings: async (settings) => {
        await get().updateSettings(settings);
      },
      
      updateUISettings: async (settings) => {
        await get().updateSettings(settings);
      },
      
      // Apply settings to the application
      applySettings: (settings: UserSettings) => {
        // Apply theme
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // Auto theme - follow system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        
        // Apply animations
        if (!settings.animationsEnabled) {
          document.documentElement.style.setProperty('--animation-duration', '0s');
        } else {
          document.documentElement.style.removeProperty('--animation-duration');
        }
        
        // Apply compact mode
        if (settings.compactMode) {
          document.documentElement.classList.add('compact-mode');
        } else {
          document.documentElement.classList.remove('compact-mode');
        }
        
        // Apply sidebar state
        if (settings.sidebarCollapsed) {
          document.documentElement.classList.add('sidebar-collapsed');
        } else {
          document.documentElement.classList.remove('sidebar-collapsed');
        }
        
        console.log('Settings applied to application');
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
