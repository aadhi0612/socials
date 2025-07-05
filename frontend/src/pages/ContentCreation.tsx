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
  X
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { mockPlatforms } from '../data/mockData';
import { createContent } from '../api/content';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const ContentCreation: React.FC = () => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['1']);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'published' | 'scheduled' | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [postId, setPostId] = useState<string>(uuidv4());
  const [showAIImageGen, setShowAIImageGen] = useState(false);
  const [aiImagePrompt, setAiImagePrompt] = useState('');
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [aiImageS3Url, setAiImageS3Url] = useState<string | null>(null);
  const [aiImageLoading, setAiImageLoading] = useState(false);
  const [aiImageError, setAiImageError] = useState<string | null>(null);
  
  const bucket = import.meta.env.VITE_AWS_S3_BUCKET as string;

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
        const media = await uploadImagesToS3();
        await createContent({
          title: prompt,
          body: generatedContent,
          author_id: user.user_id,
          platforms: selectedPlatformNames,
          scheduled_for,
          status: 'scheduled',
          media,
        });
        setSuccess(true);
        setSuccessType('scheduled');
        setError(null);
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
        const media = await uploadImagesToS3();
        await createContent({
          title: prompt,
          body: generatedContent,
          author_id: user.user_id,
          platforms: selectedPlatformNames,
          scheduled_for: undefined,
          status: 'published',
          media,
        });
        setSuccess(true);
        setSuccessType('published');
        setError(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFiles(prev => [...prev, file]);
    setPreviewUrls(prev => [...prev, URL.createObjectURL(file)]);
  };

  const handleAIImageGenerate = async () => {
    console.log('handleAIImageGenerate called, aiImagePrompt:', aiImagePrompt);
    if (!aiImagePrompt.trim()) {
      setAiImageError('Please enter a prompt for AI image generation');
      return;
    }
    
    setAiImageLoading(true);
    setAiImageError(null);
    setAiImage(null);
    setAiImageS3Url(null);
    
    try {
      const res = await fetch('http://localhost:8000/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiImagePrompt })
      });
      
      if (!res.ok) {
        throw new Error('Failed to generate AI image');
      }
      
      const data = await res.json();
      // Prefer s3_url, fallback to image_url
      setAiImage(data.s3_url || data.image_url || null);
      setAiImageS3Url(data.s3_url || null);
      
      if (!data.s3_url && !data.image_url) {
        throw new Error('No image URL returned from AI service');
      }
    } catch (err: any) {
      setAiImageError(err.message || 'AI image generation failed');
    } finally {
      setAiImageLoading(false);
    }
  };

  const handleRemoveAIImage = () => {
    setAiImage(null);
    setAiImageS3Url(null);
    setAiImagePrompt('');
    setAiImageError(null);
  };

  const handleCloseAIImageGen = () => {
    setShowAIImageGen(false);
    setAiImagePrompt('');
    setAiImageError(null);
    if (!aiImage) {
      // Only reset if no image was generated
      setAiImage(null);
      setAiImageS3Url(null);
    }
  };

  const uploadImagesToS3 = async (): Promise<string[]> => {
    const s3Urls: string[] = [];
    
    // User-uploaded images
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
    
    // AI-generated image (if present and not already in S3)
    if (aiImage && !aiImageS3Url) {
      // Fetch image as blob
      const response = await fetch(aiImage);
      const blob = await response.blob();
      const res = await fetch('http://localhost:8000/content/media/presign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          filename: 'ai-image.png',
          filetype: blob.type
        })
      });
      const { url, s3_key } = await res.json();
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': blob.type },
        body: blob
      });
      const s3Url = `https://${bucket}.s3.amazonaws.com/${s3_key}`;
      s3Urls.push(s3Url);
      setAiImageS3Url(s3Url);
    } else if (aiImageS3Url) {
      s3Urls.push(aiImageS3Url);
    }
    
    return s3Urls;
  };

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

  useEffect(() => {
    if (aiImage) {
      console.log("AI Image URL:", aiImage);
    }
  }, [aiImage]);

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
              Create, preview, and schedule your EY social media content.
            </p>
          </div>
          
          <Button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            variant={showAIAssistant ? 'primary' : 'outline'}
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-300">
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
                    Describe your EY topic or campaign brief
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., digital transformation in financial services, EY's sustainability initiatives, tax technology innovations..."
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

            {/* Media Upload */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Media Assets
              </h2>

              {/* Media Options Grid */}
              <div className="flex gap-4">
                {/* Upload Images */}
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-yellow-500 dark:hover:border-yellow-400 transition-colors cursor-pointer flex-1"
                  onClick={() => document.getElementById('media-upload-input')?.click()}
                  tabIndex={0}
                  role="button"
                  aria-label="Upload Images"
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
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageSelect}
                  />
                  <Upload className="mx-auto mb-2" />
                  <div>Upload Images</div>
                  <div className="text-xs text-gray-500">PNG, JPG up to 10MB</div>
                </div>

                {/* AI Generate */}
                <div
                  className="border-2 border-dashed border-purple-400 rounded-lg p-6 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer flex-1"
                  onClick={() => setShowAIImageGen(true)}
                  tabIndex={0}
                  role="button"
                  aria-label="AI Generate"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setShowAIImageGen(true);
                    }
                  }}
                  style={{ minHeight: 120 }}
                >
                  <Wand2 className="mx-auto mb-2 w-8 h-8 text-purple-500" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">AI Generate</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Create visuals with AI</div>
                </div>
              </div>

              

              {/* AI Image Generation UI */}
              {showAIImageGen && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300">
                      AI Image Generation
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowAIImageGen(false);
                        setAiImagePrompt('');
                        setAiImageError(null);
                      }}
                      aria-label="Close AI Image Generation"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={aiImagePrompt}
                      onChange={e => setAiImagePrompt(e.target.value)}
                      placeholder="Describe the image you want to generate..."
                      className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      autoFocus
                    />
                    <Button
                      onClick={handleAIImageGenerate}
                      disabled={!aiImagePrompt.trim() || aiImageLoading}
                      loading={aiImageLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {aiImageLoading ? 'Generating Image...' : 'Generate Image'}
                    </Button>
                    {aiImageError && (
                      <div className="text-sm text-red-600 dark:text-red-400">{aiImageError}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Show uploaded images */}
              <div className="mt-4 flex flex-wrap gap-2">
                {previewUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative border rounded bg-gray-50 flex items-center justify-center"
                    style={{ height: 120, width: 160 }}
                  >
                    <img
                      src={url}
                      alt={`media-${idx}`}
                      style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 8 }}
                    />
                    <button
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                      onClick={() => {
                        setSelectedFiles(files => files.filter((_, i) => i !== idx));
                        setPreviewUrls(urls => urls.filter((_, i) => i !== idx));
                      }}
                      type="button"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Show AI generated image */}
                {aiImage && (
                  <div
                    className="relative border rounded bg-gray-50 flex items-center justify-center"
                    style={{ height: 120, width: 160 }}
                  >
                    <img
                      src={aiImage}
                      alt="AI generated"
                      onError={() => setAiImageError('Failed to load generated image')}
                      style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: 8 }}
                    />
                    <button
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                      onClick={handleRemoveAIImage}
                      type="button"
                      aria-label="Remove AI image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                      AI
                    </div>
                  </div>
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
                          {generatedContent || 'Your EY content will appear here...'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {previewUrls.map((url, idx) => (
                            <img key={idx} src={url} alt={`preview-media-${idx}`} style={{ height: 80, width: 100, objectFit: 'cover', borderRadius: 6 }} />
                          ))}
                          {aiImage && (
                            <div className="relative">
                              <img src={aiImage} alt="AI generated preview" style={{ height: 80, width: 100, objectFit: 'cover', borderRadius: 6 }} />
                              <div className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-1 py-0.5 rounded">
                                AI
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* AI Assistant Panel */}
            {showAIAssistant && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  AI Writing Assistant
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Add EY hashtags
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Make more professional
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Adjust for EY tone
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Suggest EY visuals
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    💡 EY Tip: Posts with client success stories get 35% more engagement
                  </p>
                </div>
              </Card>
            )}

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
    </div>
  );
};

export default ContentCreation;