from fastapi import FastAPI

app = FastAPI(title="BuffrSign API", version="0.1.0")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/v1/ping")
def ping():
    return {"message": "pong"}
