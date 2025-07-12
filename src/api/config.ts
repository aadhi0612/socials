/**
 * API Configuration for Frontend
 * Centralized API configuration with environment-specific settings
 */
import awsConfig from '../config/aws';

export const API_CONFIG = {
  baseURL: awsConfig.apiUrl,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/users/login',
    register: '/users/register',
    me: '/users/me',
  },
  
  // Content management
  content: {
    list: '/content/',
    create: '/content/',
    update: (id: string) => `/content/${id}`,
    delete: (id: string) => `/content/${id}`,
  },
  
  // Media management
  media: {
    list: '/media/',
    create: '/media/',
    delete: (id: string) => `/media/${id}`,
    presignUpload: '/content/media/presign-upload',
  },
  
  // AI services
  ai: {
    generateText: '/ai/generate-text',
    generateImage: '/ai/generate-image',
  },
  
  // Social media posting
  social: {
    directPost: '/api/v1/direct-posts/immediate',
    testCredentials: '/api/v1/direct-posts/test-credentials',
    oauthConnect: (platform: string) => `/api/v1/oauth-posts/auth/${platform}/connect`,
    oauthPost: '/api/v1/oauth-posts/immediate',
    accounts: (userId: number) => `/api/v1/oauth-posts/accounts/${userId}`,
  },
};

// Create API client with proper error handling
export const createApiClient = () => {
  const client = {
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
      const url = `${API_CONFIG.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...API_CONFIG.headers,
          ...options.headers,
        },
      };
      
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`API request failed: ${endpoint}`, error);
        throw error;
      }
    },
    
    get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
      return this.request<T>(endpoint, { method: 'GET', headers });
    },
    
    post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        headers,
      });
    },
    
    put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        headers,
      });
    },
    
    delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
      return this.request<T>(endpoint, { method: 'DELETE', headers });
    },
  };
  
  return client;
};

export const apiClient = createApiClient();
