'use client';

import { useState, memo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { WhatsAppStatusIndicator } from '@/components/whatsapp/WhatsAppStatusIndicator';
import { MobileMenuButton } from './Sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuClick: () => void;
}

const HeaderComponent = ({ title, subtitle, onMobileMenuClick }: HeaderProps) => {
  const { user } = useAuthStore();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <MobileMenuButton onClick={onMobileMenuClick} />
      
      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center min-w-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-x-2 sm:gap-x-4 lg:gap-x-6">
          {/* WhatsApp Connection Status - hidden on very small screens */}
          <div className="hidden sm:block">
            <WhatsAppStatusIndicator size="sm" className="text-gray-500" />
          </div>

          {/* Profile dropdown */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Header = memo(HeaderComponent);
