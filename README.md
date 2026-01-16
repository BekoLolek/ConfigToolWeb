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

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

## Project Structure

```
src/
├── api/                    # API client
│   ├── client.ts          # Axios instance
│   └── endpoints.ts       # API functions
├── components/            # UI components
│   ├── landing/           # Landing page components
│   ├── CollaboratorList.tsx
│   ├── ConfigEditor.tsx
│   ├── FileTree.tsx
│   ├── InviteCodeManager.tsx
│   ├── JoinServerModal.tsx
│   ├── TabBar.tsx
│   ├── VersionHistory.tsx
│   └── ...
├── pages/                 # Route pages
├── stores/                # Zustand stores
└── App.tsx               # Root component
```

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page (unauthenticated) / Dashboard (authenticated) |
| `/login` | Public | Authentication |
| `/pricing` | Public | Plan pricing |
| `/docs` | Public | Documentation |
| `/servers/:serverId` | Protected | Server file editor |
| `/templates` | Protected | User template library |
| `/templates/:templateId` | Protected | Template detail view |
| `/marketplace` | Protected | Community template marketplace |
| `/billing` | Protected | Subscription management |
| `/profile` | Protected | User settings |
| `/api-keys` | Protected | API key management |
| `/webhooks` | Protected | Webhook configuration |
| `/scheduled-backups` | Protected | Backup schedules |
| `/git-configs` | Protected | Git sync configuration |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save & Reload plugin |
| `Ctrl+Shift+S` | Save only |
| `Ctrl+W` | Close tab |
| `Ctrl+Shift+F` | Global search |
| `Ctrl+Alt+W` | Toggle split view |

---

*Part of the [ConfigTool](../README.md) project*
