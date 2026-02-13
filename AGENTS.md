# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Scope

`sat-platform` is a monorepo for a technical challenge with three apps:
- `backend/`: Spring Boot API (Java 17, Maven)
- `frontend/`: Angular dashboard (Angular 15, Node 18)
- `mobile/`: Android app (Kotlin, Jetpack Compose, Gradle)

Current phase: foundation and incremental implementation. Keep changes scoped and pragmatic.

## Repository Map

- `backend/src/main`: API code
- `backend/src/test`: backend tests
- `frontend/src`: Angular app code
- `mobile/app/src/main`: Android app code
- `mobile/app/src/test`: local unit tests
- `mobile/app/src/androidTest`: instrumented tests
- `Teste técnico.md`: challenge requirements and constraints

## Run Commands

Run commands from repository root unless noted.

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
nvm use
npm start
```

### Mobile

```bash
cd mobile
./gradlew :app:assembleDebug
```

## Test Commands

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

## Coding Standards

- Prefer minimal, focused patches; avoid broad refactors unless requested.
- Preserve existing style and naming in each module.
- Keep public behavior explicit; avoid hidden side effects.
- Do not introduce new dependencies unless needed for the task.
- Add or update tests when behavior changes.

## Architecture Constraints

- Respect module boundaries (`backend`, `frontend`, `mobile` are independently runnable).
- Mobile requirements in this challenge should remain aligned with:
  - Kotlin + Jetpack Compose
  - Room
  - Koin
  - WorkManager
  - MVVM + Repository pattern
- Backend should keep Spring idioms (controller/service/repository separation).

## Git and Commit Rules

- Conventional Commits are required.
- Valid format:
  - `<type>[optional scope][!]: <description>`
- Common examples:
  - `feat(backend): add pedidos endpoint`
  - `fix(frontend): correct route guard logic`
  - `chore(mobile): update gradle config`
- Hooks are versioned in `.githooks/`.
- Install once per clone:

```bash
./scripts/install-git-hooks.sh
```

- Preferred commit command format (for humans and agents):

```bash
git commit -m $'feat(scope): short title\n\nWhy this change was needed and what was done.'
```

- The first line must always follow Conventional Commits.
- Use the commit body for context, rationale, and important implementation notes.

## Safety and Non-Goals

- Never commit secrets, credentials, tokens, or private keys.
- Do not change CI/release/security-sensitive configuration unless explicitly requested.
- Do not rewrite history, reset unrelated files, or revert user changes without request.
- Do not implement speculative features not tied to current requirements.

## Definition of Done

Before finalizing a task:
1. Relevant code is implemented and scoped to the request.
2. Relevant tests/checks are run (or explicitly reported if not run).
3. Documentation is updated when commands/behavior change.
4. Changes follow Conventional Commits and repository hooks.
