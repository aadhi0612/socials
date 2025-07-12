"""
Enhanced AWS Configuration for Serverless Deployment
Supports both local development and AWS Lambda/Amplify environments
"""
import boto3
import os
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class AWSConfig:
    def __init__(self):
        self.is_lambda = self._is_lambda_environment()
        self.region = os.getenv("DEFAULT_REGION", "us-east-2")
        self.bedrock_region = os.getenv("BEDROCK_REGION", "us-east-1")
        self.s3_bucket = os.getenv("S3_BUCKET", "socials-aws-1")
        
        if self.is_lambda:
            logger.info("🚀 Running in AWS Lambda/Serverless environment")
        else:
            logger.info("💻 Running in local development environment")
            self._validate_local_credentials()
    
    def _is_lambda_environment(self) -> bool:
        """Check if running in AWS Lambda environment"""
        return bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))
    
    def _validate_local_credentials(self):
        """Validate local development credentials"""
        # For local development, check if AWS credentials are available
        access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        
        if not access_key_id or not secret_access_key:
            logger.warning("⚠️ AWS credentials not found in environment variables for local development")
        else:
            logger.info(f"✅ Local AWS credentials configured for region: {self.region}")
        
        # Log session token status for temporary credentials
        if os.getenv("AWS_SESSION_TOKEN"):
            logger.info("🔑 Using temporary credentials with session token")
    
    def get_session(self, region=None):
        """Get boto3 session with appropriate credentials"""
        target_region = region or self.region
        
        if self.is_lambda:
            # In Lambda, use IAM roles automatically
            return boto3.Session(region_name=target_region)
        else:
            # Local development with explicit credentials (if available)
            access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
            secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
            
            if access_key_id and secret_access_key:
                session_kwargs = {
                    'aws_access_key_id': access_key_id,
                    'aws_secret_access_key': secret_access_key,
                    'region_name': target_region
                }
                
                # Add session token for temporary credentials
                if os.getenv("AWS_SESSION_TOKEN"):
                    session_kwargs['aws_session_token'] = os.getenv("AWS_SESSION_TOKEN")
                
                return boto3.Session(**session_kwargs)
            else:
                # Fallback to default credentials (IAM roles, profiles, etc.)
                return boto3.Session(region_name=target_region)
    
    def get_client(self, service_name, region=None):
        """Get boto3 client for a specific service"""
        session = self.get_session(region)
        return session.client(service_name)
    
    def get_resource(self, service_name, region=None):
        """Get boto3 resource for a specific service"""
        session = self.get_session(region)
        return session.resource(service_name)
    
    # Service-specific client getters
    def get_s3_client(self):
        """Get S3 client"""
        return self.get_client('s3')
    
    def get_dynamodb_client(self):
        """Get DynamoDB client"""
        return self.get_client('dynamodb')
    
    def get_dynamodb_resource(self):
        """Get DynamoDB resource"""
        return self.get_resource('dynamodb')
    
    def get_bedrock_client(self):
        """Get Bedrock client"""
        return self.get_client('bedrock-runtime', self.bedrock_region)
    
    def get_secrets_manager_client(self):
        """Get Secrets Manager client"""
        return self.get_client('secretsmanager')
    
    def get_lambda_client(self):
        """Get Lambda client"""
        return self.get_client('lambda')
    
    def get_apigateway_client(self):
        """Get API Gateway client"""
        return self.get_client('apigateway')
    
    def get_cognito_client(self):
        """Get Cognito client"""
        return self.get_client('cognito-idp')
    
    def get_cloudwatch_client(self):
        """Get CloudWatch client"""
        return self.get_client('cloudwatch')
    
    def test_connection(self):
        """Test AWS connection and permissions"""
        try:
            # Test S3 access
            s3_client = self.get_s3_client()
            s3_client.list_buckets()
            logger.info("✅ S3 connection successful")
            
            # Test DynamoDB access
            dynamodb_client = self.get_dynamodb_client()
            dynamodb_client.list_tables()
            logger.info("✅ DynamoDB connection successful")
            
            # Test Bedrock access
            try:
                bedrock_client = self.get_bedrock_client()
                bedrock_client.list_foundation_models()
                logger.info("✅ Bedrock connection successful")
            except Exception as e:
                logger.warning(f"⚠️ Bedrock connection failed: {e}")
            
            # Test Secrets Manager access
            try:
                secrets_client = self.get_secrets_manager_client()
                secrets_client.list_secrets(MaxResults=1)
                logger.info("✅ Secrets Manager connection successful")
            except Exception as e:
                logger.warning(f"⚠️ Secrets Manager connection failed: {e}")
            
            return True
            
        except ClientError as e:
            logger.error(f"❌ AWS connection failed: {e}")
            return False
        except Exception as e:
            logger.error(f"❌ Unexpected error testing AWS connection: {e}")
            return False
    
    def get_environment_info(self):
        """Get environment information for debugging"""
        return {
            "is_lambda": self.is_lambda,
            "region": self.region,
            "bedrock_region": self.bedrock_region,
            "s3_bucket": self.s3_bucket,
            "has_session_token": bool(os.getenv("AWS_SESSION_TOKEN")),
            "lambda_function_name": os.getenv("AWS_LAMBDA_FUNCTION_NAME"),
            "execution_env": os.getenv("AWS_EXECUTION_ENV")
        }

# Global AWS config instance
aws_config = AWSConfig()
