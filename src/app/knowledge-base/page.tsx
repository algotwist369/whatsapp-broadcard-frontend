'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import axios from 'axios';

interface KnowledgeBase {
  _id: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  description?: string;
  totalPages?: number;
  totalChunks: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processingError?: string;
  isActive: boolean;
  statistics: {
    queriesAnswered: number;
    lastUsed?: string;
    successRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeSummary {
  totalDocuments: number;
  totalChunks: number;
  categories: string[];
  lastUpdated?: string;
}

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [summary, setSummary] = useState<KnowledgeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('business_details');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchKnowledgeBases();
  }, [isAuthenticated]);

  const fetchKnowledgeBases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = ('http://localhost:5000') + '/api' || process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.get(
        `${API_URL}/knowledge-base`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setKnowledgeBases(response.data.data.knowledgeBases);
        setSummary(response.data.data.summary);
      }
    } catch (error: any) {
      console.error('Error fetching knowledge bases:', error);
      toast.error('Failed to load knowledge bases');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and TXT files are allowed');
        return;
      }

      // Validate file size (50 MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 50 MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      if (description) {
        formData.append('description', description);
      }

      const API_URL = ('http://localhost:5000') + '/api' || process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${API_URL}/knowledge-base/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('File uploaded! Processing in background...');
        setSelectedFile(null);
        setDescription('');
        
        // Refresh list after a delay to show processing status
        setTimeout(() => {
          fetchKnowledgeBases();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const API_URL = ('http://localhost:5000') + '/api' || process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.delete(
        `${API_URL}/knowledge-base/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success('Knowledge base deleted successfully');
        fetchKnowledgeBases();
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete knowledge base');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const API_URL = ('http://localhost:5000') + '/api' || process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.put(
        `${API_URL}/knowledge-base/${id}/activate`,
        { isActive: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(`Knowledge base ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchKnowledgeBases();
      }
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast.error('Failed to update knowledge base');
    }
  };

  const handleTestQuery = async () => {
    if (!testQuery.trim()) {
      toast.error('Please enter a test query');
      return;
    }

    try {
      setTesting(true);
      const API_URL = ('http://localhost:5000') + '/api' || process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${API_URL}/knowledge-base/test-answer`,
        {
          query: testQuery,
          customerName: 'Test Customer'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTestResult(response.data.data);
        toast.success('Answer generated from your PDFs!');
      }
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error('Failed to generate answer');
    } finally {
      setTesting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getCategoryBadgeColor = (category: string): string => {
    const colors: Record<string, string> = {
      business_details: 'bg-blue-100 text-blue-800',
      services: 'bg-green-100 text-green-800',
      pricing: 'bg-purple-100 text-purple-800',
      faq: 'bg-yellow-100 text-yellow-800',
      policies: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>;
      case 'processing':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Processing...</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload your business PDFs and AI will answer customer questions from your data
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <DocumentIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalDocuments}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Knowledge Chunks</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalChunks}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.categories.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Upload PDF
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File (PDF or TXT)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.txt"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF or TXT up to 50MB</p>
                    </div>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: <span className="font-medium">{selectedFile.name}</span> ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="business_details">Business Details</option>
                    <option value="services">Services</option>
                    <option value="pricing">Pricing</option>
                    <option value="faq">FAQ / Q&A</option>
                    <option value="policies">Policies</option>
                    <option value="general">General</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this document..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full btn btn-primary"
                >
                  {uploading ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                      Upload PDF
                    </>
                  )}
                </button>
              </div>

              {/* Info Box */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-2">📚 What to Upload:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Business details & information</li>
                  <li>• Service descriptions</li>
                  <li>• Price lists & packages</li>
                  <li>• FAQ & common questions</li>
                  <li>• Policies & terms</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Section */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Test AI Answer
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ask a Question
                  </label>
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="e.g., What are your prices for Thai massage?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleTestQuery}
                  disabled={!testQuery.trim() || testing}
                  className="w-full btn btn-secondary"
                >
                  {testing ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                      Test Query
                    </>
                  )}
                </button>

                {testResult && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-2">AI Response:</p>
                    <p className="text-sm text-green-800">{testResult.answer}</p>
                    {testResult.sources && testResult.sources.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-green-700">
                          Sources: {testResult.sources.join(', ')}
                        </p>
                        <p className="text-xs text-green-700">
                          Confidence: {(testResult.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Uploaded Documents ({knowledgeBases.length})
              </h3>
              <button
                onClick={fetchKnowledgeBases}
                className="btn btn-sm btn-outline"
              >
                <ArrowPathIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Loading knowledge bases...</p>
                </div>
              ) : knowledgeBases.length === 0 ? (
                <div className="p-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2">No documents uploaded yet</p>
                  <p className="text-xs text-gray-500">
                    Upload your business PDFs to enable AI-powered auto-replies
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {knowledgeBases.map((kb) => (
                        <tr key={kb._id} className={!kb.isActive ? 'bg-gray-50 opacity-60' : ''}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {kb.originalFileName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatFileSize(kb.fileSize)} • {kb.totalChunks} chunks
                                  {kb.totalPages && ` • ${kb.totalPages} pages`}
                                </div>
                                {kb.description && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {kb.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadgeColor(kb.category)}`}>
                              {kb.category.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(kb.processingStatus)}
                            {kb.processingError && (
                              <p className="text-xs text-red-600 mt-1">{kb.processingError}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {kb.statistics.queriesAnswered} queries
                            </div>
                            {kb.statistics.lastUsed && (
                              <div className="text-xs text-gray-500">
                                Last used: {new Date(kb.statistics.lastUsed).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleToggleActive(kb._id, kb.isActive)}
                              className={`mr-3 ${kb.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                              title={kb.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {kb.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(kb._id, kb.originalFileName)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">How It Works</h3>
            </div>
            <div className="card-body">
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                  <div>
                    <strong>Upload PDFs:</strong> Business details, price lists, Q&A documents
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                  <div>
                    <strong>AI Reads & Learns:</strong> System processes and understands your PDFs
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                  <div>
                    <strong>Customer Asks:</strong> Questions via WhatsApp auto-reply
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
                  <div>
                    <strong>AI Answers:</strong> Professional responses from YOUR data
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">5</span>
                  <div>
                    <strong>AI Convinces:</strong> Sales-focused responses to increase bookings
                  </div>
                </li>
              </ol>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  💡 <strong>Tip:</strong> Upload your actual business PDFs for best results. The AI will answer from YOUR data and try to convince customers to book!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

