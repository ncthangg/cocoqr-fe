# Project Rules

## Folder Structure
src/
 ├── pages/
 ├── components/
 ├── services/
 ├── models/
 ├── hooks/
 ├── store/
 ├── router/
 ├── constants/

## Pages
- Pages → `src/pages/<role>/<feature>/page.tsx`
- Router → `src/router/app.router.tsx`
- Models → `src/models/*.model.ts`

## Router
- `src/router/app.router.tsx`
- Guard → `RequireAuth` → `RequireRole`
- Fallback `*` → HOME

## API
- Use `*-api.service.ts`
- Return `Promise<T>`
- Use `axiosPrivate` / `axiosPublic`

## Models
- `src/models/*.model.ts`
- Suffix: `Req` `Res` `VM`

## Naming
- Component → PascalCase
- Hooks → camelCase `useSomething`
- Files → kebab-case
- Redux → `*.slice.ts`
- Service → `*.service.ts`
- Model → `*.model.ts`

## Feedback
- Use `react-toastify`