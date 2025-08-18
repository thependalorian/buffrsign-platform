# Redis Integration for BuffrSign

This document outlines the comprehensive Redis integration for the BuffrSign electronic signature platform.

## Overview

Redis has been fully integrated as a multi-purpose solution for BuffrSign, providing:

- **Session Management & Authentication** - JWT blacklisting, secure sessions, rate limiting
- **Real-time Features** - Live document updates, collaborative editing, notifications
- **Caching Layer** - Performance optimization for documents, users, and API responses
- **Task Queue & Background Jobs** - Email notifications, document processing, compliance checks
- **Performance Optimization** - Database query caching, expensive computation caching
- **Compliance & Audit** - ETA 2019 compliance tracking, audit trail management

## Architecture Overview

### Frontend Redis Integration (`apps/web/`)

#### 1. `src/lib/redis.ts` - Enhanced Redis Client
Comprehensive Redis client with BuffrSign-specific functionality:
- **Session Management**: JWT blacklisting, secure session storage
- **Real-time Features**: Pub/sub for live updates, document status tracking
- **Caching System**: Multi-layer caching with TTL support
- **Task Queue**: Background job management with delayed execution
- **Rate Limiting**: API protection with configurable limits
- **User Activity**: Activity tracking and analytics
- **Document Status**: Real-time document processing status

#### 2. `src/hooks/useRealtime.ts` - Real-time Hooks
React hooks for real-time functionality:
- **useRealtime()**: Main real-time connection management
- **useDocumentRealtime()**: Document-specific real-time updates
- **WebSocket Integration**: Automatic connection handling
- **Event Management**: Real-time event processing and state updates

#### 3. `src/components/RedisExample.tsx` - Testing Component
Interactive component for Redis testing and demonstration:
- **Connection Testing**: Real-time connection status
- **Operation Testing**: Set, get, delete operations
- **Error Handling**: Comprehensive error display
- **Status Updates**: Live operation feedback

### Backend Redis Integration (`apps/api/`)

#### 4. `services/redis_service.py` - Python Redis Service
Full-featured Redis service for backend operations:
- **Session Management**: Secure session creation and validation
- **Task Queue**: Background job processing with multiple queues
- **Caching**: Intelligent caching with pattern invalidation
- **Compliance**: ETA 2019 compliance result caching
- **Notifications**: Real-time notification delivery system

#### 5. `services/task_processor.py` - Background Task Processing
Asynchronous task processing system:
- **Email Notifications**: Signature requests, reminders, completion emails
- **Document Processing**: AI analysis, PDF processing, thumbnail generation
- **Compliance Checks**: ETA 2019 compliance validation
- **Audit Trail**: Comprehensive audit logging
- **Cleanup Tasks**: System maintenance and cleanup

#### 6. `middleware/redis_middleware.py` - API Middleware
Request processing middleware:
- **Rate Limiting**: API endpoint protection
- **Request Tracking**: Performance monitoring
- **Security**: Abuse prevention and throttling

#### 7. `websocket_server.py` - Real-time Server
WebSocket server for real-time communication:
- **Connection Management**: WebSocket connection handling
- **Document Subscriptions**: Real-time document updates
- **User Notifications**: Direct user notification delivery
- **Collaboration**: Typing indicators and live collaboration

#### 8. Enhanced API Routers
Updated API endpoints with Redis integration:
- **auth.py**: Enhanced authentication with Redis session management
- **documents.py**: Document processing with caching and background tasks

## Redis Configuration

The Redis client is configured using environment variables for security:

```typescript
const redisConfig = {
    username: process.env.NEXT_PUBLIC_REDIS_USERNAME || 'default',
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD || '5fJdncoLgeYwT6W5fx9NIIQug06V10cs',
    socket: {
        host: process.env.NEXT_PUBLIC_REDIS_HOST || 'redis-19532.c232.us-east-1-2.ec2.redns.redis-cloud.com',
        port: parseInt(process.env.NEXT_PUBLIC_REDIS_PORT || '19532')
    }
};
```

### Environment Variables

Add the following to your `.env.local` file:

```bash
# Redis Configuration
NEXT_PUBLIC_REDIS_USERNAME=default
NEXT_PUBLIC_REDIS_PASSWORD=5fJdncoLgeYwT6W5fx9NIIQug06V10cs
NEXT_PUBLIC_REDIS_HOST=redis-19532.c232.us-east-1-2.ec2.redns.redis-cloud.com
NEXT_PUBLIC_REDIS_PORT=19532
```

## Usage Examples

### Session Management

```typescript
import { redis } from '../lib/redis';

// Create secure session
const sessionData = {
    userId: 'user123',
    email: 'user@example.com',
    permissions: ['read', 'write']
};
await redis.setSession('session_abc123', sessionData, 86400); // 24 hours

// Blacklist JWT token on logout
await redis.blacklistToken('jwt_token_here', 86400);

// Check if token is blacklisted
const isBlacklisted = await redis.isTokenBlacklisted('jwt_token_here');
```

### Real-time Document Updates

```typescript
import { useDocumentRealtime } from '../hooks/useRealtime';

function DocumentViewer({ documentId }) {
    const { documentStatus, activeUsers, documentEvents } = useDocumentRealtime(documentId);
    
    return (
        <div>
            <p>Status: {documentStatus}</p>
            <p>Active Users: {activeUsers.length}</p>
            <div>Recent Events: {documentEvents.map(e => e.type).join(', ')}</div>
        </div>
    );
}
```

### Caching with Performance Optimization

```typescript
import { redis } from '../lib/redis';

// Cache expensive operations
async function getDocumentWithCache(documentId: string) {
    // Try cache first
    const cached = await redis.getCache(`document:${documentId}`);
    if (cached) {
        return cached;
    }

    // Fetch from database
    const document = await fetchDocumentFromDB(documentId);
    
    // Cache for 1 hour
    await redis.cache(`document:${documentId}`, document, 3600);
    return document;
}

// Cache user profile
await redis.cache(`user:${userId}`, userProfile, 1800); // 30 minutes
```

### Background Task Processing

```typescript
import { redis } from '../lib/redis';

// Add email notification task
await redis.addJob('email_notifications', {
    type: 'signature_request',
    recipient_email: 'signer@example.com',
    document_title: 'Contract Agreement',
    signing_url: 'https://buffrsign.com/sign/abc123'
}, 0); // Immediate execution

// Add delayed compliance check
await redis.addJob('compliance_checks', {
    type: 'eta_2019_check',
    document_id: 'doc123',
    user_id: 'user456'
}, 300); // 5 minutes delay
```

### Rate Limiting

```typescript
import { redis } from '../lib/redis';

// Check API rate limit
const rateLimit = await redis.checkRateLimit('api:user123', 100, 3600);
if (!rateLimit.allowed) {
    throw new Error('Rate limit exceeded');
}

// Check login attempts
const loginAttempts = await redis.checkRateLimit('login:user@example.com', 5, 3600);
if (!loginAttempts.allowed) {
    throw new Error('Too many login attempts');
}
```

### Document Status Tracking

```typescript
import { redis } from '../lib/redis';

// Update document processing status
await redis.setDocumentStatus('doc123', 'processing', {
    step: 'ai_analysis',
    progress: 75,
    estimated_completion: '2024-01-15T10:30:00Z'
});

// Get current status
const status = await redis.getDocumentStatus('doc123');
console.log(`Document ${status.status} - ${status.metadata.progress}% complete`);
```

### User Activity Tracking

```typescript
import { redis } from '../lib/redis';

// Track user activity
await redis.trackUserActivity('user123', 'document_uploaded', {
    document_id: 'doc456',
    file_size: 1024000,
    file_type: 'pdf'
});

// Get recent activity
const activities = await redis.getUserActivity('user123', 10);
activities.forEach(activity => {
    console.log(`${activity.timestamp}: ${activity.activity}`);
});
```

## Available Functions

### Session Management
- `setSession(sessionId, data, ttl)`: Create secure session with TTL
- `getSession(sessionId)`: Retrieve session data
- `deleteSession(sessionId)`: Remove session
- `blacklistToken(token, expiresIn)`: Blacklist JWT token for logout
- `isTokenBlacklisted(token)`: Check if token is blacklisted

### Caching System
- `cache(key, data, ttl)`: Cache data with TTL
- `getCache(key)`: Retrieve cached data
- `invalidateCache(pattern)`: Invalidate cache by pattern
- `cacheSet(key, data, ttl)`: Set cache with TTL
- `cacheGet(key)`: Get cached data
- `cacheDelete(key)`: Delete cache entry

### Real-time Features
- `publish(channel, message)`: Publish message to channel
- `subscribe(channel, callback)`: Subscribe to channel
- `setDocumentStatus(documentId, status, metadata)`: Update document status
- `getDocumentStatus(documentId)`: Get document status

### Task Queue Management
- `addJob(queue, job, delay)`: Add job to queue with optional delay
- `getJob(queue)`: Get job from queue for processing

### Rate Limiting
- `checkRateLimit(identifier, limit, window)`: Check rate limit
- `checkRateLimit(key, limit, window)`: Check rate limit with custom key

### User Activity Tracking
- `trackUserActivity(userId, activity, metadata)`: Track user activity
- `getUserActivity(userId, limit)`: Get user activity history

### Connection Management
- `connectRedis()`: Establish Redis connection
- `disconnectRedis()`: Close Redis connection

### Test Functions
- `testRedisConnection()`: Run comprehensive Redis tests

## Error Handling

All Redis functions include comprehensive error handling:

- Connection errors are logged to console
- Failed operations return appropriate fallback values
- Network timeouts are handled gracefully
- Invalid operations are caught and logged

## Security & Compliance Features

### Security Implementations
1. **JWT Token Blacklisting**: Secure logout with token invalidation
2. **Rate Limiting**: API protection against abuse and brute force attacks
3. **Session Management**: Secure session storage with automatic expiration
4. **Failed Login Tracking**: Prevention of brute force login attempts
5. **Environment Variables**: Secure credential management
6. **Data Validation**: Input validation before Redis storage
7. **TTL Management**: Automatic data expiration to prevent accumulation

### Compliance Features (ETA 2019)
1. **Compliance Result Caching**: Cache compliance check results for performance
2. **Audit Trail Management**: Comprehensive audit logging for regulatory requirements
3. **Document Status Tracking**: Real-time tracking of document processing status
4. **User Activity Logging**: Complete user activity tracking for compliance
5. **Secure Session Handling**: Compliant session management with proper expiration

### Best Practices
- **Data Encryption**: Sensitive data should be encrypted before storage
- **Access Control**: Implement proper access controls for Redis operations
- **Monitoring**: Set up monitoring and alerting for Redis operations
- **Backup Strategy**: Implement regular Redis data backup procedures
- **Error Handling**: Comprehensive error handling without exposing sensitive data

## Testing & Development

### Quick Start Testing
1. **Verify Environment Setup**:
   ```bash
   npm run verify:redis
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Test Redis Operations**:
   - Navigate to the RedisExample component
   - Check browser console for connection status
   - Use interactive UI to test operations

### Comprehensive Testing

#### Frontend Testing
```typescript
// Test Redis connection
import { testRedisConnection } from '../lib/redis-test';
await testRedisConnection();

// Test real-time features
import { useRealtime } from '../hooks/useRealtime';
const { connected, events } = useRealtime();
```

#### Backend Testing
```python
# Test Redis service
from services.redis_service import redis_service

# Test session management
session_id = redis_service.create_session("user123", {"email": "test@example.com"})
session_data = redis_service.get_session(session_id)

# Test task queue
redis_service.add_task("email_notifications", {"type": "test"})
task = redis_service.get_task("email_notifications")
```

### Integration Testing
1. **Real-time Document Updates**: Test document status changes
2. **Background Task Processing**: Verify email notifications and compliance checks
3. **Rate Limiting**: Test API endpoint protection
4. **Session Management**: Test login/logout flows
5. **Caching**: Verify performance improvements

## Production Deployment

### Environment Configuration
1. **Environment Variables**: All Redis credentials are managed via environment variables
2. **Connection Pooling**: Implemented for high traffic scenarios
3. **Monitoring**: Set up Redis monitoring and alerting systems
4. **Backup Strategy**: Implement regular Redis data backup procedures
5. **Security**: Proper access controls and network security implemented

### Performance Optimization
1. **Caching Strategy**: Multi-layer caching for optimal performance
2. **Background Processing**: Asynchronous task processing for better user experience
3. **Real-time Updates**: WebSocket-based real-time communication
4. **Rate Limiting**: API protection with configurable limits
5. **Connection Management**: Efficient connection pooling and management

### Scalability Features
1. **Horizontal Scaling**: Redis clustering support for high availability
2. **Load Balancing**: Distributed task processing across multiple workers
3. **Caching Layers**: Intelligent caching with automatic invalidation
4. **Queue Management**: Robust task queue with delayed execution
5. **Real-time Scaling**: WebSocket connection management for multiple users

### Monitoring & Maintenance
1. **Health Checks**: Regular Redis health monitoring
2. **Performance Metrics**: Track Redis performance and usage
3. **Error Alerting**: Automated error detection and alerting
4. **Capacity Planning**: Monitor Redis memory and connection usage
5. **Backup Verification**: Regular backup testing and verification

## Troubleshooting & Support

### Common Issues & Solutions

#### Connection Issues
1. **Connection Failed**: 
   - Check Redis server status: `redis-cli ping`
   - Verify environment variables: `npm run verify:redis`
   - Check network connectivity and firewall settings

2. **Authentication Error**: 
   - Verify Redis credentials in `.env.local`
   - Check Redis server authentication configuration
   - Ensure proper username/password format

3. **Network Timeout**: 
   - Check network connectivity to Redis host
   - Verify firewall rules and port access
   - Test connection with Redis CLI

#### Performance Issues
1. **Memory Issues**: 
   - Monitor Redis memory usage: `redis-cli info memory`
   - Implement proper eviction policies
   - Review TTL settings for cached data

2. **Slow Response Times**: 
   - Check Redis performance metrics
   - Review caching strategies and TTL values
   - Monitor connection pool usage

#### Real-time Issues
1. **WebSocket Disconnections**: 
   - Check WebSocket server status
   - Verify Redis pub/sub connections
   - Review connection timeout settings

2. **Missing Real-time Updates**: 
   - Verify Redis pub/sub channels
   - Check WebSocket connection status
   - Review event subscription logic

### Debug Steps
1. **Environment Verification**: Run `npm run verify:redis`
2. **Connection Testing**: Use RedisExample component
3. **Console Logging**: Check browser console for error messages
4. **Server Logs**: Review backend server logs
5. **Redis CLI**: Test direct Redis connections

### Support Resources
1. **Documentation**: Review this REDIS_SETUP.md file
2. **Testing Tools**: Use provided testing scripts and components
3. **Error Logging**: Check comprehensive error logs
4. **Performance Monitoring**: Monitor Redis performance metrics

## Dependencies & Requirements

### Frontend Dependencies
- `redis`: Official Redis client for Node.js
- `socket.io-client`: WebSocket client for real-time features
- `dotenv`: Environment variable management (dev dependency)

### Backend Dependencies
- `redis`: Python Redis client
- `fastapi`: Web framework for API endpoints
- `websockets`: WebSocket support for real-time communication
- `asyncio`: Asynchronous task processing

### Installation
```bash
# Frontend dependencies
npm install redis socket.io-client
npm install dotenv --save-dev

# Backend dependencies
pip install redis fastapi websockets
```

## Support & Resources

### Documentation
- **This Guide**: Comprehensive Redis integration documentation
- **API Documentation**: Backend API endpoints and usage
- **Component Library**: Frontend components and hooks
- **Testing Guide**: Testing procedures and examples

### Development Tools
- **RedisExample Component**: Interactive testing component
- **Verification Scripts**: Environment and connection testing
- **Testing Hooks**: Real-time feature testing utilities
- **Debug Tools**: Comprehensive debugging and monitoring

### Getting Help
1. **Check Documentation**: Review this REDIS_SETUP.md file
2. **Run Tests**: Use `npm run verify:redis` and testing components
3. **Check Logs**: Review browser console and server logs
4. **Environment Issues**: Verify `.env.local` configuration
5. **Performance Issues**: Monitor Redis performance metrics

### Community Resources
- **Redis Documentation**: Official Redis documentation
- **Node.js Redis**: Redis client documentation
- **FastAPI**: Web framework documentation
- **WebSocket**: Real-time communication guides
