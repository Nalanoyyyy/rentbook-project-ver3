import React from 'react';

// ── BookCardSkeleton ──────────────────────────────────────────────────────────

export const BookCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-[#1a3324] rounded-2xl overflow-hidden border border-[#e7f3ec] dark:border-[#2a4d36] animate-pulse">
    <div className="aspect-[3/4] bg-gray-200 dark:bg-white/10" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded-full w-1/2" />
      <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-xl mt-3" />
    </div>
  </div>
);

// ── BookGridSkeleton ──────────────────────────────────────────────────────────

export const BookGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
    {Array.from({ length: count }).map((_, i) => <BookCardSkeleton key={i} />)}
  </div>
);

// ── PageSpinner ───────────────────────────────────────────────────────────────

export const PageSpinner: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm text-gray-400 font-medium">กำลังโหลด...</p>
    </div>
  </div>
);

export default BookCardSkeleton;