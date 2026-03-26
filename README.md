# MyWallet.FE

## Overview

MyWallet.FE is a web application for creating payment QR codes and managing related wallet data. It includes:

- A public QR creation page for anyone who wants to generate a payment QR quickly
- A user area for managing saved accounts, QR history, and personal QR styles
- An admin area for managing users, roles, providers, banks, accounts, history, and sync data

The public-facing experience is branded as QR Pay. The application uses Google sign-in, cookie-based sessions, and role-based access for protected areas.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS v4
- Radix-based UI utilities
- `react-toastify`
- `lucide-react`
- `qr-code-styling`

## Project Structure

```text
src/
  api/         API clients and interceptors
  auth/        Authentication and route guards
  components/  Shared UI components, modals, forms, and tables
  config/      Environment configuration
  constants/   Route, API, and role constants
  hooks/       Reusable hooks
  layouts/     Public, user, and admin layouts
  models/      Request and response models
  pages/       Public, user, and admin screens
  router/      Application routing
  services/    Typed API service layer
  store/       Redux store and slices
  styles/      Global styles and design tokens
  utils/       Shared helper functions
public/        Static assets
Dockerfile
tailwind.config.js
vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- A working backend API for authentication and business data

### Install and run locally

```bash
npm install
npm run dev
```

### Build and preview

```bash
npm run build
npm run preview
```

### Mode-specific builds

```bash
npm run build -- --mode staging
npm run build -- --mode production
```

The included Dockerfile builds the app and serves the final `dist/` output with Nginx.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Environment

The app selects its backend base URL from the current Vite mode and then appends `/api`.

| Variable | Description |
| --- | --- |
| `VITE_DEV_API_URL` | Backend base URL for development |
| `VITE_STAGING_API_URL` | Backend base URL for staging |
| `VITE_PRODUCTION_API_URL` | Backend base URL for production |

Example:

```env
VITE_DEV_API_URL=https://localhost:7234
VITE_STAGING_API_URL=https://your-staging-api.example.com
VITE_PRODUCTION_API_URL=https://your-production-api.example.com
```

## Architecture

The application is organized around three main areas:

- Public: landing page and QR creation flow
- User: account management, QR history, and personal QR style library
- Admin: dashboard and management pages for banks, providers, users, roles, accounts, history, seed data, and system QR styles

At the technical level:

- Routing is handled with `createBrowserRouter`
- Protected routes use `RequireAuth` and `RequireRole`
- API calls go through a typed service layer backed by Axios
- State is managed with Redux Toolkit and auth context
- Styling uses Tailwind CSS with shared tokens from `src/styles/globals.css`

## Contributing

Contributions should follow the existing project structure and coding patterns. Before opening a pull request, make sure the change is consistent with the current architecture, keeps the user and admin flows working, and passes linting.
