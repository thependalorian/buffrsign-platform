/**
 * Redis Test Configuration
 * 
 * This file provides a simple test to verify Redis connection and basic operations.
 * It can be used to test the Redis setup during development.
 * 
 * Location: src/lib/redis-test.ts
 * Purpose: Test Redis connection and basic operations
 */

import { setRedisKey, getRedisKey, deleteRedisKey, connectRedis, disconnectRedis } from './redis';

/**
 * Test Redis connection and basic operations
 */
export async function testRedisConnection(): Promise<void> {
    try {
        console.log('Testing Redis connection...');
        
        // Test connection
        const connected = await connectRedis();
        if (!connected) {
            console.error('Failed to connect to Redis');
            return;
        }
        
        // Test set operation
        const setResult = await setRedisKey('test_key', 'test_value');
        if (!setResult) {
            console.error('Failed to set Redis key');
            return;
        }
        console.log('✅ Set operation successful');
        
        // Test get operation
        const value = await getRedisKey('test_key');
        if (value === 'test_value') {
            console.log('✅ Get operation successful:', value);
        } else {
            console.error('❌ Get operation failed. Expected: test_value, Got:', value);
        }
        
        // Test delete operation
        const deleteResult = await deleteRedisKey('test_key');
        if (deleteResult) {
            console.log('✅ Delete operation successful');
        } else {
            console.error('❌ Delete operation failed');
        }
        
        // Verify deletion
        const deletedValue = await getRedisKey('test_key');
        if (deletedValue === null) {
            console.log('✅ Key deletion verified');
        } else {
            console.error('❌ Key still exists after deletion:', deletedValue);
        }
        
        console.log('🎉 All Redis tests passed!');
        
    } catch (error) {
        console.error('❌ Redis test failed:', error);
    } finally {
        // Clean up connection
        await disconnectRedis();
    }
}

// Example usage:
// import { testRedisConnection } from './redis-test';
// testRedisConnection();
