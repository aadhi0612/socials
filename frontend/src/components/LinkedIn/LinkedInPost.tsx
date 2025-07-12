import React, { useState } from 'react';
import { Send, Image, Building2, User, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { postToLinkedIn, LinkedInAuthData, LinkedInPage } from '../../api/linkedin';
import { useAuth } from '../../contexts/AuthContext';

interface LinkedInPostProps {
  authData: LinkedInAuthData;
  onPostSuccess?: (postId: string) => void;
  onError?: (error: string) => void;
}

const LinkedInPost: React.FC<LinkedInPostProps> = ({ authData, onPostSuccess, onError }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<'profile' | string>('profile');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePost = async () => {
    if (!content.trim() && mediaUrls.length === 0) {
      setError('Please enter some content or add media');
      return;
    }

    setIsPosting(true);
    setError(null);
    setSuccess(null);

    try {
      const targetUrn = selectedTarget === 'profile' ? undefined : `urn:li:organization:${selectedTarget}`;
      
      const response = await postToLinkedIn({
        access_token: authData.access_token,
        content_text: content,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        target_urn: targetUrn,
        user_id: user?.user_id
      });

      if (response.success) {
        setSuccess(`Posted successfully! Post ID: ${response.platform_post_id}`);
        setContent('');
        setMediaUrls([]);
        onPostSuccess?.(response.platform_post_id || '');
      } else {
        throw new Error(response.error || 'Failed to post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to post to LinkedIn';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddMedia = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setMediaUrls([...mediaUrls, url.trim()]);
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const getTargetName = (targetId: string) => {
    if (targetId === 'profile') return authData.linkedin_name;
    const page = authData.pages?.find(p => p.id === targetId);
    return page?.name || 'Unknown Page';
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">Post to LinkedIn</h3>
        
        {/* Target Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Post to:
          </label>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="profile">
              👤 {authData.linkedin_name} (Personal Profile)
            </option>
            {authData.pages?.map((page) => (
              <option key={page.id} value={page.id}>
                🏢 {page.name} (Company Page)
              </option>
            ))}
          </select>
        </div>

        {/* Content Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {content.length}/3000
          </div>
        </div>

        {/* Media URLs */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Media (Images)
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddMedia}
              className="text-blue-600"
            >
              <Image className="w-4 h-4 mr-1" />
              Add Image
            </Button>
          </div>
          
          {mediaUrls.length > 0 && (
            <div className="space-y-2">
              {mediaUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <Image className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 text-sm text-gray-700 truncate">{url}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMedia(index)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Button */}
        <Button
          onClick={handlePost}
          disabled={isPosting || (!content.trim() && mediaUrls.length === 0)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isPosting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Post to {selectedTarget === 'profile' ? 'Profile' : 'Page'}
            </>
          )}
        </Button>

        {/* Success Message */}
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default LinkedInPost;
