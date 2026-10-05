# CropPilotAI — AI-Powered Agriculture Crop Advisory Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React_18_+_Vite-blue.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Node_Express-green.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL_%26_Auth-3ecf8e.svg)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini_2.5_Flash-orange.svg)](https://ai.google.dev/)

**CropPilotAI** is a production-grade, full-stack precision agronomy platform. It empowers farmers and agricultural specialists to manage properties hierarchically (Farms → Fields → Crops) and request real-time artificial intelligence diagnostics powered by **Google Gemini** by submitting visual symptoms, severity levels, and climate contexts.

All data is securely persisted in **Supabase PostgreSQL** protected by strict **Row Level Security (RLS)** ensuring complete multi-tenant tenant isolation.

---

## 🌾 Core Features

- **Supabase Authentication**: Secure user registration, login, session persistence, and client-side route guards.
- **Hierarchical Asset Modeling**:
  - **Farms**: Manage properties, acreage, and geographic regions.
  - **Fields**: Delineate individual plots with soil classifications (Loam, Clay, Sandy Loam, Peat).
  - **Crops**: Register plant varieties, monitor growth stages (*Seedling, Vegetative, Flowering, Fruiting, Harvest*), and flag health states (*Healthy, Warning, Critical*).
- **Gemini AI Agronomist Diagnostic**:
  - Leverages Google's `@google/genai` SDK with an expert Agronomist system persona.
  - Returns strictly validated JSON conforming to a structured Zod schema.
  - Generates condition diagnosis, probable causes, emergency mitigation steps, long-term sustainable recommendations, prevention protocols, and agronomist consultation notices.
- **Persistent Advisory Archive**:
  - Every consultation is archived in Supabase with symptoms, raw JSON payload, and timestamps.
  - Full search and severity filtering across the entire advisory history.
- **Strict Row Level Security (RLS)**:
  - `profiles` keyed on `auth.uid() = id`.
  - `farms`, `fields`, `crops`, and `advisories` keyed on `auth.uid() = user_id`.
  - Backend uses a user-scoped Supabase client carrying the user's Bearer token so RLS is strictly enforced at the database layer.

---

## 🏛️ Project Architecture

```
CropPilotAI/
├── .gitignore
├── README.md
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Pure executable PostgreSQL migration with RLS & triggers
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js                     # Express app instance, CORS & middleware
│       ├── server.js                  # Production entrypoint (PORT listener & shutdown handlers)
│       ├── config/
│       │   └── supabase.js            # Supabase admin & user-scoped client builder
│       ├── controllers/
│       │   ├── farm.controller.js     # Farm CRUD
│       │   ├── field.controller.js    # Field CRUD
│       │   ├── crop.controller.js     # Crop CRUD
│       │   └── advisory.controller.js # Gemini AI trigger & advisory history
│       ├── middleware/
│       │   ├── auth.middleware.js     # Bearer JWT verification & RLS client injection
│       │   ├── validate.middleware.js # Zod schema validation
│       │   └── error.middleware.js    # Production-safe error handling
│       ├── routes/                    # RESTful endpoints (/api/farms, /api/crops, etc.)
│       ├── schemas/                   # Zod schemas for requests & Gemini JSON outputs
│       ├── services/
│       │   └── gemini.service.js      # @google/genai service & schema validation
│       └── utils/
│           └── logger.js              # Structured console logger
└── client/
    ├── package.json
    ├── .env.example
    ├── vite.config.js
    ├── tailwind.config.js             # Tailwind v3.4 configuration
    ├── postcss.config.js
    ├── vercel.json                    # Vercel SPA rewrite rule
    ├── index.html
    └── src/
        ├── App.jsx                    # React Router DOM configuration (11+ routes)
        ├── main.jsx                   # Entrypoint with AuthProvider
        ├── index.css                  # Tailored agricultural palette & styles
        ├── components/                # Modular UI (Cards, AdvisoryResult, Modal, Spinner)
        ├── context/                   # AuthContext with Supabase auth listener
        ├── lib/                       # Supabase client initialization
        ├── pages/                     # Full-page views (Dashboard, Farms, Advisor, etc.)
        └── services/                  # Axios API client with token interceptor
```

---

## 🚀 Quickstart Guide

### 1. Database Setup (Supabase)
1. Log in to [Supabase](https://supabase.com/) and create a new project.
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` from this repository.
4. Paste the SQL content into the SQL Editor and click **Run**.
   - This creates all tables (`profiles`, `farms`, `fields`, `crops`, `advisories`), enables RLS, establishes user policies, and installs the automatic profile creation trigger.

### 2. Backend Setup
1. Open a terminal in `/server`:
   ```bash
   cd server
   cp .env.example .env
   ```
2. Populate `server/.env` with your real credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=AIzaSy...              # Get from Google AI Studio
   SUPABASE_URL=https://xyz.supabase.co
   SUPABASE_SECRET_KEY=eyJhbGci...      # From Supabase Project Settings -> API (secret key)
   SUPABASE_PUBLISHABLE_KEY=eyJhbGci... # Same publishable key as the client; lets RLS apply to per-user queries
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The backend API will start on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a terminal in `/client`:
   ```bash
   cd client
   cp .env.example .env
   ```
2. Populate `client/.env` with your publishable keys:
   ```env
   VITE_SUPABASE_URL=https://xyz.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...  # From Supabase Project Settings -> API (anon/publishable key)
   VITE_API_BASE_URL=http://localhost:5000
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will be accessible at `http://localhost:5173`.

---

## 🔒 Security & Data Isolation Architecture

- **No Secrets in Frontend**: `GEMINI_API_KEY` and `SUPABASE_SECRET_KEY` exist exclusively on the Express backend. The frontend only consumes public anon keys.
- **User-Scoped Database Operations**: Every authenticated request passes the user's JWT to `req.supabase`. PostgREST enforces `auth.uid() = user_id` on all queries.
- **Zod AI Response Validation**: The stringified response from Gemini is strictly validated against the Zod schema before database insertion, guaranteeing database hygiene.
- **CORS Protection**: Access to the Express backend is restricted to the origin defined in `CLIENT_URL`.

---

## 🌐 Deployment Configuration

### Deploying Frontend to Vercel
1. Set the root directory of the Vercel project to `client`.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_API_BASE_URL` (URL of your deployed backend)
6. SPA routing is natively handled by `client/vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### Deploying Backend to Render
1. Create a **New Web Service** connected to your repository.
2. Root directory: `server`.
3. Runtime: **Node**.
4. Build command: `npm install`.
5. Start command: `npm start` (resolves to `node src/server.js`).
6. Environment variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `CLIENT_URL` (URL of your deployed Vercel frontend)
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `SUPABASE_PUBLISHABLE_KEY`
