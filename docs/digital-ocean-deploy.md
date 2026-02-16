# DigitalOcean Deploy (GitHub Actions)

Este repositório possui 3 workflows para o branch `digitalOcean-dev`:

- `dev-digital-ocean-backend-publish.yml`
- `dev-digital-ocean-frontend-publish.yml`
- `dev-digital-ocean-mobile-apk-upload.yml`

## 1) Backend (DOCR)

Arquivo: `.github/workflows/dev-digital-ocean-backend-publish.yml`

Builda `backend/Dockerfile` e publica no DOCR com tags:
- `${GITHUB_SHA}`
- `latest`

Secrets necessários:
- `DIGITAL_OCEAN_ACCESS_TOKEN`
- `DIGITAL_OCEAN_CONTAINER_REGISTRY`
- `DIGITAL_OCEAN_BACKEND_REPOSITORY`

Variáveis de runtime recomendadas no App Platform (serviço backend):
- `SPRING_PROFILES_ACTIVE=prod`
- `DB_URL=jdbc:postgresql://<host>:<port>/<database>`
- `DB_USERNAME=<usuario>`
- `DB_PASSWORD=<senha>`
- `JPA_DDL_AUTO=update` (ou `validate` quando tiver migração versionada)
- `SAT_JWT_SECRET=<segredo-forte>`

## 2) Frontend (DOCR)

Arquivo: `.github/workflows/dev-digital-ocean-frontend-publish.yml`

Builda `frontend/Dockerfile` e publica no DOCR com tags:
- `${GITHUB_SHA}`
- `latest`

Este workflow usa `--build-arg NGINX_CONF=nginx.prod.conf`.

Secrets necessários:
- `DIGITAL_OCEAN_ACCESS_TOKEN`
- `DIGITAL_OCEAN_CONTAINER_REGISTRY`
- `DIGITAL_OCEAN_FRONTEND_REPOSITORY`

## 3) Mobile (APK para Spaces)

Arquivo: `.github/workflows/dev-digital-ocean-mobile-apk-upload.yml`

Gera APK debug e envia para DigitalOcean Spaces em:
- `mobile/<branch>/<sha>/sat-mobile-debug.apk`

Secrets necessários:
- `DIGITAL_OCEAN_SPACES_KEY`
- `DIGITAL_OCEAN_SPACES_SECRET`
- `DIGITAL_OCEAN_SPACES_BUCKET`
- `DIGITAL_OCEAN_SPACES_REGION`

Observação:
- O workflow publica URL no `Job Summary`.
- Para distribuição no teste técnico, esse link de Spaces é suficiente.

## Execução local com Docker (frontend + backend)

O frontend tem duas configs Nginx:
- `frontend/deploy/nginx.prod.conf`: para deploy
- `frontend/deploy/nginx.local-docker.conf`: para rodar com backend container local

Exemplo local:

```bash
docker network create sat-net

docker run --rm -d --name sat-backend --network sat-net -p 8080:8080 sat-backend:local

docker build --build-arg NGINX_CONF=nginx.local-docker.conf \
  -t sat-frontend:local \
  -f frontend/Dockerfile frontend

docker run --rm -d --name sat-frontend --network sat-net -p 4200:80 sat-frontend:local
```

Para desenvolvimento sem Docker, continue usando:
- backend no terminal (`./mvnw spring-boot:run`)
- frontend no terminal (`npm start`, usa `proxy.conf.json`)

## Backend + Postgres local (simulando produção)

Para validar o backend com perfil `prod` e banco PostgreSQL local:

```bash
docker compose -f docker-compose.backend-postgres.yml up --build -d
```

Verificações:

```bash
docker compose -f docker-compose.backend-postgres.yml ps
curl -i http://localhost:8080/actuator/health
```

Logs:

```bash
docker compose -f docker-compose.backend-postgres.yml logs -f sat-backend
```

Parar e remover:

```bash
docker compose -f docker-compose.backend-postgres.yml down
```

Parar e remover também o volume do Postgres (reset total de dados):

```bash
docker compose -f docker-compose.backend-postgres.yml down -v
```
