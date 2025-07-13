import React from 'react';
import { 
  Target, 
  Calendar,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const CampaignManager: React.FC = () => {
  const upcomingFeatures = [
    {
      icon: Target,
      title: 'Campaign Planning',
      description: 'Create and organize marketing campaigns with detailed goals and timelines'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analytics',
      description: 'Track campaign performance with real-time metrics and insights'
    },
    {
      icon: Users,
      title: 'Audience Targeting',
      description: 'Define and target specific audience segments across platforms'
    },
    {
      icon: BarChart3,
      title: 'ROI Tracking',
      description: 'Measure return on investment with comprehensive reporting tools'
    },
    {
      icon: Calendar,
      title: 'Content Scheduling',
      description: 'Schedule and automate content publishing across all platforms'
    },
    {
      icon: Zap,
      title: 'A/B Testing',
      description: 'Test different campaign variations to optimize performance'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Campaign Manager
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Powerful campaign management tools to plan, execute, and analyze your marketing efforts across all platforms.
        </p>
      </div>

      {/* Coming Soon Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            We're working hard to bring you comprehensive campaign management features. 
            Get notified when it's ready!
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Get Notified
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Features Preview */}
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            What's Coming
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Discover the powerful features that will transform your campaign management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingFeatures.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Increase Efficiency
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Streamline your campaign workflow and save time with automated tools
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Better Insights
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Make data-driven decisions with comprehensive analytics and reporting
            </p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Optimize Performance
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Continuously improve your campaigns with A/B testing and optimization tools
            </p>
          </div>
        </div>
      </Card>

      {/* CTA Section */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Ready to transform your campaign management?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be among the first to experience our powerful campaign management platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline">
            Learn More
          </Button>
          <Button>
            Join Waitlist
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignManager;