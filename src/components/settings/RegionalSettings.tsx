'use client';

import { SelectField } from './index';

interface RegionalSettingsProps {
  settings: {
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    currency: string;
  };
  onSettingChange: (field: string, value: any) => void;
}

export function RegionalSettings({ settings, onSettingChange }: RegionalSettingsProps) {
  const timezoneOptions = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (India)' },
    { value: 'America/New_York', label: 'America/New_York (EST)' },
    { value: 'Europe/London', label: 'Europe/London (GMT)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  ];

  const dateFormatOptions = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const timeFormatOptions = [
    { value: '12h', label: '12 Hour (AM/PM)' },
    { value: '24h', label: '24 Hour' },
  ];

  const currencyOptions = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <SelectField
        label="Timezone"
        value={settings.timezone}
        onChange={(value) => onSettingChange('timezone', value)}
        options={timezoneOptions}
      />
      <SelectField
        label="Date Format"
        value={settings.dateFormat}
        onChange={(value) => onSettingChange('dateFormat', value)}
        options={dateFormatOptions}
      />
      <SelectField
        label="Time Format"
        value={settings.timeFormat}
        onChange={(value) => onSettingChange('timeFormat', value)}
        options={timeFormatOptions}
      />
      <SelectField
        label="Currency"
        value={settings.currency}
        onChange={(value) => onSettingChange('currency', value)}
        options={currencyOptions}
      />
    </div>
  );
}
