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

## Deployment Guide

### Prerequisites

- GitHub account
- Vercel account (free tier)
- Backend API deployed (see backend repo)

### Step 1: Deploy to Vercel

1. **Fork/Clone this repository**

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import this repository from GitHub

3. **Configure Environment Variables**

   In Vercel project settings, add:

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `VITE_API_URL` | `https://your-backend.fly.dev` | Your backend API URL |

4. **Deploy**
   - Vercel will automatically build and deploy
   - You'll get a URL like `configtool-web.vercel.app`

### Step 2: Set Up Neon Database (for Backend)

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech) and sign up (free tier available)

2. **Create New Project**
   - Click "New Project"
   - Name: `configtool`
   - Region: Choose closest to your users

3. **Get Connection String**
   - Go to Dashboard > Connection Details
   - Copy the connection string (looks like `postgresql://user:pass@host/dbname?sslmode=require`)

4. **Update Backend Environment**
   - Set `DATABASE_URL` in your backend deployment (Fly.io)

### Step 3: Deploy Backend to Fly.io

See the backend repository for detailed Fly.io deployment instructions.

Required environment variables for backend:
```
DATABASE_URL=postgresql://...@neon.tech/configtool?sslmode=require
JWT_SECRET=your-secure-secret-key-min-32-chars
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Step 4: Update CORS

After frontend is deployed, update backend's `CORS_ORIGINS` to include your Vercel URL.

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local and set VITE_API_URL=http://localhost:8080

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

Output is in `dist/` directory.

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
