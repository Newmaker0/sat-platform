# Frontend Architecture (Angular 15)

Este documento define as convenções do frontend para manter o projeto escalável e previsível.

## Objetivos

- Estruturar o app por feature, não por tipo técnico global.
- Manter acoplamento baixo entre módulos.
- Preservar consistência visual com tokens tipográficos e overrides centralizados.
- Facilitar colaboração entre pessoas e agentes.

## Estrutura de Pastas

```txt
src/
  app/
    core/                     # serviços singleton e infraestrutura de app
    shared/                   # módulos compartilhados (ex.: MaterialModule)
    auth/                     # autenticação global (guard/service)
    features/
      auth/
        pages/
          login/
        auth.module.ts
        auth-routing.module.ts
      dashboard/
        layout/
          dashboard-layout/
        pages/
          overview/
          reports/
          settings/
        dashboard.module.ts
        dashboard-routing.module.ts
    app.module.ts
    app-routing.module.ts
  styles/
    fonts.css
    tokens.css
    material-overrides.css
  material-theme.scss
  styles.css                 # agregador global de estilos
```

## Módulos e Dependências

- `AppModule`: apenas bootstrap + módulos raiz.
- `CoreModule`: importado somente em `AppModule`.
- `Shared` (`MaterialModule`): exporta módulos reutilizáveis de UI.
- `FeatureModule`: declara componentes da feature e seu routing dedicado.
- Evitar importar componentes entre features.

## Rotas

- `app-routing.module.ts` deve usar lazy loading para features.
- Cada feature mantém `*-routing.module.ts` com suas rotas internas.
- Guards globais podem ficar em `app/auth` (ou migrar para `core/auth` quando necessário).

## Componentes

- Componente de página: orquestra UI e interação.
- Evitar lógica de domínio grande no componente.
- Quando crescer, extrair para `facade`/`service` dentro da feature.
- Preferir `ChangeDetectionStrategy.OnPush` para componentes de UI.
- Em listas com `*ngFor`, usar `trackBy` para evitar re-render desnecessário.

## Estilos

- `styles.css`: apenas imports (`fonts`, `tailwind`, `tokens`, `material-overrides`).
- `tokens.css`: tipografia, variáveis e utilitários de design.
- `material-overrides.css`: customizações de Material/MDC.
- Evitar estilos visuais complexos dentro de componentes sem necessidade.

## Convenções de Nomes

- Componentes: `*.component.ts/html/css`
- Módulos: `*.module.ts`
- Rotas: `*-routing.module.ts`
- Guards/services: `*.guard.ts`, `*.service.ts`

## Regras de Evolução

- Nova tela => criar dentro da feature correspondente.
- Nova feature => criar novo módulo em `features/<nome>`.
- Ajuste global de UI => tokens/overrides globais, não CSS espalhado.
- Sempre validar com `npm run build` após refactors estruturais.
- Executar `npm run lint` antes de commit.
- Deixar `pre-commit` cuidar de formatação/lint dos arquivos staged.
