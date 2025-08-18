# BuffrSign API Documentation

## Overview

The BuffrSign API provides programmatic access to all digital signature functionality, designed for seamless integration with existing business systems while maintaining full ETA 2019 compliance and CRAN accreditation requirements.

## Base URLs

```
Production: https://www.api.sign.buffr.ai/v1
Staging: https://www.staging-api.sign.buffr.ai/v1
Development: http://localhost:8000/api/v1
```

## Authentication

BuffrSign API uses JWT (JSON Web Tokens) for authentication with optional API key support for enterprise integrations.

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "account_type": "business",
      "subscription_plan": "enterprise"
    }
  }
}
```

### Using the Token

Include the JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key Authentication (Enterprise)

For enterprise integrations, you can use API key authentication:

```http
X-API-Key: your-api-key
```

## Rate Limiting

- **Standard**: 1000 requests/hour
- **Premium**: 5000 requests/hour  
- **Enterprise**: Unlimited

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `ETA_COMPLIANCE_ERROR` | ETA 2019 compliance violation |
| `CRAN_ERROR` | CRAN accreditation issue |
| `AI_SERVICE_ERROR` | AI service temporarily unavailable |

## Core Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-10T14:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "ai_services": "healthy",
    "storage": "healthy"
  }
}
```

### Ping

```http
GET /ping
```

**Response:**
```json
{
  "message": "pong",
  "timestamp": "2024-12-10T14:30:00Z"
}
```

## Document Management

### Upload Document

```http
POST /documents
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
title: "Employment Contract"
message: "Please review and sign"
expires_in_days: 7
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "title": "Employment Contract",
    "file_hash": "sha256:abc123...",
    "file_size": 245760,
    "status": "draft",
    "created_at": "2024-12-10T14:30:00Z",
    "expires_at": "2024-12-17T14:30:00Z"
  }
}
```

### Upload Document with AI Analysis

```http
POST /ai/documents/upload-with-analysis
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
document_type: "employment_contract"
analysis_level: "comprehensive"
auto_detect_fields: true
compliance_check: true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "ai_analysis": {
      "document_summary": "Employment contract between...",
      "key_clauses": [
        {
          "type": "termination_clause",
          "content": "Either party may terminate...",
          "compliance_status": "ETA_compliant",
          "recommendations": ["Consider adding notice period"]
        }
      ],
      "signature_fields": [
        {
          "field_id": "employee_signature",
          "position": {"page": 2, "x": 100, "y": 500},
          "type": "advanced_electronic",
          "required": true,
          "legal_basis": "ETA 2019 Section 20"
        }
      ],
      "compliance_score": 95,
      "eta_compliance": {
        "section_17": "compliant",
        "section_20": "compliant", 
        "section_21": "compliant",
        "chapter_4": "needs_review"
      }
    }
  }
}
```

### Get Document

```http
GET /documents/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "title": "Employment Contract",
    "status": "pending",
    "file_url": "https://storage.buffrsign.ai/documents/uuid.pdf",
    "file_hash": "sha256:abc123...",
    "created_at": "2024-12-10T14:30:00Z",
    "expires_at": "2024-12-17T14:30:00Z",
    "recipients": [
      {
        "id": "uuid",
        "email": "john@example.com",
        "name": "John Doe",
        "role": "signer",
        "status": "pending",
        "signing_order": 1
      }
    ],
    "signatures": [],
    "audit_trail": [
      {
        "timestamp": "2024-12-10T14:30:00Z",
        "action": "document_created",
        "user_id": "uuid",
        "ip_address": "41.182.123.45",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "details": {
          "file_hash": "sha256:abc123...",
          "file_size": 245760
        }
      }
    ]
  }
}
```

### List Documents

```http
GET /documents?status=pending&limit=10&offset=0
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "document_id": "uuid",
        "title": "Employment Contract",
        "status": "pending",
        "created_at": "2024-12-10T14:30:00Z",
        "recipients_count": 2,
        "signatures_count": 0
      }
    ],
    "pagination": {
      "total": 47,
      "limit": 10,
      "offset": 0,
      "has_more": true
    }
  }
}
```

## Signature Management

### Request Signature

```http
POST /signatures
Authorization: Bearer {token}
Content-Type: application/json

{
  "document_id": "uuid",
  "recipients": [
    {
      "email": "signer@example.com",
      "name": "John Doe",
      "role": "signer",
      "signing_order": 1,
      "require_id_verification": true,
      "signature_type": "advanced_electronic"
    }
  ],
  "message": "Please sign this document",
  "expires_in_days": 7,
  "notify_on_completion": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature_request_id": "uuid",
    "document_id": "uuid",
    "status": "pending",
    "recipients": [
      {
        "id": "uuid",
        "email": "signer@example.com",
        "name": "John Doe",
        "status": "pending",
        "signing_url": "https://sign.buffr.ai/sign/uuid"
      }
    ],
    "created_at": "2024-12-10T14:30:00Z",
    "expires_at": "2024-12-17T14:30:00Z"
  }
}
```

### Get Signature Status

```http
GET /signatures/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "signature_request_id": "uuid",
    "document_id": "uuid",
    "status": "completed",
    "recipients": [
      {
        "id": "uuid",
        "email": "signer@example.com",
        "name": "John Doe",
        "status": "completed",
        "signed_at": "2024-12-10T15:30:00Z",
        "signature_type": "advanced_electronic",
        "certificate_id": "CRAN-CERT-2024-001234"
      }
    ],
    "completion_percentage": 100,
    "created_at": "2024-12-10T14:30:00Z",
    "completed_at": "2024-12-10T15:30:00Z"
  }
}
```

## Template Management

### List Templates

```http
GET /templates?category=HR&public=true
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "template_id": "uuid",
        "name": "Employment Contract",
        "description": "Standard employment contract template",
        "category": "HR",
        "is_public": true,
        "fields": [
          {
            "type": "text",
            "name": "employee_name",
            "label": "Employee Name",
            "required": true
          },
          {
            "type": "signature",
            "name": "employee_signature",
            "label": "Employee Signature",
            "required": true
          }
        ],
        "eta_compliance": {
          "section_17": "compliant",
          "section_20": "compliant",
          "section_21": "compliant"
        }
      }
    ]
  }
}
```

### Generate Smart Template

```http
POST /templates/generate-smart
Authorization: Bearer {token}
Content-Type: application/json

{
  "template_type": "service_agreement",
  "industry": "technology",
  "jurisdiction": "namibia",
  "requirements": {
    "parties": 2,
    "payment_terms": "monthly",
    "termination_clause": true,
    "ip_protection": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "template_id": "uuid",
    "name": "Technology Service Agreement",
    "content": "Generated template content...",
    "fields": [
      {
        "type": "text",
        "name": "service_provider",
        "label": "Service Provider",
        "required": true
      },
      {
        "type": "text",
        "name": "client",
        "label": "Client",
        "required": true
      },
      {
        "type": "signature",
        "name": "provider_signature",
        "label": "Service Provider Signature",
        "required": true
      },
      {
        "type": "signature",
        "name": "client_signature",
        "label": "Client Signature",
        "required": true
      }
    ],
    "compliance_notes": [
      "Template complies with ETA 2019 Section 20",
      "Includes required consumer protection clauses",
      "Ready for CRAN accreditation"
    ],
    "ai_generated": true,
    "confidence_score": 0.95
  }
}
```

## Compliance & Audit

### Analyze Compliance

```http
POST /compliance/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "document_id": "uuid",
  "compliance_frameworks": ["eta_2019", "cran", "consumer_protection"],
  "jurisdiction": "namibia"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "compliance_score": 95,
    "eta_compliance": {
      "section_17": {
        "status": "compliant",
        "details": "Document meets legal recognition requirements"
      },
      "section_20": {
        "status": "compliant",
        "details": "Electronic signature requirements satisfied"
      },
      "section_21": {
        "status": "compliant",
        "details": "Original information integrity maintained"
      },
      "chapter_4": {
        "status": "needs_review",
        "details": "Consumer protection clauses require enhancement"
      }
    },
    "cran_compliance": {
      "accreditation_ready": true,
      "security_standards": "met",
      "audit_trail": "complete"
    },
    "recommendations": [
      "Add cooling-off period clause for consumer protection",
      "Include dispute resolution mechanism",
      "Enhance data protection language"
    ],
    "risk_assessment": {
      "overall_risk": "low",
      "legal_risk": "low",
      "compliance_risk": "medium",
      "operational_risk": "low"
    }
  }
}
```

### Get Audit Trail

```http
GET /documents/{id}/audit-trail
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "events": [
      {
        "timestamp": "2024-12-10T14:30:00Z",
        "action": "document_created",
        "user_id": "uuid",
        "ip_address": "41.182.123.45",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "details": {
          "file_hash": "sha256:abc123...",
          "file_size": 245760
        }
      },
      {
        "timestamp": "2024-12-10T14:32:00Z",
        "action": "recipients_added",
        "user_id": "uuid",
        "ip_address": "41.182.123.45",
        "details": {
          "recipients_count": 2,
          "signing_order": "sequential"
        }
      },
      {
        "timestamp": "2024-12-10T14:35:00Z",
        "action": "document_signed",
        "user_id": "uuid",
        "ip_address": "41.182.123.45",
        "details": {
          "signature_type": "advanced_electronic",
          "certificate_id": "CRAN-CERT-2024-001234"
        }
      }
    ],
    "compliance_summary": {
      "eta_compliant": true,
      "cran_ready": true,
      "audit_complete": true
    }
  }
}
```

## AI Services

### Document Intelligence

```http
POST /ai/documents/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "document_id": "uuid",
  "analysis_type": "comprehensive",
  "extract_clauses": true,
  "identify_risks": true,
  "suggest_improvements": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "analysis": {
      "summary": "Employment contract with standard terms and conditions",
      "key_clauses": [
        {
          "type": "employment_terms",
          "content": "Employee shall work 40 hours per week",
          "importance": "high",
          "compliance_status": "compliant"
        },
        {
          "type": "termination",
          "content": "Either party may terminate with 30 days notice",
          "importance": "high",
          "compliance_status": "needs_review"
        }
      ],
      "identified_risks": [
        {
          "risk_type": "legal",
          "severity": "medium",
          "description": "Termination clause may not meet ETA requirements",
          "recommendation": "Add specific notice period requirements"
        }
      ],
      "suggested_improvements": [
        "Add dispute resolution clause",
        "Include data protection provisions",
        "Enhance termination notice requirements"
      ],
      "ai_confidence": 0.92
    }
  }
}
```

### Smart Field Detection

```http
POST /ai/documents/detect-fields
Authorization: Bearer {token}
Content-Type: application/json

{
  "document_id": "uuid",
  "field_types": ["signature", "date", "text", "checkbox"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "detected_fields": [
      {
        "field_id": "employee_signature",
        "type": "signature",
        "position": {
          "page": 2,
          "x": 150,
          "y": 500,
          "width": 200,
          "height": 80
        },
        "confidence": 0.95,
        "suggested_label": "Employee Signature",
        "required": true
      },
      {
        "field_id": "start_date",
        "type": "date",
        "position": {
          "page": 1,
          "x": 300,
          "y": 250,
          "width": 120,
          "height": 30
        },
        "confidence": 0.88,
        "suggested_label": "Start Date",
        "required": true
      }
    ],
    "recommendations": [
      "Add employer signature field on page 2",
      "Include date field for contract execution",
      "Add checkbox for terms acceptance"
    ]
  }
}
```

## User Management

### Get User Profile

```http
GET /users/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+264-61-123-4567",
    "company_name": "Tech Solutions Ltd",
    "account_type": "business",
    "subscription": {
      "plan": "enterprise",
      "status": "active",
      "expires_at": "2025-12-10T14:30:00Z",
      "features": {
        "documents_per_month": 500,
        "users": 25,
        "ai_features": true,
        "api_access": true
      }
    },
    "compliance": {
      "eta_verified": true,
      "cran_certified": true,
      "last_audit": "2024-11-15T10:00:00Z"
    }
  }
}
```

### Update User Profile

```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "John Smith",
  "phone": "+264-61-987-6543",
  "company_name": "New Company Ltd"
}
```

## Webhooks

BuffrSign can send real-time notifications to your application via webhooks.

### Supported Events

- `document.created`
- `document.sent`
- `document.viewed`
- `document.signed`
- `document.completed`
- `document.expired`
- `signature.requested`
- `signature.completed`
- `compliance.violation`
- `audit.event`

### Webhook Payload

```json
{
  "event": "document.signed",
  "timestamp": "2024-12-10T14:30:00Z",
  "data": {
    "document_id": "uuid",
    "recipient_id": "uuid",
    "signature_type": "advanced_electronic",
    "signed_at": "2024-12-10T14:30:00Z",
    "compliance_status": {
      "eta_compliant": true,
      "cran_ready": true
    }
  }
}
```

### Webhook Security

All webhooks are signed with HMAC-SHA256. Verify the signature using the `X-BuffrSign-Signature` header.

## SDKs

Official SDKs are available for:

- **Node.js**: `npm install @buffrsign/node-sdk`
- **Python**: `pip install buffrsign-python`
- **PHP**: `composer require buffrsign/php-sdk`
- **Java**: Maven/Gradle available
- **C#**: NuGet package available

### Node.js Example

```javascript
const BuffrSign = require('@buffrsign/node-sdk');

const client = new BuffrSign({
  apiKey: 'your-api-key',
  environment: 'production' // or 'staging'
});

// Create and send document with AI analysis
const document = await client.documents.createWithAI({
  file: fs.createReadStream('contract.pdf'),
  title: 'Employment Contract',
  documentType: 'employment_contract',
  analysisLevel: 'comprehensive',
  recipients: [
    {
      email: 'employee@company.com',
      name: 'John Doe',
      role: 'signer',
      signatureType: 'advanced_electronic'
    }
  ]
});

console.log('Document sent with AI analysis:', document.id);
```

## Compliance Features

### ETA 2019 Compliance

All API operations maintain full compliance with Namibia's Electronic Transactions Act 2019:

- **Legal recognition of electronic signatures** (Section 17)
- **Advanced electronic signature support** (Section 20)
- **Document integrity verification** (Section 21)
- **Comprehensive audit trails** (Section 25)

### CRAN Accreditation

BuffrSign is accredited by the Communications Regulatory Authority of Namibia:

- **Accreditation ID**: `CRAN-ACC-2024-001`
- **Security Service Class**: Advanced Electronic Signatures
- **Valid until**: December 31, 2025

### Audit Trail

Every API operation is logged for compliance:

```http
GET /documents/{id}/audit-trail
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "events": [
      {
        "timestamp": "2024-12-10T14:30:00Z",
        "action": "document_created",
        "user_id": "uuid",
        "ip_address": "41.182.123.45",
        "details": {
          "file_hash": "sha256:abc123...",
          "file_size": 245760
        }
      }
    ]
  }
}
```

## Testing

### Sandbox Environment

Use the staging environment for testing:

```
Base URL: https://www.staging-api.sign.buffr.ai/v1
```

### Test Data

Sample test accounts:
- Email: `test@sign.buffr.ai`
- Password: `TestPassword123!`

### Postman Collection

Import our Postman collection for easy testing:
[Download Collection](https://www.api.sign.buffr.ai/postman/collection.json)

## Support

- **Documentation**: [docs.sign.buffr.ai](https://www.docs.sign.buffr.ai)
- **API Support**: api-support@sign.buffr.ai
- **Status Page**: [status.sign.buffr.ai](https://www.status.sign.buffr.ai)
- **GitHub**: [github.com/buffrsign/api-examples](https://github.com/buffrsign/api-examples)

## Changelog

### v1.2.0 (2024-12-01)
- Added AI-powered document analysis
- Enhanced CRAN compliance features
- Improved error handling
- Added webhook signature verification

### v1.1.0 (2024-11-01)
- Added template management
- Enhanced compliance checking
- Mobile SDK support
- Real-time notifications

### v1.0.0 (2024-10-01)
- Initial API release
- ETA 2019 compliance
- CRAN accreditation
- Basic document management
