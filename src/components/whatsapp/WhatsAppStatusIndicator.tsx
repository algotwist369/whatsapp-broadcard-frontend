'use client';

import { useWhatsAppStore } from '@/store/whatsappStore';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface WhatsAppStatusIndicatorProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function WhatsAppStatusIndicator({ 
  showText = true, 
  size = 'md',
  className = ''
}: WhatsAppStatusIndicatorProps) {
  const { isConnected, status } = useWhatsAppStore();

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isConnected ? (
        <CheckCircleIcon className={`${sizeClasses[size]} text-green-500`} />
      ) : (
        <XCircleIcon className={`${sizeClasses[size]} text-red-500`} />
      )}
      {showText && (
        <span className={`${textSizeClasses[size]} font-medium ${
          isConnected ? 'text-green-700' : 'text-red-700'
        }`}>
          WhatsApp {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      )}
      {status?.state && showText && (
        <span className={`${textSizeClasses[size]} text-gray-500 capitalize`}>
          ({status.state.replace('_', ' ')})
        </span>
      )}
    </div>
  );
}
