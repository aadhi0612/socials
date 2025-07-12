import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaAward } from 'react-icons/fa';
import UpcomingEvents from './UpcomingEvents';

const platforms = [
  {
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-blue-500',
    description: 'Share quick thoughts and updates'
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700',
    description: 'Professional networking and insights'
  },
  {
    name: 'Instagram',
    icon: '📸',
    color: 'bg-pink-500',
    description: 'Visual storytelling and creativity'
  }
];

const stats = [
  { label: 'Total Posts', value: '1,234', icon: '📝' },
  { label: 'Engagement Rate', value: '8.5%', icon: '❤️' },
  { label: 'Followers Growth', value: '+15%', icon: '📈' },
  { label: 'Active Platforms', value: '3', icon: '🌐' }
];

const Main: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderHomeContent = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Welcome to Socials AI! 🚀</h1>
        <p className="text-lg opacity-90 mb-6">
          Your AI-powered social media management platform. Create, schedule, and analyze your content across all platforms.
        </p>
        <Link
          to="/create"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Start Creating Content ✨
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Platforms Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Connected Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((platform, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                  {platform.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{platform.name}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{platform.description}</p>
              <button className="mt-4 w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Manage Account
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/create" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Create Content</h3>
            <p className="text-gray-600 dark:text-gray-400">Generate AI-powered content for your social media</p>
          </Link>
          
          <button 
            onClick={() => setActiveSection('events')}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group text-left"
          >
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Upcoming Events</h3>
            <p className="text-gray-600 dark:text-gray-400">View and manage your scheduled posts</p>
          </button>
          
          <Link to="/analytics" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibent text-gray-900 dark:text-white mb-2">Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">Track your social media performance</p>
          </Link>
        </div>
      </div>
    </div>
  );

  if (activeSection === 'events') {
    return <UpcomingEvents onBack={() => setActiveSection('home')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderHomeContent()}
      </div>
    </div>
  );
};

export default Main;
