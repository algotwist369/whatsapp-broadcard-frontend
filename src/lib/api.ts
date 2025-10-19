import axios, { AxiosResponse } from 'axios';
import {
  ApiResponse,
  User,
  Contact,
  ContactsResponse,
  MessagesResponse,
  BulkMessage,
  SpamAnalysis,
  WhatsAppConnection,
  Statistics,
  ContactFormData,
  BulkMessageFormData
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
console.log("API_BASE_URL", API_BASE_URL);

// Request cache and deduplication
const requestCache = new Map<string, Promise<any>>();
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache helper functions
const getCacheKey = (url: string, params?: any) => {
  return `${url}${params ? JSON.stringify(params) : ''}`;
};

const getFromCache = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key: string, data: any, ttl: number = 300000) => { // 5 minutes default
  cache.set(key, { data, timestamp: Date.now(), ttl });
};

// Request deduplication
const deduplicateRequest = <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  if (requestCache.has(key)) {
    return requestCache.get(key)!;
  }
  
  const promise = requestFn().finally(() => {
    requestCache.delete(key);
  });
  
  requestCache.set(key, promise);
  return promise;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData: {
    name?: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// WhatsApp API
export const whatsappApi = {
  connect: async (): Promise<ApiResponse<{ qr?: string; isConnected: boolean }>> => {
    return deduplicateRequest('whatsapp-connect', async () => {
      const response = await api.post('/whatsapp/connect', {}, {
        timeout: 500, // 0.5 seconds for initial connection attempt
      });
      return response.data;
    });
  },

  getStatus: async (): Promise<ApiResponse<WhatsAppConnection>> => {
    const cacheKey = getCacheKey('/whatsapp/status');
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    return deduplicateRequest('whatsapp-status', async () => {
      const response = await api.get('/whatsapp/status');
      const data = response.data;
      setCache(cacheKey, data, 30000); // Cache for 30 seconds
      return data;
    });
  },

  getQR: async (): Promise<ApiResponse<{ qr: string; isConnected: boolean }>> => {
    return deduplicateRequest('whatsapp-qr', async () => {
      const response = await api.get('/whatsapp/qr');
      return response.data;
    });
  },

  disconnect: async (): Promise<ApiResponse> => {
    return deduplicateRequest('whatsapp-disconnect', async () => {
      const response = await api.post('/whatsapp/disconnect');
      // Clear cache after disconnect
      cache.delete(getCacheKey('/whatsapp/status'));
      return response.data;
    });
  },

  sendTestMessage: async (data: {
    phoneNumber: string;
    message: string;
  }): Promise<ApiResponse<{ messageId: string }>> => {
    const response = await api.post('/whatsapp/test-message', data);
    return response.data;
  },
};

// Contacts API
export const contactsApi = {
  getContacts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
  }): Promise<ApiResponse<ContactsResponse>> => {
    const cacheKey = getCacheKey('/contacts', params);
    const cached = getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    return deduplicateRequest(`contacts-${cacheKey}`, async () => {
      const response = await api.get('/contacts', { params });
      const data = response.data;
      setCache(cacheKey, data, 60000); // Cache for 1 minute
      return data;
    });
  },

  addContact: async (contactData: ContactFormData): Promise<ApiResponse<{ contact: Contact }>> => {
    const response = await api.post('/contacts', contactData);
    // Clear contacts cache
    cache.forEach((_, key) => {
      if (key.includes('/contacts')) {
        cache.delete(key);
      }
    });
    return response.data;
  },

  updateContact: async (id: string, contactData: ContactFormData): Promise<ApiResponse<{ contact: Contact }>> => {
    const response = await api.put(`/contacts/${id}`, contactData);
    // Clear contacts cache
    cache.forEach((_, key) => {
      if (key.includes('/contacts')) {
        cache.delete(key);
      }
    });
    return response.data;
  },

  deleteContact: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/contacts/${id}`);
    // Clear contacts cache
    cache.forEach((_, key) => {
      if (key.includes('/contacts')) {
        cache.delete(key);
      }
    });
    return response.data;
  },

  uploadContacts: async (file: File): Promise<ApiResponse<{
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    contacts: Contact[];
    errors: Array<{ row: number; error: string }>;
  }>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/contacts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Clear contacts cache
    cache.forEach((_, key) => {
      if (key.includes('/contacts')) {
        cache.delete(key);
      }
    });
    return response.data;
  },
};

// Cache utility functions
export const cacheUtils = {
  clearCache: (pattern?: string) => {
    if (pattern) {
      cache.forEach((_, key) => {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      });
    } else {
      cache.clear();
    }
  },
  
  clearRequestCache: () => {
    requestCache.clear();
  },
  
  getCacheStats: () => ({
    cacheSize: cache.size,
    requestCacheSize: requestCache.size,
  }),
};

// Messages API
export const messagesApi = {
  analyzeMessage: async (data: {
    message: string;
    category: string;
  }): Promise<ApiResponse<SpamAnalysis>> => {
    const response = await api.post('/messages/analyze', data);
    return response.data;
  },

  sendBulkMessage: async (data: BulkMessageFormData): Promise<ApiResponse<{
    bulkMessageId: string;
    totalContacts: number;
    status: string;
    analysis: {
      isSpam: boolean;
      spamWords: string[];
      replacements: Array<{ original: string; replacement: string; reason: string }>;
    };
  }>> => {
    const response = await api.post('/messages/send-bulk', data);
    return response.data;
  },

  getBulkMessageStatus: async (id: string): Promise<ApiResponse<{ bulkMessage: BulkMessage }>> => {
    const response = await api.get(`/messages/bulk/${id}/status`);
    return response.data;
  },

  getBulkMessages: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ bulkMessages: BulkMessage[]; total: number }>> => {
    const response = await api.get('/messages/bulk', { params });
    return response.data;
  },

  getBulkMessageDetails: async (id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    messages: Array<{
      id: string;
      contact: Contact;
      status: string;
      sentAt?: string;
      deliveredAt?: string;
      readAt?: string;
      errorMessage?: string;
      retryCount: number;
    }>;
    pagination: any;
  }>> => {
    const response = await api.get(`/messages/bulk/${id}/details`, { params });
    return response.data;
  },

  getMessageHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<MessagesResponse>> => {
    const response = await api.get('/messages/history', { params });
    return response.data;
  },

  getStatistics: async (period?: string): Promise<ApiResponse<Statistics>> => {
    const response = await api.get('/messages/statistics', {
      params: period ? { period } : {}
    });
    return response.data;
  },
};

// Settings API
export const settingsApi = {
  getSettings: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (settings: any): Promise<ApiResponse<any>> => {
    const response = await api.put('/settings', settings);
    return response.data;
  },

  resetSettings: async (): Promise<ApiResponse<any>> => {
    const response = await api.post('/settings/reset');
    return response.data;
  },
};

// Auto-Reply API
export const autoReplyApi = {
  getAutoReplies: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{ autoReplies: any[]; total: number }>> => {
    const response = await api.get('/auto-reply', { params });
    return response.data;
  },

  createAutoReply: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/auto-reply', data);
    return response.data;
  },

  updateAutoReply: async (id: string, data: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/auto-reply/${id}`, data);
    return response.data;
  },

  deleteAutoReply: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/auto-reply/${id}`);
    return response.data;
  },

  toggleAutoReply: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/auto-reply/${id}/toggle`);
    return response.data;
  },

  testAutoReply: async (data: {
    phoneNumber: string;
    message: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/auto-reply/test', data);
    return response.data;
  },

  getAutoReplyLogs: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    autoReplyId?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.get('/auto-reply/logs', { params });
    return response.data;
  },

  getAutoReplyStatistics: async (period?: string): Promise<ApiResponse<any>> => {
    const response = await api.get('/auto-reply/statistics', {
      params: period ? { period } : {}
    });
    return response.data;
  },

  getReplyData: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    dataType?: string;
  }): Promise<ApiResponse<{ replyData: any[]; total: number }>> => {
    const response = await api.get('/auto-reply/data', { params });
    return response.data;
  },

  createReplyData: async (data: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/auto-reply/data', data);
    return response.data;
  },

  uploadReplyData: async (file: File, data: {
    name: string;
    category: string;
  }): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', data.name);
    formData.append('category', data.category);

    const response = await api.post('/auto-reply/data/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  testReplyData: async (id: string, message: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/auto-reply/data/${id}/test`, { message });
    return response.data;
  },

  deleteReplyData: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/auto-reply/data/${id}`);
    return response.data;
  },
};

export default api;
