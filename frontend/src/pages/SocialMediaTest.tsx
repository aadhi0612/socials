import React, { useState, useEffect } from 'react';
import { Share2, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { postToSocialMedia, testSocialCredentials } from '../api/socialPosts';

const SocialMediaTest: React.FC = () => {
  const [testContent, setTestContent] = useState('Test post from Socials App! 🚀 #testing');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter']);
  const [isPosting, setIsPosting] = useState(false);
  const [postResults, setPostResults] = useState<any>(null);
  const [credentialsTest, setCredentialsTest] = useState<any>(null);
  const [isTestingCredentials, setIsTestingCredentials] = useState(false);

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', color: 'bg-blue-500' },
    { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' }
  ];

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleTestCredentials = async () => {
    setIsTestingCredentials(true);
    try {
      const result = await testSocialCredentials();
      setCredentialsTest(result);
    } catch (error) {
      console.error('Credentials test failed:', error);
    } finally {
      setIsTestingCredentials(false);
    }
  };

  const handleTestPost = async () => {
    if (!testContent.trim()) {
      alert('Please enter test content');
      return;
    }
    
    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    setIsPosting(true);
    setPostResults(null);

    try {
      const postData = {
        content_text: testContent,
        media_urls: [],
        media_type: 'text',
        platforms: selectedPlatforms
      };

      const result = await postToSocialMedia(postData);
      setPostResults(result);
    } catch (error) {
      console.error('Test post failed:', error);
      setPostResults({
        success: false,
        message: error.message || 'Failed to post',
        results: []
      });
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    handleTestCredentials();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Social Media Testing
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test your social media posting functionality
        </p>
      </div>

      {/* Credentials Test */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Credentials Status
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestCredentials}
            disabled={isTestingCredentials}
          >
            {isTestingCredentials ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {credentialsTest && (
          <div className="space-y-3">
            {Object.entries(credentialsTest.credentials_test).map(([platform, status]: [string, any]) => (
              <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${platform === 'twitter' ? 'bg-blue-500' : 'bg-blue-700'} rounded-lg flex items-center justify-center`}>
                    <span className="text-sm font-semibold text-white">
                      {platform.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {platform}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {status.message}
                    </p>
                    {status.username && (
                      <p className="text-xs text-gray-500">
                        Username: @{status.username}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  {status.status === 'success' ? (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  ) : status.status === 'configured' ? (
                    <Badge variant="warning">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      OAuth Required
                    </Badge>
                  ) : (
                    <Badge variant="error">
                      <XCircle className="w-3 h-3 mr-1" />
                      Error
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {credentialsTest.note && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> {credentialsTest.note}
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Test Posting */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Test Post
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test Content
            </label>
            <textarea
              value={testContent}
              onChange={(e) => setTestContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter your test content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Platforms
            </label>
            <div className="grid grid-cols-2 gap-3">
              {platforms.map((platform) => (
                <label
                  key={platform.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-sm font-semibold text-white">
                        {platform.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {platform.name}
                      </p>
                    </div>
                  </div>
                  {selectedPlatforms.includes(platform.id) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </label>
              ))}
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleTestPost}
            disabled={isPosting || !testContent.trim()}
          >
            {isPosting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Test Post
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {postResults && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Post Results
          </h2>
          
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${postResults.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <p className={`font-medium ${postResults.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {postResults.message}
              </p>
            </div>

            {postResults.results && postResults.results.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Platform Results:</h3>
                {postResults.results.map((result: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {result.platform}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {result.error}
                        </p>
                      )}
                      {result.platform_post_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Post ID: {result.platform_post_id}
                        </p>
                      )}
                    </div>
                    <div>
                      {result.success ? (
                        <Badge variant="success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Posted
                        </Badge>
                      ) : (
                        <Badge variant="error">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SocialMediaTest;
