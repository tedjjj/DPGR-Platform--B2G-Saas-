# ESI Sejour — Frontend Technical Documentation

**Project:** PRJP12 — Management of Scientific Internships and Stays at the DPGR (ESI)
**Academic Year:** 2025/2026
**Frontend Stack:** React 19 + Vite + JavaScript
**Last updated:** May 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Routing](#4-routing)
5. [Authentication & Security](#5-authentication--security)
6. [Components](#6-components)
7. [State Management](#7-state-management)
8. [API Integration](#8-api-integration)
9. [Styling](#9-styling)
10. [Internationalization](#10-internationalization)
11. [Business Logic — Workflow](#11-business-logic--workflow)
12. [Setup & Scripts](#12-setup--scripts)
13. [Testing](#13-testing)
14. [Deployment](#14-deployment)
15. [Maintenance & Known Limitations](#15-maintenance--known-limitations)

---

## 1. Overview

### Purpose

The DPGR Scientific Mobility Platform is a web-based portal that digitalizes and automates the full lifecycle of scientific internship and stay requests at the Direction de la Post Graduation et de la Recherche scientifique (DPGR) of ESI.

The platform covers the entire process — from the initial request submission by a researcher, through automatic eligibility checks, Scientific Council (CS) deliberation, approval or rejection, stay execution, report submission, and final closure.

### Target Users

| Role | Description |
|------|-------------|
| `CHERCHEUR` | Researcher (faculty or doctoral student) who submits and tracks internship/stay requests |
| `ASSISTANT_DPGR` | DPGR Assistant who manages and processes requests administratively |
| `ADMIN_DPGR` | DPGR Administrator who records CS decisions and prepares official documents |
| `SUPER_ADMIN` | Super Administrator who manages platform configuration, users, and evaluation grids |

### Tech Stack

| Technology | Version | Role |
|------------|---------|------|
| React | ^19.2.0 | UI framework |
| Vite | ^7.3.1 | Build tool and dev server |
| React Router DOM | ^7.13.2 | Client-side routing |
| i18next | ^26.0.8 | Internationalization engine |
| react-i18next | ^17.0.6 | React bindings for i18next |
| react-icons | ^5.6.0 | Icon library |
| axios | ^1.13.6 | HTTP client (installed, partially used) |
| ESLint | ^9.39.1 | Code linting |
| @vitejs/plugin-react | — | Vite plugin for React/JSX |

---

## 2. Architecture

### Application Type

Single Page Application (SPA) with client-side routing via React Router DOM. All routing is handled on the client; the server serves a single `index.html` entry point.

### High-Level Architecture

```
Browser
  └── React SPA (Vite)
        ├── Public pages (LandingPage, Login, ForgotPassword)
        └── Protected portals (per role)
              ├── Chercheur portal
              ├── Assistant DPGR portal
              ├── Admin DPGR portal
              └── Super Admin portal
                    └── All portals communicate with:
                          └── Django REST API (http://127.0.0.1:8000/api)
```

### Component Hierarchy

```
App
├── LandingPage (public)
│   ├── Page1
│   ├── Stat
│   ├── Features
│   ├── Feedbacks
│   ├── Chatbot
│   ├── CTA
│   └── Footer
├── LoginPage (public)
├── ForgotPassword (public)
├── ChercheurPage (protected — CHERCHEUR)
│   ├── SideBarDash
│   ├── MesDemandes
│   ├── NouvelleDemande
│   ├── DetailsSejour
│   ├── MesRapports
│   ├── MonProfil
│   ├── DemandeDetails
│   ├── DocumentDeposit
│   ├── AdditionalInfo
│   ├── Document
│   ├── Notifications
│   └── Messagerie
├── AssistantPage (protected — ASSISTANT_DPGR)
│   ├── SideBarAs
│   ├── Demandes
│   ├── DetailDemande
│   ├── Statistiques
│   ├── Parametres
│   ├── Notifications
│   └── Messagerie
├── AdminDash (protected — ADMIN_DPGR)
│   ├── AdminSideBar
│   ├── ExamenDossier
│   ├── Statistiques
│   ├── Notifications
│   ├── Parametres
│   ├── DetDemandeAdmin
│   ├── RapportsAdmin
│   └── DetailRapportAdmin
└── SuperAdmin (protected — SUPER_ADMIN)
    ├── SideBarAdmin
    ├── Acceuil
    ├── Utulisateur
    ├── GrilleEvaluation
    ├── Zone
    ├── Basee
    ├── Notifications
    └── Parametre
```

---

## 3. Folder Structure

```
Frontend/
├── public/                            # Static public assets
├── src/
│   ├── App.jsx                        # Root router and route protection
│   ├── auth.js                        # Auth helpers: login, logout, token storage, password reset
│   ├── i18n.js                        # Internationalization configuration
│   ├── index.css                      # Global styles and CSS design tokens
│   ├── LandingPage.jsx                # Public landing page shell
│   ├── main.jsx                       # Application entry point
│   │
│   ├── api/                           # API client modules
│   │   ├── AdminDPGR.js               # API calls for the Admin DPGR portal
│   │   ├── assistant.js               # API calls for the Assistant DPGR portal
│   │   ├── chercheur.js               # API calls for the Chercheur portal
│   │   ├── demandes.js                # API calls for request management
│   │   ├── jwtClient.js               # Authenticated fetch wrapper with JWT refresh logic
│   │   └── superadmin.js              # API calls for the Super Admin portal
│   │
│   ├── assets/                        # Static media assets
│   │   ├── ESI_logo.png
│   │   └── esi_logo_w.png
│   │
│   ├── Admin DPGR/                    # Admin DPGR portal
│   │   ├── AdminDash.jsx              # Main dashboard shell
│   │   ├── AdminDash.css
│   │   ├── AdminSideBar.jsx           # Navigation sidebar
│   │   ├── AdminSideBar.css
│   │   ├── ChangerMotDePasse.jsx      # Change password form
│   │   ├── ChangerMotDePasse.css
│   │   ├── DetailDemande.css
│   │   ├── DetailRapportAdmin.jsx     # Full post-stay report detail view
│   │   ├── DetailRapportAdmin.css
│   │   ├── DetDemandeAdmin.jsx        # Full request detail for admin review
│   │   ├── esi_logo_w.png
│   │   ├── ExamenDossier.jsx          # CS decision interface (approve / reject)
│   │   ├── ExamenDossier.css
│   │   ├── ExamenDossier2.jsx         # Extended examination view
│   │   ├── ExamenDossier2.css
│   │   ├── Notifications.jsx          # In-app notifications list
│   │   ├── Notifications.css
│   │   ├── Parametres.jsx             # Admin parameter settings
│   │   ├── Parametres.css
│   │   ├── RapportsAdmin.jsx          # List of submitted post-stay reports
│   │   ├── RapportsAdmin.css
│   │   ├── Statistiques.jsx           # Platform-wide statistics dashboard
│   │   └── Statistiques.css
│   │
│   ├── assistant/                     # Assistant DPGR portal
│   │   ├── acceuil.jsx                # Main dashboard shell
│   │   ├── acceuil.css
│   │   ├── Changermotdepasse.jsx      # Change password form
│   │   ├── Demandes.jsx               # All requests list with filters
│   │   ├── Demandes.css
│   │   ├── DetailDemande.jsx          # Full request detail and processing view
│   │   ├── DetailDemande.css
│   │   ├── Messagerie.jsx             # Internal messaging
│   │   ├── Messagerie.css
│   │   ├── Notifications.jsx          # In-app notifications
│   │   ├── Notifications.css
│   │   ├── Parametres.jsx             # Platform parameter management
│   │   ├── Parametres.css
│   │   ├── Securite.css
│   │   ├── Sessionsactives.jsx        # Active session management
│   │   ├── SideBarAs.jsx              # Navigation sidebar
│   │   ├── SideBarAs.css
│   │   ├── Statistiques.jsx           # Dashboard statistics and charts
│   │   └── Statistiques.css
│   │
│   ├── Chercheur/                     # Researcher portal
│   │   ├── AdditionalInfo.jsx         # Additional info step in request form
│   │   ├── AdditionalInfo.css
│   │   ├── ChangerMotDePasse.jsx      # Change password form
│   │   ├── ChangerMotDePasse.css
│   │   ├── chercheur_dash.jsx         # Main dashboard shell
│   │   ├── chercheur_dash.css
│   │   ├── CountrySelect.jsx          # Country/city picker (CountriesNow API)
│   │   ├── DatePicker.jsx             # Date picker component
│   │   ├── DatePicker.css
│   │   ├── DemandeContext.jsx         # React context — shared request state
│   │   ├── DemandeDetails.jsx         # View full details of a single request
│   │   ├── DemandeDetails.css
│   │   ├── DetailsSejour.jsx          # Stay details view
│   │   ├── DetailsSejour.css
│   │   ├── Document.jsx               # Document viewer component
│   │   ├── Document.css
│   │   ├── documentDeposit.jsx        # Upload supporting documents
│   │   ├── documentDeposit.css
│   │   ├── FileUpload.jsx             # File upload control with validation
│   │   ├── logo.png
│   │   ├── MesDemandes.jsx            # List of the researcher's requests
│   │   ├── MesDemandes.css
│   │   ├── MesRapports.jsx            # List and submission of post-stay reports
│   │   ├── MesRapports.css
│   │   ├── Messagerie.jsx             # Internal messaging
│   │   ├── Messagerie.css
│   │   ├── ModifierProfil.jsx         # Edit researcher profile
│   │   ├── ModifierProfil.css
│   │   ├── MonProfil.jsx              # View researcher profile
│   │   ├── MonProfil.css
│   │   ├── Notifications.jsx          # In-app notifications list
│   │   ├── Notifications.css
│   │   ├── NouvelleDemande.jsx        # Multi-step form to create a new request
│   │   ├── NouvelleDemande.css
│   │   ├── SessionsActives.jsx        # View and revoke active login sessions
│   │   ├── SessionsActives.css
│   │   ├── SideBarDash.jsx            # Navigation sidebar
│   │   ├── SideBarDash.css
│   │   ├── SignaturePad.jsx           # Digital signature input
│   │   ├── SoumettreRapport.jsx       # Post-stay report submission form
│   │   └── SoumettreRapport.css
│   │
│   ├── LandingPage/                   # Public landing page sections
│   │   ├── chatbot.jsx                # Public AI chatbot widget
│   │   ├── chatbot.css
│   │   ├── cta.jsx                    # Call-to-action section
│   │   ├── cta.css
│   │   ├── Data.jsx                   # Static data for landing page
│   │   ├── Features.jsx               # Platform features section
│   │   ├── Feedback.jsx               # Single feedback item
│   │   ├── Feedback.css
│   │   ├── Feedbacks.jsx              # Feedbacks section (list)
│   │   ├── Footer.jsx                 # Page footer
│   │   ├── Footer.css
│   │   ├── page1.jsx                  # Hero / first section
│   │   ├── page1.css
│   │   ├── Stat.jsx                   # Statistics section
│   │   └── Stat.css
│   │
│   ├── LoginPage/                     # Authentication pages
│   │   ├── forgot-password.jsx        # Multi-step password reset flow
│   │   ├── forgot-password.css
│   │   ├── login-page.jsx             # User login interface
│   │   ├── login-page.css
│   │   ├── logo.png
│   │   └── roadesi1.png
│   │
│   ├── Research_chat_bot/             # Standalone chatbot backend (Python)
│   │   ├── main.py                    # FastAPI chatbot server
│   │   ├── pyproject.toml
│   │   ├── .python-version
│   │   ├── .gitignore
│   │   └── README.md
│   │
│   ├── shared/                        # Shared utilities
│   │   └── evaluationCriteriaStorage.js  # Local storage helper for evaluation criteria
│   │
│   └── SuperAdmin/                    # Super Admin portal
│       ├── Acceuil.jsx                # Super admin home dashboard
│       ├── Acceuil.css
│       ├── Basee.jsx                  # Manage base parameter lists (grades, labs)
│       ├── Basee.css
│       ├── baseeData.jsx              # Static data for base parameters
│       ├── grilleData.jsx             # Static data for evaluation grid
│       ├── GrilleEvaluation.jsx       # Configure evaluation grid criteria per session
│       ├── GrilleEvaluation.css
│       ├── logo.png
│       ├── Notifications.jsx          # In-app notifications
│       ├── Notifications.css
│       ├── NouveuUtulisateur.jsx      # Add new user form
│       ├── NouveuUtulisateur.css
│       ├── Parametre.jsx              # General platform parameters
│       ├── Parametre.css
│       ├── SAacceuil.jsx              # Main dashboard shell
│       ├── SAacceuil.css
│       ├── sessionData.jsx            # Static data for sessions
│       ├── SideBarAdmin.jsx           # Navigation sidebar
│       ├── SideBarAdmin.css
│       ├── utilisateurData.jsx        # Static data for user management
│       ├── Utulisateur.jsx            # User management (list, add, toggle, delete)
│       ├── Utulisateur.css
│       ├── Zone.jsx                   # Manage geographic zones (Zone I / Zone II)
│       ├── Zone.css
│       └── zoneData.jsx               # Static data for zones
│
├── package.json
├── vite.config.js
└── .env.local                         # Environment variables (not committed to git)
```

---

## 4. Routing

All routes are defined in `src/App.jsx`. Public routes are accessible without authentication; protected routes are wrapped with the `ProtectedRoute` component.

### Route Table

| Path | Component | Access | Allowed Role(s) |
|------|-----------|--------|-----------------|
| `/` | `LandingPage` | Public | — |
| `/login` | `LoginPage` | Public | — |
| `/forgot-password` | `ForgotPassword` | Public | — |
| `/chercheur` | `ChercheurPage` | Protected | `CHERCHEUR` |
| `/assistant` | `AssistantPage` | Protected | `ASSISTANT_DPGR` |
| `/admin` | `AdminDash` | Protected | `ADMIN_DPGR` |
| `/super-admin` | `SuperAdmin` | Protected | `SUPER_ADMIN` |

### ProtectedRoute Component

The `ProtectedRoute` component in `App.jsx` enforces both authentication and role-based access:

```jsx
// Usage in App.jsx
<ProtectedRoute allowedRoles={['CHERCHEUR']}>
  <ChercheurPage />
</ProtectedRoute>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | The page component to render if authorized |
| `allowedRoles` | `string[]` | No | List of roles that can access this route |

If `isAuthenticated()` returns false, the user is redirected to `/login`. If authenticated but the role does not match `allowedRoles`, access is denied.

---

## 5. Authentication & Security

### Token Storage

Authentication state is persisted in `localStorage`:

| Key | Description |
|-----|-------------|
| `access_token` | JWT access token, sent with every authenticated API request |
| `refresh_token` | JWT refresh token, used to obtain a new access token when expired |
| `role` | User role string (`CHERCHEUR`, `ASSISTANT_DPGR`, etc.) |

### Auth Helpers (`src/auth.js`)

| Function | Description |
|----------|-------------|
| `login(credentials)` | Calls `POST /api/auth/login/`, stores tokens and role |
| `logout()` | Calls `POST /api/auth/logout/`, clears localStorage |
| `isAuthenticated()` | Returns `true` if a valid access token exists |
| `getRole()` | Returns the stored role string |
| `changePassword(data)` | Calls `POST /api/auth/change-password/` |
| Password reset helpers | Three-step flow: request → verify OTP → confirm new password |

### JWT Client (`src/api/jwtClient.js`)

All authenticated API calls go through `jwtClient.js`, which:

- Attaches the `Authorization: Bearer <access_token>` header automatically
- Intercepts `401 Unauthorized` responses and attempts a silent token refresh via `POST /api/auth/refresh/`
- Retries the original request with the new token if refresh succeeds
- Redirects to `/login` if the refresh token is also expired

### Password Reset Flow

The `ForgotPassword` component implements a 3-step process:

1. Enter email → `POST /api/auth/password-reset/request/`
2. Enter 6-digit OTP → `POST /api/auth/password-reset/verify/`
3. Enter new password → `POST /api/auth/password-reset/confirm/`

---

## 6. Components

### Primary Shared Components

#### `ProtectedRoute`

Route guard that checks authentication and role before rendering a protected page.

```jsx
<ProtectedRoute allowedRoles={['ADMIN_DPGR']}>
  <AdminDash />
</ProtectedRoute>
```

#### `OtpInput`

6-digit OTP input field used in the password reset flow.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `value` | `string` | Yes | Current OTP value |
| `onChange` | `function` | Yes | Callback when OTP changes |

```jsx
<OtpInput value={otp} onChange={setOtp} />
```

#### `StepIndicator`

Visual progress indicator for the password reset multi-step form.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentStep` | `number` | Yes | Current step (1, 2, or 3) |

```jsx
<StepIndicator currentStep={2} />
```

#### `DemandeProvider` (Context)

React context provider that shares request state across all Chercheur portal components.

```jsx
<DemandeProvider>
  <ChercheurPage />
</DemandeProvider>
```

#### `Chatbot` (Landing page)

Public-facing chatbot form that sends user questions to the backend.

- Calls `POST /ask/` on the backend
- No authentication required
- Stateless — no shared context

### Portal Shell Components

Each role has a main dashboard shell that handles internal navigation between sub-pages via state:

| Component | File | Role |
|-----------|------|------|
| `ChercheurPage` | `Chercheur/chercheur_dash.jsx` | `CHERCHEUR` |
| `AssistantPage` | `assistant/acceuil.jsx` | `ASSISTANT_DPGR` |
| `AdminDash` | `Admin DPGR/AdminDash.jsx` | `ADMIN_DPGR` |
| `SuperAdmin` | `SuperAdmin/SAacceuil.jsx` | `SUPER_ADMIN` |

Each shell renders a sidebar and swaps the main content area based on the selected menu item.

### Chercheur Portal Components

| Component | Purpose |
|-----------|---------|
| `SideBarDash` | Navigation sidebar |
| `MesDemandes` | List of the researcher's requests with status |
| `NouvelleDemande` | Multi-step form to create a new request |
| `DemandeDetails` | View full details of a single request |
| `DocumentDeposit` | Upload supporting documents for a request |
| `AdditionalInfo` | Additional info fields for the request form |
| `DetailsSejour` | Stay details view |
| `MesRapports` | List and submission of post-stay reports |
| `SoumettreRapport` | Report submission form |
| `MonProfil` | View researcher profile |
| `ModifierProfil` | Edit researcher profile |
| `ChangerMotDePasse` | Change password form |
| `Notifications` | In-app notifications list |
| `Messagerie` | Internal messaging |
| `SessionsActives` | View and revoke active login sessions |
| `CountrySelect` | Country/city picker (uses CountriesNow API) |
| `DatePicker` | Date picker component |
| `FileUpload` | File upload control with validation |
| `SignaturePad` | Digital signature input |

### Assistant DPGR Portal Components

| Component | Purpose |
|-----------|---------|
| `SideBarAs` | Navigation sidebar |
| `Demandes` | All requests list with filters |
| `DetailDemande` | Full request detail and processing view |
| `Statistiques` | Dashboard statistics and charts |
| `Parametres` | Platform parameter management |
| `Notifications` | In-app notifications |
| `Messagerie` | Internal messaging |
| `Sessionsactives` | Active session management |

### Admin DPGR Portal Components

| Component | Purpose |
|-----------|---------|
| `AdminSideBar` | Navigation sidebar |
| `ExamenDossier` | CS decision interface — approve or reject requests |
| `ExamenDossier2` | Extended examination view |
| `DetDemandeAdmin` | Full request detail for admin review |
| `RapportsAdmin` | List of submitted post-stay reports |
| `DetailRapportAdmin` | Full report detail view |
| `Statistiques` | Platform-wide statistics |
| `Parametres` | Admin parameter settings |
| `Notifications` | In-app notifications |
| `ChangerMotDePasse` | Change password form |

### Super Admin Portal Components

| Component | Purpose |
|-----------|---------|
| `SideBarAdmin` | Navigation sidebar |
| `Acceuil` | Super admin home dashboard |
| `Utulisateur` | User management (list, add, toggle, delete) |
| `NouveuUtulisateur` | Add new user form |
| `GrilleEvaluation` | Configure evaluation grid criteria per session |
| `Zone` | Manage geographic zones (Zone I / Zone II) |
| `Basee` | Manage base parameter lists (grades, labs, etc.) |
| `Parametre` | General platform parameters |
| `Notifications` | In-app notifications |

---

## 7. State Management

### Approach

The project does not use an external state management library (no Redux, Zustand, MobX, or Recoil). State is managed through three mechanisms:

**1. Local component state** (`useState`, `useEffect`)
Used for UI state, form data, and data fetched by individual components. This is the primary pattern across the application.

**2. React Context API**
Used in one place: `src/Chercheur/DemandeContext.jsx` — a context provider that shares the current request state and actions across the Chercheur portal's nested components (new request form, document upload, additional info steps, etc.).

```jsx
// Accessing request context in a Chercheur child component
import { useDemande } from '../DemandeContext';
const { demande, setDemande } = useDemande();
```

**3. localStorage**
Used for authentication state persistence:
- `access_token`, `refresh_token`, `role`
- Read by `auth.js` helpers and `jwtClient.js` on every API call

---

## 8. API Integration

### Base URL

The backend API base URL is configured in two ways:

| Location | Value |
|----------|-------|
| `src/auth.js` | Hard-coded: `http://127.0.0.1:8000/api` |
| `src/api/jwtClient.js` | Hard-coded: `http://127.0.0.1:8000/api` |
| `src/api/assistant.js` | `import.meta.env.VITE_API_URL` with fallback to `http://127.0.0.1:8000/api` |
| `assistant/acceuil.jsx` | `import.meta.env.VITE_API_BASE_URL` with fallback to `http://127.0.0.1:8000` |

> **Note:** The base URL is partially hard-coded. For production deployment, all modules should be updated to read from `VITE_API_URL` exclusively.

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/logout/` | User logout |
| POST | `/api/auth/refresh/` | Refresh JWT access token |
| POST | `/api/auth/change-password/` | Change current user password |
| POST | `/api/auth/password-reset/request/` | Request OTP for password reset |
| POST | `/api/auth/password-reset/verify/` | Verify OTP code |
| POST | `/api/auth/password-reset/confirm/` | Set new password |
| GET | `/api/users/me/` | Get current user profile and role |
| PATCH | `/api/users/me/` | Update current user profile |

### Request (Demande) Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demandes/` | List all requests (filtered by role) |
| POST | `/api/demandes/` | Create a new request (draft) |
| GET | `/api/demandes/{id}/` | Get single request details |
| PATCH | `/api/demandes/{id}/` | Update a request |
| POST | `/api/demandes/{id}/soumettre/` | Submit a draft request officially |
| POST | `/api/demandes/{id}/annuler/` | Request cancellation |
| POST | `/api/demandes/{id}/preparer-cs/` | Prepare request for CS deliberation |
| GET | `/api/demandes/{id}/rapport/` | Get the post-stay report |

### Document Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demandes/{id}/documents/` | List documents for a request |
| POST | `/api/demandes/{id}/documents/` | Upload a document |
| DELETE | `/api/demandes/{id}/documents/{docId}/` | Delete a document |

### Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/monprofil/` | Get researcher profile |
| PATCH | `/api/monprofil/` | Update researcher profile |
| POST | `/api/monprofil/` | Upload profile with form data |

### Parameter Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parametres/type-sejours/` | List stay types |
| GET | `/api/parametres/sessions/` | List academic sessions |
| GET | `/api/parametres/pays/` | List countries |
| GET | `/api/parametres/zones/` | List geographic zones (Zone I / Zone II) |
| GET | `/api/parametres/grades/` | List academic grades |
| GET | `/api/parametres/laboratoires/` | List research laboratories |
| GET | `/api/parametres/sessions/{id}/grille-eval/` | Get evaluation grid for a session |
| POST | `/api/parametres/sessions/{id}/grille-eval/` | Create evaluation grid |
| PATCH | `/api/parametres/sessions/{id}/grille-eval/` | Update evaluation grid |

### Notification & Session Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | List notifications |
| GET | `/api/notifications/{id}/` | Get single notification |
| POST | `/api/notifications/{id}/lire/` | Mark notification as read |
| POST | `/api/notifications/lire-tout/` | Mark all notifications as read |
| GET | `/api/auth/sessions/` | List active login sessions |
| POST | `/api/auth/sessions/{id}/revoke/` | Revoke a specific session |
| POST | `/api/auth/sessions/revoke-all/` | Revoke all sessions |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/assistant/` | Dashboard data for Assistant DPGR |
| GET | `/api/dashboard/super-admin/` | Dashboard data for Super Admin |

### User Management Endpoints (Super Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/` | List all users |
| POST | `/api/users/` | Create a new user |
| PATCH | `/api/users/{id}/toggle_active/` | Enable or disable a user account |
| DELETE | `/api/users/{id}/` | Delete a user |
| GET | `/api/logs/` | Retrieve audit logs |

### External API

| Method | URL | Description |
|--------|-----|-------------|
| POST | `https://countriesnow.space/api/v0.1/countries/cities` | Fetch cities for a given country (used in request form destination selection) |

---

## 9. Styling

### Approach

Components use plain CSS files imported directly alongside their JSX files. Each component folder contains its own `.css` file (e.g., `login-page.css`, `AdminDash.css`). There are no CSS Modules — class names are global.

### Naming Convention

CSS classes follow kebab-case naming:

```css
.login-container { ... }
.input-field { ... }
.forgot-step-circle { ... }
.chatbot-section { ... }
```

### Global CSS Design Tokens

Defined in `src/index.css` as CSS custom properties:

| Variable | Usage |
|----------|-------|
| `--navy` | Primary dark brand color |
| `--navy-mid` | Secondary navy shade |
| `--gold` | Accent / highlight color |
| `--bg` | Page background color |
| `--white` | White |
| `--text` | Primary text color |
| `--text-light` | Secondary / muted text color |
| `--border` | Default border color |
| `--green` | Success / approved status color |
| `--orange` | Warning / pending status color |
| `--red` | Error / rejected status color |

Use these variables throughout component CSS files to maintain visual consistency:

```css
.status-badge.approved {
  color: var(--green);
  border-color: var(--green);
}
```

---

## 10. Internationalization

The platform supports multiple languages via `i18next` and `react-i18next`, configured in `src/i18n.js`.

### Configuration

Translation resources are defined in `i18n.js` and loaded statically. The `useTranslation()` hook is used inside portal components to render localized strings.

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}
```

To add a new language, add a new resource object to the `resources` configuration in `i18n.js` and update the language switcher if available.

---

## 11. Business Logic — Workflow

The frontend reflects the full request lifecycle defined in the cahier des charges. The statuses and transitions handled in the UI are:

| Status | French Label | UI Behavior |
|--------|-------------|-------------|
| `BROUILLON` | Draft | Editable by researcher; form auto-saves |
| `SOUMISE` | Submitted | Form locked; researcher sees submission confirmation |
| `VERIFICATION_AUTO` | Automatic check | System processes eligibility (no user action) |
| `PREPARATION_CS` | CS preparation | Admin consolidates dossiers for deliberation |
| `DELIBERATION_CS` | CS deliberation | Admin records approval or rejection decision |
| `APPROUVEE` | Approved | Researcher notified; allowance calculation displayed |
| `REJETEE` | Rejected | Researcher notified with rejection reason |
| `EN_ATTENTE` | Pending | Awaiting stay execution |
| `TERMINEE` | Completed | Researcher submits post-stay report |
| `CLOTUREE` | Closed | Admin validates report; read-only archival |
| `ANNULEE` | Cancelled | Cancellation confirmed by CS; researcher notified |

### Allowance Calculation (Zone-based)

The frontend displays calculated daily allowances based on the destination country's zone:

- **Zone I** (EU, USA, Japan, China, etc.): higher daily rate
- **Zone II** (all other countries): standard daily rate

Zone configuration is managed by the Super Admin and retrieved via `/api/parametres/zones/`.

### Evaluation Grid

The Super Admin configures evaluation criteria per session via the `GrilleEvaluation` component. Criteria can be individually enabled or disabled. Only enabled criteria are displayed in the request form and factored into the automatic score calculation.

---

## 12. Setup & Scripts

### Prerequisites

- Node.js (v18.x or higher recommended)
- npm

### Installation

```bash
# 1. Navigate to the frontend folder
cd Frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local and set your values
```

### Environment Variables

Create a `.env.local` file at the root of the `Frontend/` folder:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_API_BASE_URL=http://127.0.0.1:8000
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Recommended | `http://127.0.0.1:8000/api` | Full API base URL including `/api` |
| `VITE_API_BASE_URL` | Recommended | `http://127.0.0.1:8000` | API base URL without `/api` suffix |

> **Warning:** Some modules still have the base URL hard-coded. In production, update `src/auth.js` and `src/api/jwtClient.js` to read from `VITE_API_URL`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server (hot reload) |
| `npm run build` | Compile production-ready assets into `dist/` |
| `npm run preview` | Serve the production build locally for preview |
| `npm run lint` | Run ESLint to check code quality |

---

## 13. Testing

Testing is not currently configured in this project.

- No test runner (`jest`, `vitest`) is installed
- No test files (`*.test.jsx`, `*.spec.js`) exist under `src/`
- No `test` script in `package.json`

### Recommended Setup (future)

For future implementation, the recommended testing stack for a Vite + React project is:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

Add to `package.json`:

```json
"scripts": {
  "test": "vitest",
  "test:coverage": "vitest --coverage"
}
```

---

## 14. Deployment

### Production Build

```bash
npm run build
```

This generates a `dist/` folder containing static assets ready to be served by any web server (Nginx, Apache, Vercel, Netlify, etc.).

### Local Preview

```bash
npm run preview
```

Serves the production build locally at `http://localhost:4173`.

### Production Checklist

Before deploying to production:

- [ ] Set `VITE_API_URL` and `VITE_API_BASE_URL` to production backend URLs
- [ ] Replace all hard-coded `http://127.0.0.1:8000` references in `auth.js` and `jwtClient.js`
- [ ] Ensure the backend CORS policy allows the frontend production domain
- [ ] Configure the web server to redirect all routes to `index.html` (required for SPA routing)

### Nginx SPA Configuration Example

```nginx
server {
  listen 80;
  root /var/www/dpgr-frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### CI/CD

No CI/CD pipeline is currently configured. The project uses no workflow files (GitHub Actions, GitLab CI, etc.).

---

## 15. Maintenance & Known Limitations

### Known Limitations

| Issue | Location | Recommended Fix |
|-------|----------|-----------------|
| Hard-coded API base URL | `src/auth.js`, `src/api/jwtClient.js` | Read from `import.meta.env.VITE_API_URL` |
| No test coverage | Entire codebase | Set up Vitest + React Testing Library |
| No CI/CD pipeline | — | Add GitHub Actions workflow for build + lint |
| `axios` installed but partially used | `package.json` | Standardize on either axios or native fetch |
| Folder name with space | `src/Admin DPGR/` | Rename to `src/AdminDPGR/` to avoid path issues |

### Maintenance Guidelines

- Update dependencies monthly with `npm outdated` and patch incrementally
- Keep this document updated when adding new routes, components, or API endpoints
- Document any new environment variables in the `.env.example` file
- Any change to the evaluation grid logic or zone configuration must be reflected in both the Super Admin portal components and this documentation
- Before each new academic session, verify that the `GrilleEvaluation` configuration is updated via the Super Admin portal

---

