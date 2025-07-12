import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Heart, MessageCircle, Share, Filter, Search, ArrowLeft } from 'lucide-react';
import { communityApi, CommunityPost, PostsStats } from '../api/community';

interface CommunityPostsProps {
  onBack?: () => void;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({ onBack }) => {
  const [selectedCommunity, setSelectedCommunity] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'community' | 'all'>('community');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<PostsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsData, statsData] = await Promise.all([
          communityApi.getPosts({ limit: 50 }),
          communityApi.getPostsStats()
        ]);
        setPosts(postsData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const communities = stats?.communities || [];
  const platforms = ['linkedin', 'twitter', 'instagram'];

  const filteredPosts = posts.filter(post => {
    const matchesCommunity = selectedCommunity === 'all' || post.community === selectedCommunity;
    const matchesPlatform = selectedPlatform === 'all' || post.platform === selectedPlatform;
    const matchesSearch = searchTerm === '' || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.community.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCommunity && matchesPlatform && matchesSearch;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return '💼';
      case 'twitter':
        return '🐦';
      case 'instagram':
        return '📸';
      default:
        return '📱';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return 'bg-blue-600';
      case 'twitter':
        return 'bg-sky-500';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default:
        return 'bg-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPosts = stats?.total_posts || 0;
  const totalEngagement = stats?.total_engagement || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading community posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-6 py-3 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-yellow-400">Community Posts Dashboard</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Track all posts published by registered communities across social media platforms
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <h3 className="text-2xl font-bold text-yellow-400">{totalPosts}</h3>
            <p className="text-gray-300">Total Posts</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <h3 className="text-2xl font-bold text-blue-400">{stats?.total_communities || 0}</h3>
            <p className="text-gray-300">Communities</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <h3 className="text-2xl font-bold text-green-400">{stats?.total_platforms || 0}</h3>
            <p className="text-gray-300">Platforms</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <h3 className="text-2xl font-bold text-purple-400">{totalEngagement}</h3>
            <p className="text-gray-300">Total Engagement</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setActiveTab('community')}
              className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                activeTab === 'community'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Community Posts
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                activeTab === 'all'
                  ? 'bg-yellow-500 text-gray-900'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              All Posts
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            {/* Community Filter */}
            <select
              value={selectedCommunity}
              onChange={(e) => setSelectedCommunity(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Communities</option>
              {communities.map(community => (
                <option key={community} value={community}>{community}</option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Platforms</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedCommunity('all');
                setSelectedPlatform('all');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-yellow-400 mb-1">{post.community}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getPlatformColor(post.platform)}`}>
                      {getPlatformIcon(post.platform)} {post.platform}
                    </span>
                    <span className="text-xs text-gray-400">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      {formatDate(post.published_at)}
                    </span>
                  </div>
                </div>
                <a
                  href={post.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              {/* Image */}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post content"
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              {/* Content */}
              <p className="text-gray-300 mb-4 line-clamp-3">{post.content}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Engagement */}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.engagement.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.engagement.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share className="w-4 h-4" />
                    {post.engagement.shares}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No posts found matching your criteria.</p>
          </div>
        )}

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8 py-3 rounded-lg transition-colors">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityPosts;
