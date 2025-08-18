/**
 * Redis Client Configuration
 * 
 * This file contains the Redis client configuration for the BuffrSign application.
 * It provides a singleton Redis client instance that can be used throughout the application
 * for caching, session storage, and other Redis-based operations.
 * 
 * Location: src/lib/redis.ts
 * Purpose: Centralized Redis client configuration and management
 */

import { createClient } from 'redis';

// Redis connection configuration
const redisConfig = {
    username: process.env.NEXT_PUBLIC_REDIS_USERNAME || 'default',
    password: process.env.NEXT_PUBLIC_REDIS_PASSWORD || '5fJdncoLgeYwT6W5fx9NIIQug06V10cs',
    socket: {
        host: process.env.NEXT_PUBLIC_REDIS_HOST || 'redis-19532.c232.us-east-1-2.ec2.redns.redis-cloud.com',
        port: parseInt(process.env.NEXT_PUBLIC_REDIS_PORT || '19532')
    }
};

// Create Redis client instance
const client = createClient(redisConfig);

// Error handling
client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Connection event handlers
client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('ready', () => {
    console.log('Redis client ready');
});

client.on('end', () => {
    console.log('Redis client disconnected');
});

// Initialize connection
let isConnected = false;

/**
 * Connects to Redis if not already connected
 * @returns Promise<boolean> - True if connection successful, false otherwise
 */
export async function connectRedis(): Promise<boolean> {
    try {
        if (!isConnected) {
            await client.connect();
            isConnected = true;
            console.log('Redis connection established');
        }
        return true;
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        return false;
    }
}

/**
 * Disconnects from Redis
 */
export async function disconnectRedis(): Promise<void> {
    try {
        if (isConnected) {
            await client.quit();
            isConnected = false;
            console.log('Redis connection closed');
        }
    } catch (error) {
        console.error('Error disconnecting from Redis:', error);
    }
}

/**
 * Sets a key-value pair in Redis
 * @param key - The key to set
 * @param value - The value to store
 * @param ttl - Optional time-to-live in seconds
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function setRedisKey(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
        await connectRedis();
        if (ttl) {
            await client.setEx(key, ttl, value);
        } else {
            await client.set(key, value);
        }
        return true;
    } catch (error) {
        console.error('Error setting Redis key:', error);
        return false;
    }
}

/**
 * Gets a value from Redis by key
 * @param key - The key to retrieve
 * @returns Promise<string | null> - The value or null if not found
 */
export async function getRedisKey(key: string): Promise<string | null> {
    try {
        await connectRedis();
        return await client.get(key);
    } catch (error) {
        console.error('Error getting Redis key:', error);
        return null;
    }
}

/**
 * Deletes a key from Redis
 * @param key - The key to delete
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function deleteRedisKey(key: string): Promise<boolean> {
    try {
        await connectRedis();
        const result = await client.del(key);
        return result > 0;
    } catch (error) {
        console.error('Error deleting Redis key:', error);
        return false;
    }
}

/**
 * Checks if a key exists in Redis
 * @param key - The key to check
 * @returns Promise<boolean> - True if key exists, false otherwise
 */
export async function keyExists(key: string): Promise<boolean> {
    try {
        await connectRedis();
        const result = await client.exists(key);
        return result > 0;
    } catch (error) {
        console.error('Error checking Redis key existence:', error);
        return false;
    }
}

// Export the client for direct access if needed
export { client };

// Example usage:
// await setRedisKey('foo', 'bar');
// const result = await getRedisKey('foo');
// console.log(result); // >>> bar
