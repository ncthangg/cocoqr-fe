---
name: create-form
description: Blueprint for robust, validated, and performant React forms.
---
# Create Form Skill

## Purpose
- Establish type-safe validation using `zod`.
- Unify form state and rendering using `react-hook-form`.

## Steps
1. **Schema**: Define strict `z.object({...})` schema. Infer native TypeScript `<FormType>`.
2. **Hook**: Initialize `useForm<FormType>` with `zodResolver(schema)`.
3. **UI**: Render with reusable inputs (`components/ui/`). 
4. **Mutate**: Submit using custom `*-api.service.ts` calls wrapped inside `try/catch`.
5. **Status UX**: 
   - Extract `isSubmitting` to disable triggers and render spinners.
   - Display localized inline validation errors (`errors.<field>.message`).
   - Throw success/fail popups natively via `react-toastify`.

## Performance
- Sub-componentize: Keep the form inside its own isolated wrapper to prevent layout re-renders.
- Minimize hook renders: Use native mode `onBlur` or `onSubmit` over continuous `onChange`.
- Enforce `useCallback` to firmly memoize your submission (`onSubmit`) and reset handlers.

## Follow Rules
- **Reset**: Explicitly invoke `reset()` upon successful `20X` requests.
- **Styling**: `Tailwind` + `cn()` ONLY. Do NOT inline CSS properties. 
- **Icons**: Pre-format buttons with strictly `lucide-react` icons (e.g., `w-4 h-4`).