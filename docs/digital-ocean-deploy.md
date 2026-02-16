# Deploy na DigitalOcean (Acoes do GitHub)

Este repositório possui 3 workflows para o branch `digitalOcean-dev`:

- `dev-digital-ocean-backend-publish.yml`
- `dev-digital-ocean-frontend-publish.yml`
- `dev-digital-ocean-mobile-apk-upload.yml`

## 1) Backend (DOCR)

Arquivo: `.github/workflows/dev-digital-ocean-backend-publish.yml`

Builda `backend/Dockerfile` e publica no DOCR com tags:
- `${GITHUB_SHA}`
- `latest`

Segredos necessarios:
- `DIGITAL_OCEAN_ACCESS_TOKEN`
- `DIGITAL_OCEAN_CONTAINER_REGISTRY`
- `DIGITAL_OCEAN_BACKEND_REPOSITORY`

Variaveis de execucao recomendadas no App Platform (servico backend):
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

Este fluxo usa `--build-arg NGINX_CONF=nginx.prod.conf`.

Segredos necessarios:
- `DIGITAL_OCEAN_ACCESS_TOKEN`
- `DIGITAL_OCEAN_CONTAINER_REGISTRY`
- `DIGITAL_OCEAN_FRONTEND_REPOSITORY`

## 3) Mobile (APK como artifact no GitHub)

Arquivo: `.github/workflows/dev-digital-ocean-mobile-apk-upload.yml`

Gera APK `ci` (apontando para backend da DigitalOcean) e publica como artifact no GitHub Actions com nome:
- `sat-mobile-ci-apk-<sha>`

Segredos necessarios:
- Nenhum segredo adicional para upload do APK.

Observacao:
- O fluxo publica instrucoes no resumo do job.
- O download do APK fica em `Actions > workflow run > Artifacts`.

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
