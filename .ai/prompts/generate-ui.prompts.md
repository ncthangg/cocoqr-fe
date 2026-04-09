# Generate UI Prompt

> ⚠️ **MUST read `ui.rules.md` before any `.tsx` edit.**

## When
Create page, form, table, modal, or any UI component.

## Skills
`create-page` · `create-form` · `create-table` · `create-modal`

## Rules
`ui` · `component` · `table` · `form` · `modal` · `state` · `api` · `react` · `performance` · `project`

## Workflow
1. Read `ui.rules.md` → confirm tokens & forbidden patterns
2. Pick matching Skill → follow its steps
3. Fetch via `*-api.service.ts` (`PagingVM<T>` or `T[]`)
4. Handle loading / empty / error (`react-toastify`)
5. Optimize: `useMemo` columns, `useCallback` handlers, `React.lazy` heavy modals
6. Verify: no inline styles, no raw Tailwind, no `any`, icons from `lucide-react`
