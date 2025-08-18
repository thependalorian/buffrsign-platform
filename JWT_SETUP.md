# BuffrSign JWT Setup Guide

## 🚨 IMPORTANT: JWT Secret Configuration

The JWT secret you provided (`4yZx0coXqam1Vx2DTFNlO+yqFXwYbVRicU0nXOb28k/fO7yaz1Ac/iXOJJI+9zI0yZHPo3j1KN1nWIXPEO+E9g==`) has been **removed from the code** and must now be configured via environment variables.

## ✅ Security Fix Applied

**Before**: Hardcoded JWT secret in code (❌ SECURITY RISK)  
**After**: Environment variable configuration (✅ SECURE)

## 🔧 Setup Instructions

### 1. Create Environment File
```bash
cd apps/api
cp .env.example .env
```

### 2. Add Your JWT Secret
Edit the `.env` file and add your JWT secret:
```bash
# JWT Configuration
JWT_SECRET=4yZx0coXqam1Vx2DTFNlO+yqFXwYbVRicU0nXOb28k/fO7yaz1Ac/iXOJJI+9zI0yZHPo3j1KN1nWIXPEO+E9g==
JWT_EXPIRY_HOURS=24
```

### 3. Verify Configuration
```bash
# Test JWT functionality
python test_jwt.py

# Run security audit
python scripts/security_audit.py
```

## 🔐 Security Best Practices

### ✅ DO
- Use environment variables for all secrets
- Keep `.env` files out of version control
- Use strong, unique secrets
- Rotate secrets regularly
- Run security audits before deployment

### ❌ DON'T
- Hardcode secrets in code
- Commit `.env` files to Git
- Use weak or predictable secrets
- Share secrets in public repositories
- Use the same secret across environments

## 🧪 Testing JWT Functionality

### Test Token Creation
```bash
curl -X POST "http://localhost:8000/auth/test-token" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@buffrsign.com"}'
```

### Test Token Verification
```bash
curl -X GET "http://localhost:8000/auth/verify" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔍 Security Audit

Run the security audit to ensure everything is properly configured:

```bash
python scripts/security_audit.py
```

Expected output:
```
✅ Security audit passed!
```

## 📋 Environment Variables Checklist

Make sure these are set in your `.env` file:

- [ ] `JWT_SECRET` - Your JWT signing secret
- [ ] `JWT_EXPIRY_HOURS` - Token expiration time (default: 24)
- [ ] `DATABASE_URL` - Supabase database connection
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `REDIS_HOST` - Redis server hostname
- [ ] `REDIS_PASSWORD` - Redis server password

## 🚨 Troubleshooting

### Error: "JWT_SECRET environment variable is required"
**Solution**: Add `JWT_SECRET` to your `.env` file

### Error: "Invalid token"
**Solution**: Check that your JWT secret is correct and tokens are properly formatted

### Error: "Token has expired"
**Solution**: Generate a new token or adjust `JWT_EXPIRY_HOURS`

## 📞 Support

If you encounter issues:
1. Check the [Security Documentation](SECURITY.md)
2. Run the security audit script
3. Verify your environment variables
4. Contact the security team

---

**Status**: ✅ SECURE  
**Last Updated**: January 2025  
**Security Level**: Production Ready
