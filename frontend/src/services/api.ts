import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  settings: any;
}

interface Document {
  id: string;
  title: string;
  originalName: string;
  status: string;
  createdAt: string;
  aiAnalysis?: any;
}

interface AIAnalysis {
  id: string;
  documentType: string;
  confidence: number;
  summary: string;
  recommendations: any[];
  complianceScore: number;
  estimatedCompletionTime: number;
}

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public removeAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Generic request method
  private async request<T>(method: string, url: string, data?: any): Promise<T> {
    const response: AxiosResponse<APIResponse<T>> = await this.client.request({
      method,
      url,
      data,
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'API request failed');
    }
    
    return response.data.data as T;
  }

  // Authentication API
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return this.request('POST', '/auth/login', { email, password });
  }

  async register(email: string, name: string, password: string, role = 'individual'): Promise<{ user: User; token: string }> {
    return this.request('POST', '/auth/register', { email, name, password, role });
  }

  async logout(): Promise<void> {
    return this.request('POST', '/auth/logout');
  }

  async getProfile(): Promise<{ user: User }> {
    return this.request('GET', '/user/profile');
  }

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return this.request('PUT', '/user/profile', updates);
  }

  // Document API
  async uploadDocument(file: File, metadata: any = {}): Promise<{ document: Document; aiAnalysis: AIAnalysis }> {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await this.client.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed');
    }

    return response.data.data;
  }

  async getDocument(id: string): Promise<Document> {
    return this.request('GET', `/documents/${id}`);
  }

  async getDocuments(params: any = {}): Promise<Document[]> {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/documents?${queryString}`);
  }

  async sendDocumentForSigning(documentId: string, data: any): Promise<any> {
    return this.request('POST', `/documents/${documentId}/send`, data);
  }

  async deleteDocument(id: string): Promise<void> {
    return this.request('DELETE', `/documents/${id}`);
  }

  // Signing API
  async getSigningSession(token: string): Promise<any> {
    return this.request('GET', `/sign/${token}`);
  }

  async signDocument(token: string, signatureData: any): Promise<any> {
    return this.request('POST', `/sign/${token}`, signatureData);
  }

  async declineDocument(token: string, reason: string): Promise<any> {
    return this.request('POST', `/sign/${token}/decline`, { reason });
  }

  // AI API
  async chatWithAI(message: string, context: any = {}): Promise<any> {
    return this.request('POST', '/ai/chat', { message, context });
  }

  async optimizeWorkflow(documentId: string, parties: any[]): Promise<any> {
    return this.request('POST', '/ai/optimize-workflow', { documentId, parties });
  }

  async analyzeDocument(documentId: string): Promise<AIAnalysis> {
    return this.request('POST', `/documents/${documentId}/analyze`);
  }

  // Workflow API
  async getWorkflowStatus(workflowId: string): Promise<any> {
    return this.request('GET', `/workflows/${workflowId}/status`);
  }

  async getWorkflows(params: any = {}): Promise<any[]> {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/workflows?${queryString}`);
  }

  async sendReminder(workflowId: string, partyId: string): Promise<void> {
    return this.request('POST', `/workflows/${workflowId}/remind`, { partyId });
  }

  async cancelWorkflow(workflowId: string, reason: string): Promise<void> {
    return this.request('POST', `/workflows/${workflowId}/cancel`, { reason });
  }

  // Analytics API
  async getAnalytics(timeRange: string = '30d'): Promise<any> {
    return this.request('GET', `/analytics?timeRange=${timeRange}`);
  }

  async getDocumentMetrics(): Promise<any> {
    return this.request('GET', '/analytics/documents');
  }

  async getComplianceMetrics(): Promise<any> {
    return this.request('GET', '/analytics/compliance');
  }

  // Admin API
  async getSystemMetrics(): Promise<any> {
    return this.request('GET', '/admin/metrics');
  }

  async getAuditLogs(params: any = {}): Promise<any[]> {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/admin/audit-logs?${queryString}`);
  }

  async getUsers(params: any = {}): Promise<User[]> {
    const queryString = new URLSearchParams(params).toString();
    return this.request('GET', `/admin/users?${queryString}`);
  }

  // Health check
  async getHealthStatus(): Promise<any> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Create API client instance
const apiClient = new APIClient();

// Export specific API modules
export const authAPI = {
  login: apiClient.login.bind(apiClient),
  register: apiClient.register.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  getProfile: apiClient.getProfile.bind(apiClient),
  updateProfile: apiClient.updateProfile.bind(apiClient),
  setAuthToken: apiClient.setAuthToken.bind(apiClient),
  removeAuthToken: apiClient.removeAuthToken.bind(apiClient),
};

export const documentsAPI = {
  upload: apiClient.uploadDocument.bind(apiClient),
  get: apiClient.getDocument.bind(apiClient),
  list: apiClient.getDocuments.bind(apiClient),
  sendForSigning: apiClient.sendDocumentForSigning.bind(apiClient),
  delete: apiClient.deleteDocument.bind(apiClient),
  analyze: apiClient.analyzeDocument.bind(apiClient),
};

export const signingAPI = {
  getSession: apiClient.getSigningSession.bind(apiClient),
  sign: apiClient.signDocument.bind(apiClient),
  decline: apiClient.declineDocument.bind(apiClient),
};

export const aiAPI = {
  chat: apiClient.chatWithAI.bind(apiClient),
  optimizeWorkflow: apiClient.optimizeWorkflow.bind(apiClient),
};

export const workflowsAPI = {
  getStatus: apiClient.getWorkflowStatus.bind(apiClient),
  list: apiClient.getWorkflows.bind(apiClient),
  sendReminder: apiClient.sendReminder.bind(apiClient),
  cancel: apiClient.cancelWorkflow.bind(apiClient),
};

export const analyticsAPI = {
  getAnalytics: apiClient.getAnalytics.bind(apiClient),
  getDocumentMetrics: apiClient.getDocumentMetrics.bind(apiClient),
  getComplianceMetrics: apiClient.getComplianceMetrics.bind(apiClient),
};

export const adminAPI = {
  getSystemMetrics: apiClient.getSystemMetrics.bind(apiClient),
  getAuditLogs: apiClient.getAuditLogs.bind(apiClient),
  getUsers: apiClient.getUsers.bind(apiClient),
};

export const healthAPI = {
  getStatus: apiClient.getHealthStatus.bind(apiClient),
};

// Export default client
export default apiClient;