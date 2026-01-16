import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [hasStarted, end, duration]);

  return (
    <span className="font-display text-3xl sm:text-4xl font-bold text-cyber-500 dark:text-cyber-400">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// Hexagon decoration
function HexDecoration({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      <polygon
        points="50,2 95,25 95,75 50,98 5,75 5,25"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      <polygon
        points="50,15 82,32 82,68 50,85 18,68 18,32"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.2"
      />
    </svg>
  );
}

// Terminal mockup with typing animation
function TerminalMockup() {
  const [typedLines, setTypedLines] = useState<number>(0);

  const lines = [
    { prefix: '# config.yml', content: '', isComment: true },
    { prefix: 'server:', content: '' },
    { prefix: '  name:', content: ' "My Minecraft Server"' },
    { prefix: '  max-players:', content: ' 100' },
    { prefix: '  motd:', content: ' "&aWelcome! &7Managed by ConfigTool"' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTypedLines((prev) => (prev < lines.length ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyber-500/20 via-cyber-400/10 to-cyber-500/20 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />

      {/* Terminal window */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-3 text-xs font-mono text-slate-500">config.yml - ConfigTool Editor</span>
        </div>

        {/* Code content */}
        <div className="p-4 font-mono text-sm min-h-[180px]">
          {lines.slice(0, typedLines).map((line, i) => (
            <div
              key={i}
              className={`flex animate-fade-in ${line.isComment ? 'text-slate-500' : ''}`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-slate-500 select-none w-6">{i + 1}</span>
              <span className="text-cyber-400">{line.prefix}</span>
              <span className="text-amber-300">{line.content}</span>
            </div>
          ))}
          {typedLines < lines.length && (
            <div className="flex">
              <span className="text-slate-500 select-none w-6">{typedLines + 1}</span>
              <span className="w-2 h-5 bg-cyber-400 animate-blink" />
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700 bg-slate-800/30 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-online animate-pulse" />
              Synced
            </span>
            <span>YAML</span>
          </div>
          <span>Ln 5, Col 42</span>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 dark:bg-ops-grid" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyber-500/10 rounded-full blur-3xl" />

      {/* Floating hexagons */}
      <HexDecoration className="absolute top-32 right-[15%] w-24 h-24 text-cyber-500/20 animate-float hidden lg:block" />
      <HexDecoration className="absolute bottom-32 left-[10%] w-20 h-20 text-cyber-500/20 animate-float-delayed hidden lg:block" />
      <HexDecoration className="absolute top-1/2 right-[5%] w-16 h-16 text-cyber-500/15 animate-float hidden xl:block" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="text-center lg:text-left">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyber-500/10 border border-cyber-500/30 rounded-full mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-status-online animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-cyber-600 dark:text-cyber-400">
                System Online
              </span>
            </div>

            {/* Headline with corner accents */}
            <div className="relative inline-block mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-cyber-500 hidden sm:block" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-cyber-500 hidden sm:block" />

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white tracking-wide leading-tight px-2 sm:px-4">
                Remote Config
                <br />
                <span className="text-cyber-500 dark:text-cyber-400">Command Center</span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
              Manage your Minecraft server plugins remotely. Real-time sync. Zero restarts. Full version control.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Link to="/login" className="btn btn-primary px-8 py-3 text-base w-full sm:w-auto">
                Get Started Free
              </Link>
              <a
                href="#docs"
                className="btn btn-secondary px-8 py-3 text-base w-full sm:w-auto"
              >
                View Docs
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-800 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div>
                <AnimatedCounter end={1000} suffix="+" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider mt-1">
                  Servers Managed
                </p>
              </div>
              <div>
                <AnimatedCounter end={50} suffix="+" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider mt-1">
                  Plugins Supported
                </p>
              </div>
            </div>
          </div>

          {/* Right: Terminal mockup */}
          <div className="animate-fade-in lg:animate-slide-in-right" style={{ animationDelay: '200ms' }}>
            <TerminalMockup />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <span className="text-xs font-mono uppercase tracking-wider">Scroll to explore</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
