'use client';

import { NumberField, CheckboxField } from './index';

interface PerformanceSettingsProps {
  settings: {
    batchSize: number;
    concurrentConnections: number;
    cacheDuration: number;
    cacheEnabled: boolean;
  };
  onSettingChange: (field: string, value: any) => void;
}

export function PerformanceSettings({ settings, onSettingChange }: PerformanceSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <NumberField
          label="Batch Size"
          value={settings.batchSize}
          onChange={(value) => onSettingChange('batchSize', value)}
          min={1}
          max={100}
          helpText="Messages processed in one batch"
        />
        <NumberField
          label="Concurrent Connections"
          value={settings.concurrentConnections}
          onChange={(value) => onSettingChange('concurrentConnections', value)}
          min={1}
          max={20}
          helpText="Maximum concurrent connections"
        />
        <NumberField
          label="Cache Duration (minutes)"
          value={settings.cacheDuration}
          onChange={(value) => onSettingChange('cacheDuration', value)}
          min={5}
          max={1440}
          helpText="How long to cache data"
        />
      </div>

      <CheckboxField
        label="Enable caching for better performance"
        checked={settings.cacheEnabled}
        onChange={(checked) => onSettingChange('cacheEnabled', checked)}
      />
    </div>
  );
}
