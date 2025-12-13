'use client';

export function StagingBadge() {
  const isStaging = process.env.NEXT_PUBLIC_IS_STAGING === 'true';

  if (!isStaging) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
      STAGING
    </div>
  );
}
