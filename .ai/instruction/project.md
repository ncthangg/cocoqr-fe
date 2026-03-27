# Project Instruction

## Purpose & Scope
This document is the source of truth for AI and developers working on CocoQR.FE.
Changes must follow the current architecture and avoid regression in:
- Authentication
- Routing
- API
- UI
- Performance

## Tech Stack
- React + TypeScript + Vite
- Router: react-router-dom (data router with createBrowserRouter)
- State: Redux Toolkit (auth.slice) + AuthContext
- HTTP: Axios (axiosPrivate, axiosPublic) + refresh interceptor
- UI: Tailwind CSS + tokens in src/styles/globals.css
- Components: UICustoms + src/components/ui
- Notifications: react-toastify
- Icons: lucide-react
- Shadcn UI-inspired component utilities (`cva`, `cn`, `Slot`)

## Folder Architecture
- **Pages**: `src/pages/{public|user|admin}/.../page.tsx`.
- **Layout**: `src/layouts/UserLayout.tsx`, `src/layouts/AdminLayout.tsx`.
- **Router**: `src/router/app.router.tsx`.
- **Services**: `src/services/*-api.service.ts`.
- **API constants**: `src/constants/api.constant.ts`.
- **Route constants**: `src/constants/route.constant.ts`.
- **Store**: `src/store/index.ts`, `src/store/slices/auth.slice.ts`.
- **Auth providers/guards**: `src/auth/*`.

## Execution Priority (P0/P1/P2)
### P0 — Critical
1. **Do not break authentication flow**
   - Always use `RequireAuth` -> `RequireRole`.
   - Use `axiosPrivate` for authenticated requests.
2. **Do not break service contracts**
   - Service return typed payload, map on `ApiConstant`.
3. **Do not break UI token system**
   - Priority class/token existed: `.btn`, `.input`, `.card`, `bg-surface`, `text-foreground`, `border-border`.
4. **Do not introduce parallel architecture**
### P1 — Recommended
1. Reuse components before creating new ones (`src/components/UICustoms`, `src/components/ui`).
2. Separate business logic from UI components.
3. Standardize loading / empty / error states.
4. Use `toast` for user feedback.
### P2 — Optimization
1. Reduce `any`, improve type safety.
2. Standardize naming by domain: account/provider/bank/qr/history/role/user.
3. Avoid inline styles, use Tailwind tokens.

## Auth + session lifecycle
1. Redux `auth.slice` stores `user/token/roles`, `isAuthModalOpen`, `isUserSynced` + localStorage persistence.
2. `AuthProvider` read Redux state, expose `logout()`.
3. `axiosPrivate`:
   - Request: attach `Authorization` from cookie `accessToken`.
   - Response: if `401` refresh token => retry once; fail => session-expired flow.
4. `auth-token.service.ts`:
   - Refresh queue (`TokenRefresher`) to avoid refresh at the same time.
   - Session expired: UI handler + cleanup `finalizeSession()`.
**Rule:** Always test: login → expired token → refresh → logout.


## UI System
- **Styling**:
  - CSS variables are defined in `globals.css`
  - Tailwind maps variables via `tailwind.config.js`
  - Always prefer Tailwind classes instead of raw CSS variables
- **Tablepattern**:
  - `data-table-column-header.tsx`
  - `table-toolbar.tsx`
  - `data-table.tsx`
  - `data-table-pagination.tsx`
- **Icons**: `Lucide React` (always include explicit size: `w-5 h-5`).
- **Feedback**: `react-toastify` for async operation results.


## API & Fetch Rules
1. Define endpoint in `ApiConstant`.
2. Do not call axios directly in pages except case was reviewed.
3. Service function must be typed return (`Promise<...>`).
4. Async form must include: loading, disable button, toast result/error.

---

## Performance Guidelines
References:
- https://react.dev/reference/react/hooks
- https://react.dev/reference/react/lazy
- https://react.dev/reference/react/Suspense

Quy tắc:
1. Use `lazy + Suspense` for heavy routes/modals.
2. `useMemo/useCallback/memo` use only when necessary.
3. Avoid new object/function in render.
4. Deduplicate fetch calls.
5. Do not use server-only cache features.
