/**
 * Library Index
 * 
 * This file exports all utility functions and configurations from the lib directory.
 * It provides a centralized import point for all shared functionality.
 * 
 * Location: src/lib/index.ts
 * Purpose: Centralized exports for all library functions
 */

// Redis exports
export {
    client as redisClient,
    connectRedis,
    disconnectRedis,
    setRedisKey,
    getRedisKey,
    deleteRedisKey,
    keyExists
} from './redis';

export { testRedisConnection } from './redis-test';

// Add other lib exports here as needed
// export { someFunction } from './some-other-file';
