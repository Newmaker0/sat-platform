# AGENTS.md

Guia para agentes de codificacao com IA trabalhando neste repositorio.

## Escopo do Projeto

`sat-platform` e um monorepo de teste tecnico com tres aplicacoes:
- `backend/`: API Spring Boot (Java 17, Maven)
- `frontend/`: Dashboard Angular (Angular 15, Node 18)
- `mobile/`: App Android (Kotlin, Jetpack Compose, Gradle)

Fase atual: fundacao e implementacao incremental. Mantenha as mudancas objetivas e pragmaticas.

## Mapa do Repositorio

- `backend/src/main`: codigo da API
- `backend/src/test`: testes do backend
- `frontend/src`: codigo da aplicacao Angular
- `mobile/app/src/main`: codigo da aplicacao Android
- `mobile/app/src/test`: testes unitarios locais
- `mobile/app/src/androidTest`: testes instrumentados
- `Teste tecnico.md`: requisitos e restricoes do desafio

## Comandos de Execucao

Execute os comandos a partir da raiz do repositorio, salvo indicacao contraria.

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

## Comandos de Teste

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

## Padroes de Codigo

- Prefira patches minimos e focados; evite refactors amplos sem solicitacao.
- Preserve o estilo e a nomenclatura existentes em cada modulo.
- Mantenha o comportamento publico explicito; evite efeitos colaterais ocultos.
- Nao introduza novas dependencias sem necessidade para a tarefa.
- Adicione ou atualize testes quando houver mudanca de comportamento.

## Restricoes de Arquitetura

- Respeite os limites entre modulos (`backend`, `frontend`, `mobile` sao executaveis de forma independente).
- Os requisitos de mobile neste desafio devem permanecer alinhados com:
  - Kotlin + Jetpack Compose
  - Room
  - Koin
  - WorkManager
  - MVVM + padrao Repository
- O backend deve manter os idioms do Spring (separacao controller/service/repository).

## Regras de Git e Commit

- Conventional Commits sao obrigatorios.
- Formato valido:
  - `<type>[optional scope][!]: <description>`
- Exemplos comuns:
  - `feat(backend): add pedidos endpoint`
  - `fix(frontend): correct route guard logic`
  - `chore(mobile): update gradle config`
- Hooks sao versionados em `.githooks/`.
- Instale uma vez por clone:

```bash
./scripts/install-git-hooks.sh
```

- Formato de commit recomendado (para pessoas e agentes):

```bash
git commit -m $'feat(scope): titulo curto\n\nPor que esta mudanca foi necessaria e o que foi feito.'
```

- A primeira linha deve sempre seguir Conventional Commits.
- Use o corpo do commit para contexto, motivacao e notas importantes de implementacao.

## Seguranca e Nao Objetivos

- Nunca versione segredos, credenciais, tokens ou chaves privadas.
- Nao altere configuracoes sensiveis de CI/release/seguranca sem solicitacao explicita.
- Nao reescreva historico, nao resete arquivos nao relacionados e nao reverta mudancas do usuario sem pedido.
- Nao implemente funcionalidades especulativas sem relacao com os requisitos atuais.

## Definicao de Pronto

Antes de finalizar uma tarefa:
1. O codigo relevante foi implementado e esta dentro do escopo solicitado.
2. Os testes/checks relevantes foram executados (ou foi informado explicitamente quando nao foram).
3. A documentacao foi atualizada quando comandos/comportamento mudaram.
4. As mudancas seguem Conventional Commits e os hooks do repositorio.
