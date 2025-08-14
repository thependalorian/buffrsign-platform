# BuffrSign API Documentation

## Overview

BuffrSign is a comprehensive digital signature platform designed for the Namibian market, featuring AI-powered document analysis, ETA 2019 compliance, and CRAN accreditation support.

**Domains**

- Marketing site: `https://www.buffr.ai`
- Web app: `https://www.sign.buffr.ai`
- API: `https://www.api.sign.buffr.ai`

**Base URL**: `http://localhost:8003` (Development)
**Production URL**: `https://www.api.sign.buffr.ai`

## Authentication

All API endpoints require authentication via API key in the header:

```http
X-API-Key: your_api_key_here
```

**Environment Variable**: `BUFFRSIGN_API_KEY`

## Rate Limiting

- **Limit**: 60 requests per minute per IP address
- **Headers**: Rate limit information included in response headers
- **Error**: 429 Too Many Requests when limit exceeded

## Response Format

All endpoints return responses in this standardized format:

```json
{
  "success": true,
  "data": { ... },
  "error": { 
    "code": "ERROR_CODE", 
    "message": "Human readable error message" 
  }
}
```

## Health & Status Endpoints

### Health Check
```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "ts": "2024-01-15T10:30:00.000Z"
}
```

### Ping
```http
GET /api/v1/ping
```

**Response**:
```json
{
  "message": "pong"
}
```

## Document Management

### Create Document
```http
POST /api/v1/documents
```

**Request Body**:
```json
{
  "title": "Employment Contract",
  "file_url": "https://example.com/contract.pdf",
  "recipients": [
    {
      "email": "employee@company.com",
      "name": "John Doe",
      "role": "signer"
    }
  ],
  "message": "Please review and sign this employment contract"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Employment Contract",
    "file_url": "https://example.com/contract.pdf",
    "recipients": [...],
    "message": "Please review and sign this employment contract",
    "status": "draft"
  }
}
```

### List Documents
```http
GET /api/v1/documents
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Employment Contract",
      "status": "draft",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Document
```http
GET /api/v1/documents/{doc_id}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Employment Contract",
    "file_url": "https://example.com/contract.pdf",
    "recipients": [...],
    "message": "Please review and sign this employment contract",
    "status": "draft"
  }
}
```

### Update Document
```http
PUT /api/v1/documents/{doc_id}
```

**Request Body**:
```json
{
  "title": "Updated Employment Contract",
  "message": "Updated message"
}
```

### Get Document Audit Trail
```http
GET /api/v1/documents/{doc_id}/audit-trail
```

**Response**:
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "events": [
      {
        "action": "document_created",
        "ts": "2024-01-15T10:30:00.000Z"
      },
      {
        "action": "signature_requested",
        "ts": "2024-01-15T10:35:00.000Z"
      }
    ]
  }
}
```

### Get Document Certificate
```http
GET /api/v1/documents/{doc_id}/certificate
```

**Response**:
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "title": "Employment Contract",
    "status": "completed",
    "generated_at": "2024-01-15T10:40:00.000Z",
    "eta_compliance": {
      "section_17": true,
      "section_20": true,
      "section_21": true,
      "section_25": true
    },
    "events": [...],
    "summary": {
      "created_at": "2024-01-15T10:30:00.000Z",
      "signatures": 2
    }
  }
}
```

## Signature Management

### Request Signature
```http
POST /api/v1/signatures
```

**Request Body**:
```json
{
  "document_id": "uuid",
  "recipients": [
    {
      "email": "employee@company.com",
      "name": "John Doe",
      "role": "signer"
    }
  ],
  "expires_in_days": 7
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "signature_uuid",
    "document_id": "uuid",
    "recipients": [...],
    "status": "requested",
    "expires_in_days": 7
  }
}
```

### Get Signature Request
```http
GET /api/v1/signatures/{sig_id}
```

### Complete Signature
```http
POST /api/v1/signatures/{sig_id}/complete
```

**Request Body**:
```json
{
  "method": "typed",
  "data": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "signature_uuid",
    "status": "completed",
    "signature": {
      "method": "typed",
      "data": "John Doe",
      "ts": "2024-01-15T10:40:00.000Z"
    }
  }
}
```

## Template Management

### List Templates
```http
GET /api/v1/templates
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Employment Contract Template",
      "description": "Standard employment contract",
      "category": "employment",
      "fields": [...]
    }
  ]
}
```

### Create Template
```http
POST /api/v1/templates
```

**Request Body**:
```json
{
  "name": "Service Agreement Template",
  "description": "Standard service agreement",
  "category": "service",
  "fields": [
    {
      "name": "company_name",
      "type": "text",
      "required": true
    }
  ]
}
```

## AI-Enhanced Endpoints (Stubs)

### Upload Document with Analysis
```http
POST /api/v1/documents/upload-with-analysis
```

**Request Body**:
```json
{
  "document_type": "contract",
  "analysis_level": "comprehensive",
  "auto_detect_fields": true,
  "compliance_check": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "document_id": "uuid",
    "ai_analysis": {
      "document_summary": "Employment contract between...",
      "key_clauses": [...],
      "signature_fields": [...],
      "compliance_status": {...},
      "recommendations": [...]
    }
  }
}
```

### Generate Smart Template
```http
POST /api/v1/templates/generate-smart
```

**Request Body**:
```json
{
  "template_type": "employment_contract",
  "industry": "technology",
  "jurisdiction": "namibia",
  "requirements": {
    "parties": 2,
    "payment_terms": "monthly",
    "termination_clause": true
  }
}
```

### Analyze Compliance
```http
POST /api/v1/compliance/analyze
```

**Request Body**:
```json
{
  "document_id": "uuid",
  "compliance_frameworks": ["eta_2019", "cran"],
  "jurisdiction": "namibia"
}
```

## Full AI Integration Endpoints

### Upload Document with AI Analysis
```http
POST /api/v1/ai/documents/upload-with-ai-analysis
```

**Request**: Multipart form data
- `file`: PDF document file
- `document_type`: Type of document (default: "contract")

**Response**:
```json
{
  "success": true,
  "document_id": "uuid",
  "ai_analysis": {
    "document_summary": "AI-generated summary...",
    "key_clauses": [
      {
        "topic": "termination",
        "summary": "Either party may terminate..."
      }
    ],
    "signature_fields": ["AI detected signature locations"],
    "compliance_status": {
      "eta_2019_notes": "Compliance analysis..."
    },
    "recommendations": ["AI recommendations"],
    "engine": "llamaindex"
  }
}
```

### Generate AI Smart Template
```http
POST /api/v1/ai/templates/generate-smart
```

**Request Body**:
```json
{
  "template_type": "employment_contract",
  "industry": "technology",
  "jurisdiction": "namibia",
  "requirements": {
    "parties": 2,
    "payment_terms": "monthly",
    "termination_clause": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "template_id": "uuid",
    "template_content": "AI-generated template content...",
    "signature_fields": [...],
    "compliance_notes": [...],
    "customization_options": [...],
    "engine": "llamaindex"
  }
}
```

### AI Compliance Analysis
```http
POST /api/v1/ai/compliance/analyze
```

**Request Body**:
```json
{
  "document_id": "uuid",
  "frameworks": ["eta_2019", "cran"],
  "jurisdiction": "namibia"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "compliance_score": 95,
    "eta_compliance": {
      "section_17": "compliant",
      "section_20": "compliant",
      "section_21": "compliant"
    },
    "cran_compliance": {...},
    "recommendations": [...],
    "risk_assessment": {...}
  }
}
```

### Get AI Insights
```http
GET /api/v1/ai/documents/{document_id}/ai-insights
```

**Response**:
```json
{
  "success": true,
  "document_id": "uuid",
  "insights": {
    "document_summary": "AI-generated summary...",
    "key_clauses": [...],
    "signature_fields": [...],
    "compliance_status": {...},
    "recommendations": [...]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `401` | Invalid API key |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

## Data Models

### Recipient
```json
{
  "email": "string",
  "name": "string (optional)",
  "role": "string (default: 'signer')"
}
```

### Document
```json
{
  "id": "uuid",
  "title": "string",
  "file_url": "string (optional)",
  "recipients": "Recipient[]",
  "message": "string (optional)",
  "status": "draft | sent | completed"
}
```

### Signature Request
```json
{
  "id": "uuid",
  "document_id": "uuid",
  "recipients": "Recipient[]",
  "status": "requested | completed",
  "expires_in_days": "number"
}
```

### Template
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string (optional)",
  "category": "string (optional)",
  "fields": "Field[]"
}
```

## LlamaIndex Integration (per `llamaindex.md`)

- Document Intelligence: vector indexing of uploaded docs, clause extraction, signature field hints
- Smart Template Generator: AI-generated templates with ETA 2019 compliance guidance
- Compliance Checker: ETA 2019 and CRAN checks with structured outputs
- Enable with `LLAMAINDEX_ENABLE=1`; graceful fallback to deterministic results if disabled

## Compliance Features

### ETA 2019 Compliance
- Section 17: Legal recognition
- Section 20: Electronic signatures
- Section 21: Document integrity
- Section 25: Consumer protection

### CRAN Accreditation
- Regulatory compliance checking
- Audit trail requirements
- Security standards

## Development Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**:
   ```bash
   export BUFFRSIGN_API_KEY="your_api_key"
   export LLAMAINDEX_ENABLE=1
   ```

3. **Start Server**:
   ```bash
   uvicorn apps.api.app:app --host 0.0.0.0 --port 8003 --reload
   ```

## Testing

Use the provided curl commands or tools like Postman to test endpoints:

```bash
# Health check
curl http://localhost:8003/health

# Create document
curl -X POST http://localhost:8003/api/v1/documents \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Document"}'
```

## Support

For API support and questions:
- **Email**: support@buffrsign.ai
- **Documentation**: https://docs.buffrsign.ai
- **Status**: https://status.buffrsign.ai
