# CI/CD Setup

## Required GitHub Secrets

- `VERCEL_TOKEN`: Vercel token with access to the project
- `VERCEL_ORG_ID`: Your Vercel org ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID (for apps/web)
- `RAILWAY_TOKEN`: Railway account token

GHCR uses the built-in `GITHUB_TOKEN` for publish permissions (packages: write).

## Workflows

- `docker-publish.yml`: builds & pushes backend/frontend images to GHCR on main
- `vercel-deploy.yml`: deploys `apps/web` to Vercel on main
- `railway-deploy.yml`: placeholder to trigger Railway deploys (bind service first)

## Notes

- Update Kubernetes manifests `infrastructure/kubernetes/*.yaml` to reference GHCR images
- For production, create Kubernetes secrets for database and redis URLs
- Nginx config routes `/api/` to backend and the rest to frontend
