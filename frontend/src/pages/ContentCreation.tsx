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
  Grid
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { mockPlatforms } from '../data/mockData';
import { createContent } from '../api/content';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { MediaOut } from '../types';
import MediaSelectModal from '../components/UI/MediaSelectModal';

const ContentCreation: React.FC = () => {
  const { user, loading, token } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['1']);
  const [selectedMedia, setSelectedMedia] = useState<MediaOut[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'published' | 'scheduled' | null>(null);
  const [postId, setPostId] = useState<string>(uuidv4());
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>You must be logged in to create content.</div>;
  }

  // Preview handler (UI only)
  const handlePreview = () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to preview.');
      return;
    }
    setGeneratedContent(prompt);
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
          title: prompt,
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

  // Publish Now handler
  const handlePublishNow = async () => {
    if (!generatedContent.trim()) {
      setError('Please generate or write content before publishing');
      return;
    }
    if (user && user.user_id) {
      const selectedPlatformNames = mockPlatforms
        .filter(p => selectedPlatforms.includes(p.id))
        .map(p => p.name);
      try {
        const uploadedMedia = await uploadImagesToS3();
        const libraryMedia = selectedMedia.map(m => m.url);
        const media = [...uploadedMedia, ...libraryMedia];
        await createContent({
          title: prompt,
          body: generatedContent,
          platforms: selectedPlatformNames,
          scheduled_for: undefined,
          status: 'published',
          media,
        });
        setSuccess(true);
        setSuccessType('published');
        setError(null);
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      } catch (err: any) {
        setError(err.message || 'Failed to publish content');
      }
    } else {
      setError('You must be logged in to publish content.');
    }
  };

  // Update handleGenerateContent to use dynamic content
  const handleGenerateContent = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    setGeneratedContent('');
    setTimeout(() => {
      setGeneratedContent(prompt);
      setIsGenerating(false);
    }, 1000);
  };

  const handleRegenerateContent = () => {
    if (!prompt.trim()) return;
    handleGenerateContent();
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const connectedPlatforms = mockPlatforms.filter(p => p.connected);

  const handleAIGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    setGeneratedContent('');
    try {
      const res = await fetch('http://localhost:8000/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      setGeneratedContent(data.generated_text || '');
    } catch (err) {
      setError('AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFiles(prev => [...prev, file]);
    setPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);
  };

  const uploadImagesToS3 = async (): Promise<string[]> => {
    const s3Urls: string[] = [];
    for (const file of selectedFiles) {
      const res = await fetch('http://localhost:8000/content/media/presign-upload', {
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
              {successType === 'scheduled' ? 'Content scheduled successfully!' : 'Content published successfully!'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Creation Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Prompt */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Content Generator
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Describe your topic or campaign brief
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., digital transformation in financial services, sustainability initiatives, tax technology innovations..."
                      className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    />
                    <Button
                      onClick={handleAIGenerate}
                      disabled={!prompt.trim() || isGenerating}
                      loading={isGenerating}
                      variant="outline"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateContent}
                  disabled={!prompt.trim() || isGenerating}
                  loading={isGenerating}
                  className="w-full"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating Content...' : 'Generate Content'}
                </Button>
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
                    <Badge variant="info">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={handleRegenerateContent}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{generatedContent.length} characters</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={handleRegenerateContent}>
                      <Wand2 className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Refine
                    </Button>
                  </div>
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
              {/* Show previews for uploaded and selected media */}
              <div className="mt-4 flex flex-wrap gap-2">
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
                <Button className="flex-1" onClick={handlePublishNow}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Now
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