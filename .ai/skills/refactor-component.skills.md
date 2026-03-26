---
name: refactor-component
description: Blueprint for optimizing, breaking down, and standardizing oversized React components.
---
# Refactor Component Skill

## Purpose
- Eradicate inline bloat, God components, and duplicate markup.
- Systematically improve render tree performance.

## Steps
1. **Analyze**: Identify repeating raw layout structures and inline functions.
2. **Standardize**: Replace raw HTML tags and arbitrary CSS with utilities from (`components/ui/`, `components/UICustoms/`) and `cn()`.
3. **Split**: Isolate distinct render blocks (e.g., Modals, Forms, Table Rows) into explicitly typed sub-components.
4. **Isolate State**: Move `useState` / `useEffect` dependencies exclusively into the smallest child component requiring them.

## Performance
- **Memoize**: Attach `memo` to heavy child components. Use `useCallback` for heavily propagated function props.
- **Reference**: Extract static objects outside render loop (module scope) or wrap with `useMemo`.
- **Props Drip**: NEVER pass massive monolithic models. Drill down strictly primitive values as props whenever possible.

## Follow Rules
- **Types**: Purge all `any` usages. Ensure properties match `src/models/*.model.ts`.
- **Icons**: Extract raw bloated SVG strings; substitute with standardized `lucide-react` icons.
- **Standards**: Verify the output strictly aligns with `.ai/rules/react.rules.md`.
