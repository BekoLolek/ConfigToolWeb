# ConfigTool Frontend

React SPA for ConfigTool - a web-based Minecraft server config management platform.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling with cyber theme)
- Monaco Editor (code editing)
- Zustand (state management)
- Axios (HTTP client)
- React Router (navigation)

## Features

### Authentication
- Login/Register with email/password
- JWT token management with auto-refresh
- Session persistence
- Protected routes

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

### Pricing Page
- Public pricing display (no auth required)
- Four plan tiers: FREE, PRO, TEAM, ENTERPRISE
- Monthly/yearly billing toggle
- 20% yearly discount display
- Feature comparison table
- FAQ section

### Billing Page (Authenticated)
- Current subscription status and plan details
- Usage overview with progress bars
- Invoice history with PDF downloads
- Payment method management
- Cancel/resume subscription
- Link to Stripe billing portal

### Profile Page (Authenticated)
- User profile display with avatar
- Email verification status
- Account membership date
- Password change form with validation
- Password strength meter
- Organization quick access
- Account deletion with confirmation

### UI/UX
- Dark/Light theme toggle
- Mobile responsive design
- Breadcrumb navigation
- Recent files quick access
- Toast notifications
- Loading states and spinners
- Connection status indicator
- Cyber aesthetic design theme

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

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

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
│   ├── ConfigEditor.tsx   # Monaco editor configuration
│   ├── EditorPane.tsx     # Monaco editor wrapper
│   ├── FileTree.tsx       # Directory tree component
│   ├── FileUpload.tsx     # File upload button
│   ├── PaymentMethodManager.tsx  # Payment methods UI
│   ├── RecentFiles.tsx    # Recent files list
│   ├── RollbackModal.tsx  # Bulk rollback modal
│   ├── SearchModal.tsx    # Global search modal
│   ├── ServerSettings.tsx # Server settings modal
│   ├── TabBar.tsx         # Editor tabs
│   ├── ThemeToggle.tsx    # Dark/light switch
│   ├── Toast.tsx          # Notification toasts
│   └── VersionHistory.tsx # Version list panel
├── hooks/                 # Custom React hooks
│   └── useWebSocket.ts    # WebSocket connection hook
├── pages/                 # Page components (routes)
│   ├── Billing.tsx        # Billing & subscription page
│   ├── Dashboard.tsx      # Server list page
│   ├── Login.tsx          # Auth page (login/register)
│   ├── Pricing.tsx        # Public pricing page
│   ├── Profile.tsx        # User profile page
│   └── ServerView.tsx     # Main editor page
├── stores/                # Zustand state stores
│   ├── authStore.ts       # Auth state & actions
│   ├── billingStore.ts    # Billing & subscription state
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

## Pages

### `/login` - Login Page
- Email/password authentication
- Toggle between login and register
- Error handling with validation
- Redirect to dashboard on success

### `/` - Dashboard (Protected)
- Grid view of all servers
- Online/offline status indicators
- Server grouping sidebar
- Create new server modal
- Server cards with quick actions

### `/servers/:serverId` - Server View (Protected)
- File tree panel (left)
- Monaco editor (center)
- Version history panel (right)
- Tab bar for multiple files
- Toolbar with save, search, settings

### `/pricing` - Pricing (Public)
- Plan comparison cards
- Monthly/yearly toggle
- Feature comparison table
- FAQ accordion
- Call-to-action buttons

### `/billing` - Billing (Protected)
- Current plan display
- Billing cycle information
- Usage meters (servers, members, versions)
- Invoice history table
- Payment method card
- Cancel/resume subscription buttons

### `/profile` - Profile (Protected)
- User avatar with initials
- Email and verification status
- Password change form
- Organization section
- Danger zone with account deletion

## State Management

### Auth Store (`authStore.ts`)
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login(email, password): Promise<void>
  register(email, password): Promise<void>
  logout(): void
  refreshAccessToken(): Promise<void>
}
```

### Server Store (`serverStore.ts`)
```typescript
interface ServerState {
  servers: Server[]
  currentServer: Server | null
  files: FileNode[]
  groups: string[]
  fetchServers(): Promise<void>
  fetchFiles(serverId, directory): Promise<void>
  updateServer(id, data): Promise<void>
  invalidateDirectory(path): void
}
```

### Editor Store (`editorStore.ts`)
```typescript
interface EditorState {
  tabs: Tab[]
  activeTabId: string | null
  splitView: boolean
  openFile(file): void
  closeTab(id): void
  updateContent(id, content): void
  reorderTabs(from, to): void
  toggleSplitView(): void
}
```

### Billing Store (`billingStore.ts`)
```typescript
interface BillingState {
  pricing: PlanPricing[]
  subscription: Subscription | null
  invoices: Invoice[]
  paymentMethods: PaymentMethod[]
  usage: Usage | null
  fetchPricing(): Promise<void>
  fetchSubscription(orgId): Promise<void>
  fetchInvoices(orgId): Promise<void>
  createSubscription(orgId, plan, paymentMethodId, billingCycle): Promise<Subscription>
  cancelSubscription(orgId): Promise<void>
  resumeSubscription(orgId): Promise<void>
  addPaymentMethod(orgId, paymentMethodId): Promise<PaymentMethod>
  removePaymentMethod(orgId, paymentMethodId): Promise<void>
  setDefaultPaymentMethod(orgId, paymentMethodId): Promise<void>
  openBillingPortal(orgId): Promise<void>
}
```

### Theme Store (`themeStore.ts`)
```typescript
interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme(): void
}
```

### Toast Store (`toastStore.ts`)
```typescript
interface ToastState {
  toasts: Toast[]
  addToast(type, message): void
  removeToast(id): void
}
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

### PaymentMethodManager
- Card brand icons
- Last 4 digits display
- Expiration date
- Default method indicator
- Add/remove/set default actions

## Styling

Uses Tailwind CSS with custom configuration for a distinctive cyber aesthetic:

### Custom Colors
```javascript
colors: {
  cyber: { 400-700 },         // Accent color (cyan/teal)
  slate: { 850, 900, 950 },   // Background tones
  status: {
    online: '#22c55e',        // Green
    offline: '#6b7280',       // Gray
    warning: '#f59e0b',       // Amber
    error: '#ef4444'          // Red
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

### Custom Effects
- `bg-ops-grid` - Dot matrix background pattern
- `shadow-glow` - Cyan glow effect
- `shadow-glow-sm` - Subtle glow effect
- `shadow-panel` - Dark panel shadow

### Dark Mode
- Automatic detection via `prefers-color-scheme`
- Manual toggle with localStorage persistence
- All components support both themes
- Scan line overlay effect in dark mode

## API Integration

### Authentication Flow
1. Login -> receive access + refresh tokens
2. Store tokens in memory (Zustand)
3. Axios interceptor adds Authorization header
4. On 401 -> auto-refresh token
5. On refresh fail -> logout

### API Endpoints Used
```typescript
// Auth
authApi.register(email, password)
authApi.login(email, password)
authApi.logout(refreshToken)

// Servers
serverApi.list()
serverApi.get(id)
serverApi.create(name)
serverApi.update(id, data)
serverApi.delete(id)
serverApi.getGroups()

// Files
fileApi.list(serverId, directory, offset, limit)
fileApi.getContent(serverId, path)
fileApi.save(serverId, path, content, message, reload)
fileApi.getVersions(serverId, path)
fileApi.restore(serverId, path, versionId)
fileApi.createFile(serverId, path, isDirectory)
fileApi.renameFile(serverId, oldPath, newPath)
fileApi.deleteFile(serverId, path)
fileApi.search(serverId, query)
fileApi.download(serverId, path)

// User
userApi.changePassword(currentPassword, newPassword)
userApi.deleteAccount()
userApi.getProfile()
userApi.updateProfile(data)

// Billing
billingApi.getPricing()
billingApi.getSubscription(orgId)
billingApi.createSubscription(orgId, plan, paymentMethodId, billingCycle)
billingApi.cancelSubscription(orgId)
billingApi.resumeSubscription(orgId)
billingApi.getInvoices(orgId)
billingApi.getPaymentMethods(orgId)
billingApi.addPaymentMethod(orgId, paymentMethodId, setAsDefault)
billingApi.removePaymentMethod(orgId, paymentMethodId)
billingApi.setDefaultPaymentMethod(orgId, paymentMethodId)
billingApi.createBillingPortal(orgId, returnUrl)
billingApi.getUsage(orgId)
```

### WebSocket Connection
1. Connect with JWT token
2. Subscribe to server events
3. Receive real-time status updates
4. Auto-reconnect with exponential backoff

## TypeScript Types

Key types defined in `types/index.ts`:

```typescript
// Core types
User, AuthResponse, Server, ServerListItem
FileInfo, FileListResponse, FileContent
Version, VersionDetail, SearchResult

// Billing types
Plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE'
SubscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING'
InvoiceStatus: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE'
PlanPricing, Subscription, Invoice, PaymentMethod, Usage
```

---

*Part of the [ConfigTool](../README.md) project*
