const API_URL = import.meta.env.VITE_API_URL || 'https://wi6uxcbvs9.execute-api.us-east-2.amazonaws.com/prod';

export const initiateOAuth = async (platform, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/oauth-posts/auth/${platform}/connect?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to initiate OAuth');
    }

    return await response.json();
  } catch (error) {
    console.error('OAuth initiation error:', error);
    throw error;
  }
};

export const postToSocialMediaOAuth = async (postData) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/oauth-posts/immediate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to post to social media');
    }

    return await response.json();
  } catch (error) {
    console.error('OAuth social media posting error:', error);
    throw error;
  }
};

export const getConnectedAccounts = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/oauth-posts/accounts/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get connected accounts');
    }

    return await response.json();
  } catch (error) {
    console.error('Get connected accounts error:', error);
    throw error;
  }
};

export const disconnectAccount = async (accountId, userId) => {
  try {
    const response = await fetch(`${API_URL}/api/v1/oauth-posts/accounts/${accountId}?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to disconnect account');
    }

    return await response.json();
  } catch (error) {
    console.error('Disconnect account error:', error);
    throw error;
  }
};

export const testLinkedInConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/oauth-posts/test-linkedin-connection`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to test LinkedIn connection');
    }

    return await response.json();
  } catch (error) {
    console.error('LinkedIn connection test error:', error);
    throw error;
  }
};
