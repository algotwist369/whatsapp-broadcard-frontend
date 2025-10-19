'use client';

import { CheckboxField } from './index';

interface NotificationSettingsProps {
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    soundNotifications: boolean;
    notificationTypes: Record<string, boolean>;
  };
  onSettingChange: (field: string, value: any) => void;
}

export function NotificationSettings({ settings, onSettingChange }: NotificationSettingsProps) {
  return (
    <div className="space-y-4">
      <CheckboxField
        label="Email Notifications"
        checked={settings.emailNotifications}
        onChange={(checked) => onSettingChange('emailNotifications', checked)}
      />

      <CheckboxField
        label="Push Notifications"
        checked={settings.pushNotifications}
        onChange={(checked) => onSettingChange('pushNotifications', checked)}
      />

      <CheckboxField
        label="Sound Notifications"
        checked={settings.soundNotifications}
        onChange={(checked) => onSettingChange('soundNotifications', checked)}
      />

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
        <div className="space-y-2">
          {Object.entries(settings.notificationTypes).map(([key, value]) => (
            <CheckboxField
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').trim()}
              checked={value}
              onChange={(checked) => onSettingChange('notificationTypes', {
                ...settings.notificationTypes,
                [key]: checked
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
