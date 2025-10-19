'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { autoReplyApi } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ClientOnly } from '@/components/common/ClientOnly';
import { useHydration } from '@/hooks/useHydration';
import dynamic from 'next/dynamic';

interface AutoReply {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  triggerKeywords: string[];
  responseTemplate: string;
  responseType: 'text' | 'template' | 'ai_generated';
  category: string;
  priority: number;
  statistics: {
    totalTriggers: number;
    successfulReplies: number;
    failedReplies: number;
    lastTriggered?: string;
  };
  createdAt: string;
}

interface ReplyData {
  _id: string;
  name: string;
  description?: string;
  category: string;
  dataType: 'excel_import' | 'manual_entry' | 'api_import';
  data: Array<{
    key: string;
    value: string;
    context?: string;
    tags?: string[];
    priority?: number;
  }>;
  isActive: boolean;
  importMetadata?: {
    totalRows: number;
    importedRows: number;
    skippedRows: number;
    importDate: string;
  };
  statistics: {
    totalQueries: number;
    successfulMatches: number;
    lastUsed?: string;
  };
  createdAt: string;
}

// Create a client-only component to prevent hydration issues
const AutoReplyContent: React.FC = () => {
  const { user } = useAuthStore();
  const isHydrated = useHydration();
  const [activeTab, setActiveTab] = useState<'auto-replies' | 'logs'>('auto-replies');
  const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
  // Removed: replyData state - no longer using manual data
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Removed: showDataModal, showUploadModal, selectedFile - no longer using manual data
  
  // Simple auto-reply settings
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplySettings, setAutoReplySettings] = useState({
    personality: 'professional',
    includeGreeting: true,
    includeClosing: true,
    useRAG: true
  });

  // Manual data form state
  const [manualDataForm, setManualDataForm] = useState({
    name: '',
    description: '',
    category: 'general',
    dataType: 'manual_entry',
    data: ''
  });

  useEffect(() => {
    if (user && isHydrated) {
      loadAutoReplies();
      // Removed: loadReplyData() - no longer using manual data
      loadAutoReplySettings();
    }
  }, [user, isHydrated]);

  // Auto-save settings when they change
  useEffect(() => {
    if (isHydrated && user) {
      const timeoutId = setTimeout(() => {
        saveAutoReplySettings();
      }, 1000); // Auto-save after 1 second of no changes

      return () => clearTimeout(timeoutId);
    }
  }, [autoReplyEnabled, autoReplySettings]);

  const loadAutoReplies = async () => {
    try {
      const response = await autoReplyApi.getAutoReplies();
      if (response.success && response.data) {
        setAutoReplies(response.data.autoReplies);
      }
    } catch (error) {
      console.error('Error loading auto-replies:', error);
    }
  };

  // Removed: loadReplyData() - no longer using manual data

  const loadAutoReplySettings = async () => {
    try {
      const response = await autoReplyApi.getAutoReplies();
      if (response.success && response.data) {
        const aiAutoReply = response.data.autoReplies.find(ar => ar.responseType === 'ai_generated');
        if (aiAutoReply) {
          setAutoReplyEnabled(aiAutoReply.isActive);
          if (aiAutoReply.aiSettings) {
            setAutoReplySettings({
              personality: aiAutoReply.aiSettings.personality || 'professional',
              includeGreeting: aiAutoReply.aiSettings.includeGreeting || true,
              includeClosing: aiAutoReply.aiSettings.includeClosing || true,
              useRAG: aiAutoReply.aiSettings.useRAG || true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading auto-reply settings:', error);
    } finally {
      setLoading(false); // Make sure to stop loading
    }
  };

  const toggleAutoReply = async (id: string) => {
    try {
      const response = await autoReplyApi.toggleAutoReply(id);
      if (response.success) {
        loadAutoReplies();
      }
    } catch (error) {
      console.error('Error toggling auto-reply:', error);
    }
  };

  const deleteAutoReply = async (id: string) => {
    if (!confirm('Are you sure you want to delete this auto-reply?')) return;
    
    try {
      const response = await autoReplyApi.deleteAutoReply(id);
      if (response.success) {
        loadAutoReplies();
      }
    } catch (error) {
      console.error('Error deleting auto-reply:', error);
    }
  };

  // Removed: deleteReplyData() - no longer using manual data

  // Removed: handleFileUpload() - no longer using manual data upload

  const saveAutoReplySettings = async () => {
    try {
      // Create a simple AI auto-reply rule
      const autoReplyData = {
        name: 'AI Auto-Reply',
        description: 'Intelligent AI-powered auto-reply',
        category: 'general',
        responseType: 'ai_generated',
        triggerKeywords: [], // No specific keywords - AI handles all messages
        responseTemplate: 'AI will generate response based on incoming message', // Placeholder for AI responses
        priority: 1,
        isActive: autoReplyEnabled,
        aiSettings: {
          useAI: true,
          personality: autoReplySettings.personality,
          includeGreeting: autoReplySettings.includeGreeting,
          includeClosing: autoReplySettings.includeClosing,
          useRAG: autoReplySettings.useRAG
        },
        statistics: {
          totalTriggers: 0,
          successfulReplies: 0,
          failedReplies: 0,
          lastTriggered: null
        }
      };

      // Update or create the AI auto-reply rule
      const response = await autoReplyApi.createAutoReply(autoReplyData);
      if (response.success) {
        console.log('AI Auto-reply settings saved successfully');
        loadAutoReplies();
      }
    } catch (error) {
      console.error('Error saving auto-reply settings:', error);
    }
  };

  // Removed: handleManualDataSubmit() - no longer using manual data entry

  if (!isHydrated || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('auto-replies')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'auto-replies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Auto-Replies
            </button>
            {/* Removed: Reply Data tab - use Knowledge Base instead for uploading PDFs */}
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Logs
            </button>
          </nav>
        </div>

        {/* Auto-Replies Tab */}
        {activeTab === 'auto-replies' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">AI Auto-Reply Settings</h2>
              
              {/* Simple Auto-Reply Toggle */}
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Enable AI Auto-Reply</h3>
                    <p className="text-gray-600 mt-1">
                      Automatically reply to incoming WhatsApp messages using AI
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoReplyEnabled}
                      onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                {autoReplyEnabled && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AI Personality
                        </label>
                        <select
                          value={autoReplySettings.personality}
                          onChange={(e) => setAutoReplySettings({...autoReplySettings, personality: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="casual">Casual</option>
                          <option value="formal">Formal</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={autoReplySettings.includeGreeting}
                            onChange={(e) => setAutoReplySettings({...autoReplySettings, includeGreeting: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Include Greeting</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={autoReplySettings.includeClosing}
                            onChange={(e) => setAutoReplySettings({...autoReplySettings, includeClosing: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Include Closing</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={autoReplySettings.useRAG}
                        onChange={(e) => setAutoReplySettings({...autoReplySettings, useRAG: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Use uploaded data for context (RAG)
                      </span>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• AI analyzes incoming messages and generates intelligent responses</li>
                        <li>• Uses uploaded PDFs from Knowledge Base for accurate answers</li>
                        <li>• Automatically adapts to different conversation types</li>
                        <li>• Upload your business PDFs in Knowledge Base page</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={saveAutoReplySettings}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Removed: Reply Data Tab - use Knowledge Base page instead */}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Auto-Reply Logs</h2>
            <div className="bg-white p-6 rounded-lg shadow border">
              <p className="text-gray-500">Logs will be displayed here once auto-replies are active.</p>
            </div>
          </div>
        )}

        {/* Removed: Manual Data Modal and Upload Excel Modal - use Knowledge Base page instead */}
    </div>
  );
};

// Main page component with dynamic import to prevent hydration issues
const AutoReplyPage: React.FC = () => {
  return (
    <DashboardLayout title="Auto-Reply System" subtitle="Manage intelligent auto-replies and data sources">
      <ClientOnly fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <AutoReplyContent />
      </ClientOnly>
    </DashboardLayout>
  );
};

// Export with dynamic import to prevent SSR hydration issues
export default dynamic(() => Promise.resolve(AutoReplyPage), {
  ssr: false,
  loading: () => (
    <DashboardLayout title="Auto-Reply System" subtitle="Loading...">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </DashboardLayout>
  )
});
