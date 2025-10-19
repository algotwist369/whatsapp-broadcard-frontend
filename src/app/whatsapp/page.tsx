'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WhatsAppConnectionComponent } from '@/components/whatsapp/WhatsAppConnection';
import { useWhatsAppStore } from '@/store/whatsappStore';
import {
  ChatBubbleLeftRightIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface TestMessageForm {
  phoneNumber: string;
  message: string;
}

export default function WhatsAppPage() {
  const [testingMessage, setTestingMessage] = useState(false);
  const { isConnected, sendTestMessage } = useWhatsAppStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestMessageForm>();

  const onTestMessage = async (data: TestMessageForm) => {
    setTestingMessage(true);
    try {
      const response = await sendTestMessage(data.phoneNumber, data.message);
      if (response.success) {
        toast.success('Test message sent successfully!');
        reset();
      } else {
        toast.error(response.message || 'Failed to send test message');
      }
    } catch (error: any) {
      toast.error('Failed to send test message');
    } finally {
      setTestingMessage(false);
    }
  };

  return (
    <DashboardLayout title="WhatsApp Settings" subtitle="Manage your WhatsApp connection">
      <div className="space-y-6">
        {/* WhatsApp Connection Status */}
        <WhatsAppConnectionComponent />

        {/* Test Message Section */}
        {isConnected && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Send Test Message
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Test your WhatsApp connection by sending a message to any phone number.
              </p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onTestMessage)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      {...register('phoneNumber', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^\+?[\d\s-()]+$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                      type="tel"
                      className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
                      placeholder="+1234567890"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Message *
                    </label>
                    <input
                      {...register('message', {
                        required: 'Message is required',
                        minLength: {
                          value: 1,
                          message: 'Message cannot be empty'
                        }
                      })}
                      type="text"
                      className={`input ${errors.message ? 'input-error' : ''}`}
                      placeholder="Hello! This is a test message."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={testingMessage}
                    className="btn btn-primary"
                  >
                    {testingMessage ? (
                      <>
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 animate-pulse" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                        Send Test Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WhatsApp Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              WhatsApp Integration Information
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <QrCodeIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">QR Code Connection</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Scan the QR code with your WhatsApp mobile app to connect your account. 
                    The connection is secure and your data is encrypted.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Session Persistence</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Once connected, your WhatsApp session will persist across browser sessions. 
                    You only need to scan the QR code once.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Important Notes</h4>
                  <div className="text-sm text-gray-600 mt-1 space-y-2">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Make sure your phone has an active internet connection</li>
                      <li>Keep your WhatsApp app updated to the latest version</li>
                      <li>Don't log out of WhatsApp on your phone while using this service</li>
                      <li>For security, avoid connecting on public or shared computers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Troubleshooting
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Connection Issues</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>QR Code not appearing:</strong> Refresh the page and try connecting again.</p>
                  <p><strong>QR Code expired:</strong> Click "Refresh QR Code" to generate a new one.</p>
                  <p><strong>Can't scan QR code:</strong> Make sure your phone camera is working and has permission to scan QR codes.</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Message Issues</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Messages not sending:</strong> Check your internet connection and WhatsApp connection status.</p>
                  <p><strong>Phone number format:</strong> Use international format with country code (e.g., +1234567890).</p>
                  <p><strong>Rate limiting:</strong> WhatsApp may limit message sending if you send too many messages too quickly.</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Still having issues?</h4>
                <p className="text-sm text-gray-600">
                  If you continue to experience problems, try disconnecting and reconnecting your WhatsApp account, 
                  or contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
