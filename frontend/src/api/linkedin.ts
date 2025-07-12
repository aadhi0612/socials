import { API_BASE } from './users';

export interface LinkedInProfile {
  id: string;
  firstName: { localized: { en_US: string } };
  lastName: { localized: { en_US: string } };
  email?: string;
}

export interface LinkedInPage {
  id: string;
  name: string;
  type: string;
  logo_url?: string;
}

export interface LinkedInAuthData {
  linkedin_user_id: string;
  linkedin_name: string;
  linkedin_email: string;
  access_token: string;
  token_expires_in: number;
  pages: LinkedInPage[];
}

export interface PostToLinkedInRequest {
  access_token: string;
  content_text: string;
  media_urls?: string[];
  target_urn?: string; // For posting to pages
  user_id?: string;
}

export interface PostToLinkedInResponse {
  success: boolean;
  message?: string;
  platform_post_id?: string;
  posted_at?: string;
  error?: string;
}

// Start LinkedIn OAuth flow
export async function startLinkedInOAuth(userId: string, redirectAfterAuth?: string): Promise<{ oauth_url: string; state: string }> {
  const params = new URLSearchParams({
    user_id: userId,
    redirect_after_auth: redirectAfterAuth || window.location.origin
  });
  
  const response = await fetch(`${API_BASE}/oauth-posts/auth/linkedin?${params}`);
  if (!response.ok) {
    throw new Error('Failed to start LinkedIn OAuth');
  }
  
  return response.json();
}

// Get LinkedIn profile
export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile> {
  const response = await fetch(`${API_BASE}/oauth-posts/linkedin/profile?access_token=${accessToken}`);
  if (!response.ok) {
    throw new Error('Failed to get LinkedIn profile');
  }
  
  const data = await response.json();
  return data.profile;
}

// Get LinkedIn pages
export async function getLinkedInPages(accessToken: string): Promise<LinkedInPage[]> {
  const response = await fetch(`${API_BASE}/oauth-posts/linkedin/pages?access_token=${accessToken}`);
  if (!response.ok) {
    throw new Error('Failed to get LinkedIn pages');
  }
  
  const data = await response.json();
  return data.pages;
}

// Post to LinkedIn
export async function postToLinkedIn(request: PostToLinkedInRequest): Promise<PostToLinkedInResponse> {
  const response = await fetch(`${API_BASE}/oauth-posts/linkedin/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    throw new Error('Failed to post to LinkedIn');
  }
  
  return response.json();
}

// Validate LinkedIn token
export async function validateLinkedInToken(accessToken: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/oauth-posts/linkedin/validate-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ access_token: accessToken })
  });
  
  if (!response.ok) {
    return false;
  }
  
  const data = await response.json();
  return data.valid;
}

// Helper function to parse LinkedIn auth data from URL
export function parseLinkedInAuthFromURL(): LinkedInAuthData | null {
  const urlParams = new URLSearchParams(window.location.search);
  const linkedinAuth = urlParams.get('linkedin_auth');
  const userData = urlParams.get('user_data');
  
  if (linkedinAuth === 'success' && userData) {
    try {
      return JSON.parse(decodeURIComponent(userData));
    } catch (error) {
      console.error('Error parsing LinkedIn auth data:', error);
      return null;
    }
  }
  
  return null;
}

// Helper function to clean URL after OAuth
export function cleanOAuthURL() {
  const url = new URL(window.location.href);
  url.searchParams.delete('linkedin_auth');
  url.searchParams.delete('user_data');
  url.searchParams.delete('error');
  url.searchParams.delete('message');
  window.history.replaceState({}, document.title, url.toString());
}
