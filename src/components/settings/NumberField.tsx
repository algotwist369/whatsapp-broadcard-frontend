'use client';

import { InputField } from '@/components/common';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  helpText?: string;
  disabled?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  helpText,
  disabled = false,
}: NumberFieldProps) {
  const handleChange = (newValue: string | number) => {
    const numValue = typeof newValue === 'number' ? newValue : parseFloat(newValue.toString());
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <InputField
      label={label}
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      helpText={helpText}
      disabled={disabled}
    />
  );
}
