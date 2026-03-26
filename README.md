# COCOQR.FE

## Overview

COCOQR.FE is a web application for creating payment QR codes and managing related wallet data. It includes:

- A public QR creation page for anyone who wants to generate a payment QR quickly
- A user area for managing saved accounts, QR history, and personal QR styles
- An admin area for managing users, roles, providers, banks, accounts, history, and sync data

The public-facing experience is branded as QR Pay. The application uses Google sign-in, cookie-based sessions, and role-based access for protected areas.

## Key Features

- Generate payment QR codes (VietQR available, MoMo / ZaloPay / VNPay integration in progress)
- Manage multiple bank/payment accounts
- Save and reuse QR configurations
- Custom QR styling (colors, logo, layout)
- Role-based admin dashboard
- Google Sign-In authentication

## Tech Stack

### Frontend Core
- React 19
- TypeScript
- Vite 7

### State & Data Fetching
- Redux Toolkit
- Axios (with interceptors)

### Routing & Auth
- React Router
- Cookie-based authentication
- Role-based access control (RBAC)

### UI & Styling
- Tailwind CSS v4
- Radix UI (headless components)
- lucide-react (icons)
- react-toastify (notifications)

### QR & Utilities
- qr-code-styling

### DevOps & Tooling
- Docker & Docker Compose (multi-stage build, Nginx serving)
- Docker Hub (image registry)
- VPS deployment (pull & run via docker-compose)
- ESLint

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

### Mode-specific builds (PRODUCTION-STAGING ONLY)

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
VITE_STAGING_API_URL=https://staging.be.cocoqr.cocome.online
VITE_PRODUCTION_API_URL=https://example.com (hide)
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
