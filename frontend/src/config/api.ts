// API Configuration
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const AWS_S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET || 'socials-aws-1';
export const AWS_REGION = import.meta.env.REACT_APP_AWS_REGION || 'us-east-2';

// API endpoints
export const API_ENDPOINTS = {
  users: `${API_BASE}/users`,
  content: `${API_BASE}/content`,
  media: `${API_BASE}/media`,
  community: `${API_BASE}/community`,
  ai: `${API_BASE}/ai`,
  socialAuth: `${API_BASE}/api/v1/auth`,
  socialPosts: `${API_BASE}/api/v1/posts`,
} as const;

console.log('API Configuration:', {
  API_BASE,
  AWS_S3_BUCKET,
  AWS_REGION,
  environment: import.meta.env.MODE
});
