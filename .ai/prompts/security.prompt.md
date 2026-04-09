# Security Prompt

> ⚠️ **MUST read `api.rules.md` before any API/auth change.**

## When
Add input validation, audit XSS risks, secure API calls, review route guards.

## Skills
`security`

## Rules
`api` · `form` · `project` · `react`

## Workflow
1. Validate: every form uses `zod` + `zodResolver`. Never trust raw input
2. Sanitize: no `dangerouslySetInnerHTML`, use safe JSX binding `{value}`
3. API safety: `axiosPrivate` (auth) / `axiosPublic` (public), `try/catch` + `toast.error()`
4. Safe access: optional chaining `?.`, nullish coalescing `?? []`
5. Hide internals: generic error toasts only, never expose stack traces
6. Guard routes: `RequireAuth` → `RequireRole` (see `project.rules.md`)
7. Verify: no `eval()`, no template injection, no unescaped HTML
