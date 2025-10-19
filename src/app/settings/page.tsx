'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useWhatsAppStore } from '@/store/whatsappStore';
import { useSettingsStore } from '@/store/settingsStore';
import toast from 'react-hot-toast';
import {
  SettingsTab,
  SettingsSection,
  ProfileSettings,
  MessageSettings,
  AISettings,
  WhatsAppSettings,
  NotificationSettings,
  RegionalSettings,
  PerformanceSettings,
  SecuritySettings,
  UISettings,
} from '@/components/settings';
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  UserIcon,
  TrashIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { isConnected } = useWhatsAppStore();
  const {
    settings,
    isLoading,
    isSaving,
    updateMessageSettings,
    updateAISettings,
    updateWhatsAppSettings,
    updateNotificationSettings,
    updateRegionalSettings,
    updatePerformanceSettings,
    updateSecuritySettings,
    updateUISettings,
    resetSettings,
    loadSettings,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Memoized settings change handlers
  const handleMessageSettingsChange = useCallback(async (field: string, value: any) => {
    try {
      await updateMessageSettings({ [field]: value });
      toast.success('Message settings updated');
    } catch (error) {
      toast.error('Failed to update message settings');
    }
  }, [updateMessageSettings]);

  const handleAISettingsChange = useCallback(async (field: string, value: any) => {
    try {
      await updateAISettings({ [field]: value });
      toast.success('AI settings updated');
    } catch (error) {
      toast.error('Failed to update AI settings');
    }
  }, [updateAISettings]);

  const handleWhatsAppSettingsChange = useCallback(async (field: string, value: any) => {
    try {
      await updateWhatsAppSettings({ [field]: value });
      toast.success('WhatsApp settings updated');
    } catch (error) {
      toast.error('Failed to update WhatsApp settings');
    }
  }, [updateWhatsAppSettings]);

  const handleNotificationSettingsChange = useCallback(async (field: string, value: any) => {
    try {
      await updateNotificationSettings({ [field]: value });
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  }, [updateNotificationSettings]);

  const handleRegionalSettingsChange = useCallback(async (field: string, value: any) => {
    try {
      await updateRegionalSettings({ [field]: value });
      toast.success('Regional settings updated');
    } catch (error) {
      toast.error('Failed to update regional settings');
    }
  }, [updateRegionalSettings]);

  const handlePerformanceSettingsChange = useCallback(async (field: string, value: any) => {
    try {
      await updatePerformanceSettings({ [field]: value });
      toast.success('Performance settings updated');
    } catch (error) {
      toast.error('Failed to update performance settings');
    }
  }, [updatePerformanceSettings]);

  const handleSecuritySettingsChange = useCallback(async (field: string, value: any) => {
    try {
      await updateSecuritySettings({ [field]: value });
      toast.success('Security settings updated');
    } catch (error) {
      toast.error('Failed to update security settings');
    }
  }, [updateSecuritySettings]);

  const handleUISettingsChange = useCallback(async (field: string, value: any) => {
    try {
      await updateUISettings({ [field]: value });
      toast.success('UI settings updated');
    } catch (error) {
      toast.error('Failed to update UI settings');
    }
  }, [updateUISettings]);

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      await resetSettings();
      toast.success('Settings reset to defaults');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'messages', name: 'Messages', icon: ChatBubbleLeftRightIcon },
    { id: 'ai', name: 'AI Settings', icon: SparklesIcon },
    { id: 'whatsapp', name: 'WhatsApp', icon: DevicePhoneMobileIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'regional', name: 'Regional', icon: GlobeAltIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'ui', name: 'Interface', icon: CogIcon },
  ];

  if (isLoading) {
    return (
      <DashboardLayout title="Settings" subtitle="Manage your application preferences">
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Settings" subtitle="Manage your application preferences">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <SettingsTab
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <SettingsSection
                title="Profile Information"
                description="Update your personal information"
              >
                <ProfileSettings user={user} />
              </SettingsSection>
            )}

            {/* Message Settings */}
            {activeTab === 'messages' && (
              <SettingsSection
                title="Message Settings"
                description="Configure how messages are sent"
              >
                <MessageSettings
                  settings={settings}
                  onSettingChange={handleMessageSettingsChange}
                />
              </SettingsSection>
            )}

            {/* AI Settings */}
            {activeTab === 'ai' && (
              <SettingsSection
                title="AI Settings"
                description="Configure AI-powered features"
              >
                <AISettings
                  settings={settings}
                  onSettingChange={handleAISettingsChange}
                />
              </SettingsSection>
            )}

            {/* WhatsApp Settings */}
            {activeTab === 'whatsapp' && (
              <SettingsSection
                title="WhatsApp Settings"
                description="Configure WhatsApp connection settings"
              >
                <WhatsAppSettings
                  settings={settings}
                  isConnected={isConnected}
                  onSettingChange={handleWhatsAppSettingsChange}
                />
              </SettingsSection>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <SettingsSection
                title="Notification Settings"
                description="Configure how you receive notifications"
              >
                <NotificationSettings
                  settings={settings}
                  onSettingChange={handleNotificationSettingsChange}
                />
              </SettingsSection>
            )}

            {/* Regional Settings */}
            {activeTab === 'regional' && (
              <SettingsSection
                title="Regional Settings"
                description="Configure your regional preferences"
              >
                <RegionalSettings
                  settings={settings}
                  onSettingChange={handleRegionalSettingsChange}
                />
              </SettingsSection>
            )}

            {/* Performance Settings */}
            {activeTab === 'performance' && (
              <SettingsSection
                title="Performance Settings"
                description="Optimize application performance"
              >
                <PerformanceSettings
                  settings={settings}
                  onSettingChange={handlePerformanceSettingsChange}
                />
              </SettingsSection>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <SettingsSection
                title="Security Settings"
                description="Configure security preferences"
              >
                <SecuritySettings
                  settings={settings}
                  onSettingChange={handleSecuritySettingsChange}
                />
              </SettingsSection>
            )}

            {/* UI Settings */}
            {activeTab === 'ui' && (
              <SettingsSection
                title="Interface Settings"
                description="Customize your user interface"
              >
                <UISettings
                  settings={settings}
                  onSettingChange={handleUISettingsChange}
                />
              </SettingsSection>
            )}
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
            <button
              onClick={handleResetSettings}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Reset to Defaults
            </button>

            <div className="flex items-center text-sm text-gray-500">
              {isSaving && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Saving...
                </div>
              )}
              {!isSaving && (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Settings saved automatically
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}