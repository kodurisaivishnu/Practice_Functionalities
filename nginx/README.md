# Nginx Microservices Proxy Server

A production-ready reverse proxy server built with Node.js Express that routes and manages requests to 5 microservices. This server acts as a single entry point for all your microservices, providing load balancing, security, monitoring, and centralized logging.

## 🏗️ Architecture Overview

This proxy server provides a unified gateway to the following microservices:

### Microservices Routing Table
| Service | Endpoint Pattern | Target URL | Purpose |
|---------|------------------|------------|---------|
| **Authentication** | `/api/auth/*` | https://auth-service-k5aq.onrender.com | User authentication & JWT management |
| **Emotion Detection** | `/api/emotion-service` | https://emotion-learning-microservice.onrender.com | AI-powered emotion analysis from images |
| **Analytics** | `/api/logs/*` | https://analytics-service-47zl.onrender.com | Student emotion & attention data logging |
| **Notification** | `/api/send-email` | https://notification-service-qaxu.onrender.com | Email notification service |
| **Video Management** | `/api/videos/*`, `/api/upload` | https://video-service-w4ir.onrender.com | Video upload, management & interaction |

## ✨ Key Features & Benefits

### 🔒 Security & Protection
- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **Security Headers**: X-Frame-Options, XSS Protection, Content Security Policy
- **CORS Management**: Configurable cross-origin resource sharing
- **Request Validation**: Input sanitization and validation

### 📊 Monitoring & Observability  
- **Health Checks**: Real-time service status monitoring
- **Request Logging**: Comprehensive logging of all proxy requests
- **Performance Metrics**: Response time tracking for each service
- **Error Tracking**: Detailed error reporting and analysis

### 🚀 Performance & Reliability
- **Load Balancing**: Distributes requests across service instances
- **Failover Handling**: Graceful error handling with detailed responses
- **Connection Pooling**: Optimized HTTP connections to microservices
- **Request Buffering**: Handles large file uploads (up to 500MB for videos)

### 🔧 Developer Experience
- **Unified API Gateway**: Single endpoint for all microservices
- **Environment Configuration**: Easy service URL management
- **Development Dashboard**: Built-in monitoring interface
- **API Documentation**: Comprehensive endpoint documentation

## 🚀 Quick Start Guide

### 1. Repository Setup
```bash
git clone https://github.com/your-username/nginx-microservices-proxy.git
cd nginx-microservices-proxy
npm install
```

### 2. Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 3. Production Deployment
```bash
npm start
# Ready for deployment on Render, Heroku, or any Node.js hosting
```

## 📋 API Documentation

### System Endpoints

#### Health Check
```bash
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T15:30:00.000Z",
  "uptime": 42.567,
  "services": [
    {
      "name": "Authentication Service",
      "status": "online", 
      "responseTime": 245
    }
  ],
  "recentRequests": 25
}
```

#### Service Status
```bash
GET /api/services
```
**Response:** Array of all microservices with detailed status information.

#### Request Logs
```bash
GET /api/logs?limit=50
```
**Response:** Recent proxy request logs with performance metrics.

### Authentication Service (`/api/auth/*`)

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "student"
}
```

#### Login User  
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "securepassword"
}
```
**Response:** JWT token set as httpOnly cookie

#### Check Authentication Status
```bash
GET /api/auth/check
Cookie: [JWT token from login]
```

#### Update User Profile
```bash
PUT /api/auth/update
Cookie: [JWT token]
Content-Type: application/json

{
  "email": "newemail@example.com",
  "role": "teacher"
}
```

#### Logout
```bash
POST /api/auth/logout
Cookie: [JWT token]
```

### Emotion Detection Service (`/api/emotion-service`)

#### Analyze Emotion from Image
```bash
POST /api/emotion-service
Content-Type: multipart/form-data

image: [JPG/PNG file]
```
**Response:**
```json
{
  "emotion": "happy",
  "confidence": 0.89,
  "emotions": {
    "happy": 0.89,
    "sad": 0.05,
    "angry": 0.03,
    "neutral": 0.03
  }
}
```

### Analytics Service (`/api/logs/*`)

#### Log Emotion Data
```bash
POST /api/logs/emotion
Content-Type: application/json

{
  "studentId": "stu123",
  "emotion": "happy",
  "attention": 85,
  "timestamp": "2025-01-27T15:30:00Z"
}
```
**Response:**
```json
{
  "success": true,
  "logId": "log_456",
  "message": "Emotion data logged successfully"
}
```

### Notification Service (`/api/send-email`)

#### Send Email Notification
```bash
POST /api/send-email
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Notification Subject",
  "message": "Email body content here"
}
```
**Response:**
```json
{
  "success": true,
  "messageId": "msg_123456",
  "message": "Email sent successfully"
}
```

### Video Service (`/api/videos/*`, `/api/upload`)

#### Upload Video
```bash
POST /api/upload
Content-Type: multipart/form-data

video: [MP4/AVI file - max 500MB]
title: "Video Title"
description: "Video description"
```

#### List All Videos
```bash
GET /api/videos
```
**Response:**
```json
[
  {
    "id": "vid_123",
    "title": "Sample Video",
    "description": "A sample video",
    "url": "https://example.com/video.mp4",
    "likes": 15,
    "views": 142,
    "uploadedAt": "2025-01-27T15:30:00Z"
  }
]
```

#### Like a Video
```bash
PATCH /api/videos/{videoId}/like
```
**Example:**
```bash
PATCH /api/videos/vid_123/like
```

#### Add Video View
```bash
PATCH /api/videos/{videoId}/view
```

## 🛡️ Security Features

### Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Response**: HTTP 429 when exceeded
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY  
X-XSS-Protection: 1; mode=block
```

### CORS Configuration
```javascript
{
  "origin": "*",
  "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  "allowedHeaders": ["Content-Type", "Authorization", "Cookie"],
  "credentials": true
}
```

## 🚀 Deployment Guide

### Deploy to Render.com

1. **Create Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial proxy server setup"
   git remote add origin https://github.com/YOUR-USERNAME/nginx-proxy-server.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node

3. **Environment Variables (Optional):**
   ```env
   NODE_ENV=production
   PORT=10000
   AUTH_SERVICE_URL=https://auth-service-k5aq.onrender.com
   EMOTION_SERVICE_URL=https://emotion-learning-microservice.onrender.com
   ANALYTICS_SERVICE_URL=https://analytics-service-47zl.onrender.com
   NOTIFICATION_SERVICE_URL=https://notification-service-qaxu.onrender.com
   VIDEO_SERVICE_URL=https://video-service-w4ir.onrender.com
   ```

### Testing Deployment

After deployment, test your proxy server:

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Test authentication
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"student"}'

# Test emotion service (requires image file)
curl -X POST https://your-app.onrender.com/api/emotion-service \
  -F "image=@sample-image.jpg"
```

## 🔧 Configuration

### Environment Variables
```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Microservice URLs (defaults provided)
AUTH_SERVICE_URL=https://auth-service-k5aq.onrender.com
EMOTION_SERVICE_URL=https://emotion-learning-microservice.onrender.com
ANALYTICS_SERVICE_URL=https://analytics-service-47zl.onrender.com
NOTIFICATION_SERVICE_URL=https://notification-service-qaxu.onrender.com
VIDEO_SERVICE_URL=https://video-service-w4ir.onrender.com
```

## 📊 Benefits of Using This Proxy

### For Developers
- **Single Entry Point**: One URL for all microservices
- **Simplified Client Code**: No need to manage multiple service URLs
- **Built-in Monitoring**: Request logging and performance tracking
- **Error Handling**: Consistent error responses across all services

### For Operations
- **Centralized Logging**: All requests logged in one place
- **Security Layer**: Rate limiting and security headers applied uniformly
- **Health Monitoring**: Real-time status of all microservices
- **Easy Deployment**: Single service to deploy and manage

### For End Users  
- **Better Performance**: Optimized connection handling
- **Higher Reliability**: Failover and error recovery
- **Consistent Experience**: Uniform response formats
- **Enhanced Security**: Protection against common attacks

## 🐛 Troubleshooting

### Common Issues

**502 Bad Gateway**
- Check if target microservice is running
- Verify service URLs in environment variables
- Check network connectivity

**429 Rate Limit Exceeded**
- Wait 15 minutes for rate limit reset
- Adjust RATE_LIMIT_MAX_REQUESTS if needed
- Implement request caching in client

**CORS Errors**
- Verify CORS configuration includes your domain
- Check browser developer tools for specific CORS issues
- Ensure credentials are handled properly

### Monitoring Commands

```bash
# Check service health
curl https://your-proxy.onrender.com/api/health

# View recent logs  
curl https://your-proxy.onrender.com/api/logs?limit=10

# Check service status
curl https://your-proxy.onrender.com/api/services
```

## 📝 License

MIT License - feel free to use this proxy server in your projects.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
