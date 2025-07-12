"""
AWS Secrets Manager integration for secure credential management
"""
import boto3
import json
import os
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger(__name__)

class SecretsManager:
    def __init__(self):
        self.region = os.getenv("AWS_DEFAULT_REGION", "us-east-2")
        self.secrets_client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Secrets Manager client with proper credentials"""
        try:
            # For local development, use environment variables
            if os.getenv("AWS_ACCESS_KEY_ID"):
                session_kwargs = {
                    'aws_access_key_id': os.getenv("AWS_ACCESS_KEY_ID"),
                    'aws_secret_access_key': os.getenv("AWS_SECRET_ACCESS_KEY"),
                    'region_name': self.region
                }
                
                # Add session token if available (for temporary credentials)
                if os.getenv("AWS_SESSION_TOKEN"):
                    session_kwargs['aws_session_token'] = os.getenv("AWS_SESSION_TOKEN")
                
                session = boto3.Session(**session_kwargs)
                self.secrets_client = session.client('secretsmanager')
            else:
                # For production/Lambda, use IAM roles
                self.secrets_client = boto3.client('secretsmanager', region_name=self.region)
                
            logger.info("✅ Secrets Manager client initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Secrets Manager: {e}")
            raise
    
    def create_secret(self, secret_name: str, secret_value: dict, description: str = ""):
        """Create a new secret in AWS Secrets Manager"""
        try:
            response = self.secrets_client.create_secret(
                Name=secret_name,
                Description=description,
                SecretString=json.dumps(secret_value)
            )
            logger.info(f"✅ Created secret: {secret_name}")
            return response['ARN']
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceExistsException':
                logger.info(f"Secret {secret_name} already exists, updating...")
                return self.update_secret(secret_name, secret_value)
            else:
                logger.error(f"❌ Failed to create secret {secret_name}: {e}")
                raise
    
    def get_secret(self, secret_name: str) -> dict:
        """Retrieve a secret from AWS Secrets Manager"""
        try:
            response = self.secrets_client.get_secret_value(SecretId=secret_name)
            secret_value = json.loads(response['SecretString'])
            logger.info(f"✅ Retrieved secret: {secret_name}")
            return secret_value
        except ClientError as e:
            logger.error(f"❌ Failed to retrieve secret {secret_name}: {e}")
            raise
    
    def update_secret(self, secret_name: str, secret_value: dict):
        """Update an existing secret"""
        try:
            response = self.secrets_client.update_secret(
                SecretId=secret_name,
                SecretString=json.dumps(secret_value)
            )
            logger.info(f"✅ Updated secret: {secret_name}")
            return response['ARN']
        except ClientError as e:
            logger.error(f"❌ Failed to update secret {secret_name}: {e}")
            raise
    
    def store_social_media_credentials(self):
        """Store social media credentials securely"""
        social_credentials = {
            "twitter": {
                "api_key": os.getenv("X_API_KEY"),
                "api_key_secret": os.getenv("X_API_KEY_SECRET"),
                "bearer_token": os.getenv("X_BEARER_TOKEN"),
                "access_token": os.getenv("X_ACCESS_TOKEN"),
                "access_token_secret": os.getenv("X_ACCESS_TOKEN_SECRET")
            },
            "linkedin": {
                "client_id": os.getenv("LINKEDIN_CLIENT_ID"),
                "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET")
            }
        }
        
        return self.create_secret(
            "socials-app/social-media-credentials",
            social_credentials,
            "Social media API credentials for Socials App"
        )
    
    def get_social_media_credentials(self) -> dict:
        """Retrieve social media credentials"""
        try:
            return self.get_secret("socials-app/social-media-credentials")
        except:
            # Fallback to environment variables for local development
            logger.warning("Using environment variables for social media credentials")
            return {
                "twitter": {
                    "api_key": os.getenv("X_API_KEY"),
                    "api_key_secret": os.getenv("X_API_KEY_SECRET"),
                    "bearer_token": os.getenv("X_BEARER_TOKEN"),
                    "access_token": os.getenv("X_ACCESS_TOKEN"),
                    "access_token_secret": os.getenv("X_ACCESS_TOKEN_SECRET")
                },
                "linkedin": {
                    "client_id": os.getenv("LINKEDIN_CLIENT_ID"),
                    "client_secret": os.getenv("LINKEDIN_CLIENT_SECRET")
                }
            }

# Global secrets manager instance
secrets_manager = SecretsManager()
