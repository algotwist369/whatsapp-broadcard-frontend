'use client';

import { useSettingsEffect } from '@/hooks/useSettingsEffect';

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  // This hook will automatically load and apply settings
  useSettingsEffect();

  return <>{children}</>;
}
