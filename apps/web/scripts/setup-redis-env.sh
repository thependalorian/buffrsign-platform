#!/bin/bash

# Redis Environment Variables Setup Script
# This script adds Redis configuration to your .env.local file

echo "🔧 Setting up Redis environment variables..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Creating one..."
    touch .env.local
fi

# Check if Redis variables already exist
if grep -q "NEXT_PUBLIC_REDIS_USERNAME" .env.local; then
    echo "⚠️  Redis environment variables already exist in .env.local"
    echo "   Skipping Redis configuration..."
else
    echo "📝 Adding Redis configuration to .env.local..."
    
    # Add Redis configuration
    cat >> .env.local << EOF

# Redis Configuration
NEXT_PUBLIC_REDIS_USERNAME=default
NEXT_PUBLIC_REDIS_PASSWORD=5fJdncoLgeYwT6W5fx9NIIQug06V10cs
NEXT_PUBLIC_REDIS_HOST=redis-19532.c232.us-east-1-2.ec2.redns.redis-cloud.com
NEXT_PUBLIC_REDIS_PORT=19532
EOF
    
    echo "✅ Redis environment variables added successfully!"
fi

echo ""
echo "📋 Current .env.local contents:"
echo "================================"
cat .env.local
echo "================================"
echo ""
echo "🚀 Redis setup complete! You can now use Redis in your application."
echo "   Check REDIS_SETUP.md for usage examples."
