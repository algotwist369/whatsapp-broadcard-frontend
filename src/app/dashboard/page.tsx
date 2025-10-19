'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { useWhatsAppStore } from '@/store/whatsappStore';
import { WhatsAppConnectionComponent } from '@/components/whatsapp/WhatsAppConnection';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  DocumentTextIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isConnected } = useWhatsAppStore();

  const quickActions = [
    {
      title: 'Send Messages',
      description: 'Create and send bulk messages to your contacts',
      icon: ChatBubbleLeftRightIcon,
      href: '/messages',
      color: 'bg-blue-500',
      disabled: !isConnected,
      disabledText: 'Connect WhatsApp first'
    },
    {
      title: 'Manage Contacts',
      description: 'Add, edit, or organize your contact list',
      icon: UserGroupIcon,
      href: '/contacts',
      color: 'bg-green-500',
      disabled: false
    },
    {
      title: 'Settings',
      description: 'Configure your WhatsApp and app preferences',
      icon: CogIcon,
      href: '/settings',
      color: 'bg-purple-500',
      disabled: false
    },
    {
      title: 'Message History',
      description: 'View your sent messages and delivery status',
      icon: DocumentTextIcon,
      href: '/messages',
      color: 'bg-orange-500',
      disabled: false
    }
  ];

  const statusInfo = [
    {
      icon: PhoneIcon,
      title: 'WhatsApp Status',
      status: isConnected ? 'Connected' : 'Disconnected',
      color: isConnected ? 'text-green-600' : 'text-red-600',
      bgColor: isConnected ? 'bg-green-50' : 'bg-red-50',
      borderColor: isConnected ? 'border-green-200' : 'border-red-200'
    },
    {
      icon: CheckCircleIcon,
      title: 'Account Status',
      status: 'Active',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.name}`}>
      <div className="space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to WhatsApp Bulk Messenger
          </h2>
          <p className="text-gray-600 mb-4">
            Send personalized bulk messages to your contacts efficiently and professionally.
          </p>
          {!isConnected && (
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Connect your WhatsApp account to start sending messages
              </span>
            </div>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusInfo.map((item, index) => (
            <div key={index} className={`${item.bgColor} ${item.borderColor} border rounded-lg p-4`}>
              <div className="flex items-center">
                <item.icon className={`h-6 w-6 ${item.color} mr-3`} />
                <div>
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className={`text-sm ${item.color}`}>{item.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp Connection */}
        <WhatsAppConnectionComponent />

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.disabled ? '#' : action.href}
                className={`block bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  action.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300'
                }`}
                onClick={(e) => action.disabled && e.preventDefault()}
              >
                <div className="flex items-start">
                  <div className={`${action.color} rounded-lg p-2 mr-3`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                    {action.disabled && action.disabledText && (
                      <p className="text-xs text-red-600">{action.disabledText}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Connect WhatsApp</p>
                <p className="text-sm text-gray-600">Scan the QR code to link your WhatsApp account</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Contacts</p>
                <p className="text-sm text-gray-600">Import or manually add your contact list</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Send Messages</p>
                <p className="text-sm text-gray-600">Create and send personalized bulk messages</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">AI-Powered Messages</h4>
              <p className="text-sm text-gray-600">Automatic spam detection and message optimization for better delivery rates</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Bulk Messaging</h4>
              <p className="text-sm text-gray-600">Send personalized messages to hundreds of contacts simultaneously</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Real-time Updates</h4>
              <p className="text-sm text-gray-600">Track message delivery status and connection status in real-time</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
