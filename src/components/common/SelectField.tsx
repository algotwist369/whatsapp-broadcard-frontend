'use client';

import { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  // Basic props
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  
  // Select attributes
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  
  // Validation and error handling
  error?: string;
  hasError?: boolean;
  
  // Styling and layout
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
  
  // Options
  options: SelectOption[];
  
  // Help text
  helpText?: string;
  
  // React Hook Form integration
  register?: any;
  
  // Size variants
  size?: 'sm' | 'md' | 'lg';
  
  // Full width
  fullWidth?: boolean;
  
  // Search functionality
  searchable?: boolean;
  searchPlaceholder?: string;
  
  // Clear functionality
  clearable?: boolean;
  onClear?: () => void;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    name,
    id,
    required = false,
    disabled = false,
    multiple = false,
    error,
    hasError = false,
    className = '',
    containerClassName = '',
    labelClassName = '',
    selectClassName = '',
    errorClassName = '',
    options,
    helpText,
    register,
    size = 'md',
    fullWidth = true,
    searchable = false,
    searchPlaceholder = 'Search options...',
    clearable = false,
    onClear,
    ...props
  }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    // Select classes
    const selectClasses = `
      block w-full border rounded-md shadow-sm 
      focus:outline-none focus:ring-primary-500 focus:border-primary-500 
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[size]}
      ${hasError || error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
      ${selectClassName}
    `.trim();

    // Container classes
    const containerClasses = `
      ${fullWidth ? 'w-full' : ''}
      ${containerClassName}
    `.trim();

    // Label classes
    const labelClasses = `
      block text-sm font-medium text-gray-700 mb-1
      ${labelClassName}
    `.trim();

    // Error classes
    const errorClasses = `
      mt-1 text-sm text-red-600
      ${errorClassName}
    `.trim();

    // Handle select change
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        const newValue = multiple ? 
          Array.from(e.target.selectedOptions, option => option.value) : 
          e.target.value;
        onChange(newValue as string | number);
      }
    };

    // Render select with register (React Hook Form) or without
    const renderSelect = () => {
      const selectProps = {
        value,
        onChange: handleChange,
        onBlur,
        onFocus,
        name,
        id: id || name,
        required,
        disabled,
        multiple,
        className: selectClasses,
        ref,
        ...props,
      };

      if (register) {
        // When using React Hook Form, let it handle value and onChange
        return (
          <select {...register} {...selectProps}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      // When not using React Hook Form, handle value and onChange manually
      return (
        <select {...selectProps}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      );
    };

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label htmlFor={id || name} className={labelClasses}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          {renderSelect()}
          
          {/* Clear Button */}
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 right-0 pr-8 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Help Text */}
        {helpText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helpText}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className={errorClasses}>{error}</p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
