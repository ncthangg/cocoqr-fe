# State Rules

> **Scope:** This file owns the decision of *which state tool to use*. `react.rules.md` defers here. 
> For form state specifically → `form.rules.md`.

## Choosing a State Tool
 
| State type | Tool |
|---|---|
| UI state (toggles, open/close, selections) | `useState` |
| Modal open/close | `useState` |
| Form values & validation | `react-hook-form` |
| Global state (shared across pages) | Redux |
| Dependency injection (theme, auth, services) | Context |

## `useState`
 
- Default choice for anything scoped to a single component or subtree
- Keep state as local as possible (see `performance.rules.md` — co-location)
 

## react-hook-form

- Owns all form field values, dirty state, and validation
- Do **not** mirror form values into `useState` or Redux

## Redux

- Use for state that must be shared across multiple, unrelated pages
- File convention: `src/store/<domain>.slice.ts`
- ❌ Do **not** store raw API response data in Redux — it creates unnecessary coupling and stale data issues

## Context

- Use only for **dependency injection**: auth tokens, theming, app-wide services
- Do **not** use Context as a substitute for Redux global state or component-local state

## Avoid

- store API data in Redux