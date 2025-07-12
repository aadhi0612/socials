const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const postToSocialMedia = async (postData) => {
  try {
    console.log('Posting to social media:', postData);
    console.log('API URL:', `${API_URL}/api/v1/direct-posts/immediate`);
    
    const response = await fetch(`${API_URL}/api/v1/direct-posts/immediate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.detail || `HTTP ${response.status}: Failed to post to social media`);
    }

    const result = await response.json();
    console.log('Post result:', result);
    return result;
  } catch (error) {
    console.error('Social media posting error:', error);
    throw error;
  }
};

export const testSocialCredentials = async () => {
  try {
    console.log('Testing credentials at:', `${API_URL}/api/v1/direct-posts/test-credentials`);
    
    const response = await fetch(`${API_URL}/api/v1/direct-posts/test-credentials`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to test credentials');
    }

    const result = await response.json();
    console.log('Credentials test result:', result);
    return result;
  } catch (error) {
    console.error('Credentials test error:', error);
    throw error;
  }
};
