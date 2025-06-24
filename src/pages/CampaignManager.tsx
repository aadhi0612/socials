import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Users,
  DollarSign,
  Eye,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { mockCampaigns } from '../data/mockData';
import { format } from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CampaignManager: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const selectedCampaignData = selectedCampaign ? mockCampaigns.find(c => c.id === selectedCampaign) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getGoalProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  // Mock chart data
  const performanceData = [
    { name: 'Week 1', reach: 12000, engagement: 800, leads: 45 },
    { name: 'Week 2', reach: 15000, engagement: 1200, leads: 67 },
    { name: 'Week 3', reach: 18000, engagement: 1500, leads: 89 },
    { name: 'Week 4', reach: 22000, engagement: 1800, leads: 124 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Campaign Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize and track your marketing campaigns.
          </p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns List */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Campaigns
              </h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">All</Button>
                <Button variant="outline" size="sm">Active</Button>
                <Button variant="outline" size="sm">Completed</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {mockCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedCampaign === campaign.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {campaign.name}
                        </h3>
                        <Badge variant={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {campaign.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(campaign.startDate, 'MMM d')} - {format(campaign.endDate, 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{campaign.goals.length} goals</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost">
                        {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Goals Progress */}
                  <div className="space-y-2">
                    {campaign.goals.slice(0, 2).map((goal, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {goal.type}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getGoalProgress(goal.current, goal.target)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 min-w-0">
                            {goal.current.toLocaleString()}/{goal.target.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Campaign Details */}
        <div className="space-y-6">
          {selectedCampaignData ? (
            <>
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Campaign Overview
                  </h3>
                  <Badge variant={getStatusColor(selectedCampaignData.status)}>
                    {selectedCampaignData.status}
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedCampaignData.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedCampaignData.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Total Reach
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedCampaignData.metrics.totalReach.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Engagement
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedCampaignData.metrics.totalEngagement.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Leads
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedCampaignData.metrics.totalLeads.toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          ROI
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {selectedCampaignData.metrics.roi}x
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Goals Progress
                </h3>
                <div className="space-y-4">
                  {selectedCampaignData.goals.map((goal, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {goal.type}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${getGoalProgress(goal.current, goal.target)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>0</span>
                        <span>{Math.round(getGoalProgress(goal.current, goal.target))}%</span>
                        <span>{goal.target.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Trend
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--tooltip-bg)', 
                          border: '1px solid var(--tooltip-border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Posts
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="w-4 h-4 mr-2" />
                    Edit Goals
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Campaign Selected
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click on a campaign to view details and analytics.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;