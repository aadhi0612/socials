export interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatar?: string;
  lastActive?: Date;
  profile_pic_url?: string;
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
  name: 'LinkedIn' | 'Instagram' | 'Twitter' | 'Facebook' ;
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

export interface MediaOut {
  id: string;
  user_id: string;
  url: string;
  type: string;
  name?: string;
  description?: string;  // For storing AI prompts or descriptions
  prompt?: string;  // Specifically for AI-generated content prompts
  ai_generated?: boolean;
  created_at?: string;
  tags?: string[];
}

export interface MediaCreate {
  url: string;
  type: string;
  name?: string;
  description?: string;  // For storing AI prompts or descriptions
  prompt?: string;  // Specifically for AI-generated content prompts
  ai_generated?: boolean;
  tags?: string[];
}