#!/usr/bin/env python3
"""
Setup script to store social media platform credentials in AWS Secrets Manager
"""
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.services.aws_secrets import secrets_manager

def load_credentials_from_env():
    """Load credentials from the .env.social-credentials file"""
    env_file = os.path.join(os.path.dirname(__file__), '.env.social-credentials')
    
    if not os.path.exists(env_file):
        print(f"Error: {env_file} not found!")
        print("Please ensure your social media credentials are stored in .env.social-credentials")
        return None
    
    # Load environment variables from the file
    load_dotenv(env_file)
    
    credentials = {}
    
    # X (Twitter) credentials
    if os.getenv('X_API_KEY'):
        credentials['twitter'] = {
            'api_key': os.getenv('X_API_KEY'),
            'api_secret': os.getenv('X_API_KEY_SECRET'),
            'bearer_token': os.getenv('X_BEARER_TOKEN'),
            'access_token': os.getenv('X_ACCESS_TOKEN'),
            'access_token_secret': os.getenv('X_ACCESS_TOKEN_SECRET')
        }
    
    # LinkedIn credentials
    if os.getenv('LINKEDIN_CLIENT_ID'):
        credentials['linkedin'] = {
            'client_id': os.getenv('LINKEDIN_CLIENT_ID'),
            'client_secret': os.getenv('LINKEDIN_CLIENT_SECRET')
        }
    
    return credentials

def store_credentials_in_aws():
    """Store credentials in AWS Secrets Manager"""
    print("Loading credentials from .env.social-credentials...")
    
    credentials = load_credentials_from_env()
    if not credentials:
        return False
    
    print(f"Found credentials for platforms: {list(credentials.keys())}")
    
    try:
        for platform, creds in credentials.items():
            print(f"Storing {platform} credentials in AWS Secrets Manager...")
            
            secret_name = f"social-platform-credentials/{platform}"
            arn = secrets_manager.store_secret(secret_name, creds)
            
            print(f"✅ {platform} credentials stored successfully")
            print(f"   Secret ARN: {arn}")
        
        print("\n🎉 All credentials stored successfully in AWS Secrets Manager!")
        print("\nYour social media API is now ready to use.")
        print("\nNext steps:")
        print("1. Start your backend server: cd backend && uvicorn app.main:app --reload")
        print("2. Start the scheduler: cd backend && python app/scheduler_job.py")
        print("3. Access the API docs at: http://localhost:8000/docs")
        
        return True
        
    except Exception as e:
        print(f"❌ Error storing credentials: {e}")
        print("\nPlease check:")
        print("1. AWS credentials are configured (aws configure)")
        print("2. You have permissions to create secrets in AWS Secrets Manager")
        print("3. Your AWS region is set correctly")
        return False

def main():
    print("🔐 Social Media API Credentials Setup")
    print("=====================================")
    print()
    
    # Check if AWS credentials are configured
    try:
        import boto3
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        print(f"AWS Account: {identity['Account']}")
        print(f"AWS User/Role: {identity['Arn']}")
        print()
    except Exception as e:
        print("❌ AWS credentials not configured or invalid")
        print("Please run 'aws configure' to set up your AWS credentials")
        return
    
    success = store_credentials_in_aws()
    
    if success:
        print("\n✨ Setup completed successfully!")
    else:
        print("\n❌ Setup failed. Please check the errors above.")

if __name__ == "__main__":
    main()
