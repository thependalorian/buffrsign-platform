# BuffrSign Supabase Database Setup

## Overview

This directory contains the Supabase database migrations for the BuffrSign digital signature platform. The database is designed to comply with Namibia's Electronic Transactions Act 4 of 2019 and support CRAN (Communications Regulatory Authority of Namibia) accreditation requirements.

## Database Schema

### Core Tables

1. **users** - User accounts and profiles
2. **documents** - Document storage and metadata
3. **recipients** - Document recipients and signing workflow
4. **signatures** - Digital signatures and certificates
5. **audit_trail** - Complete audit logging for compliance
6. **templates** - Reusable document templates

### CRAN Compliance Tables

7. **cran_accreditation** - CRAN accreditation status and certificates
8. **digital_certificates** - PKI certificates for advanced signatures
9. **eta_compliance** - ETA 2019 compliance verification
10. **security_events** - Security monitoring and threat detection
11. **government_integration** - Government system integrations

### Advanced Features Tables

12. **subscription_plans** - Subscription tiers and pricing
13. **user_subscriptions** - User subscription management
14. **notifications** - User notifications and alerts
15. **document_fields** - Signature field placement and metadata
16. **document_versions** - Document version control
17. **api_keys** - API access management

## Migration History

### 001_initial_schema
- Core tables: users, documents, recipients, signatures, audit_trail, templates
- Basic indexes for performance optimization
- Foreign key relationships

### 002_cran_compliance_tables
- CRAN accreditation tracking
- Digital certificate management
- ETA compliance verification
- Security event monitoring
- Government integration support

### 003_advanced_features_tables
- Subscription management
- Notification system
- Document field management
- Version control
- API key management

### 004_row_level_security
- RLS enabled on all tables
- Comprehensive security policies
- User-based access control
- Document sharing permissions

### 005_seed_data
- Sample subscription plans
- Pre-built document templates
- Automatic timestamp triggers
- Database functions

### 006_utility_functions
- User document statistics
- Audit trail retrieval
- ETA compliance checking

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- User-specific data access
- Document sharing controls
- API key restrictions

### Audit Trail
- Complete activity logging
- IP address tracking
- User agent recording
- Timestamp preservation

### Compliance Features
- ETA 2019 compliance tracking
- CRAN accreditation support
- Digital certificate management
- Security event monitoring

## Subscription Plans

1. **Individual** - N$150/month (5 documents)
2. **Small Business** - N$400/month (50 documents)
3. **Enterprise** - N$1,200/month (500 documents)
4. **Government** - N$2,000/month (1,000 documents)

## API Endpoints

The database supports the following API operations:

### Documents
- `POST /api/v1/documents` - Create document
- `GET /api/v1/documents/{id}` - Get document details
- `PUT /api/v1/documents/{id}` - Update document
- `DELETE /api/v1/documents/{id}` - Delete document

### Signatures
- `POST /api/v1/signatures` - Request signature
- `GET /api/v1/signatures/{id}` - Get signature status
- `PUT /api/v1/signatures/{id}` - Update signature

### Users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/{id}` - Get user profile
- `PUT /api/v1/users/{id}` - Update user profile

## Compliance Features

### ETA 2019 Compliance
- Section 17: Legal recognition of data messages
- Section 20: Electronic signature requirements
- Section 21: Original information integrity
- Section 24: Electronic record retention

### CRAN Accreditation
- Security service provider status
- Digital certificate authority
- Compliance database maintenance
- Security audit support

## Database Functions

### get_user_document_stats(user_uuid)
Returns document statistics for a user:
- Total documents
- Pending documents
- Completed documents
- Draft documents

### get_document_audit_trail(doc_uuid)
Returns complete audit trail for a document:
- Action performed
- User details
- Timestamp
- Additional metadata

## Next Steps

1. **Frontend Integration** - Connect Next.js frontend to Supabase
2. **Authentication** - Implement Supabase Auth with custom claims
3. **File Storage** - Set up Supabase Storage for document files
4. **Real-time Features** - Enable real-time subscriptions
5. **API Development** - Build REST API endpoints
6. **Testing** - Comprehensive test suite
7. **Deployment** - Production deployment configuration

## Project Information

- **Project ID**: inqoltqqfneqfltcqlmx
- **Region**: us-east-2
- **Database**: PostgreSQL 17.4.1
- **Status**: ACTIVE_HEALTHY
- **Created**: 2025-08-14

## Contact

For database-related questions or issues, contact the development team.
