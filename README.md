# ConfigTool Frontend

React SPA for ConfigTool - a web-based Minecraft server config management platform.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (cyber theme)
- Monaco Editor (code editing)
- Zustand (state management)
- Axios (HTTP client)
- React Router (navigation)

## Features

### Authentication
- Login/Register with email/password
- JWT token management with auto-refresh
- Protected routes

### Dashboard
- Server fleet overview with cards
- Online/offline status indicators
- Server grouping and filtering
- Create/delete server modals

### File Editor
- Monaco Editor with YAML/JSON syntax highlighting
- Multi-tab editing with drag-and-drop
- Split view for file comparison
- Real-time syntax validation
- Diff viewer for version comparison
- Draft auto-save to localStorage

### File Management
- Hierarchical file tree with lazy loading
- File/folder create, rename, delete
- File upload (YAML/JSON only)
- Global search across all configs

### Collaboration
- Invite code management (generate, copy, delete)
- Collaborator list with remove option
- Join server modal with code validation
- Plan limit indicators

### Version History
- List all versions for current file
- Preview version content
- One-click restore

### Billing
- Plan pricing display
- Usage overview with progress bars
- Invoice history
- Payment method management

## Quick Start

```bash
# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

## Deployment (Vercel)

1. Import repo at [vercel.com](https://vercel.com)
2. Set `VITE_API_URL` = `https://your-backend.onrender.com`
3. Deploy

## Project Structure

```
src/
├── api/                    # API client
│   ├── client.ts          # Axios instance
│   └── endpoints.ts       # API functions
├── components/            # UI components
│   ├── CollaboratorList.tsx
│   ├── ConfigEditor.tsx
│   ├── FileTree.tsx
│   ├── InviteCodeManager.tsx
│   ├── JoinServerModal.tsx
│   ├── TabBar.tsx
│   ├── VersionHistory.tsx
│   └── ...
├── pages/                 # Route pages
│   ├── Billing.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Pricing.tsx
│   ├── Profile.tsx
│   └── ServerView.tsx
├── stores/                # Zustand stores
│   ├── authStore.ts
│   ├── billingStore.ts
│   ├── editorStore.ts
│   ├── serverStore.ts
│   └── toastStore.ts
├── types/                 # TypeScript types
└── App.tsx               # Root component
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Authentication |
| `/` | Dashboard (server list) |
| `/servers/:id` | Server view (file editor) |
| `/pricing` | Public pricing |
| `/billing` | Subscription management |
| `/profile` | User settings |

## State Stores

### authStore
- `user`, `accessToken`, `refreshToken`
- `login()`, `register()`, `logout()`

### serverStore
- `servers`, `currentServer`, `files`
- `fetchServers()`, `fetchFiles()`, `updateServer()`

### editorStore
- `tabs`, `activeTabId`, `splitView`
- `openFile()`, `closeTab()`, `updateContent()`

### billingStore
- `subscription`, `invoices`, `usage`
- `fetchSubscription()`, `cancelSubscription()`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save & Reload plugin |
| `Ctrl+Shift+S` | Save only |
| `Ctrl+W` | Close tab |
| `Ctrl+Shift+F` | Global search |
| `Ctrl+Alt+W` | Toggle split view |

## Styling

Tailwind CSS with cyber theme:
- Custom colors: `cyber-400` to `cyber-700`
- Dark/light mode toggle
- Custom effects: `shadow-glow`, `bg-ops-grid`

---

*Part of the [ConfigTool](../README.md) project*
