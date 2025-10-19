'use client';

import { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Hook to apply settings changes in real-time across the application
 * This ensures that when settings are changed, they are immediately applied
 * to the current session and persisted to the backend
 */
export function useSettingsEffect() {
  const { settings, loadSettings } = useSettingsStore();
  const hasLoaded = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Load settings on mount only once
    if (isHydrated && !hasLoaded.current) {
      hasLoaded.current = true;
      loadSettings();
    }
  }, [loadSettings, isHydrated]);

  useEffect(() => {
    // Apply settings whenever they change (only after hydration)
    if (isHydrated && settings) {
      applySettingsToApplication(settings);
    }
  }, [settings, isHydrated]);

  return settings;
}

/**
 * Apply settings to the application in real-time
 */
function applySettingsToApplication(settings: any) {
  // Check if we're in the browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

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

  // Apply language
  if (settings.language) {
    document.documentElement.lang = settings.language;
  }

  // Apply timezone
  if (settings.timezone) {
    // Store timezone in a global variable for use by other components
    (window as any).userTimezone = settings.timezone;
  }

  // Apply message delay setting globally
  if (settings.messageDelay) {
    (window as any).messageDelay = settings.messageDelay * 1000; // Convert to milliseconds
  }

  // Apply batch size setting globally
  if (settings.batchSize) {
    (window as any).batchSize = settings.batchSize;
  }

  // Apply concurrent connections setting globally
  if (settings.concurrentConnections) {
    (window as any).concurrentConnections = settings.concurrentConnections;
  }

  // Apply AI settings globally
  if (settings.aiEnabled !== undefined) {
    (window as any).aiEnabled = settings.aiEnabled;
  }

  if (settings.spamDetection !== undefined) {
    (window as any).spamDetection = settings.spamDetection;
  }

  if (settings.messageRewriting !== undefined) {
    (window as any).messageRewriting = settings.messageRewriting;
  }

  if (settings.aiModel) {
    (window as any).aiModel = settings.aiModel;
  }

  console.log('Settings applied to application:', {
    theme: settings.theme,
    messageDelay: settings.messageDelay,
    batchSize: settings.batchSize,
    aiEnabled: settings.aiEnabled,
    timezone: settings.timezone
  });
}
