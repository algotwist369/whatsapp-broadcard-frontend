'use client';

import { NumberField, CheckboxField } from './index';

interface SecuritySettingsProps {
  settings: {
    sessionTimeout: number;
    loginAttempts: number;
    requirePasswordChange: boolean;
    twoFactorAuth: boolean;
  };
  onSettingChange: (field: string, value: any) => void;
}

export function SecuritySettings({ settings, onSettingChange }: SecuritySettingsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <NumberField
          label="Session Timeout (minutes)"
          value={settings.sessionTimeout}
          onChange={(value) => onSettingChange('sessionTimeout', value)}
          min={15}
          max={480}
        />
        <NumberField
          label="Max Login Attempts"
          value={settings.loginAttempts}
          onChange={(value) => onSettingChange('loginAttempts', value)}
          min={3}
          max={10}
        />
      </div>

      <div className="space-y-4">
        <CheckboxField
          label="Require password change on next login"
          checked={settings.requirePasswordChange}
          onChange={(checked) => onSettingChange('requirePasswordChange', checked)}
        />
        <CheckboxField
          label="Enable Two-Factor Authentication"
          checked={settings.twoFactorAuth}
          onChange={(checked) => onSettingChange('twoFactorAuth', checked)}
        />
      </div>
    </div>
  );
}
