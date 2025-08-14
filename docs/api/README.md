# BuffrSign API Documentation

Base URLs:
- Production: https://www.api.sign.buffr.ai/v1
- Development: http://localhost:8000

## Health
- GET `/health`

## Ping
- GET `/api/v1/ping`

## Documents API
- POST `/api/v1/documents` Create document
- GET `/api/v1/documents/{id}` Get document
- PUT `/api/v1/documents/{id}` Update document

Request example:
```bash
curl -X POST https://www.api.sign.buffr.ai/v1/documents \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Employment Contract",
    "file_url":"https://example.com/contract.pdf",
    "recipients":[{"email":"john@example.com","name":"John Doe","role":"signer"}],
    "message":"Please review and sign"
  }'
```

## Signatures API
- POST `/api/v1/signatures` Request signature
- GET `/api/v1/signatures/{id}` Get signature status

## Templates API
- GET `/api/v1/templates` List templates
- POST `/api/v1/templates` Create template

Example:
```bash
curl https://www.api.sign.buffr.ai/v1/ping
```
