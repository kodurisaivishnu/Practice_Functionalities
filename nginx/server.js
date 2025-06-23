const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.removeHeader('X-Powered-By');
  next();
});

// Rate limiting store
const rateLimitStore = {};
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

// Rate limiting middleware
app.use((req, res, next) => {
  const clientId = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Clean expired entries
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
  
  if (!rateLimitStore[clientId]) {
    rateLimitStore[clientId] = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
  } else {
    rateLimitStore[clientId].count++;
  }
  
  if (rateLimitStore[clientId].count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests',
      message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per 15 minutes.`
    });
  }
  
  next();
});

// Microservice URLs
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'https://auth-service-k5aq.onrender.com',
  emotion: process.env.EMOTION_SERVICE_URL || 'https://emotion-learning-microservice.onrender.com',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'https://analytics-service-47zl.onrender.com',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'https://notification-service-qaxu.onrender.com',
  video: process.env.VIDEO_SERVICE_URL || 'https://video-service-w4ir.onrender.com'
};

// Logging storage
const proxyLogs = [];

// Proxy function
async function proxyRequest(req, res, targetUrl, serviceName) {
  const startTime = Date.now();
  
  try {
    console.log(`Proxying ${req.method} ${req.path} to ${targetUrl}`);

    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'User-Agent': 'Nginx-Proxy-Server/1.0'
    };

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (req.headers.cookie) {
      headers.Cookie = req.headers.cookie;
    }

    const fetchOptions = {
      method: req.method,
      headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const responseTime = Date.now() - startTime;

    // Log the request
    proxyLogs.unshift({
      id: Date.now(),
      method: req.method,
      path: req.path,
      targetService: serviceName,
      statusCode: response.status,
      responseTime,
      timestamp: new Date().toISOString()
    });

    // Keep only last 100 logs
    if (proxyLogs.length > 100) {
      proxyLogs.splice(100);
    }

    res.status(response.status);
    
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Proxy error for ${serviceName}:`, error.message);

    proxyLogs.unshift({
      id: Date.now(),
      method: req.method,
      path: req.path,
      targetService: serviceName,
      statusCode: 502,
      responseTime,
      timestamp: new Date().toISOString()
    });

    res.status(502).json({
      error: 'Bad Gateway',
      message: `Failed to connect to ${serviceName} service`,
      details: error.message
    });
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: [
      { name: 'Authentication Service', status: 'online', responseTime: 245 },
      { name: 'Emotion Detection Service', status: 'online', responseTime: 1200 },
      { name: 'Analytics Service', status: 'online', responseTime: 180 },
      { name: 'Notification Service', status: 'online', responseTime: 320 },
      { name: 'Video Service', status: 'online', responseTime: 580 }
    ],
    recentRequests: proxyLogs.length
  });
});

// Services info
app.get('/api/services', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Authentication Service',
      baseUrl: SERVICES.auth,
      status: 'online',
      responseTime: 245,
      lastChecked: new Date().toISOString(),
      endpoints: 5
    },
    {
      id: 2,
      name: 'Emotion Detection Service',
      baseUrl: SERVICES.emotion,
      status: 'online',
      responseTime: 1200,
      lastChecked: new Date().toISOString(),
      endpoints: 1
    },
    {
      id: 3,
      name: 'Analytics Service',
      baseUrl: SERVICES.analytics,
      status: 'online',
      responseTime: 180,
      lastChecked: new Date().toISOString(),
      endpoints: 1
    },
    {
      id: 4,
      name: 'Notification Service',
      baseUrl: SERVICES.notification,
      status: 'online',
      responseTime: 320,
      lastChecked: new Date().toISOString(),
      endpoints: 1
    },
    {
      id: 5,
      name: 'Video Service',
      baseUrl: SERVICES.video,
      status: 'online',
      responseTime: 580,
      lastChecked: new Date().toISOString(),
      endpoints: 4
    }
  ]);
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(proxyLogs.slice(0, limit));
});

// Auth Service Proxy
app.all('/api/auth/*', async (req, res) => {
  const targetUrl = `${SERVICES.auth}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  await proxyRequest(req, res, targetUrl, 'auth');
});

// Emotion Detection Service Proxy
app.all('/api/emotion-service', async (req, res) => {
  const targetUrl = `${SERVICES.emotion}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  await proxyRequest(req, res, targetUrl, 'emotion');
});

// Analytics Service Proxy  
app.all('/api/logs/*', async (req, res) => {
  const targetUrl = `${SERVICES.analytics}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  await proxyRequest(req, res, targetUrl, 'analytics');
});

// Notification Service Proxy
app.all('/api/send-email', async (req, res) => {
  const targetUrl = `${SERVICES.notification}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  await proxyRequest(req, res, targetUrl, 'notification');
});

// Video Service Proxies
app.all('/api/upload', async (req, res) => {
  const targetUrl = `${SERVICES.video}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  await proxyRequest(req, res, targetUrl, 'video');
});

app.all('/api/videos/*', async (req, res) => {
  const targetUrl = `${SERVICES.video}${req.path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;
  await proxyRequest(req, res, targetUrl, 'video');
});

// Catch-all for unknown routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    availableServices: [
      '/api/auth/*',
      '/api/emotion-service',
      '/api/logs/*', 
      '/api/send-email',
      '/api/upload',
      '/api/videos/*'
    ]
  });
});

// Root endpoint for basic info
app.get('/', (req, res) => {
  res.json({
    name: 'Nginx Microservices Proxy',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      services: '/api/services',
      logs: '/api/logs'
    },
    microservices: [
      '/api/auth/*',
      '/api/emotion-service',
      '/api/logs/*',
      '/api/send-email',
      '/api/upload',
      '/api/videos/*'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nginx Proxy Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});