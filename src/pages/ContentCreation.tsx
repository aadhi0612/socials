import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { mockPlatforms } from '../data/mockData';

const ContentCreation: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['1']);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateContent = () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI content generation
    setTimeout(() => {
      const examples = [
        `🚀 EY is leading the charge in ${prompt}! Our innovative approach is helping clients navigate complex challenges and unlock new opportunities. Ready to transform your business? #EY #Innovation #${prompt.replace(/\s+/g, '')} #BetterWorkingWorld`,
        `Thought leadership spotlight: How ${prompt} is reshaping the business landscape. EY's latest insights reveal key strategies for success in this evolving space. 💡 #EYInsights #Leadership #${prompt.replace(/\s+/g, '')}`,
        `Behind the scenes at EY: Our teams are pioneering solutions in ${prompt} that deliver real value for our clients. Discover how we're building a better working world. 📊 #EYExpertise #${prompt.replace(/\s+/g, '')} #ClientSuccess`
      ];
      setGeneratedContent(examples[Math.floor(Math.random() * examples.length)]);
      setIsGenerating(false);
    }, 2000);
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

  const handlePreview = () => {
    alert('Preview functionality would show platform-specific previews');
  };

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      alert('Please select both date and time for scheduling');
      return;
    }
    alert(`Post scheduled for ${scheduledDate} at ${scheduledTime}`);
  };

  const handlePublishNow = () => {
    if (!generatedContent.trim()) {
      alert('Please generate or write content before publishing');
      return;
    }
    alert('Post published successfully!');
  };

  const connectedPlatforms = mockPlatforms.filter(p => p.connected);

  return (
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
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., digital transformation in financial services, EY's sustainability initiatives, tax technology innovations..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                />
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
            <div className="grid grid-cols-2 gap-4">
              {/* Upload Custom */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-yellow-500 dark:hover:border-yellow-400 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Upload Images</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</p>
              </div>
              
              {/* AI Generate */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors cursor-pointer">
                <Wand2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">AI Generate</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create visuals with AI</p>
              </div>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selected Media
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img src={image} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      <p className="text-sm text-gray-900 dark:text-white">
                        {generatedContent || 'Your EY content will appear here...'}
                      </p>
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
  );
};

export default ContentCreation;