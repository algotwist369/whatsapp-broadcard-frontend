'use client';

import { NumberField, CheckboxField } from './index';

interface MessageSettingsProps {
  settings: {
    messageDelay: number;
    maxRetries: number;
    autoRetry: boolean;
  };
  onSettingChange: (field: string, value: any) => void;
}

export function MessageSettings({ settings, onSettingChange }: MessageSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <NumberField
          label="Message Delay (seconds)"
          value={settings.messageDelay}
          onChange={(value) => onSettingChange('messageDelay', value)}
          min={1}
          max={300}
          helpText="Delay between sending messages (1-300 seconds). Higher values prevent spam detection but take longer."
        />
        <NumberField
          label="Max Retries"
          value={settings.maxRetries}
          onChange={(value) => onSettingChange('maxRetries', value)}
          min={1}
          max={10}
          helpText="Maximum retry attempts for failed messages"
        />
      </div>

      <CheckboxField
        label="Automatically retry failed messages"
        checked={settings.autoRetry}
        onChange={(checked) => onSettingChange('autoRetry', checked)}
      />

      {/* Delay Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Delay Recommendations</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Small campaigns (1-10 contacts):</span>
            <span className="font-medium">30-45 seconds</span>
          </div>
          <div className="flex justify-between">
            <span>Medium campaigns (11-50 contacts):</span>
            <span className="font-medium">45-60 seconds</span>
          </div>
          <div className="flex justify-between">
            <span>Large campaigns (51-100 contacts):</span>
            <span className="font-medium">60-90 seconds</span>
          </div>
          <div className="flex justify-between">
            <span>Very large campaigns (100+ contacts):</span>
            <span className="font-medium">90-120 seconds</span>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          ⚠️ Delays under 10 seconds may trigger spam detection. Higher delays are safer but take longer to complete.
        </p>
      </div>
    </div>
  );
}
