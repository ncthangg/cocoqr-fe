---
name: refactor-component
description: Standardize UI styling and component structure.
---
# Refactor Component Skill

## Purpose
- Standardize UI styling
- Remove duplicated markup
- Improve component structure

## Steps
1. **Analyze**: Identify repeating raw layout structures and inline functions.
2. **Standardize**: Replace raw HTML tags and arbitrary CSS with utilities from (`components/ui/`, `components/UICustoms/`) and `cn()`.
3. **Split**: Isolate distinct render blocks (e.g., Modals, Forms, Table Rows) into explicitly typed sub-components.

## Styling
- Use Tailwind tokens
- Use `components/ui`
- Use `components/UICustoms`
- Use lucide-react icons

## Follow Rules
- **Types**: Purge all `any` usages. Ensure properties match `src/models/*.model.ts`.
- **Icons**: Extract raw bloated SVG strings; substitute with standardized `lucide-react` icons.
- **Standards**: Verify the output strictly aligns with `.ai/rules/react.rules.md`.
