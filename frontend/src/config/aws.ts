/**
 * AWS Configuration for Frontend
 * Handles both development and production environments
 */

interface AWSConfig {
  region: string;
  s3Bucket: string;
  apiUrl: string;
  cognitoUserPoolId?: string;
  cognitoClientId?: string;
  amplifyAppId?: string;
}

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const awsConfig: AWSConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-2',
  s3Bucket: import.meta.env.VITE_AWS_S3_BUCKET || 'socials-aws-1',
  apiUrl: isDevelopment 
    ? 'http://localhost:8000'
    : import.meta.env.VITE_API_URL || 'https://api.socials.dataopslabs.com',
  
  // Cognito configuration (for future authentication)
  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  
  // Amplify configuration
  amplifyAppId: import.meta.env.VITE_AMPLIFY_APP_ID,
};

// Environment validation
if (isProduction) {
  const requiredEnvVars = ['VITE_AWS_REGION', 'VITE_AWS_S3_BUCKET', 'VITE_API_URL'];
  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

export default awsConfig;
