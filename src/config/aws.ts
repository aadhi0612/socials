/**
 * AWS Configuration for Frontend - Production Ready
 */

interface AWSConfig {
  region: string;
  s3Bucket: string;
  apiUrl: string;
}

// Get environment - check multiple ways
const isDevelopment = import.meta.env.DEV || 
                     import.meta.env.MODE === 'development' || 
                     window.location.hostname === 'localhost';

const isProduction = import.meta.env.PROD || 
                    import.meta.env.MODE === 'production' || 
                    window.location.hostname !== 'localhost';

// Production configuration with deployed API Gateway
export const awsConfig: AWSConfig = {
  region: 'us-east-2',
  s3Bucket: 'socials-aws-1',
  // Always use production API Gateway URL
  apiUrl: 'https://wi6uxcbvs9.execute-api.us-east-2.amazonaws.com/prod',
};

// Debug logging
console.log('🔧 Environment Detection:');
console.log('  - isDevelopment:', isDevelopment);
console.log('  - isProduction:', isProduction);
console.log('  - hostname:', window.location.hostname);
console.log('  - import.meta.env.MODE:', import.meta.env.MODE);
console.log('🌐 AWS Config loaded:', awsConfig);
console.log('🚀 API URL being used:', awsConfig.apiUrl);

export default awsConfig;
