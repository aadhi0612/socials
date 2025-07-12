import { SocialPost, Platform, MediaAsset, Campaign, AISettings } from '../types';

export const mockPlatforms: Platform[] = [
  { id: '1', name: 'LinkedIn', connected: true, followers: 125000, icon: 'linkedin' },
  { id: '2', name: 'Twitter', connected: true, followers: 85000, icon: 'twitter' },
  { id: '3', name: 'Instagram', connected: true, followers: 62000, icon: 'instagram' },
  { id: '4', name: 'Facebook', connected: false, followers: 0, icon: 'facebook' },
];

export const mockPosts: SocialPost[] = [
  {
    id: '1',
    content: 'Excited to share our latest sustainability initiative! 🌱 Our commitment to building a better future includes reducing carbon emissions by 40% by 2025. #Sustainability #GreenTech #BetterFuture',
    platforms: [mockPlatforms[0], mockPlatforms[1]],
    status: 'published',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    media: [],
    campaign: 'Sustainability Initiative 2024',
    metrics: {
      likes: 1234,
      comments: 89,
      shares: 156,
      impressions: 45600,
      clicks: 2890,
      engagement: 3.2
    },
    createdBy: 'Sarah Johnson',
    aiGenerated: false
  },
  {
    id: '2',
    content: 'Join us at the Global Tech Summit 2024! 📊 Discover how digital transformation is reshaping business strategy and innovation. Early bird registration now open. #TechSummit #DigitalTransformation #Innovation2024',
    platforms: [mockPlatforms[0], mockPlatforms[2]],
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 4 * 60 * 60 * 1000),
    media: [{
      id: 'm1',
      name: 'tech-summit-banner.jpg',
      url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: 'image',
      size: 245760,
      dimensions: { width: 800, height: 600 },
      tags: ['event', 'tech', 'summit', 'innovation'],
      campaign: 'Tech Summit 2024',
      createdAt: new Date(),
      aiGenerated: false
    }],
    campaign: 'Tech Summit 2024',
    metrics: {
      likes: 0,
      comments: 0,
      shares: 0,
      impressions: 0,
      clicks: 0,
      engagement: 0
    },
    createdBy: 'AI Assistant',
    aiGenerated: true
  },
  {
    id: '3',
    content: 'Behind the scenes at our Innovation Lab! 🚀 Our teams are developing cutting-edge solutions in AI, blockchain, and quantum computing to serve our clients better. #Innovation #Technology #AI',
    platforms: [mockPlatforms[2]],
    status: 'draft',
    media: [],
    metrics: {
      likes: 0,
      comments: 0,
      shares: 0,
      impressions: 0,
      clicks: 0,
      engagement: 0
    },
    createdBy: 'Marketing Team',
    aiGenerated: false
  }
];

export const mockMediaAssets: MediaAsset[] = [
  {
    id: 'm1',
    name: 'tech-summit-banner.jpg',
    url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'image',
    size: 245760,
    dimensions: { width: 800, height: 600 },
    tags: ['event', 'tech', 'summit', 'innovation', 'professional'],
    campaign: 'Tech Summit 2024',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    aiGenerated: false
  },
  {
    id: 'm2',
    name: 'innovation-lab.mp4',
    url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'video',
    size: 15728640,
    dimensions: { width: 1920, height: 1080 },
    tags: ['innovation', 'technology', 'research', 'AI'],
    campaign: 'Innovation Showcase',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    aiGenerated: false
  },
  {
    id: 'm3',
    name: 'sustainability-infographic.jpg',
    url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'image',
    size: 178432,
    dimensions: { width: 1024, height: 768 },
    tags: ['sustainability', 'environment', 'green', 'climate'],
    campaign: 'Sustainability Initiative 2024',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    aiGenerated: true
  },
  {
    id: 'm4',
    name: 'team-collaboration.jpg',
    url: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800',
    type: 'image',
    size: 298736,
    dimensions: { width: 1200, height: 800 },
    tags: ['team', 'collaboration', 'workplace', 'diversity'],
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    aiGenerated: false
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Sustainability Initiative 2024',
    description: 'Promoting our commitment to environmental sustainability and carbon neutrality goals',
    startDate: new Date(2024, 9, 1),
    endDate: new Date(2024, 11, 31),
    status: 'active',
    goals: [
      { type: 'reach', target: 500000, current: 320000 },
      { type: 'engagement', target: 25000, current: 18200 },
      { type: 'leads', target: 1500, current: 987 }
    ],
    posts: ['1', '3'],
    assets: ['m3'],
    metrics: {
      totalReach: 320000,
      totalEngagement: 18200,
      totalLeads: 987,
      roi: 2.8
    }
  },
  {
    id: '2',
    name: 'Tech Summit 2024',
    description: 'Event promotion and thought leadership for our annual technology summit',
    startDate: new Date(2024, 10, 1),
    endDate: new Date(2024, 11, 15),
    status: 'active',
    goals: [
      { type: 'reach', target: 200000, current: 128000 },
      { type: 'engagement', target: 12000, current: 8500 },
      { type: 'conversions', target: 2000, current: 1250 }
    ],
    posts: ['2'],
    assets: ['m1'],
    metrics: {
      totalReach: 128000,
      totalEngagement: 8500,
      totalLeads: 1250,
      roi: 3.2
    }
  },
  {
    id: '3',
    name: 'Innovation Showcase',
    description: 'Highlighting our technological innovations and digital transformation capabilities',
    startDate: new Date(2024, 8, 15),
    endDate: new Date(2024, 10, 30),
    status: 'completed',
    goals: [
      { type: 'reach', target: 300000, current: 342000 },
      { type: 'engagement', target: 18000, current: 21500 }
    ],
    posts: [],
    assets: ['m2'],
    metrics: {
      totalReach: 342000,
      totalEngagement: 21500,
      totalLeads: 1850,
      roi: 4.1
    }
  }
];

export const defaultAISettings: AISettings = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000,
  autoMode: false,
  promptTemplates: [
    'Create an engaging LinkedIn post about our {topic} expertise',
    'Write a Twitter thread about our perspective on {topic}',
    'Generate an Instagram caption showcasing our {topic} work',
    'Create professional content about our {topic} services'
  ]
};