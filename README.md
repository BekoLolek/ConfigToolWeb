# ConfigTool Web

A web-based SaaS platform for remotely managing Minecraft server plugin configurations.

## Features

- Remote file browsing and editing (YAML/JSON configs)
- Monaco Editor with syntax highlighting
- Version history with restore capability
- Real-time server status via WebSocket
- JWT-based authentication

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- Zustand (state management)
- Axios

## Deployment Guide (Free Tier)

### Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- Neon account (free)

---

### Step 1: Deploy Frontend to Vercel

1. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import this repository from GitHub

2. **Configure Environment Variables** (do this after backend is deployed)

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com` |

3. **Deploy** - Vercel will automatically build and deploy

---

### Step 2: Set Up Neon Database

1. **Create Account** at [neon.tech](https://neon.tech)

2. **Create New Project**
   - Name: `configtool`
   - Region: Choose closest to your users

3. **Copy Connection String**
   - Dashboard > Connection Details
   - Format: `postgresql://user:pass@host/dbname?sslmode=require`

---

### Step 3: Deploy Backend to Render

1. **Create Account** at [render.com](https://render.com)

2. **New Web Service**
   - Connect your GitHub account
   - Select the backend repository
   - Settings:
     - **Runtime**: Docker
     - **Plan**: Free
     - **Health Check Path**: `/actuator/health`

3. **Add Environment Variables**

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | Generate a 32+ char secret |
   | `CORS_ORIGINS` | `https://your-app.vercel.app` |
   | `PORT` | `8080` |

4. **Deploy** - Render will build and deploy automatically

> **Note**: Free tier spins down after 15 min inactivity. First request after sleep takes ~30s.

---

### Step 4: Update Frontend Environment

1. Go to Vercel project settings
2. Add `VITE_API_URL` = your Render backend URL
3. Redeploy

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8080

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (prod) | Backend API base URL |
| `VITE_WS_URL` | No | WebSocket URL (defaults to API URL) |

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/           # API client and endpoints
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── stores/        # Zustand state stores
├── types/         # TypeScript type definitions
├── App.tsx        # Root component with routing
├── main.tsx       # Entry point
└── index.css      # Global styles (Tailwind)
```

## License

Proprietary - All rights reserved
