.PHONY: dev up down build api web test backup monitor

dev: ## start dev stack
	./scripts/init-project.sh

up:
	docker compose up -d

down:
	docker compose down -v

build:
	docker compose build

api:
	uvicorn apps/api/app:app --reload --port 8000

web:
	cd apps/web && npm i && npm run dev

backup:
	./scripts/backup.sh

monitor:
	./scripts/monitor.sh

help:
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
