import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '../components/landing/LandingNav';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  content: React.ReactNode;
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Quick Start Guide</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Get your Minecraft server connected to ConfigTool in three simple steps.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center font-display font-bold text-cyber-500">1</div>
            <div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">Create an Account</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sign up for free at the login page. You'll get a 7-day trial with full Team features to explore everything ConfigTool has to offer.</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center font-display font-bold text-cyber-500">2</div>
            <div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">Add Your Server</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">From the dashboard, click "Add Server" and give it a name. You'll receive a unique connection token - keep this safe!</p>
            </div>
          </div>

          <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center font-display font-bold text-cyber-500">3</div>
            <div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">Install the Plugin</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Download the ConfigTool agent plugin and drop it into your server's <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">plugins</code> folder. Add your token to the config and restart your server.</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-cyber-500/10 border border-cyber-500/30 rounded-lg">
          <h4 className="font-display font-bold text-cyber-600 dark:text-cyber-400 mb-2">You're all set!</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Once connected, your server will appear online in the dashboard. Click on it to start managing your config files.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Dashboard</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Your command center for managing all your Minecraft servers in one place.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Server Cards</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Each server is displayed as a card showing its status:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-online"></span>
                <strong>Green</strong> - Server is online and connected
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <strong>Gray</strong> - Server is offline or disconnected
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Server Groups</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Organize servers into groups (like "Survival", "Creative", "Lobby") using the group field when creating or editing a server. Filter servers by group using the buttons at the top of the dashboard.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Adding Servers</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click the "Add Server" button to create a new server entry. You'll need to provide a name and optionally assign it to a group.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Server Settings</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click on a server card to view its files. From there, access server settings to rename, change group, regenerate the connection token, or delete the server.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'file-editor',
    title: 'File Editor',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Monaco Editor</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Edit your config files with the same powerful editor that powers VS Code. Full syntax highlighting, error detection, and autocomplete for YAML and JSON.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">File Navigation</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The file tree on the left shows all your server's config files. Click a file to open it, or use the breadcrumb navigation at the top. You can have multiple files open in tabs.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span className="text-slate-600 dark:text-slate-400">Save</span>
                <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Ctrl+S</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span className="text-slate-600 dark:text-slate-400">Find</span>
                <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Ctrl+F</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span className="text-slate-600 dark:text-slate-400">Replace</span>
                <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Ctrl+H</kbd>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span className="text-slate-600 dark:text-slate-400">Search Files</span>
                <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Ctrl+Shift+F</kbd>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Syntax Validation</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Invalid YAML or JSON is highlighted with red squiggles. Hover over errors to see detailed messages. The editor helps prevent saving broken configs.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Unsaved Changes</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A dot appears on the tab when you have unsaved changes. ConfigTool will warn you before leaving the page with unsaved work.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'version-history',
    title: 'Version History',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Version History</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Every change you make is automatically saved as a version. Browse history, compare changes, and restore previous versions with one click.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Viewing History</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click the clock icon in the editor toolbar to open the version history panel. You'll see all previous versions with timestamps.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Comparing Versions</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select any version to see what changed. Added lines are highlighted in green, removed lines in red.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Restoring Versions</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click "Restore" on any version to revert to that state. This creates a new version, so you can always undo the restore if needed.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">Retention:</strong> Version history retention depends on your plan - Pro keeps 14 days, Team keeps 30 days.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'templates',
    title: 'Templates',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Templates & Marketplace</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Save configs as reusable templates and share them with the community. Browse the marketplace for pre-made configurations.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Creating Templates</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Right-click any config file and select "Save as Template", or go to your Template Library to create a new one from scratch. Add a name, description, and assign a category.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Template Variables</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Make templates flexible with variables. Use the syntax <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">{"{{variable_name}}"}</code> in your template.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              When applying the template, you'll be prompted to fill in values for each variable.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Marketplace</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Browse community templates in the Marketplace. Filter by category, sort by popularity or rating, and search for specific plugins. Download templates to use on your servers.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Sharing Templates</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mark your templates as public to share them in the marketplace. Other users can rate and review your templates.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Team Collaboration</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Invite team members to help manage your servers using invite codes.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Generating Invite Codes</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Go to your server settings and find the "Invite Codes" section. Click "Generate Code" to create a new invite code. Share this code with your team member.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Joining a Server</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              If someone shares an invite code with you, click "Join Server" on your dashboard and enter the code. You'll be added as a collaborator.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Collaborator Permissions</h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-display font-bold text-slate-900 dark:text-white">Collaborators can:</span>
                <span className="text-slate-600 dark:text-slate-400"> View servers, edit config files, view version history</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-display font-bold text-slate-900 dark:text-white">Only owners can:</span>
                <span className="text-slate-600 dark:text-slate-400"> Delete servers, manage settings, invite others, regenerate tokens</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Managing Collaborators</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Server owners can view all collaborators and remove them from the server settings. Collaborators can leave a server at any time.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">Note:</strong> Invite codes expire after 12 hours. Generate a new code if needed.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'scheduled-backups',
    title: 'Scheduled Backups',
    badge: 'Team',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Scheduled Backups</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Automatically backup your configs on a schedule. Never lose important settings again.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Creating a Backup Schedule</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Go to Scheduled Backups in the sidebar. Click "New Backup" and select the server you want to backup. Choose from preset schedules or enter a custom cron expression.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Common Schedules</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span className="text-slate-900 dark:text-white font-medium">Every hour</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span className="text-slate-900 dark:text-white font-medium">Every 6 hours</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span className="text-slate-900 dark:text-white font-medium">Daily at midnight</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <span className="text-slate-900 dark:text-white font-medium">Weekly on Sunday</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Retention Policy</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Set how many days of backups to keep. Old backups are automatically deleted when they expire. We recommend keeping at least 7 days of backups.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Monitoring</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              View the status of each backup schedule, see when the last backup ran, and when the next one is scheduled. Failed backups are highlighted so you can investigate.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Team plan required.</strong> Scheduled backups are available on Team and Enterprise plans.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    badge: 'Team',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Webhooks</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Get notified when things happen. Send alerts to Discord, Slack, or any custom endpoint.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Supported Platforms</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#5865F2]/20 text-[#5865F2] rounded-full text-sm font-medium">Discord</span>
              <span className="px-3 py-1 bg-[#4A154B]/20 text-[#E01E5A] rounded-full text-sm font-medium">Slack</span>
              <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">Custom HTTP</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Event Types</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• <strong>Server events:</strong> Online, Offline, Created, Deleted</li>
              <li>• <strong>File events:</strong> Created, Updated, Deleted, Restored</li>
              <li>• <strong>Team events:</strong> Member invited, joined, removed</li>
              <li>• <strong>Backup events:</strong> Completed, Failed</li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Setting Up Discord</h4>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>1. In Discord, go to Server Settings → Integrations → Webhooks</li>
              <li>2. Create a new webhook and copy the URL</li>
              <li>3. In ConfigTool, go to Webhooks and click "Create Webhook"</li>
              <li>4. Paste the URL and select "Discord" as the type</li>
              <li>5. Choose which events you want to receive notifications for</li>
            </ol>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Testing</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Use the "Test" button to send a sample event and verify your webhook is working correctly.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Team plan required.</strong> Webhooks are available on Team and Enterprise plans.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'api-keys',
    title: 'API Keys',
    badge: 'Team',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">API Keys</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Access ConfigTool programmatically. Build custom integrations, automate deployments, or integrate with CI/CD pipelines.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Creating an API Key</h4>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>1. Go to API Keys in the sidebar</li>
              <li>2. Click "Create Key" and give it a descriptive name</li>
              <li>3. Select the scopes (permissions) the key should have</li>
              <li>4. Copy the key immediately - it won't be shown again!</li>
            </ol>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Available Scopes</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <code className="text-cyber-500 font-mono">servers:read</code>
                <span className="text-slate-600 dark:text-slate-400">- List and view servers</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <code className="text-cyber-500 font-mono">servers:write</code>
                <span className="text-slate-600 dark:text-slate-400">- Create, update, delete servers</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <code className="text-cyber-500 font-mono">files:read</code>
                <span className="text-slate-600 dark:text-slate-400">- Read config files</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                <code className="text-cyber-500 font-mono">files:write</code>
                <span className="text-slate-600 dark:text-slate-400">- Edit and save files</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Using the API</h4>
            <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
              <pre className="text-sm text-slate-300 font-mono">
{`curl -H "X-API-Key: ct_live_your_key_here" \\
  https://api.configtool.dev/v1/servers`}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Security</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Keep your API keys secret. If a key is compromised, revoke it immediately and create a new one. You can set an expiration date when creating keys.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Team plan required.</strong> API access is available on Team and Enterprise plans.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'git-sync',
    title: 'Git Sync',
    badge: 'Team',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">Git Sync</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Sync your configs with a Git repository. Perfect for version control and infrastructure-as-code workflows.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Supported Providers</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">GitHub</span>
              <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">GitLab</span>
              <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">Bitbucket</span>
              <span className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">Any Git server</span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Setting Up</h4>
            <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>1. Go to Git Configs in the sidebar</li>
              <li>2. Click "Add Git Config"</li>
              <li>3. Enter your repository URL and branch</li>
              <li>4. Add a personal access token for authentication</li>
              <li>5. Optionally select a server to link to</li>
            </ol>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Sync Modes</h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-display font-bold text-slate-900 dark:text-white">Push</span>
                <span className="text-slate-600 dark:text-slate-400"> - Changes in ConfigTool are pushed to Git</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-display font-bold text-slate-900 dark:text-white">Pull</span>
                <span className="text-slate-600 dark:text-slate-400"> - Changes in Git are pulled to ConfigTool</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-display font-bold text-slate-900 dark:text-white">Bidirectional</span>
                <span className="text-slate-600 dark:text-slate-400"> - Sync both ways automatically</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-2">Manual Sync</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Click the "Sync Now" button to manually trigger a sync at any time. View sync status and history for each config.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Team plan required.</strong> Git sync is available on Team and Enterprise plans.
          </p>
        </div>
      </div>
    ),
  },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const navigate = useNavigate();

  const handleScrollTo = useCallback((id: string) => {
    if (id === 'docs') {
      return; // Already on docs page
    }
    // Navigate to landing page and scroll
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [navigate]);

  const activeDoc = docSections.find((s) => s.id === activeSection) || docSections[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <LandingNav onScrollTo={handleScrollTo} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Documentation
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Learn how to get the most out of ConfigTool.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {docSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all ${
                    activeSection === section.id
                      ? 'bg-cyber-500/10 text-cyber-600 dark:text-cyber-400 border border-cyber-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className={activeSection === section.id ? 'text-cyber-500' : 'text-slate-400 dark:text-slate-500'}>
                    {section.icon}
                  </span>
                  <span className="font-display font-semibold text-sm flex-1">{section.title}</span>
                  {section.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded">
                      {section.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6 w-full">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-display font-semibold text-slate-900 dark:text-white"
            >
              {docSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title} {section.badge ? `(${section.badge})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
              {activeDoc.content}
            </div>

            {/* Navigation between sections */}
            <div className="flex justify-between mt-6">
              {docSections.findIndex((s) => s.id === activeSection) > 0 && (
                <button
                  onClick={() => {
                    const idx = docSections.findIndex((s) => s.id === activeSection);
                    setActiveSection(docSections[idx - 1].id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-cyber-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="font-display font-semibold text-sm">
                    {docSections[docSections.findIndex((s) => s.id === activeSection) - 1].title}
                  </span>
                </button>
              )}
              <div className="flex-1" />
              {docSections.findIndex((s) => s.id === activeSection) < docSections.length - 1 && (
                <button
                  onClick={() => {
                    const idx = docSections.findIndex((s) => s.id === activeSection);
                    setActiveSection(docSections[idx + 1].id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-cyber-500 transition-colors"
                >
                  <span className="font-display font-semibold text-sm">
                    {docSections[docSections.findIndex((s) => s.id === activeSection) + 1].title}
                  </span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
