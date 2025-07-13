const API_BASE_URL = 'https://50c83fay16.execute-api.us-east-2.amazonaws.com/prod';

export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
}

export interface CommunityPost {
  id: number;
  community: string;
  platform: 'linkedin' | 'twitter' | 'instagram';
  content: string;
  image_url?: string;
  post_url: string;
  published_at: string;
  engagement: PostEngagement;
  tags: string[];
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  max_attendees: number;
  registration_url: string;
  tags: string[];
}

export interface PostsStats {
  total_posts: number;
  total_communities: number;
  total_platforms: number;
  total_engagement: number;
  communities: string[];
  platforms: string[];
}

export interface CommunityStats {
  name: string;
  total_posts: number;
  total_engagement: number;
  platforms: string[];
}

export const communityApi = {
  // Get community posts with optional filtering
  async getPosts(params?: {
    community?: string;
    platform?: string;
    limit?: number;
    offset?: number;
  }): Promise<CommunityPost[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.community) queryParams.append('community', params.community);
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/community/posts?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get posts statistics
  async getPostsStats(): Promise<PostsStats> {
    const response = await fetch(`${API_BASE_URL}/community/posts/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts stats: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get upcoming events
  async getEvents(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${API_BASE_URL}/community/events?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get communities with stats
  async getCommunities(): Promise<CommunityStats[]> {
    const response = await fetch(`${API_BASE_URL}/community/communities`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch communities: ${response.statusText}`);
    }
    
    return response.json();
  }
};
