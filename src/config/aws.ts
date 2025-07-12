/**
 * AWS Configuration for Frontend - Production Ready
 */

interface AWSConfig {
  region: string;
  s3Bucket: string;
  apiUrl: string;
}

// Simple production configuration
export const awsConfig: AWSConfig = {
  region: 'us-east-2',
  s3Bucket: 'socials-aws-1',
  apiUrl: 'https://socials.dataopslabs.com/api',
};

export default awsConfig;
