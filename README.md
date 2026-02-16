# SAT Platform

Repositorio do teste tecnico da SAT com tres aplicacoes:

- `backend/`: API Spring Boot (Java 17)
- `frontend/`: Dashboard Angular 15
- `mobile/`: App Android para tecnicos (Kotlin + Jetpack Compose)

O problema de negocio coberto e controle de estoque com operacao offline no app mobile e sincronizacao automatica com o backend.

## Estrutura do repositorio

```txt
sat-platform/
├── backend/                    # API REST (Spring Boot)
├── frontend/                   # Dashboard web (Angular 15)
├── mobile/                     # Aplicativo Android (Kotlin/Compose)
├── refatoracao-pedidos/        # Item 2 do teste: diagnostico e proposta arquitetural
├── docs/digital-ocean-deploy.md
└── Teste tecnico.md            # Enunciado original
```

## Tecnologias

### Backend
- Java 17
- Spring Boot 3.5.x
- Spring Data JPA
- Spring Security
- H2 (desenvolvimento local)
- PostgreSQL (perfil `prod`)
- Maven

### Frontend
- Angular 15
- Node 18 (`.nvmrc`)

### Mobile
- Kotlin
- Jetpack Compose
- Room
- Koin
- WorkManager
- MVVM + Repository Pattern

## Pre-requisitos

- Git
- Java 17 (JDK)
- Android Studio (para execucao do app mobile)
- Android SDK (API 24+)
- Node 18
- NVM (recomendado para gerenciar versao do Node)

### Instalacao do NVM e Node 18 (se necessario)

Se voce ainda nao tiver NVM instalado, siga a documentacao oficial:
- `https://github.com/nvm-sh/nvm#installing-and-updating`

Depois instale e ative o Node 18:

```bash
nvm install 18
nvm use 18
```

## Como rodar localmente

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend em `http://localhost:8080`.

### 2. Frontend

```bash
cd frontend
nvm use
npm install
npm start
```

Frontend em `http://localhost:4200`.

### 3. Mobile

Opcao recomendada (Android Studio + emulador):

1. Abrir o Android Studio.
2. Selecionar `Open` e apontar para a pasta `mobile/`.
3. Aguardar sincronizacao do Gradle.
4. Criar/iniciar um emulador no Device Manager.
5. Executar o app pelo botao `Run`.

Opcao com dispositivo fisico:

- habilitar `USB debugging` no Android
- conectar o dispositivo e executar pelo Android Studio

Opcao B (linha de comando):

```bash
cd mobile
./gradlew :app:assembleDebug
```

## Testes

### Backend

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npm test
```

### Mobile

```bash
cd mobile
./gradlew test
```

## Requisitos do teste e como foram atendidos

Fonte: `Teste tecnico.md`

### 1) Desenvolvimento aplicacao WEB

Requisito:
- Backend Spring Java
- Frontend Angular 13/14/15
- Pelo menos duas telas
- Pelo menos um teste unitario com JUnit

Atendimento:
- Backend Spring Boot implementado em `backend/`.
- Frontend Angular 15 implementado em `frontend/`.
- Telas web implementadas (ex.: login, estoque, atividades).
- Testes JUnit no backend (ex.: `backend/src/test/java/com/pedrowilson/satbackend/inventory/application/InventoryServiceTest.java`).

### 2) Refatorando um codigo com problemas arquiteturais

Atendimento:
- Entrega dedicada em `refatoracao-pedidos/` com:
  - codigo problemático original em `refatoracao-pedidos/problema/`
  - proposta de refatoracao em `refatoracao-pedidos/proposta/`
  - analise arquitetural e direcao de solucao nos READMEs dessa pasta
- Observacao: e um esboco arquitetural intencional para demonstrar direcao; no README da proposta estao listados os complementos para uma solucao completa de producao.

### 3) Desenvolvimento aplicativo movel

Requisito:
- Kotlin
- Jetpack Compose
- Room com ao menos 2 migracoes
- Koin
- WorkManager
- MVVM + Repository Pattern
- Sincronizacao automatica quando houver internet

Atendimento:
- Mobile implementado em Kotlin + Compose no modulo `mobile/`.
- Persistencia local com Room e multiplas migracoes em `mobile/app/src/main/java/com/pedrowilson/sat/mobile/data/local/DatabaseMigrations.kt`.
- Injetor de dependencia com Koin em `mobile/app/src/main/java/com/pedrowilson/sat/mobile/di/AppModules.kt`.
- Sincronizacao em background com WorkManager em `mobile/app/src/main/java/com/pedrowilson/sat/mobile/work/`.
- Arquitetura MVVM + Repository aplicada na camada `ui/inventory`, `domain` e `data/repository`.
- Fluxo offline-first implementado: consumo local e sincronizacao automatica posterior.

## Deploy

- Workflows de CI/CD em `.github/workflows/`.
- Backend e frontend publicados no DigitalOcean Container Registry.
- APK Android gerado como artifact no GitHub Actions.
- Guia de deploy: `docs/digital-ocean-deploy.md`.

### Ambiente publicado

- Frontend em producao (DigitalOcean App Platform):
  - `https://sat-frontend-2t7nr.ondigitalocean.app/`

### Download do APK mobile

O APK `ci` do app mobile (com backend da DigitalOcean) e gerado pela workflow:
- `.github/workflows/dev-digital-ocean-mobile-apk-upload.yml`

Para baixar:
1. Ir em `GitHub > Actions`.
2. Abrir a execucao da workflow de mobile.
3. Baixar o artifact `sat-mobile-ci-apk-<sha>`.

## Credenciais de acesso

Usuarios iniciais semeados pelo backend (`DataInitializer`):

- `Pedro` / `Pedro` (perfil `ADMIN`)
- `Felipe` / `Felipe` (perfil `TECHNICIAN`)
- `Gustavo` / `Gustavo` (perfil `TECHNICIAN`)

Uso por aplicacao:

- Frontend web (painel administrativo): usar `Pedro` / `Pedro`
- Mobile (app tecnico): usar `Felipe` / `Felipe` ou `Gustavo` / `Gustavo`

## Git hooks

Este repositorio possui hooks versionados em `.githooks/`:
- `commit-msg`: valida Conventional Commits
- `pre-commit`: bloqueia vazamento de arquivos sensiveis e erros comuns
- `pre-push`: valida mensagens e bloqueia commits `WIP`

Ativacao (uma vez por clone):

```bash
./scripts/install-git-hooks.sh
```

## Observacoes finais

- Para instrucoes de colaboracao de agentes de IA no repositorio, consulte `AGENTS.md`.
