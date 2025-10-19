'use client';

import { useState, memo } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayoutComponent = ({ children, title, subtitle }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden lg:ml-64">
        <Header 
          title={title} 
          subtitle={subtitle}
          onMobileMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const DashboardLayout = memo(DashboardLayoutComponent);
