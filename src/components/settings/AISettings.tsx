'use client';

import { CheckboxField, SelectField } from './index';

interface AISettingsProps {
  settings: {
    aiEnabled: boolean;
    spamDetection: boolean;
    messageRewriting: boolean;
    aiModel: string;
  };
  onSettingChange: (field: string, value: any) => void;
}

export function AISettings({ settings, onSettingChange }: AISettingsProps) {
  const aiModelOptions = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Faster)' },
    { value: 'gpt-4', label: 'GPT-4 (More Accurate)' },
  ];

  return (
    <div className="space-y-4">
      <CheckboxField
        label="Enable AI Analysis"
        checked={settings.aiEnabled}
        onChange={(checked : any) => onSettingChange('aiEnabled', checked)}
      />

      <CheckboxField
        label="Spam Detection"
        checked={settings.spamDetection}
        onChange={(checked : any) => onSettingChange('spamDetection', checked)}
        disabled={!settings.aiEnabled}
      />

      <CheckboxField
        label="Message Rewriting"
        checked={settings.messageRewriting}
        onChange={(checked : any) => onSettingChange('messageRewriting', checked)}
        disabled={!settings.aiEnabled}
      />

      <SelectField
        label="AI Model"
        value={settings.aiModel}
        onChange={(value : any) => onSettingChange('aiModel', value)}
        options={aiModelOptions}
        disabled={!settings.aiEnabled}
      />
    </div>
  );
}
