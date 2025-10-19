'use client';

import { SelectField, CheckboxField } from './index';

interface UISettingsProps {
  settings: {
    theme: string;
    language: string;
    sidebarCollapsed: boolean;
    animationsEnabled: boolean;
    compactMode: boolean;
  };
  onSettingChange: (field: string, value: any) => void;
}

export function UISettings({ settings, onSettingChange }: UISettingsProps) {
  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' },
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField
          label="Theme"
          value={settings.theme}
          onChange={(value) => onSettingChange('theme', value)}
          options={themeOptions}
        />
        <SelectField
          label="Language"
          value={settings.language}
          onChange={(value) => onSettingChange('language', value)}
          options={languageOptions}
        />
      </div>

      <div className="space-y-4">
        <CheckboxField
          label="Collapse sidebar by default"
          checked={settings.sidebarCollapsed}
          onChange={(checked) => onSettingChange('sidebarCollapsed', checked)}
        />
        <CheckboxField
          label="Enable animations"
          checked={settings.animationsEnabled}
          onChange={(checked) => onSettingChange('animationsEnabled', checked)}
        />
        <CheckboxField
          label="Compact mode"
          checked={settings.compactMode}
          onChange={(checked) => onSettingChange('compactMode', checked)}
        />
      </div>
    </div>
  );
}
