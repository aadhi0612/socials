import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Calendar,
  Zap,
  Bot,
  User,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import Button from '../components/UI/Button';
import MetricCard from '../components/UI/MetricCard';
import { mockPosts, mockPlatforms } from '../data/mockData';
import { format } from 'date-fns';
import { listContent } from '../api/content';
import { ContentOut } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [aiMode, setAiMode] = useState(false);
  const [content, setContent] = useState<ContentOut[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentError, setContentError] = useState<string | null>(null);

  const totalEngagement = mockPosts.reduce((sum, post) => sum + post.metrics.engagement, 0);
  const totalImpressions = mockPosts.reduce((sum, post) => sum + post.metrics.impressions, 0);
  const totalFollowers = mockPlatforms.filter(p => p.connected).reduce((sum, p) => sum + p.followers, 0);

  React.useEffect(() => {
    if (!user?.user_id) return;
    setLoadingContent(true);
    listContent(user.user_id)
      .then(setContent)
      .catch(err => setContentError(err.message || 'Failed to load content'))
      .finally(() => setLoadingContent(false));
  }, [user?.user_id]);

  const recentPosts = content.slice(0, 3);
  const scheduledPosts = mockPosts.filter(post => post.status === 'scheduled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your social media overview.
          </p>
        </div>
        
        {/* AI Mode Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Manual
            </span>
            <button
              onClick={() => setAiMode(!aiMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                aiMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Agent
            </span>
          </div>
          {aiMode && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                AI Mode Active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Engagement"
          value={totalEngagement.toFixed(1) + '%'}
          change={12.5}
          icon={<Heart className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Total Impressions"
          value={totalImpressions.toLocaleString()}
          change={8.2}
          icon={<Eye className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Followers"
          value={totalFollowers.toLocaleString()}
          change={3.7}
          icon={<Users className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Conversion Rate"
          value="4.2%"
          change={-1.2}
          icon={<Target className="w-6 h-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Posts
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            
            {loadingContent ? (
              <div>Loading content...</div>
            ) : contentError ? (
              <div className="text-red-600">{contentError}</div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant={post.status === 'published' ? 'success' : post.status === 'scheduled' ? 'warning' : 'default'}>
                          {post.status}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{post.title}</h3>
                    <p className="text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {post.body}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>By: {post.author_id}</span>
                      <span>{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Platform Status */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connected Platforms
            </h3>
            <div className="space-y-3">
              {mockPlatforms.map((platform) => (
                <div key={platform.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      platform.connected 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}>
                      <span className="text-sm font-semibold">
                        {platform.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {platform.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {platform.connected 
                          ? `${platform.followers.toLocaleString()} followers`
                          : 'Not connected'
                        }
                      </p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    platform.connected ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                </div>
              ))}
            </div>
          </Card>

          {/* Scheduled Posts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Scheduled Posts
              </h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            
            {scheduledPosts.length > 0 ? (
              <div className="space-y-3">
                {scheduledPosts.map((post) => (
                  <div key={post.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {post.scheduledFor && format(post.scheduledFor, 'MMM d, h:mm a')}
                      </span>
                      <div className="flex items-center space-x-1">
                        {post.platforms.slice(0, 2).map((platform, index) => (
                          <span key={platform.id} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                            {platform.name.charAt(0)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No scheduled posts
              </p>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Content
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;