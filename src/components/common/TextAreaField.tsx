'use client';

import { forwardRef } from 'react';

interface TextAreaFieldProps {
  // Basic props
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  
  // Input attributes
  name?: string;
  id?: string;
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
  textareaClassName?: string;
  errorClassName?: string;
  
  // Textarea specific
  rows?: number;
  cols?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  
  // Help text
  helpText?: string;
  
  // React Hook Form integration
  register?: any;
  
  // Size variants
  size?: 'sm' | 'md' | 'lg';
  
  // Full width
  fullWidth?: boolean;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
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
    readOnly = false,
    error,
    hasError = false,
    className = '',
    containerClassName = '',
    labelClassName = '',
    textareaClassName = '',
    errorClassName = '',
    rows = 3,
    cols,
    resize = 'vertical',
    helpText,
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

    // Textarea classes
    const textareaClasses = `
      block w-full border rounded-md shadow-sm placeholder-gray-400 
      focus:outline-none focus:ring-primary-500 focus:border-primary-500 
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[size]}
      ${hasError || error ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
      resize-${resize}
      ${textareaClassName}
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

    // Handle textarea change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    // Render textarea with register (React Hook Form) or without
    const renderTextarea = () => {
      const baseProps = {
        placeholder,
        name,
        id: id || name,
        required,
        disabled,
        readOnly,
        rows,
        cols,
        className: textareaClasses,
        ref,
        ...props,
      };

      if (register) {
        // When using React Hook Form, spread register first, then baseProps
        // This ensures register's onChange, onBlur, name, and ref take precedence
        return <textarea {...register} {...baseProps} />;
      }

      // When not using React Hook Form, handle value and onChange manually
      return <textarea 
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

        {/* Textarea */}
        {renderTextarea()}

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

TextAreaField.displayName = 'TextAreaField';
