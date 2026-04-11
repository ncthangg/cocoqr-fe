---
name: security
description: Secure UI and prevent XSS vulnerabilities.
---
# Security Skill

## Purpose
- Prevent XSS.
- Validate inputs.
- Secure API handling.

## Steps
- Validate with `zod`
- Sanitize user input
- Avoid `dangerouslySetInnerHTML`
- Use safe JSX binding

## API Safety
- Optional chaining `?.`
- Safe fallback `?? []`
- Handle API errors safely

## Security Rules
- Use `axiosPrivate`
- Hide internal errors
- Use `react-toastify`.

## Follow Rules
- project.rules.md
- react.rules.md