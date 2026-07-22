---
last-updated: 2026-07-22
---

# Frontend View Architecture (React + TypeScript)

Universal layer model, folder layout, and tier patterns for **View + react-ts** projects. Each screen or functional area is a **View module** — a self-contained vertical slice.

## Layer model

Dependency direction (always inward):

```
UI ──> HOOKS/CONTEXT ──> INFRASTRUCTURE ──> DOMAIN ──> API/MODEL
```

| Layer | Contents |
|-------|----------|
| **API/MODEL** | Public contract: types, port interfaces (`FooResource`), constants, events. No React, no fetch, no imports from other View layers. |
| **DOMAIN** (optional) | Pure business logic, validation rules. Imports **only** `api/`. |
| **INFRASTRUCTURE** | DTOs, mappers (pure functions), resources (fetch/axios), mocks. Imports `api/` + `domain/`. |
| **HOOKS/CONTEXT** | `useXxx` hooks, `FooProvider`, query key factories. Orchestrates state; binds ports at runtime via Context. |
| **UI** | `FooView` entry and presentational components. Imports `api/` and hooks — no DTOs, no fetch. |

## View module structure

One folder per View (vertical slice):

```
src/views/foo/
├── index.ts                     # public barrel
├── FooView.tsx                  # View entry
├── api/
├── domain/                      # optional
├── infrastructure/
│   ├── dto/
│   ├── mappers/
│   └── resources/
├── hooks/
├── context/
└── components/
```

App-level shared code lives outside View folders:

```
src/
├── views/           # View modules
├── shared/          # cross-View components, hooks, utils
└── app/             # router, root providers, shell
```

- Import from another View only through its `index.ts`, or through `shared/`.
- Use project path aliases — avoid deep relative imports across Views.
- Extract to `shared/` when a second View genuinely needs the same code.

## Tier patterns

Start with the simplest tier; promote only when a real business rule emerges.

| Tier | Pattern | When |
|------|---------|------|
| 0 | Presentational component | Stateless UI, props only |
| 1 | `ui + hooks` | Simple View, props from host or single fetch |
| 2 | `ui + hooks + infrastructure + api` | CRUD / load Views, DTO mapping, no logic beyond conversion |
| 3 | `ui + hooks + infrastructure + domain + api` | Validation, rules, multi-step flows, non-trivial client state |

**Tier 2 rule:** mappers convert DTO → API model directly. If logic beyond mapping is needed, promote to Tier 3.

**Tier 2 call chain:**

```
FooView mounts
  → useFooQuery()
    → fooResource.getList()          ← port (api/)
          ↑ FooProvider binds →
      createHttpFooResource()        ← infrastructure
        → mapFooListFromDto(dto)     ← mapper
          → FooView renders
```

## Object types and mappers

| Layer | Types |
|-------|-------|
| API/MODEL | Interfaces, read model types, port interfaces |
| DOMAIN | Pure functions, validation rules |
| INFRASTRUCTURE | DTOs, mappers, concrete resources |

**Mapper chain** — DTOs never cross the infrastructure boundary:

```
fooResource.get() → FooResponseDto
  → mapFooFromDto(dto): Foo
    → useFooQuery returns Foo
      → FooView renders
```

**HTTP resource chain:**

```
FooResource (interface)           ← api/
  └─ mockFooResource              ← infrastructure/resources/
  └─ createHttpFooResource()      ← infrastructure/resources/
       └─ FooResponseDto          ← infrastructure/dto/
            └─ mapFooFromDto()    ← infrastructure/mappers/
```

## State placement

| State kind | Mechanism | Where |
|------------|-----------|-------|
| Server state | TanStack Query (`useQuery`, `useMutation`) | `hooks/` |
| UI state | `useState` | `ui/` or `hooks/` |
| View-scoped state | `useReducer` + Context, or Zustand | `hooks/` + `context/` |
| URL state | Router `searchParams` / route params | `hooks/` |

**Hooks layout:**

```
hooks/
├── fooQueryKeys.ts
├── useFooQuery.ts
├── useFooMutation.ts       # when needed
└── useFooViewModel.ts      # composes query + UI state
```

Prefer local or View-scoped state. Use a global store only when the project already standardizes on one and the need is genuinely cross-cutting.

Local patches / optimistic updates: `queryClient.setQueryData` or `useReducer` in the hook.

## Composition root (`context/`)

Binds port interfaces to concrete implementations — no business logic.

```tsx
<FooProvider resource={mockFooResource} labels={defaultLabels}>
  <FooView />
</FooProvider>
```

Host route or app shell passes `mockFooResource` or `createHttpFooResource(fetchFn)`. Provider exposes ports via Context; hooks consume them.

## UI component split

| Type | Convention | Role |
|------|------------|------|
| View | `FooView.tsx` | Screen entry: layout, hook wiring, loading/error/empty |
| Presentational | `FooList.tsx`, `FooRow.tsx` | Props in, JSX out |
| Colocated | `components/` next to `FooView.tsx` | Subcomponents private to the View |

Logic lives in hooks (`useFooViewModel`), not in large View files.

## Naming conventions

| Artifact | Convention | Example | Layer |
|----------|------------|---------|-------|
| Read model | `Foo`, `FooItem` | `Order`, `OrderLine` | `api/` |
| HTTP port | `FooResource` | `interface OrderResource` | `api/` |
| HTTP impl | `createHttpFooResource` / `mockFooResource` | factory | `infrastructure/resources/` |
| Mapper | `mapFooFromDto` | pure function | `infrastructure/mappers/` |
| DTO | `FooResponseDto` | JSON shape | `infrastructure/dto/` |
| Query hook | `useFooQuery` | | `hooks/` |
| View model | `useFooViewModel` | | `hooks/` |
| Provider | `FooProvider` | | `context/` |
| View | `FooView` | | root of View folder |
| Query keys | `fooQueryKeys` | `all`, `list()`, `detail(id)` | `hooks/` |
| Domain rule | `validateFoo` | pure function | `domain/` |

## Anti-patterns

| Don't | Do instead |
|-------|------------|
| `fetch` in `useEffect` in a View | `useQuery` in `hooks/` |
| DTOs in `api/` or `ui/` | Convert at infrastructure boundary via mappers |
| Port interfaces in `infrastructure/` | Declare in `api/`; implement in `infrastructure/` |
| Global store for View-local state | TanStack Query + local or View-scoped state |
| God View (300+ lines) | View + hook + presentational children |
| App-wide Context for one View | Scoped `FooProvider` |
| Deep imports into another View's folders | Public `index.ts` or `shared/` |
| UI importing HTTP clients | UI uses hooks; hooks use resources |

## Example View module (Tier 2)

```
src/views/orders/
├── index.ts
├── OrdersView.tsx
├── api/
│   ├── Order.ts
│   └── OrderResource.ts
├── infrastructure/
│   ├── dto/OrderResponseDto.ts
│   ├── mappers/mapOrderFromDto.ts
│   └── resources/
│       ├── mockOrderResource.ts
│       └── createHttpOrderResource.ts
├── hooks/
│   ├── orderQueryKeys.ts
│   ├── useOrdersQuery.ts
│   └── useOrdersViewModel.ts
├── context/
│   └── OrdersProvider.tsx
└── components/
    ├── OrderList.tsx
    └── OrderRow.tsx
```

Full rule with editor globs: `rules/frontend/react-architecture.mdc` (`**/*.{tsx,jsx}`).
