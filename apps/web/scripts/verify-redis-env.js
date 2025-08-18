#!/usr/bin/env node

/**
 * Redis Environment Variables Verification Script
 * 
 * This script verifies that all required Redis environment variables are set
 * and accessible in the Next.js application.
 * 
 * Usage: node scripts/verify-redis-env.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verifying Redis environment variables...\n');

// Required Redis environment variables
const requiredVars = [
    'NEXT_PUBLIC_REDIS_USERNAME',
    'NEXT_PUBLIC_REDIS_PASSWORD',
    'NEXT_PUBLIC_REDIS_HOST',
    'NEXT_PUBLIC_REDIS_PORT'
];

let allSet = true;

// Check each required variable
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`✅ ${varName}: ${varName.includes('PASSWORD') ? '***' : value}`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
        allSet = false;
    }
});

console.log('');

if (allSet) {
    console.log('🎉 All Redis environment variables are properly set!');
    console.log('   You can now use Redis in your application.');
    
    // Show the Redis configuration that will be used
    console.log('\n📋 Redis Configuration:');
    console.log('========================');
    console.log(`Username: ${process.env.NEXT_PUBLIC_REDIS_USERNAME}`);
    console.log(`Host: ${process.env.NEXT_PUBLIC_REDIS_HOST}`);
    console.log(`Port: ${process.env.NEXT_PUBLIC_REDIS_PORT}`);
    console.log('Password: ***');
    console.log('========================');
} else {
    console.log('❌ Some Redis environment variables are missing.');
    console.log('   Run "npm run setup:redis" to add them to your .env.local file.');
    process.exit(1);
}

console.log('\n💡 Next steps:');
console.log('   1. Start your development server: npm run dev');
console.log('   2. Import Redis functions: import { setRedisKey, getRedisKey } from "../lib"');
console.log('   3. Check REDIS_SETUP.md for usage examples');
