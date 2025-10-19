export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsappConnected: boolean;
  createdAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  contactId: string;
  contact: Contact;
  originalMessage: string;
  aiRewrittenMessage: string;
  category: MessageCategory;
  status: MessageStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
}

export interface BulkMessage {
  id: string;
  originalMessage: string;
  aiRewrittenMessage: string;
  category: MessageCategory;
  selectedContacts: string[];
  totalContacts: number;
  status: BulkMessageStatus;
  progress: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  };
  spamWords: string[];
  replacements: Array<{
    original: string;
    replacement: string;
    reason: string;
  }>;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export type MessageCategory = 
  | 'promotional' 
  | 'notification' 
  | 'advertising' 
  | 'discount_offer' 
  | 'information' 
  | 'other';

export type MessageStatus = 
  | 'pending' 
  | 'processing' 
  | 'sent' 
  | 'failed' 
  | 'delivered' 
  | 'read';

export type BulkMessageStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface SpamAnalysis {
  originalMessage: string;
  isSpam: boolean;
  spamWords: string[];
  replacements?: Array<{
    original: string;
    replacement: string;
    reason: string;
  }>;
  rewrittenMessage: string;
  confidence: number;
  complianceScore?: number;
  riskLevel?: string;
  spamScore?: number;
}

export interface WhatsAppConnection {
  isConnected: boolean;
  state: string;
  qr?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContactsResponse {
  contacts: Contact[];
  pagination: PaginationInfo;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationInfo;
}

export interface Statistics {
  period: string;
  messageStats: Array<{
    _id: MessageStatus;
    count: number;
  }>;
  bulkMessageStats: Array<{
    _id: BulkMessageStatus;
    count: number;
  }>;
  totalContacts: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
}

export interface BulkMessageFormData {
  message: string;
  category: MessageCategory;
  selectedContacts: string[];
}

export interface UserSettings {
  messageDelay?: number;
  emailDelay?: number;
  maxRetries?: number;
  aiEnabled?: boolean;
  autoRetry?: boolean;
  [key: string]: any;
}
