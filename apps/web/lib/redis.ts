import Redis from 'ioredis'

class BuffrSignRedis {
  private client: Redis
  private subscriber: Redis
  private publisher: Redis

  constructor() {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keyPrefix: 'buffsign:',
    }

    this.client = new Redis(redisConfig)
    this.subscriber = new Redis(redisConfig)
    this.publisher = new Redis(redisConfig)
  }

  // Session Management
  async setSession(sessionId: string, data: any, ttl: number = 86400) {
    return await this.client.setex(`session:${sessionId}`, ttl, JSON.stringify(data))
  }

  async getSession(sessionId: string) {
    const data = await this.client.get(`session:${sessionId}`)
    return data ? JSON.parse(data) : null
  }

  async deleteSession(sessionId: string) {
    return await this.client.del(`session:${sessionId}`)
  }

  // JWT Blacklisting
  async blacklistToken(token: string, expiresIn: number) {
    return await this.client.setex(`blacklist:${token}`, expiresIn, '1')
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.client.get(`blacklist:${token}`)
    return result === '1'
  }

  // Rate Limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean, remaining: number }> {
    const current = await this.client.incr(`ratelimit:${key}`)
    
    if (current === 1) {
      await this.client.expire(`ratelimit:${key}`, window)
    }
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current)
    }
  }

  // Caching
  async cache(key: string, data: any, ttl: number = 3600) {
    return await this.client.setex(`cache:${key}`, ttl, JSON.stringify(data))
  }

  async getCache(key: string) {
    const data = await this.client.get(`cache:${key}`)
    return data ? JSON.parse(data) : null
  }

  async invalidateCache(pattern: string) {
    const keys = await this.client.keys(`cache:${pattern}`)
    if (keys.length > 0) {
      return await this.client.del(...keys)
    }
    return 0
  }

  // Real-time Features
  async publish(channel: string, message: any) {
    return await this.publisher.publish(channel, JSON.stringify(message))
  }

  async subscribe(channel: string, callback: (message: any) => void) {
    await this.subscriber.subscribe(channel)
    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(JSON.parse(message))
      }
    })
  }

  // Task Queue
  async addJob(queue: string, job: any, delay: number = 0) {
    const jobData = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: job,
      createdAt: new Date().toISOString(),
      processAt: new Date(Date.now() + delay * 1000).toISOString()
    }

    if (delay > 0) {
      return await this.client.zadd(`queue:${queue}:delayed`, Date.now() + delay * 1000, JSON.stringify(jobData))
    } else {
      return await this.client.lpush(`queue:${queue}`, JSON.stringify(jobData))
    }
  }

  async getJob(queue: string): Promise<any> {
    const job = await this.client.brpop(`queue:${queue}`, 10)
    return job ? JSON.parse(job[1]) : null
  }

  // Document Status Tracking
  async setDocumentStatus(documentId: string, status: string, metadata: any = {}) {
    const statusData = {
      status,
      metadata,
      updatedAt: new Date().toISOString()
    }
    
    await this.client.hset(`document:${documentId}`, 'status', JSON.stringify(statusData))
    
    // Publish real-time update
    await this.publish(`document:${documentId}:status`, statusData)
  }

  async getDocumentStatus(documentId: string) {
    const status = await this.client.hget(`document:${documentId}`, 'status')
    return status ? JSON.parse(status) : null
  }

  // User Activity Tracking
  async trackUserActivity(userId: string, activity: string, metadata: any = {}) {
    const activityData = {
      activity,
      metadata,
      timestamp: new Date().toISOString()
    }
    
    await this.client.lpush(`activity:${userId}`, JSON.stringify(activityData))
    await this.client.ltrim(`activity:${userId}`, 0, 99) // Keep last 100 activities
  }

  async getUserActivity(userId: string, limit: number = 10) {
    const activities = await this.client.lrange(`activity:${userId}`, 0, limit - 1)
    return activities.map(activity => JSON.parse(activity))
  }
}

export const redis = new BuffrSignRedis()
