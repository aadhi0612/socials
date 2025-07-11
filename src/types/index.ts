export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatar?: string;
  lastActive?: Date;
}

export interface SocialPost {
  id: string;
  content: string;
  platforms: Platform[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledFor?: Date;
  publishedAt?: Date;
  media: MediaAsset[];
  campaign?: string;
  metrics: PostMetrics;
  createdBy: string;
  aiGenerated: boolean;
}

export interface Platform {
  id: string;
  name: 'LinkedIn' | 'Instagram' | 'Twitter' | 'Facebook' | 'TikTok';
  connected: boolean;
  followers: number;
  icon: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'gif';
  size: number;
  dimensions: { width: number; height: number };
  tags: string[];
  campaign?: string;
  createdAt: Date;
  aiGenerated: boolean;
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  clicks: number;
  engagement: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused';
  goals: CampaignGoal[];
  posts: string[];
  assets: string[];
  metrics: CampaignMetrics;
}

export interface CampaignGoal {
  type: 'reach' | 'engagement' | 'leads' | 'conversions';
  target: number;
  current: number;
}

export interface CampaignMetrics {
  totalReach: number;
  totalEngagement: number;
  totalLeads: number;
  roi: number;
}

export interface AISettings {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3';
  temperature: number;
  maxTokens: number;
  autoMode: boolean;
  promptTemplates: string[];
}

export type Theme = 'light' | 'dark';

export interface ContentCreate {
  title: string;
  body: string;
  author_id: string;
  media?: string[];
  status?: string;
  platforms?: string[];
  scheduled_for?: string;
}

export interface ContentUpdate {
  title?: string;
  body?: string;
  media?: string[];
  status?: string;
  platforms?: string[];
  scheduled_for?: string;
}

export interface ContentOut {
  id: string;
  title: string;
  body: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  media?: string[];
  status?: string;
  platforms?: string[];
  scheduled_for?: string;
}

// Dashboard-specific type for posts grouped by community and platform
export interface DashboardPost {
  id: string;
  community: string;
  platforms: {
    linkedin?: { images: string[]; caption: string };
    twitter?: { images: string[]; caption: string };
    instagram?: { images: string[]; caption: string };
  };
}