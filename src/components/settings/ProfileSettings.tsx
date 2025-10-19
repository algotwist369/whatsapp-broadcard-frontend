'use client';

import { FormField } from './FormField';

interface ProfileSettingsProps {
  user: {
    name: string;
    email: string;
  } | null;
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <FormField
        label="Name"
        value={user?.name || ''}
        onChange={() => {}}
        disabled
      />
      <FormField
        label="Email"
        type="email"
        value={user?.email || ''}
        onChange={() => {}}
        disabled
      />
    </div>
  );
}
