---
name: security
description: Blueprint for sanitizing DOM rendering, validating inputs, and mitigating XSS payloads.
---
# Security Skill

## Purpose
- Defend the UI against XSS by strictly guarding text mappings.
- Establish robust, type-checked validation on API data layers.

## Steps
1. **Forms Validation**: Guard all incoming user interactions through strict `zod` schemas.
2. **Sanitization**: Never natively evaluate string concatenations into DOM APIs. Rely entirely on secure JSX data binding `{data}`.
3. **Danger Zone**: Absolutely FORBID usage of `dangerouslySetInnerHTML` unless explicitly reviewing sanitized markdown inputs.
4. **API Parsing**: Optional-chain raw API payloads (`res?.data?.list`). Aggressively apply safe fallbacks (`?? []`).

## Performance
- **Front-Load Check**: Run `zod` dynamically inside `react-hook-form` to preemptively block invalid round-trips to the server.
- **Throttle**: Rate-limit heavy input validations (like specific regex or lookup verifications) via debounce.
- **Clean Execution**: Discard and garbage collect malformed variables instantly instead of mutating them.

## Follow Rules
- **Intercepts**: ALL external requests must pipe securely through `axiosPrivate` to securely handle JWT rotation.
- **Feedback**: Scrub distinct stack traces or internal server error data from user view using localized generic messages via `react-toastify`.