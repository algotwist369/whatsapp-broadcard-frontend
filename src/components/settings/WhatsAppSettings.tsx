'use client';

import { NumberField, CheckboxField, StatusCard } from './index';

interface WhatsAppSettingsProps {
  settings: {
    whatsappTimeout: number;
    qrRefreshInterval: number;
    autoReconnect: boolean;
  };
  isConnected: boolean;
  onSettingChange: (field: string, value: any) => void;
}

export function WhatsAppSettings({ settings, isConnected, onSettingChange }: WhatsAppSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <NumberField
          label="Connection Timeout (seconds)"
          value={settings.whatsappTimeout}
          onChange={(value) => onSettingChange('whatsappTimeout', value)}
          min={30}
          max={300}
        />
        <NumberField
          label="QR Refresh Interval (seconds)"
          value={settings.qrRefreshInterval}
          onChange={(value) => onSettingChange('qrRefreshInterval', value)}
          min={1}
          max={30}
        />
      </div>

      <CheckboxField
        label="Automatically reconnect on disconnect"
        checked={settings.autoReconnect}
        onChange={(checked) => onSettingChange('autoReconnect', checked)}
      />

      <StatusCard
        status={isConnected ? 'success' : 'warning'}
        title={`WhatsApp Status: ${isConnected ? 'Connected' : 'Not Connected'}`}
        description="Current settings will be applied to new connections."
      />
    </div>
  );
}
