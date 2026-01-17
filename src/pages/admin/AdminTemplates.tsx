import { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminTemplate, TemplateReviewStatus } from '../../types/admin';
import clsx from 'clsx';

const TABS: { value: TemplateReviewStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export default function AdminTemplates() {
  const {
    templates,
    templatesTotal,
    templatesPage,
    templatesPageSize,
    templatesTab,
    loadingTemplates,
    error,
    fetchTemplates,
    setTemplatesTab,
    approveTemplate,
    rejectTemplate,
    featureTemplate,
  } = useAdminStore();

  const [showRejectModal, setShowRejectModal] = useState<AdminTemplate | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<AdminTemplate | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTemplates(templatesTab, 0, templatesPageSize);
  }, []);

  const handleTabChange = (tab: TemplateReviewStatus) => {
    setTemplatesTab(tab);
  };

  const handleApprove = async (template: AdminTemplate) => {
    setActionLoading(true);
    try {
      await approveTemplate(template.id);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await rejectTemplate(showRejectModal.id, rejectReason);
      setShowRejectModal(null);
      setRejectReason('');
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeatureToggle = async (template: AdminTemplate) => {
    setActionLoading(true);
    try {
      await featureTemplate(template.id, !template.isFeatured);
    } catch {
      // Error handled in store
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchTemplates(templatesTab, newPage, templatesPageSize);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalPages = Math.ceil(templatesTotal / templatesPageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-wide mb-1">
          Template Review
        </h1>
        <p className="text-slate-500 font-mono text-xs sm:text-sm uppercase tracking-wider">
          Manage community templates
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={clsx(
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              templatesTab === tab.value
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Templates Grid */}
      {loadingTemplates && templates.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-sm uppercase tracking-wider">Loading templates...</span>
          </div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
          </svg>
          <p className="text-slate-500 font-mono text-sm uppercase tracking-wider">
            No {templatesTab.toLowerCase()} templates
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm hover:border-red-500/30 transition-all"
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white truncate">
                      {template.name}
                    </h3>
                    {template.isFeatured && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-2xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {template.description || 'No description provided'}
                  </p>
                </div>

                {/* Meta */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Plugin</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{template.pluginName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Author</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{template.authorEmail}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Created</span>
                    <span className="text-slate-700 dark:text-slate-300">{formatDate(template.createdAt)}</span>
                  </div>
                  {template.reviewStatus === 'APPROVED' && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Downloads</span>
                      <span className="text-slate-700 dark:text-slate-300">{template.downloadCount}</span>
                    </div>
                  )}
                  {template.reviewStatus === 'REJECTED' && template.rejectionReason && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-red-600 dark:text-red-400">
                        <strong>Rejection reason:</strong> {template.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setShowPreviewModal(template)}
                    className="flex-1 btn btn-secondary text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview
                  </button>

                  {template.reviewStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApprove(template)}
                        disabled={actionLoading}
                        className="flex-1 btn bg-green-500 hover:bg-green-600 text-white text-sm disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(template)}
                        disabled={actionLoading}
                        className="flex-1 btn bg-red-500 hover:bg-red-600 text-white text-sm disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {template.reviewStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleFeatureToggle(template)}
                      disabled={actionLoading}
                      className={clsx(
                        'flex-1 btn text-sm disabled:opacity-50',
                        template.isFeatured
                          ? 'bg-slate-500 hover:bg-slate-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      )}
                    >
                      {template.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg">
              <div className="text-sm text-slate-500">
                Showing {templatesPage * templatesPageSize + 1} to {Math.min((templatesPage + 1) * templatesPageSize, templatesTotal)} of {templatesTotal}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(templatesPage - 1)}
                  disabled={templatesPage === 0 || loadingTemplates}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {templatesPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(templatesPage + 1)}
                  disabled={templatesPage >= totalPages - 1 || loadingTemplates}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-md mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-red-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-red-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                  Reject Template
                </h3>
                <p className="text-slate-500 text-sm mb-4">
                  Rejecting "{showRejectModal.name}"
                </p>

                <div className="mb-6">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="input w-full h-32 resize-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(null);
                      setRejectReason('');
                    }}
                    className="flex-1 btn btn-secondary"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || actionLoading}
                    className="flex-1 btn bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 animate-slide-up">
            <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-red-500" />
            <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-red-500" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-red-500" />
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-red-500" />

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600" />

              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {showPreviewModal.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    by {showPreviewModal.authorEmail}
                  </p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block">Plugin</span>
                    <span className="font-mono text-slate-900 dark:text-white">{showPreviewModal.pluginName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">File</span>
                    <span className="font-mono text-slate-900 dark:text-white">{showPreviewModal.fileName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Category</span>
                    <span className="text-slate-900 dark:text-white">{showPreviewModal.categoryName || 'Uncategorized'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tags</span>
                    <span className="text-slate-900 dark:text-white">{showPreviewModal.tags || 'None'}</span>
                  </div>
                </div>
                {showPreviewModal.description && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 block text-sm mb-1">Description</span>
                    <p className="text-slate-900 dark:text-white">{showPreviewModal.description}</p>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                  Template Content
                </label>
                <pre className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-sm font-mono text-slate-800 dark:text-slate-200 overflow-auto max-h-96">
                  {showPreviewModal.content || 'No content available'}
                </pre>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowPreviewModal(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                {showPreviewModal.reviewStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(showPreviewModal);
                        setShowPreviewModal(null);
                      }}
                      disabled={actionLoading}
                      className="btn bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowPreviewModal(null);
                        setShowRejectModal(showPreviewModal);
                      }}
                      disabled={actionLoading}
                      className="btn bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
