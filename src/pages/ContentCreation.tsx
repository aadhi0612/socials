import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Wand2, 
  Calendar,
  Eye,
  Bot,
  MessageSquare,
  Sparkles,
  Clock,
  Send,
  RefreshCw,
  X,
  Grid,
  Share2
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import awsConfig from '../config/aws';
import { mockPlatforms } from '../data/mockData';
import { createContent } from '../api/content';
import { postToSocialMedia, testSocialCredentials } from '../api/socialPosts';
import { initiateOAuth, postToSocialMediaOAuth, getConnectedAccounts, disconnectAccount, testLinkedInConnection } from '../api/oauthSocialPosts';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { MediaOut } from '../types';
import MediaSelectModal from '../components/UI/MediaSelectModal';

const ContentCreation: React.FC = () => {
  const { user, loading, token } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentSource, setContentSource] = useState<'manual' | 'ai' | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['1']);
  const [selectedMedia, setSelectedMedia] = useState<MediaOut[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'published' | 'scheduled' | 'social' | null>(null);
  const [postId, setPostId] = useState<string>(uuidv4());
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Social media posting states
  const [isPostingToSocial, setIsPostingToSocial] = useState(false);
  const [socialPostResults, setSocialPostResults] = useState<any>(null);
  const [selectedSocialPlatforms, setSelectedSocialPlatforms] = useState<string[]>(['twitter']);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>You must be logged in to create content.</div>;
  }

  // Preview handler (UI only)
  const handlePreview = () => {
    if (!generatedContent.trim()) {
      setError('Please generate or write content before previewing.');
      return;
    }
    // setGeneratedContent(prompt); // This line is removed as per the new structure
    setError(null);
    setSuccess(false);
  };

  // Schedule handler
  const handleSchedule = async () => {
    if (!generatedContent.trim()) {
      setError('Please generate or write content before scheduling');
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      setError('Please select both date and time for scheduling');
      return;
    }
    if (user && user.user_id) {
      const selectedPlatformNames = mockPlatforms
        .filter(p => selectedPlatforms.includes(p.id))
        .map(p => p.name);
      const scheduled_for = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
      try {
        const uploadedMedia = await uploadImagesToS3();
        const libraryMedia = selectedMedia.map(m => m.url);
        const media = [...uploadedMedia, ...libraryMedia];
        await createContent({
          title: contentSource === 'ai' ? inputValue : inputValue, // Use contentSource to determine title
          body: generatedContent,
          platforms: selectedPlatformNames,
          scheduled_for,
          status: 'scheduled',
          media,
        });
        setSuccess(true);
        setSuccessType('scheduled');
        setError(null);
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } catch (err: any) {
        setError(err.message || 'Failed to schedule content');
      }
    } else {
      setError('You must be logged in to schedule content.');
    }
  };

  // Publish Now handler - Updated to use direct API posting with credentials
  const handlePublishNow = async () => {
    if (!generatedContent.trim()) {
      setError('Please generate or write content before publishing');
      return;
    }
    
    // Use the selected social platforms for posting
    if (selectedSocialPlatforms.length === 0) {
      setError('Please select at least one social media platform to publish to');
      return;
    }

    setIsPostingToSocial(true);
    setError(null);
    setSocialPostResults(null);

    try {
      // Use direct posting API with configured credentials
      const postData = {
        content_text: generatedContent,
        media_urls: selectedMedia.map(m => m.url),
        media_type: selectedMedia.length > 0 ? 'image' : 'text',
        platforms: selectedSocialPlatforms
      };

      const result = await postToSocialMedia(postData);
      setSocialPostResults(result);
      
      if (result.success) {
        setSuccess(true);
        setSuccessType('social');
        setError(null);
        
        // Also save to local content system if user is logged in
        if (user && user.user_id) {
          try {
            const selectedPlatformNames = mockPlatforms
              .filter(p => selectedPlatforms.includes(p.id))
              .map(p => p.name);
            const uploadedMedia = await uploadImagesToS3();
            const libraryMedia = selectedMedia.map(m => m.url);
            const media = [...uploadedMedia, ...libraryMedia];
            
            await createContent({
              title: contentSource === 'ai' ? inputValue : inputValue,
              body: generatedContent,
              platforms: selectedPlatformNames,
              scheduled_for: undefined,
              status: 'published',
              media,
            });
          } catch (contentErr) {
            console.warn('Failed to save to content system:', contentErr);
            // Don't show error since social posting succeeded
          }
        }
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } else {
        setError('Some posts failed. Check results below.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish to social media');
    } finally {
      setIsPostingToSocial(false);
    }
  };

  // Manual Add Content Handler
  const handleAddContent = () => {
    if (!inputValue.trim()) {
      setError('Please enter content to add.');
      return;
    }
    setGeneratedContent(inputValue);
    setContentSource('manual');
    setError(null);
    setSuccess(false);
  };

  // AI Generate Handler (update existing)
  const handleAIGenerate = async () => {
    if (!inputValue.trim()) return;
    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    setGeneratedContent('');
    try {
      const res = await fetch(`${awsConfig.apiUrl}/ai/generate-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue })
      });
      const data = await res.json();
      setGeneratedContent(data.generated_text || '');
      setContentSource('ai');
    } catch (err) {
      setError('AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // Social Media Posting Handler - Updated to handle both direct and OAuth posting
  const handlePostToSocialMedia = async () => {
    if (!generatedContent.trim()) {
      setError('Please generate or write content before posting to social media');
      return;
    }
    
    if (selectedSocialPlatforms.length === 0) {
      setError('Please select at least one social media platform');
      return;
    }

    // Check for LinkedIn without connection
    if (selectedSocialPlatforms.includes('linkedin') && !isPlatformConnected('linkedin')) {
      const confirmConnect = window.confirm(
        'LinkedIn is not connected. Would you like to connect your LinkedIn account now?'
      );
      if (confirmConnect) {
        handleConnectLinkedIn();
        return;
      } else {
        setError('LinkedIn account must be connected to post');
        return;
      }
    }

    setIsPostingToSocial(true);
    setError(null);
    setSocialPostResults(null);

    try {
      const postData = {
        content_text: generatedContent,
        media_urls: selectedMedia.map(m => m.url),
        media_type: selectedMedia.length > 0 ? 'image' : 'text',
        platforms: selectedSocialPlatforms
      };

      // Use OAuth posting if LinkedIn is selected and connected
      const hasLinkedIn = selectedSocialPlatforms.includes('linkedin');
      const linkedInConnected = isPlatformConnected('linkedin');
      
      let result;
      if (hasLinkedIn && linkedInConnected) {
        // Use OAuth posting for LinkedIn
        result = await postToSocialMediaOAuth(postData);
      } else {
        // Use direct posting for Twitter
        result = await postToSocialMedia(postData);
      }

      setSocialPostResults(result);
      
      if (result.success) {
        setSuccess(true);
        setSuccessType('social');
        setError(null);
      } else {
        // Show specific error messages for different platforms
        const failedPlatforms = result.results?.filter(r => !r.success) || [];
        if (failedPlatforms.length > 0) {
          const errorMessages = failedPlatforms.map(p => `${p.platform}: ${p.error}`).join('\n');
          setError(`Some posts failed:\n${errorMessages}`);
        } else {
          setError('Some posts failed. Check results below.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post to social media');
    } finally {
      setIsPostingToSocial(false);
    }
  };

  // Toggle social platform selection
  const handleSocialPlatformToggle = (platform: string) => {
    setSelectedSocialPlatforms(prev => 
      prev.includes(platform) 
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Connect LinkedIn account via OAuth
  const handleConnectLinkedIn = async () => {
    if (!user?.user_id) {
      setError('You must be logged in to connect LinkedIn');
      return;
    }

    try {
      const result = await initiateOAuth('linkedin', user.user_id);
      // Redirect to LinkedIn OAuth
      window.location.href = result.oauth_url;
    } catch (error: any) {
      setError(error.message || 'Failed to connect LinkedIn account');
    }
  };

  // Load connected accounts
  const loadConnectedAccounts = async () => {
    if (!user?.user_id) return;
    
    setIsLoadingAccounts(true);
    try {
      const result = await getConnectedAccounts(user.user_id);
      setConnectedAccounts(result.accounts || []);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Disconnect social media account
  const handleDisconnectAccount = async (accountId: number) => {
    if (!user?.user_id) return;

    try {
      await disconnectAccount(accountId, user.user_id);
      await loadConnectedAccounts(); // Reload accounts
    } catch (error: any) {
      setError(error.message || 'Failed to disconnect account');
    }
  };

  // Check if platform is connected
  const isPlatformConnected = (platform: string) => {
    return connectedAccounts.some(account => account.platform === platform);
  };

  // Get connected account for platform
  const getConnectedAccount = (platform: string) => {
    return connectedAccounts.find(account => account.platform === platform);
  };

  // Load connected accounts on component mount
  useEffect(() => {
    loadConnectedAccounts();
  }, [user]);

  // Handle OAuth callback success/error
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const name = urlParams.get('name');

    if (success === 'linkedin_connected') {
      setSuccess(true);
      setSuccessType('social');
      setError(null);
      // Show success message
      setTimeout(() => {
        alert(`✅ LinkedIn connected successfully! Welcome ${name || 'LinkedIn User'}`);
        loadConnectedAccounts(); // Reload accounts
      }, 500);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      const message = urlParams.get('message');
      setError(`LinkedIn connection failed: ${message || error}`);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const connectedPlatforms = mockPlatforms.filter(p => p.connected);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFiles(prev => [...prev, file]);
    setPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);
  };

  const uploadImagesToS3 = async (): Promise<string[]> => {
    const s3Urls: string[] = [];
    for (const file of selectedFiles) {
      const res = await fetch(`${awsConfig.apiUrl}/content/media/presign-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          filename: file.name,
          filetype: file.type
        })
      });
      const { url, s3_key } = await res.json();
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      const s3Url = `https://${bucket}.s3.amazonaws.com/${s3_key}`;
      s3Urls.push(s3Url);
    }
    return s3Urls;
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Content Creation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, preview, and schedule your social media content.
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 border-2 border-yellow-400 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 transition-all">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-base font-semibold">
              {successType === 'scheduled' ? 'Content scheduled successfully!' : 
               successType === 'social' ? 'Posted to social media successfully!' :
               'Content published successfully!'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Creation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Content Generator */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content Generator
              </h2>
              <div className="space-y-4">
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Type your content or campaign brief here..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddContent} disabled={!inputValue.trim()} className="flex-1">
                    Add Content
                  </Button>
                  <Button
                    onClick={handleAIGenerate}
                    disabled={!inputValue.trim() || isGenerating}
                    loading={isGenerating}
                    className="flex-1"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                </div>
              </div>
            </Card>

            {/* Generated Content */}
            {generatedContent && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Generated Content
                  </h2>
                  <div className="flex items-center space-x-2">
                    {contentSource === 'ai' && (
                      <Badge variant="info">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                    {contentSource === 'manual' && (
                      <Badge variant="default">
                        Added Content
                      </Badge>
                    )}
                  </div>
                </div>
                <textarea
                  value={generatedContent}
                  onChange={e => setGeneratedContent(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{generatedContent.length} characters</span>
                </div>
              </Card>
            )}

            {/* Media Library Selection */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Media Assets
              </h2>
              <div className="flex gap-4">
                {/* Upload Images/Videos */}
                <div
                  className="border-2 border-yellow-400 dark:border-yellow-400 bg-gray-800/80 dark:bg-gray-800/80 rounded-lg p-6 text-center text-white hover:border-yellow-300 hover:shadow-lg transition-colors cursor-pointer flex-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  onClick={() => document.getElementById('media-upload-input')?.click()}
                  tabIndex={0}
                  role="button"
                  aria-label="Upload Images or Videos"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      document.getElementById('media-upload-input')?.click();
                    }
                  }}
                  style={{ minHeight: 120 }}
                >
                  <input
                    id="media-upload-input"
                    type="file"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />
                  <Upload className="mx-auto mb-2 w-8 h-8 text-yellow-300" />
                  <div className="font-semibold text-lg">Upload Images or Videos</div>
                  <div className="text-xs text-yellow-100">PNG, JPG, MP4 up to 10MB</div>
                </div>
                {/* Select from Media Library */}
                <div
                  className="border-2 border-blue-500 dark:border-blue-400 bg-gray-800/80 dark:bg-gray-800/80 rounded-lg p-6 text-center text-white hover:border-blue-400 hover:shadow-lg transition-colors cursor-pointer flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => setShowMediaModal(true)}
                  tabIndex={0}
                  role="button"
                  aria-label="Select from Media Library"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setShowMediaModal(true);
                    }
                  }}
                  style={{ minHeight: 120 }}
                >
                  <Grid className="mx-auto mb-2 w-8 h-8 text-blue-400" />
                  <div className="font-semibold text-lg">Select from Media Library</div>
                  <div className="text-xs text-blue-100">Choose existing assets</div>
                </div>
              </div>
              {/* Show previews for uploaded and selected media, or a message if none */}
              <div className="mt-4 flex flex-wrap gap-2">
                {previewUrls.length === 0 && selectedMedia.length === 0 ? (
                  <div className="w-full text-center text-gray-500 dark:text-gray-400 py-8">
                    No media was uploaded.
                  </div>
                ) : (
                  <>
                    {previewUrls.map((url, idx) => (
                      <div
                        key={url}
                        className="relative border rounded bg-gray-50 flex items-center justify-center"
                        style={{ height: 120, width: 160 }}
                      >
                        {/* Guess type by file extension for preview */}
                        {selectedFiles[idx]?.type.startsWith('video') ? (
                          <video src={url} controls style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        ) : (
                          <img src={url} alt={`media-upload-${idx}`} style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        )}
                        <button
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                          onClick={() => {
                            setSelectedFiles(files => files.filter((_, i) => i !== idx));
                            setPreviewUrls(urls => urls.filter((_, i) => i !== idx));
                          }}
                          type="button"
                          aria-label="Remove uploaded media"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {selectedMedia.map((media, idx) => (
                      <div key={media.id} className="relative border rounded bg-gray-50 flex items-center justify-center" style={{ height: 120, width: 160 }}>
                        {media.type === 'video' ? (
                          <video src={media.url} controls style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        ) : (
                          <img src={media.url} alt={media.name || `media-${idx}`} style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        )}
                        <button
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                          onClick={() => setSelectedMedia(selectedMedia.filter((_, i) => i !== idx))}
                          type="button"
                          aria-label="Remove selected media"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Card>

            {/* Platform Selection */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Target Platforms
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {connectedPlatforms.map((platform) => (
                  <label
                    key={platform.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
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
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {platform.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {platform.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {platform.followers.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    {selectedPlatforms.includes(platform.id) && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    )}
                  </label>
                ))}
              </div>
            </Card>

            {/* Social Media Platforms */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Share2 className="w-5 h-5 inline mr-2" />
                Social Media Platforms
              </h2>
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> "Publish Now" will post directly to the selected platforms using configured API credentials.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {[
                  { id: 'twitter', name: 'Twitter/X', color: 'bg-blue-500', status: '✅ Ready to Post', enabled: true },
                  { 
                    id: 'linkedin', 
                    name: 'LinkedIn', 
                    color: 'bg-blue-700', 
                    status: isPlatformConnected('linkedin') ? '✅ Connected' : '🔗 Connect Required', 
                    enabled: true 
                  }
                ].map((platform) => (
                  <label
                    key={platform.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSocialPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    } ${!platform.enabled ? 'opacity-60' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSocialPlatforms.includes(platform.id)}
                      onChange={() => handleSocialPlatformToggle(platform.id)}
                      className="sr-only"
                      disabled={!platform.enabled}
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
                        <p className={`text-xs ${
                          platform.id === 'twitter' || isPlatformConnected(platform.id) 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-orange-600 dark:text-orange-400'
                        }`}>
                          {platform.status}
                        </p>
                      </div>
                    </div>
                    {selectedSocialPlatforms.includes(platform.id) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </label>
                ))}
              </div>
              
              {/* LinkedIn OAuth Connection */}
              {selectedSocialPlatforms.includes('linkedin') && !isPlatformConnected('linkedin') && (
                <div className="mb-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        <strong>LinkedIn:</strong> OAuth connection required for posting
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                        Click to connect your LinkedIn account
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleConnectLinkedIn}
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      Connect LinkedIn
                    </Button>
                  </div>
                </div>
              )}

              {/* LinkedIn Connected Status */}
              {selectedSocialPlatforms.includes('linkedin') && isPlatformConnected('linkedin') && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>LinkedIn:</strong> ✅ Connected and ready to post
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                        {getConnectedAccount('linkedin')?.user_info?.name || 'LinkedIn User'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnectAccount(getConnectedAccount('linkedin')?.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              )}

              {/* Test Credentials Button */}
              <Button 
                variant="outline"
                className="w-full mb-3" 
                onClick={async () => {
                  try {
                    const result = await testSocialCredentials();
                    console.log('Credentials test:', result);
                    if (result.credentials_test.twitter.status === 'success') {
                      setError(null);
                      alert(`✅ Twitter credentials working! Username: @${result.credentials_test.twitter.username}`);
                    } else {
                      setError('Twitter credentials not working properly');
                    }
                  } catch (err: any) {
                    setError(err.message || 'Failed to test credentials');
                  }
                }}
              >
                🧪 Test Twitter Connection
              </Button>

              {/* Social Media Post Button */}
              <Button 
                className="w-full" 
                onClick={handlePostToSocialMedia}
                disabled={isPostingToSocial || !generatedContent.trim()}
              >
                {isPostingToSocial ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Post to Social Media
                  </>
                )}
              </Button>

              {/* Social Media Results */}
              {socialPostResults && (
                <div className="mt-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Posting Results:
                  </h4>
                  <div className="space-y-2">
                    {socialPostResults.results.map((result: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{result.platform}</span>
                        {result.success ? (
                          <Badge variant="success">Posted</Badge>
                        ) : (
                          <Badge variant="error">Failed</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {socialPostResults.message}
                  </p>
                </div>
              )}
            </Card>

            {/* Scheduling */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Schedule Post
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleSchedule}>
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handlePublishNow}
                  disabled={isPostingToSocial || !generatedContent.trim()}
                >
                  {isPostingToSocial ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Now
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Platform Previews */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Platform Previews
              </h3>
              <div className="space-y-4">
                {selectedPlatforms.map((platformId) => {
                  const platform = connectedPlatforms.find(p => p.id === platformId);
                  if (!platform) return null;
                  
                  return (
                    <div key={platformId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            {platform.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {platform.name}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                        <p className="text-sm text-gray-900 dark:text-white mb-2">
                          {generatedContent || 'Your content will appear here...'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedMedia.map((media, idx) => (
                            <img key={idx} src={media.url} alt={`preview-media-${idx}`} style={{ height: 80, width: 100, objectFit: 'cover', borderRadius: 6 }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Content Calendar Widget */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Content Calendar
                </h3>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Interactive calendar view</p>
                <p className="text-xs">Drag and drop scheduling</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <MediaSelectModal
        open={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onConfirm={(newSelected) => {
          setSelectedMedia(prev => {
            const ids = new Set(prev.map(m => m.id));
            return [...prev, ...newSelected.filter(m => !ids.has(m.id))];
          });
        }}
        selected={selectedMedia}
        token={token || ""}
      />
    </div>
  );
};

export default ContentCreation;