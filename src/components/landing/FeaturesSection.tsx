
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  techLabel: string;
  spotlight?: boolean;
}

const features: Feature[] = [
  {
    title: 'Real-time Sync',
    description: 'WebSocket-powered instant changes. Edit configs and see them reflected on your server immediately.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    techLabel: 'WebSocket',
  },
  {
    title: 'Version History',
    description: 'Full history with one-click restore. Never lose your configs again with automatic versioning.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    techLabel: 'Git-like',
  },
  {
    title: 'Zero Restarts',
    description: 'Hot-reload configs without downtime. Your players stay connected while you make changes.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    techLabel: 'Hot Reload',
  },
  {
    title: 'Multi-Server',
    description: 'Manage your entire fleet from one dashboard. Perfect for networks and BungeeCord setups.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    techLabel: 'Fleet Mgmt',
  },
  {
    title: 'Monaco Editor',
    description: 'VS Code engine with full YAML/JSON syntax highlighting, autocomplete, and error detection.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    techLabel: 'VS Code',
    spotlight: true,
  },
  {
    title: 'Team Collaboration',
    description: 'Invite codes and role-based access. Let your team manage configs with granular permissions.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    techLabel: 'RBAC',
  },
  {
    title: 'Scheduled Backups',
    description: 'Cron-based automated backups. Set it and forget it with configurable retention policies.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    techLabel: 'Cron',
  },
  {
    title: 'Webhooks',
    description: 'Discord, Slack, and custom notifications. Get alerted when configs change.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    techLabel: 'HTTP',
  },
  {
    title: 'API Access',
    description: 'Programmatic access with API keys. Build your own integrations and automation.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    techLabel: 'REST',
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <div
      className={`group relative bg-white dark:bg-slate-900/60 border rounded-xl overflow-hidden transition-all duration-300 ${
        feature.spotlight
          ? 'border-cyber-500/30 md:col-span-2 md:row-span-2'
          : 'border-slate-200 dark:border-slate-800'
      } hover:border-cyber-500/50 hover:shadow-lg dark:hover:shadow-glow-sm animate-fade-in`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top accent */}
      <div className={`h-0.5 ${feature.spotlight ? 'bg-gradient-to-r from-transparent via-cyber-500 to-transparent' : 'bg-slate-200 dark:bg-slate-800 group-hover:bg-cyber-500/50'} transition-colors`} />

      <div className={`p-6 ${feature.spotlight ? 'md:p-8' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={`flex items-center justify-center rounded-lg transition-colors ${
            feature.spotlight
              ? 'w-14 h-14 bg-cyber-500/10 text-cyber-500 group-hover:bg-cyber-500/20'
              : 'w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-cyber-500/10 group-hover:text-cyber-500'
          }`}>
            {feature.icon}
          </div>

          {/* Tech label */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-2xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className={`w-1.5 h-1.5 rounded-full ${feature.spotlight ? 'bg-cyber-500' : 'bg-slate-400 dark:bg-slate-500'}`} />
            {feature.techLabel}
          </div>
        </div>

        {/* Content */}
        <h3 className={`font-display font-bold text-slate-900 dark:text-white mb-2 ${
          feature.spotlight ? 'text-2xl' : 'text-lg'
        }`}>
          {feature.title}
        </h3>
        <p className={`text-slate-600 dark:text-slate-400 ${
          feature.spotlight ? 'text-base' : 'text-sm'
        }`}>
          {feature.description}
        </p>

        {/* Spotlight extra content */}
        {feature.spotlight && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded bg-red-500/80" />
                <span className="w-3 h-3 rounded bg-yellow-500/80" />
                <span className="w-3 h-3 rounded bg-green-500/80" />
                <span className="ml-2 text-slate-400">editor.tsx</span>
              </div>
              <div className="text-cyber-400">{'// Syntax highlighting for 50+ plugins'}</div>
              <div><span className="text-purple-400">spawn-location</span>: <span className="text-amber-300">"world, 0, 64, 0"</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-500/5 to-transparent" />
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-slate-50 dark:bg-slate-950 relative">
      {/* Background */}
      <div className="absolute inset-0 dark:bg-ops-grid opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-500/10 border border-cyber-500/30 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-500" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-600 dark:text-cyber-400">
              Features
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-wide mb-4">
            Ops Dashboard <span className="text-cyber-500 dark:text-cyber-400">Panels</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to manage your Minecraft server configs like a pro.
          </p>
        </div>

        {/* Features grid - Bento layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
