import React, { useState, useEffect } from 'react';
import { Linkedin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import LinkedInConnect from '../components/LinkedIn/LinkedInConnect';
import LinkedInPost from '../components/LinkedIn/LinkedInPost';
import { LinkedInAuthData } from '../api/linkedin';

const LinkedInIntegration: React.FC = () => {
  const navigate = useNavigate();
  const [authData, setAuthData] = useState<LinkedInAuthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have stored LinkedIn auth data
    const storedData = localStorage.getItem('linkedin_auth_data');
    if (storedData) {
      try {
        setAuthData(JSON.parse(storedData));
      } catch (err) {
        console.error('Error parsing stored LinkedIn data:', err);
        localStorage.removeItem('linkedin_auth_data');
      }
    }
  }, []);

  const handleConnected = (data: LinkedInAuthData) => {
    setAuthData(data);
    setError(null);
    // Store in localStorage for persistence
    localStorage.setItem('linkedin_auth_data', JSON.stringify(data));
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePostSuccess = (postId: string) => {
    console.log('Post successful:', postId);
    // You could show a success notification here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Linkedin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">LinkedIn Integration</h1>
                  <p className="text-sm text-gray-600">Connect and post to LinkedIn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection Status */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h2>
            <LinkedInConnect
              onConnected={handleConnected}
              onError={handleError}
            />
          </div>

          {/* Posting Interface */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Post</h2>
            {authData ? (
              <LinkedInPost
                authData={authData}
                onPostSuccess={handlePostSuccess}
                onError={handleError}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Linkedin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect LinkedIn First</h3>
                <p className="text-gray-600">
                  Please connect your LinkedIn account to start posting.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="p-2 bg-blue-100 rounded-lg w-fit mb-4">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Profile</h3>
              <p className="text-sm text-gray-600">
                Post directly to your LinkedIn personal profile and reach your professional network.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="p-2 bg-blue-100 rounded-lg w-fit mb-4">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Company Pages</h3>
              <p className="text-sm text-gray-600">
                Manage and post to your company pages that you have admin access to.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="p-2 bg-blue-100 rounded-lg w-fit mb-4">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Media Support</h3>
              <p className="text-sm text-gray-600">
                Share images and rich media content along with your posts.
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkedInIntegration;
