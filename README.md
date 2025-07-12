# 🚀 Socials - AI-Powered Social Media Management Platform

A full-stack social media application with React frontend and FastAPI backend, featuring AI content generation and multi-platform posting.

## ✨ Features

- 🤖 **AI Content Generation** - Powered by Amazon Bedrock
- 📱 **Multi-Platform Posting** - Twitter/X and LinkedIn integration
- 🔐 **Secure Authentication** - JWT-based user management
- 📊 **Media Management** - S3-powered image storage
- 🎨 **Modern UI** - React + TypeScript + Tailwind CSS
- ☁️ **Serverless Ready** - AWS Amplify deployment

## 🏗️ Architecture

```
Frontend (React + Vite)     Backend (FastAPI)        AWS Services
├── Content Creation    →   ├── AI Generation    →   ├── Bedrock (AI)
├── Media Upload        →   ├── Social Posting   →   ├── S3 (Storage)
├── User Management     →   ├── Authentication   →   ├── DynamoDB (Database)
└── Platform Integration→   └── OAuth Flow       →   └── Secrets Manager
```

## 🚀 Quick Start

### **Option 1: One-Command Start**
```bash
./start.sh
```

### **Option 2: Manual Setup**

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Configuration

### **Environment Variables**

**Backend (.env):**
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-2
AWS_S3_BUCKET=socials-aws-1

# Social Media APIs
X_API_KEY=your_twitter_api_key
X_API_KEY_SECRET=your_twitter_secret
X_ACCESS_TOKEN=your_twitter_token
X_ACCESS_TOKEN_SECRET=your_twitter_token_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret
```

**Frontend (.env):**
```env
VITE_AWS_S3_BUCKET=socials-aws-1
VITE_API_URL=http://localhost:8000
REACT_APP_AWS_REGION=us-east-2
```

## 📱 Social Media Integration

### **Twitter/X** ✅
- **Status**: Fully Working
- **Method**: Direct API posting
- **Features**: Text posts, media upload, real-time posting

### **LinkedIn** 🔗
- **Status**: OAuth Ready
- **Method**: OAuth 2.0 flow
- **Setup Required**: Add redirect URI to LinkedIn app
- **Redirect URI**: `https://socials.dataopslabs.com/api/v1/oauth-posts/auth/linkedin/callback`

## 🔐 LinkedIn OAuth Setup

1. **Go to**: https://www.linkedin.com/developers/apps
2. **Find your app** with Client ID: `86vkop6nen6kvi`
3. **Add redirect URI**: `https://socials.dataopslabs.com/api/v1/oauth-posts/auth/linkedin/callback`
4. **Enable scopes**: `r_liteprofile`, `w_member_social`

## 🚀 Production Deployment

### **AWS Amplify**
```bash
# 1. Connect repository to Amplify
# 2. Use amplify.yml configuration
# 3. Set environment variables
# 4. Deploy automatically
```

### **Environment URLs**
- **Production**: https://socials.dataopslabs.com
- **API**: https://api.socials.dataopslabs.com

## 📁 Project Structure

```
socials/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── api/           # API integration
│   │   └── config/        # Configuration files
│   ├── package.json
│   └── .env
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── routers/       # Route handlers
│   │   └── schemas/       # Data models
│   ├── requirements.txt
│   └── .env
├── amplify.yml            # AWS Amplify configuration
├── start.sh               # Development startup script
└── README.md
```

## 🛠️ Development

### **Adding New Features**
1. **Backend**: Add endpoints in `app/api/` or `app/routers/`
2. **Frontend**: Create components in `src/components/` or pages in `src/pages/`
3. **Database**: Update schemas in `app/schemas/`
4. **API Integration**: Add functions in `src/api/`

### **Testing**
```bash
# Backend
cd backend && python -m pytest

# Frontend
cd frontend && npm test
```

## 🔒 Security

- ✅ JWT authentication
- ✅ AWS IAM roles
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Input validation
- ✅ Secure credential storage

## 📊 Current Status

- **Twitter Integration**: 🟢 Production Ready
- **LinkedIn Integration**: 🟡 OAuth Setup Required
- **AI Content Generation**: 🟢 Working
- **Media Management**: 🟢 Working
- **User Authentication**: 🟢 Working
- **AWS Deployment**: 🟢 Ready

## 🆘 Troubleshooting

### **Common Issues**
1. **CORS errors**: Check API URL in frontend .env
2. **AWS credentials**: Verify access keys and permissions
3. **LinkedIn OAuth**: Ensure redirect URI is configured
4. **Port conflicts**: Backend (8000), Frontend (5173)

### **Support**
- Check API documentation: http://localhost:8000/docs
- Review logs in browser console
- Verify environment variables

---

**Built with ❤️ using React, FastAPI, and AWS**
