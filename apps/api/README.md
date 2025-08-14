# BuffrSign API (FastAPI)

Production-ready FastAPI service with optional LlamaIndex-powered endpoints. AI features are attempted automatically when dependencies are installed; otherwise responses fall back to deterministic stubs so the API remains stable.

## Run locally

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Optional AI dependencies

```bash
pip install llama-index-core llama-index-readers-file pypdf
```

## Key endpoints

- `GET /health` – health probe
- `POST /api/v1/documents` – create document (in-memory demo)
- `POST /api/v1/documents/upload-with-analysis` – uploads with AI analysis (LlamaIndex if installed)
- `POST /api/v1/templates/generate-smart` – AI smart template generation
- `POST /api/v1/compliance/analyze` – compliance summarization (ETA 2019 basics)

If `BUFFRSIGN_API_KEY` is set, pass `x-api-key: <value>` on requests.
