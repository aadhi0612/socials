"""
AWS Secrets Manager integration for secure credential storage
"""
import boto3
import json
import logging
from typing import Dict, Any, Optional
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

class AWSSecretsManager:
    def __init__(self, region_name: str = "us-east-2"):
        self.client = boto3.client('secretsmanager', region_name=region_name)
        self.region_name = region_name
    
    def store_secret(self, secret_name: str, secret_value: Dict[str, Any]) -> str:
        """
        Store a secret in AWS Secrets Manager
        Returns the ARN of the created secret
        """
        try:
            response = self.client.create_secret(
                Name=secret_name,
                SecretString=json.dumps(secret_value),
                Description=f"Social media API credentials for {secret_name}"
            )
            logger.info(f"Secret {secret_name} created successfully")
            return response['ARN']
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceExistsException':
                # Secret already exists, update it
                return self.update_secret(secret_name, secret_value)
            else:
                logger.error(f"Error creating secret {secret_name}: {e}")
                raise
    
    def update_secret(self, secret_name: str, secret_value: Dict[str, Any]) -> str:
        """
        Update an existing secret in AWS Secrets Manager
        """
        try:
            response = self.client.update_secret(
                SecretId=secret_name,
                SecretString=json.dumps(secret_value)
            )
            logger.info(f"Secret {secret_name} updated successfully")
            return response['ARN']
        except ClientError as e:
            logger.error(f"Error updating secret {secret_name}: {e}")
            raise
    
    def get_secret(self, secret_name_or_arn: str) -> Dict[str, Any]:
        """
        Retrieve a secret from AWS Secrets Manager
        """
        try:
            response = self.client.get_secret_value(SecretId=secret_name_or_arn)
            secret_string = response['SecretString']
            return json.loads(secret_string)
        except ClientError as e:
            logger.error(f"Error retrieving secret {secret_name_or_arn}: {e}")
            raise
    
    def delete_secret(self, secret_name_or_arn: str, force_delete: bool = False) -> bool:
        """
        Delete a secret from AWS Secrets Manager
        """
        try:
            if force_delete:
                self.client.delete_secret(
                    SecretId=secret_name_or_arn,
                    ForceDeleteWithoutRecovery=True
                )
            else:
                self.client.delete_secret(SecretId=secret_name_or_arn)
            
            logger.info(f"Secret {secret_name_or_arn} deleted successfully")
            return True
        except ClientError as e:
            logger.error(f"Error deleting secret {secret_name_or_arn}: {e}")
            return False
    
    def store_user_tokens(self, user_id: int, platform: str, tokens: Dict[str, Any]) -> str:
        """
        Store user's OAuth tokens for a specific platform
        """
        secret_name = f"social-tokens/{platform}/{user_id}"
        return self.store_secret(secret_name, tokens)
    
    def get_user_tokens(self, user_id: int, platform: str) -> Dict[str, Any]:
        """
        Retrieve user's OAuth tokens for a specific platform
        """
        secret_name = f"social-tokens/{platform}/{user_id}"
        return self.get_secret(secret_name)
    
    def get_platform_credentials(self, platform: str) -> Dict[str, Any]:
        """
        Get platform API credentials (client ID, client secret, etc.)
        """
        secret_name = f"social-platform-credentials/{platform}"
        return self.get_secret(secret_name)

# Global instance
secrets_manager = AWSSecretsManager()
