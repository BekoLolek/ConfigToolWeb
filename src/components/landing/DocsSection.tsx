// Setup step component
function SetupStep({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-cyber-500/10 border border-cyber-500/30 flex items-center justify-center font-display font-bold text-cyber-500">
          {number}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-slate-400 dark:text-slate-500">{icon}</span>
          <h4 className="font-display font-bold text-slate-900 dark:text-white">
            {title}
          </h4>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function DocsSection() {
  return (
    <section id="docs" className="py-20 sm:py-32 bg-slate-50 dark:bg-slate-950 relative">
      {/* Background */}
      <div className="absolute inset-0 dark:bg-ops-grid opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-500/10 border border-cyber-500/30 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-500" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyber-600 dark:text-cyber-400">
              How It Works
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-wide mb-4">
            System <span className="text-cyber-500 dark:text-cyber-400">Architecture</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            A simple yet powerful architecture that connects your server to the cloud.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Setup steps */}
          <div className="animate-fade-in">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                <svg className="w-5 h-5 text-cyber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Start Guide
              </h3>

              <div className="space-y-8">
                <SetupStep
                  number={1}
                  title="Create an Account"
                  description="Sign up for free in seconds. No credit card required to get started."
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />

                <SetupStep
                  number={2}
                  title="Add Your Server"
                  description="Create a server entry and get your unique connection token."
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                />

                <SetupStep
                  number={3}
                  title="Install the Plugin"
                  description="Drop the agent plugin into your server's plugins folder and add your token."
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                />
              </div>

              {/* CTA */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <a
                  href="https://docs.configtool.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-cyber-500/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyber-500/10 flex items-center justify-center text-cyber-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-display font-bold text-slate-900 dark:text-white text-sm">
                        Full Documentation
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Detailed guides, API reference, and more
                      </div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-cyber-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
