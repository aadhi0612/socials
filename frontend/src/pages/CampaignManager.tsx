import React from 'react';
import { Target, Clock, Sparkles } from 'lucide-react';
import Card from '../components/UI/Card';

const CampaignManager: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <div className="py-12 px-6">
          {/* Icon */}
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Campaign Manager
          </h1>
          
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full mb-6">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Coming Soon
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            We're working hard to bring you an amazing campaign management experience. 
            Stay tuned for powerful tools to organize, track, and optimize your marketing campaigns.
          </p>

          {/* Features Preview */}
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Campaign creation and management</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Goal tracking and analytics</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Performance insights and reporting</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Multi-platform campaign coordination</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CampaignManager;
