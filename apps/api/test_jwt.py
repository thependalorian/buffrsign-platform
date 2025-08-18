#!/usr/bin/env python3
"""
Test script for BuffrSign JWT functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.jwt_utils import create_test_token, verify_token, create_access_token
from datetime import timedelta

def test_jwt_functionality():
    """Test JWT token creation and verification"""
    print("🔐 Testing BuffrSign JWT Functionality")
    print("=" * 50)
    
    # Test data
    test_email = "test@buffrsign.com"
    test_session_id = "test_session_123"
    
    print(f"📧 Test User: {test_email}")
    print(f"🆔 Session ID: {test_session_id}")
    print()
    
    try:
        # Test 1: Create test token
        print("1️⃣ Creating test JWT token...")
        token = create_test_token(test_email, test_session_id)
        print(f"✅ Token created successfully!")
        print(f"🔑 Token (first 50 chars): {token[:50]}...")
        print()
        
        # Test 2: Verify token
        print("2️⃣ Verifying JWT token...")
        payload = verify_token(token)
        print(f"✅ Token verified successfully!")
        print(f"📋 Payload keys: {list(payload.keys())}")
        print(f"👤 User email: {payload.get('sub')}")
        print(f"🎫 Session ID: {payload.get('session_id')}")
        print(f"⏰ Expires at: {payload.get('exp')}")
        print()
        
        # Test 3: Create custom token
        print("3️⃣ Creating custom JWT token...")
        custom_data = {
            "sub": test_email,
            "email": test_email,
            "role": "authenticated",
            "session_id": test_session_id,
            "custom_field": "test_value"
        }
        custom_token = create_access_token(custom_data, timedelta(hours=1))
        print(f"✅ Custom token created successfully!")
        print(f"🔑 Custom token (first 50 chars): {custom_token[:50]}...")
        print()
        
        # Test 4: Verify custom token
        print("4️⃣ Verifying custom JWT token...")
        custom_payload = verify_token(custom_token)
        print(f"✅ Custom token verified successfully!")
        print(f"📋 Custom field: {custom_payload.get('custom_field')}")
        print()
        
        # Test 5: Test token with Bearer prefix
        print("5️⃣ Testing token with Bearer prefix...")
        bearer_token = f"Bearer {token}"
        bearer_payload = verify_token(bearer_token)
        print(f"✅ Bearer token verified successfully!")
        print(f"👤 User email: {bearer_payload.get('sub')}")
        print()
        
        print("🎉 All JWT tests passed successfully!")
        print()
        print("📝 Test Summary:")
        print(f"   • JWT Secret: Configured and working")
        print(f"   • Token Creation: ✅ Working")
        print(f"   • Token Verification: ✅ Working")
        print(f"   • Custom Payloads: ✅ Working")
        print(f"   • Bearer Prefix: ✅ Working")
        print()
        print("🚀 BuffrSign JWT system is ready for testing!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False
    
    return True

def generate_test_curl_commands():
    """Generate curl commands for testing the API endpoints"""
    print("🔧 Test API Commands")
    print("=" * 50)
    
    # Create a test token
    test_email = "test@buffrsign.com"
    token = create_test_token(test_email)
    
    print("📡 API Test Commands:")
    print()
    
    # Test token creation endpoint
    print("1. Create test token:")
    print(f'curl -X POST "http://localhost:8000/auth/test-token" \\')
    print(f'     -H "Content-Type: application/json" \\')
    print(f'     -d \'{{"email": "{test_email}"}}\'')
    print()
    
    # Test token verification endpoint
    print("2. Verify token:")
    print(f'curl -X GET "http://localhost:8000/auth/verify" \\')
    print(f'     -H "Authorization: Bearer {token}"')
    print()
    
    # Test login endpoint
    print("3. Login (will return a new token):")
    print(f'curl -X POST "http://localhost:8000/auth/login" \\')
    print(f'     -H "Content-Type: application/json" \\')
    print(f'     -d \'{{"email": "{test_email}", "password": "password123"}}\'')
    print()
    
    # Test logout endpoint
    print("4. Logout:")
    print(f'curl -X POST "http://localhost:8000/auth/logout" \\')
    print(f'     -H "Authorization: Bearer {token}"')
    print()

if __name__ == "__main__":
    print("🚀 BuffrSign JWT Test Suite")
    print("=" * 60)
    print()
    
    # Run JWT functionality tests
    success = test_jwt_functionality()
    
    if success:
        print()
        generate_test_curl_commands()
        
        print("💡 Usage Notes:")
        print("   • The JWT secret is configured and ready for use")
        print("   • Test tokens are valid for 24 hours")
        print("   • Use the curl commands above to test the API endpoints")
        print("   • Replace 'localhost:8000' with your actual API URL")
        print()
        print("🔒 Security Notes:")
        print("   • Keep the JWT secret secure and never expose it in client-side code")
        print("   • Use HTTPS in production")
        print("   • Consider implementing token refresh mechanisms")
        print("   • Monitor token usage and implement rate limiting")
    else:
        print("❌ JWT tests failed. Please check the configuration.")
        sys.exit(1)
