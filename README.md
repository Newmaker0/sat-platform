# SAT Platform

Projeto técnico composto por:

- Backend (Spring Boot - Java)
- Frontend (Angular 15)
- Mobile (Android Kotlin + Jetpack Compose)

O objetivo é simular uma plataforma de gestão de estoque para técnicos de campo, com sincronização offline.

---

## 🏗 Arquitetura Geral

sat-platform/
│
├── backend/   → API REST (Spring Boot)
├── frontend/  → Dashboard administrativo (Angular)
└── mobile/    → Aplicativo Android para técnicos

---

## ⚙️ Tecnologias Utilizadas

### Backend
- Java 17
- Spring Boot 3.5.x
- Spring Data JPA
- Spring Security
- H2 (desenvolvimento)
- PostgreSQL (pronto para produção)
- Maven

### Frontend
- Angular 15
- Node 18 (controlado via .nvmrc)

### Mobile
- Kotlin
- Jetpack Compose
- MVVM (estrutura base)
- Android SDK 24+

---

## ▶ Como rodar o projeto

### 1️⃣ Backend

cd backend
./mvnw spring-boot:run

Disponível em:
http://localhost:8080

---

### 2️⃣ Frontend

cd frontend
nvm use
ng serve

Disponível em:
http://localhost:4200

---

### 3️⃣ Mobile

Abrir a pasta "mobile/" no Android Studio e rodar em:
- Emulator
ou
- Dispositivo físico (USB debugging habilitado)

---

## 🔐 Autenticação

Spring Security está habilitado.
Em ambiente de desenvolvimento, um usuário "user" é gerado automaticamente no log ao iniciar a aplicação.

---

## 📦 Organização

- Monorepo
- Cada módulo pode ser executado de forma independente
- Node versionado por projeto usando .nvmrc

---

## 🚧 Próximos Passos

- Definição do domínio (estoque, consumo, usuários)
- Implementação da sincronização offline no mobile
- Integração entre backend, mobile e dashboard

---

## ✅ Git Hooks

Este repositório possui hooks versionados em `.githooks/`:
- `commit-msg`: valida Conventional Commits (`<type>[optional scope][!]: <description>`)
- `pre-commit`: bloqueia arquivos `.env` reais, merge markers, chave privada, trailing whitespace e arquivos grandes acidentais
- `pre-push`: bloqueia commits `WIP` e commits fora do padrão Conventional Commits

Tipos aceitos:
- `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

### Como ativar (uma vez por clone)

```bash
./scripts/install-git-hooks.sh
```

Exemplos válidos:
- `feat(mobile): add stock sync worker`
- `fix(backend)!: change pedidos endpoint validation`
- `docs: update technical test notes`

---

## 🤖 AI Contributors

If you are using Codex/AI agents to work in this repository, follow `AGENTS.md` for project-specific workflow, commands, constraints, and done criteria.
