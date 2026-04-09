# Refactor Prompt

> **MUST read `ui.rules.md`, `project.rules.md` before any styling change.**

## When
Refactor component structure, clean code, improve readability.

## Skills
- refactor-component
- optimization
- region-note

## Rules
- ui
- component
- react
- state
- performance
- project

## Workflow
1. Audit: 
- inline styles
- any types
- duplicated markup
- oversized components
- unnecessary comments

2. Clean:
- remove `//` comments
- apply region structure

3. Standardize: 
- replace raw HTML/CSS
- use UI components
- use Tailwind tokens

4. Extract: 
- split modals/forms/rows
- isolate sub-components

5. Optimize: 
- useCallback handlers
- useMemo derived data
- remove inline objects

6. Fix state: 
- co-locate state
- remove unnecessary lifts

7. Verify:
- no duplication
- no any
- consistent structure
