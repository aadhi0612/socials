/**
 * AWS Configuration for Frontend - Production Ready
 */

interface AWSConfig {
  region: string;
  s3Bucket: string;
  apiUrl: string;
}

// Production configuration with deployed API Gateway
export const awsConfig: AWSConfig = {
  region: 'us-east-2',
  s3Bucket: 'socials-aws-1',
  apiUrl: 'https://wi6uxcbvs9.execute-api.us-east-2.amazonaws.com/prod',
};

export default awsConfig;
