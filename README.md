# MineralVision

**MineralVision** is a full-stack AI mineral identification platform. Upload a photo of a mineral sample, run live inference, compare two samples side by side, track analytics over time, manage ML models without redeploying the frontend, and monitor API health — all from a polished crystalline-themed dashboard.

The project is built as three independent services that communicate over HTTP:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MineralVision Stack                             │
├─────────────────┬─────────────────────┬───────────────────────────────┤
│  client/        │  server/            │  ml-service/                  │
│  React + Vite   │  Node + Express     │  FastAPI + PyTorch          │
│  Port 5173      │  Port 5000          │  Port 8000                    │
│  Dashboard UI   │  Auth, history,     │  Inference, compare,          │
│                 │  stats, ML proxy    │  model hot-swap               │
└────────┬────────┴──────────┬──────────┴──────────────┬────────────────┘
         │                   │                         │
         │    REST + JWT     │    multipart proxy      │
         └──────────────────►│◄────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  MongoDB Atlas  │  (optional — falls back to
                    │  or in-memory   │   in-memory store for local dev)
                    └─────────────────┘
```

---

## Table of Contents

1. [What It Does](#what-it-does)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture & Data Flow](#architecture--data-flow)
5. [UI & Design System](#ui--design-system)
6. [Pages & Features](#pages--features)
7. [API Reference](#api-reference)
8. [Authentication & Storage](#authentication--storage)
9. [ML Pipeline](#ml-pipeline)
10. [Getting Started](#getting-started)
11. [Environment Variables](#environment-variables)
12. [Deployment](#deployment)
13. [Swapping the ML Model](#swapping-the-ml-model)
14. [Roadmap](#roadmap)

---

## What It Does

| Capability | Description |
|------------|-------------|
| **Mineral identification** | Upload an image → get top prediction, confidence %, probability breakdown, inference time |
| **Sample comparison** | Upload two images → similarity score + verdict (Same Mineral / Different Minerals) |
| **Analytics dashboard** | Bar charts, pie charts, line charts for prediction trends, mineral distribution, accuracy |
| **Prediction history** | Searchable table of every inference, CSV export, per-user scoping |
| **Model management** | Upload a new `.pth` PyTorch weights file → hot-swap without touching frontend or redeploying |
| **API health monitoring** | Live status, latency, GPU availability, RAM usage (auto-refreshes every 15s) |
| **User authentication** | JWT-based register/login with bcrypt password hashing |
| **Demo mode** | Frontend falls back to mock data when backend is unreachable — useful for UI demos |

---

## Tech Stack

### Frontend (`client/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI framework |
| **Vite** | 5.2 | Dev server + production bundler |
| **Tailwind CSS** | 3.4 | Utility-first styling + custom design tokens |
| **React Router** | 6.23 | Client-side routing (9 routes) |
| **Recharts** | 2.12 | Bar, line, pie, and radar charts; lazy-loaded per route |
| **Axios** | 1.7 | HTTP client with JWT interceptors |
| **react-dropzone** | 14.2 | Drag-and-drop image upload on Detect page |
| **Framer Motion** | 11 | Motion choreography (staggered entrances, page transitions, spring interactions) |
| **lucide-react** | latest | Icon system (sidebar, stat cards, buttons, empty states) |
| **cmdk** | latest | Command palette (⌘K / Ctrl+K) primitive |
| **PostCSS + Autoprefixer** | — | CSS processing pipeline |

> Heavy/optional dependencies (Recharts, Framer Motion, cmdk) are loaded through route-level code splitting (`React.lazy`) so the initial dashboard bundle stays light for daily use.

### Backend (`server/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **Express** | 4.19 | REST API framework |
| **Mongoose** | 8.4 | MongoDB ODM (optional — in-memory fallback) |
| **jsonwebtoken** | 9.0 | JWT auth tokens (7-day expiry) |
| **bcryptjs** | 2.4 | Password hashing |
| **Multer** | 1.4 | Multipart file upload (images + model files, 15 MB limit) |
| **node-fetch** | 3.3 | Proxy requests to ml-service |
| **dotenv** | 16.4 | Environment variable loading |
| **nodemon** | 3.1 | Dev auto-restart |

### ML Service (`ml-service/`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Runtime |
| **FastAPI** | 0.111 | Async API framework |
| **Uvicorn** | 0.30 | ASGI server |
| **PyTorch** | 2.2 | SqueezeNet inference |
| **torchvision** | 0.17 | Model architecture + image transforms |
| **Pillow** | 10.3 | Image preprocessing (resize, RGB convert) |
| **NumPy** | 1.26 | Array operations for model input/output |
| **psutil** | 5.9 | RAM usage reporting in health endpoint |

---

## Project Structure

```
MineralVision/
├── client/                          # React dashboard
│   ├── index.html                   # Entry HTML (Google Fonts loaded here)
│   ├── vite.config.js               # Dev server + /api proxy to :5000
│   ├── tailwind.config.js           # Custom color palette + font families
│   ├── postcss.config.js
│   ├── .env.example                 # VITE_API_URL
│   └── src/
│       ├── main.jsx                 # React root + theme init
│       ├── App.jsx                  # Route definitions
│       ├── index.css                # Global styles, facet clip-paths, light theme
│       ├── context/
│       │   └── AuthContext.jsx      # JWT + user state in localStorage
│       ├── services/
│       │   ├── api.js               # Axios instance + JWT interceptor
│       │   ├── mineralService.js    # API calls with mock fallbacks
│       │   ├── mockData.js          # Demo data for offline mode
│       │   └── theme.js               # Dark/light theme toggle
│       ├── layouts/
│       │   ├── DashboardLayout.jsx  # Sidebar + Topbar + page outlet
│       │   ├── Sidebar.jsx          # Left navigation (8 links)
│       │   └── Topbar.jsx           # Page title + user email + logout
│       ├── components/
│       │   ├── StatCard.jsx         # Metric card with accent color
│       │   ├── ConfidenceFacet.jsx  # Crystal-shaped confidence gauge
│       │   └── ProtectedRoute.jsx   # Auth guard redirecting to /login
│       └── pages/
│           ├── Login.jsx            # Register + login form
│           ├── Overview.jsx         # Dashboard home (stats + charts)
│           ├── MineralDetection.jsx # Upload + predict + report download
│           ├── CompareImages.jsx    # Two-image comparison
│           ├── Analytics.jsx        # 4-chart analytics grid
│           ├── PredictionHistory.jsx# Searchable history table + CSV export
│           ├── ModelManagement.jsx  # Model info + upload
│           ├── ApiHealth.jsx        # Live health cards (15s refresh)
│           └── Settings.jsx         # API URL, threshold, dark mode
│
├── server/                          # Node.js API
│   ├── index.js                     # Express app entry + store selection
│   ├── .env.example                 # PORT, MONGO_URI, JWT_SECRET, ML_SERVICE_URL
│   ├── middleware/
│   │   ├── auth.js                  # JWT requireAuth guard
│   │   └── upload.js                # Multer disk storage (auto-creates uploads/)
│   ├── models/
│   │   ├── User.js                  # email, passwordHash, role (admin/client/researcher)
│   │   └── Prediction.js            # user, imagePath, prediction, confidence, probabilities
│   ├── routes/
│   │   ├── auth.js                  # POST /register, POST /login
│   │   ├── predict.js               # POST /predict, POST /predict/compare
│   │   ├── history.js               # GET /history, DELETE /history/:id
│   │   ├── stats.js                 # GET /stats
│   │   ├── model.js                 # GET /model, POST /model/upload
│   │   └── health.js                # GET /health (proxies ml-service)
│   └── store/
│       ├── index.js                 # Store selector (memory vs mongo)
│       ├── memoryStore.js           # In-memory users + predictions
│       ├── mongoStore.js            # Mongoose-backed store
│       └── computeStats.js          # Shared analytics computation
│
├── ml-service/                      # Python inference service
│   ├── app.py                       # FastAPI endpoints
│   ├── predict.py                   # Model load, preprocess, predict, compare
│   ├── requirements.txt
│   └── model/                       # Drop best_model.pth here
│       └── .gitkeep
│
├── uploads/                         # Runtime image storage (gitignored)
├── reports/                         # Reserved for future PDF reports
├── .gitignore
└── README.md
```

---

## Architecture & Data Flow

### Single-image prediction (end to end)

```
User uploads image on /detect
        │
        ▼
mineralService.predictImage(file)
        │  POST /api/predict  (multipart: image)
        ▼
Node server (auth middleware validates JWT)
        │  saves file to uploads/
        │  forwards to ml-service via FormData
        ▼
FastAPI POST /predict
        │  predict.py: preprocess → model.predict() → format response
        ▼
Node server receives { prediction, confidence, inference_time_ms, probabilities }
        │  saves Prediction record to store (memory or MongoDB)
        ▼
React renders result: ConfidenceFacet gauge + mineral name + bar chart
```

### Two-image comparison

```
User uploads imageA + imageB on /compare
        │
        ▼
POST /api/predict/compare  →  ml-service POST /compare
        │  runs both images through predict()
        │  computes similarity + verdict
        ▼
React shows side-by-side results with similarity % in center
```

### Storage layer (dual-mode)

The server automatically picks a data store at boot:

| Condition | Store used | Persistence |
|-----------|-----------|-------------|
| `MONGO_URI` set + connection succeeds | `mongoStore` (Mongoose) | Permanent |
| `MONGO_URI` missing or connection fails | `memoryStore` (in-process arrays) | Lost on restart |

Both stores expose the same interface (`users`, `predictions`) so routes never need to know which backend is active. Analytics (`computeStats.js`) is shared between both.

---

## UI & Design System

MineralVision uses a **crystalline / faceted mineral aesthetic** — not generic rounded SaaS boxes. Every card, button, and gauge shares the same clipped-corner geometry to feel like cut gemstones.

### Color palette (Tailwind tokens in `tailwind.config.js`)

| Token | Hex | Used for |
|-------|-----|----------|
| `base` | `#14161A` | Page background |
| `base-panel` | `#1D2024` | Card/panel surfaces |
| `base-raised` | `#24272C` | Hover states, secondary surfaces |
| `base-line` | `#2C3036` | Borders, dividers, grid lines |
| `quartz` | `#ECE7DD` | Primary text |
| `amethyst` | `#8B6FD1` | Brand accent, primary buttons, active nav |
| `malachite` | `#2E8B67` | Success/online indicators |
| `pyrite` | `#D4A72C` | Warnings, similarity scores |
| `garnet` | `#B33F4B` | Errors, delete actions, offline status |

### Typography (loaded from Google Fonts in `index.html`)

| Family | Tailwind class | Used for |
|--------|---------------|----------|
| **Space Grotesk** | `font-display` | Page titles, mineral names, large numbers |
| **Inter** | `font-body` | Body text, labels, descriptions |
| **IBM Plex Mono** | `font-mono` | Timestamps, latency, confidence values, filenames |

### Signature UI elements (defined in `index.css`)

| Class | What it does | Where it's used |
|-------|-------------|-----------------|
| `.facet` | Large clipped corners (14px cut) | Login card, stat cards, upload zones, result panels |
| `.facet-sm` | Small clipped corners (8px cut) | Buttons, upload dropzones, nav accent dot |
| `.facet-lg` | Extra-large clipped corners (22px cut) | Empty-state icons, error-state icons |
| `.glass` | Cut-glass material: top-left light-catch edge, inner depth, elevation shadow | All cards/panels/modals |
| `.glass-hover` | Lifts + deepens shadow on hover | Stat cards, health strips |
| `.specular` | Faint light sweep across the surface on hover | Primary buttons, stat cards, ConfidenceFacet on high confidence |
| `.crystal-bg` | Subtle purple diagonal grid pattern | Dashboard main content area, login background |
| `.mesh-amethyst` | Atmospheric amethyst→pyrite gradient mesh | Login hero, empty states, high-confidence result glow |
| `.skeleton` | Shimmer-sweep loading placeholder | All loading states |
| `html.light` | Light theme overrides | Toggled from Settings page |

**Design tokens beyond color** (`index.css` `:root` + `tailwind.config.js`):

- **Motion**: `--mv-t-hover` 150ms · `--mv-t-panel` 250ms · `--mv-t-page` 400ms, plus an `ease-out` and a spring (`ease-mv-spring`) curve. Everything is disabled under `prefers-reduced-motion`.
- **Elevation**: `shadow-elev-1/2/3` + `shadow-glow-amethyst` (resting → hoverable → active/modal).
- **Fluid type**: `text-fluid-title`, `text-fluid-stat`, `text-fluid-hero` use `clamp()` so titles and big numbers scale smoothly with viewport width.

### Reusable components

| Component | File | Description |
|-----------|------|-------------|
| **StatCard** | `components/StatCard.jsx` | Metric card with `hero`/`default`/`compact`/`mini` size variants, optional icon, trend delta, and a skeleton state — powers the bento layouts |
| **ConfidenceFacet** | `components/ConfidenceFacet.jsx` | Faceted gauge that animates fill 0→value with a count-up label and a light-sweep finish on high-confidence results |
| **ProtectedRoute** | `components/ProtectedRoute.jsx` | Redirects unauthenticated users to `/login` |
| **Toast** | `context/ToastContext.jsx` | Transient notifications (success/warning/error/info) with optional undo action |
| **NotificationCenter** | `context/NotificationContext.jsx` | Persistent activity log surfaced by the Topbar bell (model swaps, low-confidence, health changes) |
| **CommandPalette** | `components/CommandPalette.jsx` | Global ⌘K/Ctrl+K palette — jump to routes, run actions, fuzzy-search history |
| **ConfirmDialog / DangerZone** | `components/ConfirmDialog.jsx` | Focus-trapped confirmation modal + garnet-bordered danger-zone wrapper for destructive actions |
| **Skeleton set** | `components/Skeleton.jsx` | `SkeletonCard`, `SkeletonChart`, `SkeletonRow` with shimmer |
| **EmptyState / ErrorState** | `components/EmptyState.jsx`, `ErrorState.jsx` | Standardized empty (icon + copy + CTA) and error (icon + message + retry) patterns |
| **ActivityHeatmap** | `components/ActivityHeatmap.jsx` | GitHub-style prediction-activity calendar |
| **CrystalHero** | `components/CrystalHero.jsx` | Animated low-poly SVG crystal on the login hero; freezes under reduced motion and is its own static fallback |
| **ReportPreview** | `components/ReportPreview.jsx` | Previews the identification report, then prints/saves-as-PDF (client-side) or downloads `.txt` |
| **OnboardingCoachMark** | `components/OnboardingCoachMark.jsx` | First-run spotlight tour (Detect → command palette → Settings) |
| **ShortcutsCheatsheet** | `components/ShortcutsCheatsheet.jsx` | `?`-triggered keyboard-shortcuts overlay |
| **motion helpers** | `components/motion.jsx` | `Stagger`, `Rise`, `PageTransition` primitives (reduced-motion aware) |

### Layout structure

```
┌──────────┬──────────────────────────────────────────────┐
│          │  Topbar: page title + subtitle + user email  │
│ Sidebar  ├──────────────────────────────────────────────┤
│ (240px)  │                                              │
│          │  Main content (crystal-bg pattern)           │
│ 8 nav    │  Page-specific content rendered here         │
│ links    │                                              │
│          │                                              │
│ v1.4     │                                              │
└──────────┴──────────────────────────────────────────────┘
```

- **Sidebar** (`layouts/Sidebar.jsx`): lucide icons per link, spring-animated active indicator, collapses to a slide-out drawer below 1024px
- **Topbar** (`layouts/Topbar.jsx`): dynamic title/subtitle, command-palette search trigger, notification bell with unread badge, role badge + avatar, logout, mobile hamburger
- **DashboardLayout** (`layouts/DashboardLayout.jsx`): shell wrapping Sidebar + Topbar + a `PageTransition`-wrapped `<Outlet />`; mounts the first-run onboarding tour
- **Responsive**: sidebar → drawer < 1024px; stat/chart/compare grids reflow at `sm`/`lg`; safe-area insets + PWA manifest (`public/manifest.webmanifest`) for home-screen install

### Charts (Recharts)

Used on **Overview** and **Analytics** pages:

| Chart type | Data source | Page |
|------------|------------|------|
| Area chart | `dailyPredictions` (last 7 days) | Overview |
| Pie chart (donut, direct-labeled) | `mineralDistribution` | Overview, Analytics |
| Bar chart | `predictionCounts` by mineral | Analytics |
| Line chart w/ brush + model-swap annotation | `accuracyTrend` | Analytics |
| Radar chart | probability profiles of two samples | Compare |
| Activity heatmap | prediction activity over time | Overview, Analytics |
| Top-3 comparative bars | `probabilities` per class | Detect (result panel) |

Chart styling is centralized in `components/chartTheme.js` (`#1D2024` tooltip, `#2C3036` grid, `#ECE7DD60` axis labels) and applied to every instance. Entrance animations run on first render only; each chart page ships designed loading (skeleton) and empty states.

### Theme system

- **Dark mode** (default): crystalline dark palette
- **Light mode**: toggled from Settings → adds `html.light` class → overrides surface/text colors in `index.css`, with a cross-fade transition
- Preference saved to `localStorage` key `mv_theme`; also switchable from the command palette

### Operational UX

- **Command palette** (⌘K / Ctrl+K) reachable from any authenticated page
- **Notification/activity center** (Topbar bell) — persistent log distinct from transient toasts
- **Shortcuts cheatsheet** (`?`), **first-run coach marks**, **role-aware UI** (Model Management locked for `client`, admin/researcher badges)
- **Optimistic delete with undo** (History), **danger-zone** pattern (Settings, Model Management), **session-expiry** context on 401 (`/login?expired=1`)
- All motion respects `prefers-reduced-motion`; every signature visual feature has a static/no-JS fallback

---

## Pages & Features

### `/login` — Login & Registration

- Pre-filled email: `demo@mineralvision.ai`
- Toggle between **Log in** and **Create account & log in**
- If backend is unreachable → falls back to demo session (any credentials work)
- If backend is running → real JWT auth via register/login API

### `/` — Overview

- 4 stat cards: Total Predictions, Today's Uploads, Accuracy, Active Model
- Line chart: predictions this week
- Donut chart: mineral distribution
- Model status bar: API online/offline, latency, GPU, RAM

### `/detect` — Identify Mineral

- Drag-and-drop upload zone (`react-dropzone`) with image preview
- **Identify mineral** button → calls ML service → shows result
- **ConfidenceFacet** gauge + mineral name + horizontal bar chart of all class probabilities
- Low-confidence warning when below Settings threshold
- **Download report** → exports plain-text prediction summary

### `/compare` — Compare Samples

- Two side-by-side image upload slots
- Runs both through model → shows predictions + **similarity %** + verdict
- ConfidenceFacet gauges for each image

### `/analytics` — Analytics

- 4-panel grid: prediction count by mineral, mineral distribution pie, daily predictions bar, accuracy trend line

### `/history` — Prediction History

- Searchable table: date, image filename, prediction, confidence %, inference time
- **Download CSV** export
- Per-row delete (scoped to logged-in user)

### `/model` — Model Management

- 4 stat cards: model name, accuracy, version, file size
- Upload new `.pth` / `.pt` PyTorch weights → hot-swaps on ml-service

### `/health` — API Health

- 6 stat cards: status, latency, model loaded, GPU, RAM, auto-refresh interval
- Polls every 15 seconds

### `/settings` — Settings

- **API URL**: repoint dashboard at deployed backend (applied live via `setApiBaseUrl()`)
- **Confidence threshold**: slider 50–99%, flags low predictions on Detect page
- **Dark mode**: toggle with live preview

---

## API Reference

All authenticated endpoints require `Authorization: Bearer <token>` header.

### Auth (`/api/auth`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/register` | No | `{ email, password, role? }` | `{ token, user }` |
| POST | `/login` | No | `{ email, password }` | `{ token, user }` |

### Predict (`/api/predict`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/` | Yes | multipart `image` | `{ prediction, confidence, inferenceTimeMs, probabilities }` |
| POST | `/compare` | Yes | multipart `imageA`, `imageB` | `{ a, b, similarity, verdict }` |

### History (`/api/history`)

| Method | Path | Auth | Query | Response |
|--------|------|------|-------|----------|
| GET | `/` | Yes | `search`, `page`, `limit` | `{ total, items[] }` |
| DELETE | `/:id` | Yes | — | `{ ok }` |

History items are returned in frontend-friendly shape:
```json
{ "id": "...", "date": "2026-07-08", "image": "sample.png", "prediction": "Granite", "confidence": 91.2, "timeMs": 42 }
```

### Stats (`/api/stats`)

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/` | Yes | `{ totalPredictions, todaysUploads, accuracy, activeModel, mineralDistribution, predictionCounts, dailyPredictions, accuracyTrend }` |

### Model (`/api/model`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/` | Yes | — | `{ name, accuracy, version, sizeMb, uploadedAt, loaded }` |
| POST | `/upload` | Yes | multipart `model` | `{ ok, message }` |

### Health (`/api/health`)

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/` | No | `{ status, modelLoaded, gpu, ramGb, latencyMs }` |

### ML Service (direct, port 8000)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Service status + GPU + RAM |
| POST | `/predict` | Single image inference |
| POST | `/compare` | Two-image comparison |
| GET | `/model-info` | Active model metadata |
| POST | `/model-upload` | Hot-swap model file |

---

## Authentication & Storage

### How auth works

1. User registers or logs in → server returns a JWT (7-day expiry)
2. Frontend stores `mv_token` and `mv_user` in `localStorage`
3. Axios interceptor attaches `Authorization: Bearer <token>` on every request
4. `requireAuth` middleware on server validates the token
5. On 401 (expired/invalid token), user is redirected to `/login?expired=1`, and the login screen explains the session expired (unless already there)

### User roles (schema-backed; surfaced in the UI)

| Role | Default | UI treatment |
|------|---------|--------------|
| `client` | Yes (assigned on register) | Model Management is locked (read-only "restricted area") |
| `admin` | Manual assignment | Amethyst **Admin** badge in Topbar; full Model Management access |
| `researcher` | Manual assignment | Pyrite **Researcher** badge in Topbar |

> Role gating is applied client-side for UX. Server-side RBAC enforcement on the protected routes is still recommended for production.

### Storage modes

**In-memory (default for local dev):**
- No `MONGO_URI` in `.env` → server uses `memoryStore`
- Auth, history, and stats all work
- Data is lost when the server restarts

**MongoDB (production):**
- Set `MONGO_URI` in `server/.env` → connects to MongoDB Atlas
- Falls back to in-memory if connection fails
- Data persists across restarts

---

## ML Pipeline

### Active model (Merge project)

| Property | Value |
|----------|-------|
| **Architecture** | SqueezeNet 1.1 (torchvision) |
| **Framework** | PyTorch |
| **Weights file** | `ml-service/model/best_model.pth` (~2.8 MB) |
| **Classes** | Calcite, Granite, Limestone |
| **Input size** | 128×128 RGB |
| **Normalization** | ImageNet mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]` |
| **Training data** | Merged datasets (granite, limestone, calcite) — see Merge `merge_and_train.py` |

### Model file

Place your trained PyTorch weights at:
```
ml-service/model/best_model.pth
```

Or upload via the **Model Management** page in the dashboard (`.pth` / `.pt`).

### Without a model

If no `.pth` file exists, `predict.py` serves **mock predictions** with the three class names so the pipeline remains testable.

### Class labels

Edit `CLASS_NAMES` in `ml-service/predict.py` to match your model's output classes (order must match training):
```python
CLASS_NAMES = ["calcite", "granite", "limestone"]
```

### Preprocessing

Images are resized to **128×128**, converted to RGB, converted to tensor, and ImageNet-normalized (same as `train_fast.py` in the Merge project).

### Comparison logic

Current implementation: same/different check based on top prediction.
For production, replace with cosine similarity between embedding vectors from the penultimate layer (see `predict.py::compare()`).

### Swapping architectures

Edit **only** `ml-service/predict.py` — change `_build_model()`, `TRANSFORM`, `IMG_SIZE`, and `CLASS_NAMES`. The FastAPI app, Node server, and React frontend require zero changes.

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB Atlas** account (optional — in-memory store works for local dev)

### 1. Clone and install

```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install

# ML service
cd ../ml-service
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
# server/.env
cp server/.env.example server/.env
# Edit JWT_SECRET (required). MONGO_URI is optional for local dev.
```

```bash
# client/.env (optional — Vite proxy handles /api in dev)
cp client/.env.example client/.env
```

### 3. Start all three services

**One command (recommended)** — the root `package.json` orchestrates all three with `concurrently`:

```bash
npm install          # once, at the repo root (installs concurrently)
npm start            # runs ML (8000) + API (5000) + WEB (5173) together
```

Output is colour-tagged `[ML]` / `[API]` / `[WEB]`. `Ctrl+C` stops all three.

**Or run them individually in three terminals:**

```bash
# Terminal 1 — ML service (port 8000)
cd ml-service
venv\Scripts\activate        # Windows
uvicorn app:app --reload --port 8000

# Terminal 2 — Node API (port 5000)
cd server
npm run dev

# Terminal 3 — React dashboard (port 5173)
cd client
npm run dev
```

### 4. Open the dashboard

Go to **http://localhost:5173**

**First time?** Click **"No account yet? Create one"**, enter an email and password, and you'll be registered and logged in automatically.

### 5. Frontend-only demo (no backend)

If you only want to preview the UI:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173 — if the backend isn't running, login with any credentials enters demo mode with mock data. Check the browser console for `[demo mode]` notices.

### 6. Production build

```bash
cd client
npm run build    # outputs to client/dist/
npm run preview  # serve the build locally
```

---

## Environment Variables

### `server/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | API server port |
| `MONGO_URI` | No | — | MongoDB connection string. Omit for in-memory store |
| `JWT_SECRET` | Yes | `dev_secret` | Secret for signing JWT tokens |
| `ML_SERVICE_URL` | No | `http://localhost:8000` | FastAPI inference service URL |
| `ACTIVE_MODEL_NAME` | No | `SqueezeNet1.1 v2.0` | Display name in stats |

### `client/.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `/api` | Backend API base URL. Vite dev proxy forwards `/api` → `:5000` |

Can also be changed live from the **Settings** page (saved to `localStorage` as `mv_api_url`).

---

## Deployment

| Service | Suggested host | Notes |
|---------|---------------|-------|
| **client** | Vercel, Netlify | Set `VITE_API_URL` to deployed server URL |
| **server** | Render, Railway | Set `MONGO_URI`, `JWT_SECRET`, `ML_SERVICE_URL` |
| **ml-service** | Render, Railway | PyTorch CPU works on modest RAM (~1 GB+); GPU optional |
| **database** | MongoDB Atlas | Free tier works for development |

After deploying, set:
- `ML_SERVICE_URL` in server env → deployed ml-service URL
- `VITE_API_URL` in client env → deployed server URL + `/api`

---

## Swapping the ML Model

1. Train your model (SqueezeNet, ResNet, EfficientNet, ViT, custom CNN, etc.)
2. Save PyTorch `state_dict` as `.pth`
3. Either:
   - Drop file at `ml-service/model/best_model.pth`, or
   - Upload via dashboard **Model Management** page
4. Update `CLASS_NAMES`, `IMG_SIZE`, and `_build_model()` in `predict.py` if architecture differs
5. Restart ml-service (or let hot-swap handle it via upload endpoint)

No frontend or Node server changes needed.

---

## Roadmap

Recently shipped:

- [x] Command palette, notification/activity center, onboarding coach marks, shortcuts cheatsheet
- [x] Bento layouts, faceted-glass material, motion choreography, activity heatmap, radar comparison
- [x] Role-aware UI (client/admin/researcher), danger-zone pattern, model version/audit timeline
- [x] Branded, previewable report with client-side print/save-as-PDF
- [x] One-command launcher, PWA manifest + safe-area insets, route-level code splitting

Still open (require backend/ML work):

- [ ] Grad-CAM heatmaps showing which pixels drove a prediction (UI toggle is a placeholder today)
- [ ] Server-generated branded PDF (current PDF is client-side print)
- [ ] Batch prediction via ZIP upload
- [ ] Server-side RBAC enforcement to match the role-aware UI
- [ ] Embedding-based cosine similarity for image comparison
- [ ] Real model accuracy metrics (not just avg confidence)
- [ ] Docker Compose for one-command local dev
- [ ] Automated tests (API + frontend)

---

## License

This project is for educational and portfolio use.
# AI_dashboard
# AI_dashboard
