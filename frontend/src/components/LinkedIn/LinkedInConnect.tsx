import React, { useState, useEffect } from 'react';
import { Linkedin, Users, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { 
  startLinkedInOAuth, 
  parseLinkedInAuthFromURL, 
  cleanOAuthURL, 
  validateLinkedInToken,
  LinkedInAuthData,
  LinkedInPage
} from '../../api/linkedin';
import { useAuth } from '../../contexts/AuthContext';

interface LinkedInConnectProps {
  onConnected?: (authData: LinkedInAuthData) => void;
  onError?: (error: string) => void;
}

const LinkedInConnect: React.FC<LinkedInConnectProps> = ({ onConnected, onError }) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [authData, setAuthData] = useState<LinkedInAuthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Check if we're returning from LinkedIn OAuth
    const linkedInAuthData = parseLinkedInAuthFromURL();
    if (linkedInAuthData) {
      setAuthData(linkedInAuthData);
      onConnected?.(linkedInAuthData);
      cleanOAuthURL();
    }

    // Check for OAuth errors
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    const errorMessage = urlParams.get('message');
    
    if (oauthError) {
      const errorText = errorMessage || oauthError;
      setError(errorText);
      onError?.(errorText);
      cleanOAuthURL();
    }
  }, [onConnected, onError]);

  const handleConnect = async () => {
    if (!user?.user_id) {
      setError('User not authenticated');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const { oauth_url } = await startLinkedInOAuth(user.user_id);
      // Redirect to LinkedIn OAuth
      window.location.href = oauth_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to LinkedIn';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleValidateToken = async () => {
    if (!authData?.access_token) return;

    setIsValidating(true);
    try {
      const isValid = await validateLinkedInToken(authData.access_token);
      if (!isValid) {
        setError('LinkedIn token has expired. Please reconnect.');
        setAuthData(null);
      }
    } catch (err) {
      setError('Failed to validate LinkedIn token');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDisconnect = () => {
    setAuthData(null);
    setError(null);
    // Clear from localStorage if stored there
    localStorage.removeItem('linkedin_auth_data');
  };

  if (authData) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Linkedin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">LinkedIn Connected</h3>
              <p className="text-sm text-gray-600">{authData.linkedin_name}</p>
              {authData.linkedin_email && (
                <p className="text-xs text-gray-500">{authData.linkedin_email}</p>
              )}
            </div>
          </div>
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>

        {authData.pages && authData.pages.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Building2 className="w-4 h-4 mr-2" />
              Available Pages ({authData.pages.length})
            </h4>
            <div className="space-y-2">
              {authData.pages.map((page) => (
                <div key={page.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  {page.logo_url ? (
                    <img src={page.logo_url} alt={page.name} className="w-8 h-8 rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{page.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{page.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidateToken}
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Validate Token'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Disconnect
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="text-center">
        <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Linkedin className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2">Connect LinkedIn</h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect your LinkedIn account to post to your profile and manage your company pages.
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Post to your LinkedIn profile
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Manage company pages
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            Schedule posts
          </div>
        </div>

        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Linkedin className="w-4 h-4 mr-2" />
              Connect LinkedIn
            </>
          )}
        </Button>

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

export default LinkedInConnect;
