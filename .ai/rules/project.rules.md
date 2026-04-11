# Project Rules

## Single Source of Truth (SSOT)
- **UI & Styling**: `ui.rules.md` is the absolute authority for all visual design, tokens, and CSS classes.
- **AI Instruction**: Before modifying any `.tsx` or CSS files, you **MUST** read `ui.rules.md` to ensure compliance with the Design System. Never guess colors, spacing, or class names.
- **Component Patterns**: `component.rules.md` defines how to structure React components.
- **State Management**: `state.rules.md` defines which state tool to use (State, Redux, Context).

## Folder Structure
```
src/
 ├── pages/          # Smart components (state/fetch/route)
 ├── components/
 │   ├── ui/         # Generic, reusable UI
 │   └── UICustoms/  # Project-specific components
 ├── services/       # API service files
 ├── models/         # TypeScript interfaces/types
 ├── hooks/          # Custom React hooks
 ├── store/          # Redux slices
 ├── router/         # Route definitions & guards
 └── constants/
```

## File Naming
 
| Type | Convention | Example |
|---|---|---|
| Component | PascalCase | `UserCard.tsx` |
| Page | kebab-case path + `page.tsx` | `pages/admin/users/page.tsx` |
| Hook | camelCase | `useDebounce.ts` |
| Service | `*.service.ts` | `user-api.service.ts` |
| Redux slice | `*.slice.ts` | `auth.slice.ts` |
| Model | `*.model.ts` | `user.model.ts` |
| General file | kebab-case | `format-date.ts` |

## Models
 
- Location: `src/models/*.model.ts`
- Suffix convention: `Req` · `Res` · `VM`
 
```ts
// user.model.ts
export interface UserReq { ... }
export interface UserRes { ... }
export interface UserVM  { ... }
```

## Router 
- File: `src/router/app.router.tsx`
- Guard order: `RequireAuth` → `RequireRole`
- Unmatched routes (`*`) redirect to `HOME`

## Feedback
- Use **`react-toastify`** for all user-facing toast notifications.
- Error toasts → triggered in API services (see `api.rules.md`)
- Success toasts → triggered after form submission (see `form.rules.md`)