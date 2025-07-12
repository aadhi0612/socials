# 🚀 Socials - AI-Powered Social Media Management Platform

**Live at: [https://socials.dataopslabs.com](https://socials.dataopslabs.com)**

A full-stack social media application with React frontend and FastAPI backend, featuring AI content generation and multi-platform posting.

## ✨ Features

- 🤖 **AI Content Generation** - Powered by Amazon Bedrock
- 📱 **Multi-Platform Posting** - Twitter/X and LinkedIn integration  
- 🔐 **Secure Authentication** - JWT-based user management
- 📊 **Media Management** - S3-powered image storage
- 🎨 **Modern UI** - React + TypeScript + Tailwind CSS
- ☁️ **Serverless Architecture** - AWS Amplify + Lambda deployment

## 🏗️ Architecture

```
Frontend (React + Vite)     Backend (FastAPI)        AWS Services
├── Content Creation    →   ├── AI Generation    →   ├── Bedrock (AI)
├── Media Upload        →   ├── Social Posting   →   ├── S3 (Storage)
├── User Management     →   ├── Authentication   →   ├── DynamoDB (Database)
└── Platform Integration→   └── OAuth Flow       →   └── Lambda (Serverless)
```

## 🌐 Live Platform

### **Production URLs:**
- **Website**: https://socials.dataopslabs.com
- **API**: https://socials.dataopslabs.com/api
- **Status**: 🟢 **LIVE & OPERATIONAL**

### **User Features:**
- ✅ **Create Account** - Simple registration process
- ✅ **AI Content Generation** - Generate posts with Amazon Bedrock
- ✅ **Twitter Integration** - Direct posting to Twitter/X
- ✅ **LinkedIn OAuth** - Connect and post to LinkedIn
- ✅ **Media Upload** - Add images to your posts
- ✅ **Multi-Platform** - Post to both platforms simultaneously

## 🚀 Quick Start (Development)

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
npm install
npm run dev
```

## 🔧 Development Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📱 Social Media Integration

### **Twitter/X** ✅
- **Status**: Fully Working
- **Method**: Direct API posting
- **Features**: Text posts, media upload, real-time posting

### **LinkedIn** 🔗
- **Status**: OAuth Ready
- **Method**: OAuth 2.0 flow
- **Setup**: Redirect URI configured for production
- **Redirect URI**: `https://socials.dataopslabs.com/api/v1/oauth-posts/auth/linkedin/callback`

## 🚀 Production Deployment

### **Automated Deployment**
```bash
./deploy.sh
```

### **Manual Deployment**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**AWS Amplify automatically builds and deploys on every push to main branch.**

## 📁 Project Structure

```
socials/
├── 📄 README.md           # This file
├── 🚀 deploy.sh           # Production deployment script
├── 🚀 start.sh            # Development startup script
├── ⚙️ amplify.yml         # AWS Amplify build configuration
├── 🎨 public/             # Static assets (favicon, etc.)
├── 📁 src/                # Frontend source code
│   ├── 📁 components/     # Reusable UI components
│   ├── 📁 pages/          # Application pages
│   ├── 📁 api/            # API integration
│   └── 📁 config/         # Configuration files
├── 📁 backend/            # FastAPI backend
│   ├── 📁 app/            # Application code
│   │   ├── 📁 api/        # API endpoints
│   │   ├── 📁 services/   # Business logic
│   │   ├── 📁 routers/    # Route handlers
│   │   └── 📁 schemas/    # Data models
│   ├── 📄 requirements.txt # Python dependencies
│   └── 📄 lambda_handler.py # AWS Lambda entry point
├── 📄 package.json        # Frontend dependencies
└── 📄 .env                # Environment variables
```

## 🛠️ Technology Stack

### **Frontend:**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### **Backend:**
- **FastAPI** - Python web framework
- **Pydantic** - Data validation
- **Boto3** - AWS SDK
- **Tweepy** - Twitter API
- **Requests** - HTTP client

### **AWS Services:**
- **Amplify** - Frontend hosting & CI/CD
- **Lambda** - Serverless backend
- **S3** - File storage
- **Bedrock** - AI content generation
- **DynamoDB** - Database
- **API Gateway** - API management

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure user sessions
- ✅ **OAuth 2.0** - Social media platform integration
- ✅ **Environment Variables** - Secure credential storage
- ✅ **CORS Configuration** - Cross-origin request security
- ✅ **Input Validation** - Data sanitization
- ✅ **AWS IAM Roles** - Secure cloud permissions

## 📊 Current Status

- **Frontend**: 🟢 **DEPLOYED & WORKING**
- **Backend API**: 🟢 **DEPLOYED & WORKING**
- **Twitter Integration**: 🟢 **FULLY FUNCTIONAL**
- **LinkedIn Integration**: 🟢 **OAUTH CONFIGURED**
- **AI Content Generation**: 🟢 **WORKING**
- **Media Upload**: 🟢 **WORKING**
- **User Authentication**: 🟢 **WORKING**

## 🎯 How to Use

1. **Visit**: https://socials.dataopslabs.com
2. **Create Account** - Simple registration
3. **Connect Social Media** - Link Twitter and/or LinkedIn
4. **Generate Content** - Use AI to create posts
5. **Add Media** - Upload images (optional)
6. **Post** - Share to multiple platforms simultaneously

## 🆘 Support & Troubleshooting

### **Common Issues:**
1. **API Connection** - Check network connectivity
2. **Social Media Auth** - Ensure accounts are properly connected
3. **Content Generation** - Verify AI service availability

### **Development Support:**
- **API Documentation**: http://localhost:8000/docs (development)
- **Build Logs**: Check Amplify console for deployment issues
- **Environment Variables**: Verify all required variables are set

## 🔄 Updates & Maintenance

The platform is automatically updated when changes are pushed to the main branch. AWS Amplify handles:
- ✅ **Automatic builds**
- ✅ **Zero-downtime deployments**
- ✅ **SSL certificate management**
- ✅ **CDN distribution**
- ✅ **Environment management**

---

**🎉 Built with ❤️ using React, FastAPI, and AWS**

**Ready to revolutionize your social media management!** 🚀
