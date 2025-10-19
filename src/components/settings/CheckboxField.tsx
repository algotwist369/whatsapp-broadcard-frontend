'use client';

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export function CheckboxField({
  label,
  checked,
  onChange,
  disabled = false,
  description,
  className = '',
}: CheckboxFieldProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
      />
      <div className="ml-2">
        <label className="block text-sm text-gray-900">{label}</label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );
}
