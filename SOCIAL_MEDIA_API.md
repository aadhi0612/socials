# Cross-Platform Social Media API

A comprehensive Python-based API for posting content to LinkedIn, Instagram, and Twitter/X with full scheduling, authentication, and analytics capabilities.

## 🚀 Features

- **Multi-Platform Support**: LinkedIn, Instagram (Business), Twitter/X
- **OAuth Authentication**: Secure user authentication for each platform
- **Post Scheduling**: Schedule posts for future publishing
- **Media Support**: Text and image posting
- **Analytics Collection**: Fetch engagement metrics from each platform
- **Secure Credential Storage**: AWS Secrets Manager integration
- **Background Processing**: Automated post execution via scheduler

## 🏗️ Architecture

### Core Components

1. **Platform Integrations** (`/services/social_platforms/`)
   - `base.py`: Abstract base class for all platforms
   - `linkedin.py`: LinkedIn API integration
   - `instagram.py`: Instagram Graph API integration  
   - `twitter.py`: Twitter/X API integration

2. **Authentication System** (`/routers/social_auth.py`)
   - OAuth flow management
   - Token storage and validation
   - Account connection/disconnection

3. **Post Management** (`/routers/social_posts.py`)
   - Post scheduling and immediate posting
   - Analytics collection and refresh
   - Post status management

4. **Scheduler Service** (`/services/scheduler.py`)
   - Background job execution
   - Post queue management
   - Error handling and retry logic

5. **Security Layer** (`/services/aws_secrets.py`)
   - AWS Secrets Manager integration
   - Secure credential storage and retrieval

## 📋 Prerequisites

### Platform Requirements

1. **LinkedIn Developer Account**
   - Create app at [LinkedIn Developer Portal](https://www.linkedin.com/developers)
   - Required scopes: `r_liteprofile`, `r_emailaddress`, `w_member_social`

2. **Instagram Business Account**
   - Facebook Developer account and app
   - Instagram Business account connected to Facebook Page
   - Required permissions: `instagram_basic`, `instagram_content_publish`

3. **Twitter Developer Account**
   - Create app at [Twitter Developer Portal](https://developer.twitter.com)
   - API v1.1 access for posting
   - Required permissions: Read and Write

### System Requirements

- Python 3.8+
- AWS Account with Secrets Manager access
- PostgreSQL or SQLite database

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

### 3. Store Platform Credentials

Your credentials are already stored in `.env.social-credentials`. Run the setup script:

```bash
python setup_credentials.py
```

This will securely store your platform credentials in AWS Secrets Manager.

### 4. Database Setup

The API uses SQLAlchemy with automatic table creation. On first run, tables will be created automatically.

For production, set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://user:password@localhost/socials_db"
```

### 5. Start the Services

**Start the API server:**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Start the scheduler (in a separate terminal):**
```bash
cd backend
python app/scheduler_job.py
```

## 📚 API Documentation

### Authentication Endpoints

#### Get OAuth URL
```http
GET /api/v1/auth/{platform}/oauth-url?redirect_uri={uri}&state={state}
```

#### Handle OAuth Callback
```http
POST /api/v1/auth/{platform}/callback
```

#### Get User's Connected Accounts
```http
GET /api/v1/auth/accounts/{user_id}
```

#### Disconnect Account
```http
DELETE /api/v1/auth/accounts/{account_id}?user_id={user_id}
```

### Posting Endpoints

#### Schedule Posts
```http
POST /api/v1/posts/schedule
Content-Type: application/json

{
  "content_text": "Hello from the API!",
  "media_urls": ["https://example.com/image.jpg"],
  "media_type": "image",
  "scheduled_for": "2025-07-09T15:00:00Z",
  "social_account_ids": [1, 2, 3]
}
```

#### Post Immediately
```http
POST /api/v1/posts/immediate
```

#### Get Scheduled Posts
```http
GET /api/v1/posts/scheduled?user_id={user_id}&status=scheduled&limit=50
```

#### Cancel Scheduled Post
```http
DELETE /api/v1/posts/{post_id}?user_id={user_id}
```

#### Get Post Analytics
```http
GET /api/v1/posts/{post_id}/analytics?user_id={user_id}
```

#### Refresh Analytics
```http
POST /api/v1/posts/{post_id}/refresh-analytics?user_id={user_id}
```

## 🔐 Security Features

### AWS Secrets Manager Integration

- **Platform Credentials**: Stored as `social-platform-credentials/{platform}`
- **User Tokens**: Stored as `social-tokens/{platform}/{user_id}`
- **Automatic Encryption**: All secrets encrypted at rest
- **Access Control**: IAM-based access control

### Token Management

- **Validation**: Tokens validated before each API call
- **Refresh**: Automatic token refresh where supported
- **Expiration**: Token expiration tracking and handling

## 📊 Platform-Specific Details

### LinkedIn

- **API Version**: v2
- **Media Support**: Images (JPEG, PNG)
- **Upload Process**: 2-step (register upload → upload media → create post)
- **Analytics**: Likes, comments, shares (requires additional permissions)
- **Rate Limits**: Varies by API endpoint

### Instagram

- **API**: Facebook Graph API v18.0
- **Account Type**: Business accounts only
- **Media Support**: Images (JPEG only)
- **Upload Process**: 2-step (create container → publish)
- **Analytics**: Likes, comments, impressions, reach
- **Rate Limits**: 25 posts per day

### Twitter/X

- **API Version**: v1.1 (for posting)
- **Authentication**: OAuth 1.0a
- **Media Support**: Images, videos
- **Upload Process**: Upload media → create tweet
- **Analytics**: Likes, retweets, basic engagement
- **Rate Limits**: 300 tweets per 15-minute window

## 🔄 Scheduler System

### How It Works

1. **Post Storage**: Scheduled posts stored in database
2. **Background Job**: Runs every 5 minutes checking for due posts
3. **Execution**: Posts executed using stored OAuth tokens
4. **Status Tracking**: Success/failure status and error messages tracked
5. **Analytics**: Post-execution analytics collection

### Scheduler Configuration

The scheduler runs as a separate process using APScheduler:

```python
# Run every 5 minutes
scheduler.add_job(
    run_scheduler_job,
    trigger=IntervalTrigger(minutes=5),
    id='post_scheduler'
)
```

### Error Handling

- **Token Validation**: Tokens validated before posting
- **Retry Logic**: Failed posts marked with error messages
- **Logging**: Comprehensive logging for debugging
- **Status Updates**: Real-time status updates in database

## 🧪 Testing

### Manual Testing

1. **Start the API**: `uvicorn app.main:app --reload`
2. **Access Docs**: Visit `http://localhost:8000/docs`
3. **Test OAuth**: Use the authentication endpoints
4. **Schedule Posts**: Create test posts
5. **Check Scheduler**: Monitor scheduler logs

### API Testing with curl

```bash
# Get OAuth URL
curl "http://localhost:8000/api/v1/auth/linkedin/oauth-url?redirect_uri=http://localhost:3000/callback"

# Schedule a post
curl -X POST "http://localhost:8000/api/v1/posts/schedule?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "content_text": "Test post from API",
    "social_account_ids": [1]
  }'
```

## 🚀 Deployment

### Production Considerations

1. **Database**: Use PostgreSQL for production
2. **Secrets**: Ensure AWS Secrets Manager permissions
3. **Scheduler**: Run scheduler as a service/daemon
4. **Monitoring**: Implement logging and monitoring
5. **Rate Limits**: Implement rate limiting for API endpoints

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# AWS
AWS_DEFAULT_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# API
API_HOST=0.0.0.0
API_PORT=8000
```

## 📈 Analytics & Monitoring

### Available Metrics

- **Engagement**: Likes, comments, shares
- **Reach**: Impressions, reach (platform-dependent)
- **Performance**: Post success/failure rates
- **Platform-Specific**: Custom metrics per platform

### Monitoring

- **Scheduler Logs**: Monitor scheduler execution
- **API Logs**: Track API usage and errors
- **Database**: Monitor post status and analytics
- **AWS CloudWatch**: Monitor Secrets Manager usage

## 🤝 Contributing

### Code Structure

- Follow existing patterns in platform integrations
- Add comprehensive error handling
- Include logging for debugging
- Update documentation for new features

### Adding New Platforms

1. Create new platform class inheriting from `BaseSocialPlatform`
2. Implement all abstract methods
3. Add platform to router configurations
4. Update documentation

## 📄 License

This project is part of the Socials application. See the main README for license information.

## 🆘 Troubleshooting

### Common Issues

1. **AWS Credentials**: Ensure AWS CLI is configured
2. **Platform Permissions**: Check OAuth scopes and app permissions
3. **Token Expiration**: Monitor token validity and refresh
4. **Rate Limits**: Implement backoff strategies
5. **Media URLs**: Ensure media URLs are publicly accessible

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review scheduler logs
3. Verify AWS Secrets Manager permissions
4. Test OAuth flows manually

---

**Built with ❤️ for seamless cross-platform social media management**
