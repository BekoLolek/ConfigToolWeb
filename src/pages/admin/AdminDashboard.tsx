import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import clsx from 'clsx';

export default function AdminDashboard() {
  const {
    dashboardStats,
    revenue,
    loadingDashboard,
    error,
    fetchDashboardStats,
    fetchRevenue,
  } = useAdminStore();

  useEffect(() => {
    fetchDashboardStats();
    fetchRevenue();
  }, [fetchDashboardStats, fetchRevenue]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const quickActions = [
    { label: 'Manage Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'View Audit Logs', path: '/admin/audit-logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Review Templates', path: '/admin/templates', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' },
  ];

  if (loadingDashboard && !dashboardStats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
          System Overview & Analytics
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-2xs font-mono uppercase tracking-wider text-green-500">
              +{dashboardStats?.newUsersToday || 0} today
            </span>
          </div>
          <div className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Users</div>
          <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {formatNumber(dashboardStats?.totalUsers || 0)}
          </div>
        </div>

        {/* Total Servers */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
            </div>
            <span className="text-2xs font-mono uppercase tracking-wider text-status-online">
              {dashboardStats?.onlineServers || 0} online
            </span>
          </div>
          <div className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Total Servers</div>
          <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {formatNumber(dashboardStats?.totalServers || 0)}
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
          <div className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Active Subscriptions</div>
          <div className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {formatNumber(dashboardStats?.activeSubscriptions || 0)}
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-1">Monthly Revenue</div>
          <div className="font-display text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(dashboardStats?.mrr || 0)}
          </div>
        </div>
      </div>

      {/* User Growth Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
            User Growth
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-2">Today</div>
              <div className="font-display text-xl font-bold text-slate-900 dark:text-white">
                +{dashboardStats?.newUsersToday || 0}
              </div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-2">This Week</div>
              <div className="font-display text-xl font-bold text-slate-900 dark:text-white">
                +{dashboardStats?.newUsersThisWeek || 0}
              </div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-2xs font-mono uppercase tracking-wider text-slate-500 mb-2">This Month</div>
              <div className="font-display text-xl font-bold text-slate-900 dark:text-white">
                +{dashboardStats?.newUsersThisMonth || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm dark:shadow-none">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Revenue by Plan
          </h2>
          {revenue?.byPlan && revenue.byPlan.length > 0 ? (
            <div className="space-y-3">
              {revenue.byPlan.map((planRevenue) => (
                <div key={planRevenue.plan} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={clsx(
                        'text-sm font-medium',
                        planRevenue.plan === 'FREE' && 'text-slate-600 dark:text-slate-400',
                        planRevenue.plan === 'PRO' && 'text-blue-600 dark:text-blue-400',
                        planRevenue.plan === 'TEAM' && 'text-purple-600 dark:text-purple-400',
                        planRevenue.plan === 'ENTERPRISE' && 'text-amber-600 dark:text-amber-400',
                      )}>
                        {planRevenue.plan}
                      </span>
                      <span className="text-sm text-slate-500">
                        {planRevenue.subscriptionCount} subscribers
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all',
                          planRevenue.plan === 'FREE' && 'bg-slate-400',
                          planRevenue.plan === 'PRO' && 'bg-blue-500',
                          planRevenue.plan === 'TEAM' && 'bg-purple-500',
                          planRevenue.plan === 'ENTERPRISE' && 'bg-amber-500',
                        )}
                        style={{ width: `${planRevenue.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(planRevenue.revenue)}
                    </div>
                    <div className="text-2xs text-slate-500">
                      {planRevenue.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p className="font-mono text-sm uppercase tracking-wider">No revenue data available</p>
            </div>
          )}
          {revenue && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm text-slate-500">Annual Revenue (ARR)</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(revenue.totalArr)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm dark:shadow-none">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-red-500/10 dark:hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                </svg>
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {action.label}
              </span>
              <svg className="w-4 h-4 ml-auto text-slate-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
