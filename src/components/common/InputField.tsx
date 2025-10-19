'use client';

import { forwardRef, ReactNode } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface InputFieldProps {
  // Basic props
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  
  // Input type and attributes
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'search';
  name?: string;
  id?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  
  // Validation and error handling
  error?: string;
  hasError?: boolean;
  
  // Styling and layout
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  
  // Input constraints
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Help text
  helpText?: string;
  
  // Icons
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  
  // Password visibility toggle
  showPasswordToggle?: boolean;
  onPasswordToggle?: () => void;
  
  // React Hook Form integration
  register?: any;
  
  // Size variants
  size?: 'sm' | 'md' | 'lg';
  
  // Full width
  fullWidth?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    type = 'text',
    name,
    id,
    autoComplete,
    required = false,
    disabled = false,
    readOnly = false,
    error,
    hasError = false,
    className = '',
    containerClassName = '',
    labelClassName = '',
    inputClassName = '',
    errorClassName = '',
    min,
    max,
    minLength,
    maxLength,
    pattern,
    helpText,
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    onPasswordToggle,
    register,
    size = 'md',
    fullWidth = true,
    ...props
  }, ref) => {
    // Size classes
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    // Input classes
    const inputClasses = `
      block w-full border rounded-md shadow-sm placeholder-gray-400 
      focus:outline-none focus:ring-primary-500 focus:border-primary-500 
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[size]}
      ${hasError || error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon || showPasswordToggle ? 'pr-10' : ''}
      ${inputClassName}
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

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        const newValue = type === 'number' ? 
          (e.target.value === '' ? 0 : parseFloat(e.target.value)) : 
          e.target.value;
        onChange(newValue);
      }
    };

    // Render input with register (React Hook Form) or without
    const renderInput = () => {
      const baseProps = {
        type: showPasswordToggle ? 'password' : type,
        placeholder,
        id: id || name,
        autoComplete,
        required,
        disabled,
        readOnly,
        min,
        max,
        minLength,
        maxLength,
        pattern,
        className: inputClasses,
        ...props,
      };

      if (register) {
        // When using React Hook Form, register is already the result of register(fieldName)
        // It contains: { onChange, onBlur, name, ref }
        // We need to spread register AFTER baseProps to ensure register properties take precedence
        return <input {...baseProps} {...register} />;
      }

      // When not using React Hook Form, handle value and onChange manually
      return <input 
        {...baseProps}
        value={value}
        onChange={(e) => handleChange(e)}
        onBlur={onBlur}
        onFocus={onFocus}
      />;
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

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}

          {/* Input */}
          {renderInput()}

          {/* Right Icon or Password Toggle */}
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle ? (
                <button
                  type="button"
                  onClick={onPasswordToggle}
                  className="h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {type === 'password' ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <div className="h-5 w-5 text-gray-400">
                  {rightIcon}
                </div>
              )}
            </div>
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

InputField.displayName = 'InputField';
