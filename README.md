# ESI Séjour — Installation & Technical Guide

**Project:** PRJP12_EQ43 — Multidisciplinary Project, 2nd Year Preparatory Classes (2CP)
**Theme:** Internship Management at the DPGR Level
**Year:** 2025 / 2026


**Realized by:**

| Name | Group |
|---|---|
| Saidoune Haithem (Chef d'équipe) | 03 |
| Ayache Wail Abderraouf | 01 |
| Ouzzane Abdallah | 03 |
| Santouh Meriem | 01 |
| Saibi Sonia | 01 |
| Zerroug Tedj El Islem | 03 |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Before You Begin](#3-before-you-begin)
4. [Step-by-Step Installation](#4-step-by-step-installation)
5. [Running the Application](#5-running-the-application)
6. [First-Time Setup](#6-first-time-setup)
7. [Troubleshooting](#7-troubleshooting)
8. [Getting Help](#8-getting-help)

---

## 1. Introduction

**ESI Séjour** is a web-based platform developed for the DPGR at ESI to digitize and manage the full lifecycle of scientific internships and research stays. It provides role-specific dashboards, automated eligibility checks, scoring tools, and complete traceability of all requests.

The system supports four user roles:

- **Researcher** — submits and tracks requests, uploads reports
- **DPGR Assistant** — handles administrative follow-up
- **DPGR Administrator** — records approval/rejection decisions
- **Super Administrator** — manages platform configuration and users

This guide walks through installing and running the application on a local machine.

---

## 2. System Requirements

| Requirement | Details |
|---|---|
| Operating System | Windows 10/11, macOS, or Linux |
| Python Version | 3.8 or higher |
| Node.js Version | 16 or higher (Node 18+ recommended) |
| RAM | Minimum 4 GB |
| Disk Space | At least 2 GB free |
| Web Browser | Chrome, Firefox, or Edge (latest version) |
| Git | Required to download the project |

---

## 3. Before You Begin

Complete these checks before starting the installation. Open a terminal (Command Prompt on Windows, Terminal on Mac/Linux).

### Check Python
```bash
python --version
```
Expected output similar to `Python 3.11.x`. If you get an error, download Python from [python.org/downloads](https://www.python.org/downloads).

### Check Node.js
```bash
node --version
```
Expected output similar to `v18.x.x`. If you get an error, download Node.js from [nodejs.org](https://nodejs.org).

### Check Git
```bash
git --version
```
If not installed, download it from [git-scm.com](https://git-scm.com).

> **Note (Windows):** It is recommended to use PowerShell or Git Bash for all commands in this guide.

---

## 4. Step-by-Step Installation

### Step 1 — Download the Project
```bash
git clone <repository-url>
cd projet_2cp_FINAL
```
Replace `<repository-url>` with the actual link provided by the team.

### Step 2 — Set Up the Backend

The backend is the server-side part of the application.

1. Navigate to the backend folder:
   ```bash
   cd Backend/project
   ```
2. Create an isolated Python environment:
   ```bash
   python -m venv env
   ```
3. Activate the environment:
   - **Windows:** `env\Scripts\activate`
   - **macOS/Linux:** `source env/bin/activate`

   You will see `(env)` at the start of your terminal line — this means it worked.

4. Install all required packages:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt drf-nested-routers django-cors-headers cloudinary python-decouple
   ```
5. Set up the database:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. *(Optional)* Create an administrator account:
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to enter a username, email, and password.

> Keep the terminal window open and the environment activated for the next steps.

### Step 3 — Set Up the Frontend

The frontend is the visual interface seen in the browser. Open a **new** terminal window.

1. Navigate to the frontend folder:
   ```bash
   cd Frontend
   ```
2. Install all required packages:
   ```bash
   npm install
   ```
   This may take a few minutes — wait for it to finish before continuing.

### Step 4 — Configure Cloudinary (File Storage)

The `settings.py` file containing API keys and sensitive credentials is **not included** in the repository for security reasons. It will be provided separately by the development team.

Once received, place the file in the following location:
```bash
Backend/project/project/settings.py
```

> Do not rename or move the file — the application will not run without it.

The application uses **Cloudinary** to store uploaded documents. Credentials are pre-configured in `Backend/project/project/settings.py`. No further action is needed for a standard installation.

---

## 5. Running the Application

### Start the Backend Server

In the terminal where the backend was set up (with the environment activated):
```bash
cd Backend/project
python manage.py runserver
```
Expected output:
```
Starting development server at http://127.0.0.1:8000/
```
Leave this terminal running.

### Start the Frontend

In the second terminal window:
```bash
cd Frontend
npm run dev
```
Expected output:
```
Local: http://localhost:5173/
```

### Open the Application

| Service | URL |
|---|---|
| Main Application | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Admin Panel | http://localhost:8000/admin |

> **Important:** Both the backend **and** the frontend must be running at the same time for the app to work.

---

## 6. First-Time Setup

After successfully launching the application for the first time:

1. Log in to the Admin Panel at `http://localhost:8000/admin` using the superuser account created earlier.
2. Add initial configuration data: stay types (`TypeSejour`), countries (`Pays`), user grades, and laboratories.
3. Create user accounts for researchers, assistants, and administrators through the admin interface or the user management module.
4. Verify that file uploads work by submitting a test request with an attached document.

> The **Super Administrator** is responsible for all initial platform configuration before other users can start working.

---

## 7. Troubleshooting

| Problem | Solution |
|---|---|
| `'python' is not recognized` | Python is not installed or not added to PATH. Re-install Python and check the "Add to PATH" option during setup. |
| `'npm' is not recognized` | Node.js is not installed. Download and install it from nodejs.org, then re-open your terminal. |
| `ModuleNotFoundError` | The Python virtual environment is not activated. Run `env\Scripts\activate` (Windows) or `source env/bin/activate` (Mac/Linux). |
| CORS Error in browser | The frontend cannot reach the backend. Make sure the backend server is running and check `CORS_ALLOWED_ORIGINS` in `settings.py` includes `http://localhost:5173`. |
| Database error / locked | Delete the file `db.sqlite3` from `Backend/project` and re-run `python manage.py migrate`. |
| File upload fails | The Cloudinary API credentials may be invalid. Verify them in `Backend/project/project/settings.py`. |
| Page not loading (frontend) | Ensure Node.js version is 18 or higher. Run `node --version` to check, then upgrade if needed. |

---

## 8. Getting Help

If you run into an issue not covered in this guide:

- Contact your system administrator or the project team directly.
- Refer to the project's technical documentation for advanced configuration details.
- For Django-related questions, visit: [docs.djangoproject.com](https://docs.djangoproject.com)
- For React/Vite questions, visit: [vitejs.dev](https://vitejs.dev) and [react.dev](https://react.dev)

> Always make sure both the backend and frontend servers are running before reporting an issue — most connection problems are caused by one of them being stopped.
