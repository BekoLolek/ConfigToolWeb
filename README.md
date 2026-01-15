# ConfigTool Frontend

React SPA for ConfigTool - a web-based Minecraft server config management platform.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Monaco Editor (code editing)
- Zustand (state management)
- Axios (HTTP client)

## Features

### Authentication
- Login/Register with email/password
- JWT token management with auto-refresh
- Session persistence

### Dashboard
- Server fleet overview with cards
- Online/offline status indicators
- Server grouping and filtering
- Create/delete server modals
- Statistics display

### File Editor
- Monaco Editor with YAML/JSON syntax highlighting
- Multi-tab editing support
- Split view for file comparison
- Tab drag-and-drop reordering
- Real-time syntax validation
- Diff viewer for version comparison
- Draft auto-save to localStorage
- Keyboard shortcuts panel

### File Management
- Hierarchical file tree with lazy loading
- File/folder create, rename, delete
- File upload (YAML/JSON only)
- File download for backup
- Global search across all configs
- Context menu for file operations

### Server Management
- Server settings modal
- Server grouping with custom groups
- Server notes (up to 500 chars)
- Connection diagnostics panel
- Statistics (connections, edits, timestamps)

### Version History
- List all versions for current file
- Preview version content
- One-click restore
- Relative timestamps

### UI/UX
- Dark/Light theme toggle
- Mobile responsive design
- Breadcrumb navigation
- Recent files quick access
- Toast notifications
- Loading states and spinners
- Connection status indicator

## Quick Start

### Local Development

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

### Build for Production

```bash
npm run build
```

Output is in `dist/` directory.

## Deployment (Vercel)

### Step 1: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import this repository from GitHub

### Step 2: Configure Environment Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` |

### Step 3: Deploy

Vercel will automatically build and deploy.

> **Note**: Redeploy after changing environment variables.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (prod) | Backend API base URL |
| `VITE_WS_URL` | No | WebSocket URL (defaults to API URL) |

## Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.ts          # Axios instance with interceptors
│   └── endpoints.ts       # API endpoint functions
├── components/            # Reusable UI components
│   ├── Breadcrumb.tsx     # File path navigation
│   ├── EditorPane.tsx     # Monaco editor wrapper
│   ├── FileTree.tsx       # Directory tree component
│   ├── FileUpload.tsx     # File upload button
│   ├── RecentFiles.tsx    # Recent files list
│   ├── SearchModal.tsx    # Global search modal
│   ├── ServerSettings.tsx # Server settings modal
│   ├── TabBar.tsx         # Editor tabs
│   ├── ThemeToggle.tsx    # Dark/light switch
│   ├── Toast.tsx          # Notification toasts
│   └── VersionHistory.tsx # Version list panel
├── hooks/                 # Custom React hooks
│   └── useWebSocket.ts    # WebSocket connection hook
├── pages/                 # Page components
│   ├── Dashboard.tsx      # Server list page
│   ├── Login.tsx          # Auth page
│   └── ServerView.tsx     # Main editor page
├── stores/                # Zustand state stores
│   ├── authStore.ts       # Auth state
│   ├── editorStore.ts     # Editor state (tabs, content)
│   ├── serverStore.ts     # Server/file state
│   ├── themeStore.ts      # Theme preference
│   └── toastStore.ts      # Toast notifications
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared types
├── App.tsx                # Root component with routing
├── main.tsx               # Entry point
└── index.css              # Global styles (Tailwind)
```

## State Management

### Auth Store
```typescript
- user: User | null
- accessToken: string | null
- login(email, password): Promise<void>
- register(email, password): Promise<void>
- logout(): void
- refreshToken(): Promise<void>
```

### Server Store
```typescript
- servers: Server[]
- currentServer: Server | null
- files: FileNode[]
- groups: string[]
- fetchServers(): Promise<void>
- fetchFiles(serverId, directory): Promise<void>
- updateServer(id, data): Promise<void>
- invalidateDirectory(path): void
```

### Editor Store
```typescript
- tabs: Tab[]
- activeTabId: string | null
- splitView: boolean
- openFile(file): void
- closeTab(id): void
- updateContent(id, content): void
- reorderTabs(from, to): void
```

### Theme Store
```typescript
- theme: 'light' | 'dark'
- toggleTheme(): void
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save & Reload plugin |
| `Ctrl+Shift+S` | Save only |
| `Ctrl+Alt+S` | Save all files |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Ctrl+W` | Close tab |
| `Ctrl+Shift+F` | Global search |
| `Ctrl+Alt+W` | Toggle split view |

## Component Details

### FileTree
- Lazy loads directories on expansion
- Caches loaded directories
- Supports create/rename/delete via context menu
- Inline editing for new files/folders

### EditorPane
- Monaco Editor with YAML/JSON language support
- Real-time validation with error markers
- Diff view toggle for version comparison
- Unsaved changes indicator

### TabBar
- Drag-and-drop reordering
- Context menu (close, close others)
- Unsaved indicator dot
- Overflow scroll for many tabs

### VersionHistory
- Expandable version preview
- Restore confirmation
- Relative time display
- Current version badge

## Styling

Uses Tailwind CSS with custom configuration:

### Custom Colors
```javascript
colors: {
  cyber: { 400-700 },      // Accent color
  slate: { 850, 900, 950 }, // Background tones
  status: {
    online: '#22c55e',
    offline: '#6b7280',
    warning: '#f59e0b'
  }
}
```

### Custom Fonts
```javascript
fontFamily: {
  display: ['Rajdhani', 'sans-serif'],  // Headings
  body: ['Inter', 'sans-serif'],        // Body text
  mono: ['JetBrains Mono', 'monospace'] // Code
}
```

### Dark Mode
- Automatic detection via `prefers-color-scheme`
- Manual toggle with localStorage persistence
- All components support both themes

## API Integration

### Authentication Flow
1. Login → receive access + refresh tokens
2. Store tokens in memory (Zustand)
3. Axios interceptor adds Authorization header
4. On 401 → auto-refresh token
5. On refresh fail → logout

### WebSocket Connection
1. Connect with JWT token
2. Subscribe to server events
3. Receive real-time status updates
4. Auto-reconnect with exponential backoff

---

*Part of the [ConfigTool](../README.md) project*
