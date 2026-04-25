import React from 'react';

const TicketSkeleton = () => {
  return (
    <div className="luna-card flex flex-col relative overflow-hidden !p-0 opacity-40">
      {/* Header Skeleton */}
      <div className="h-20 bg-luna-midnight/60 relative overflow-hidden border-b border-luna-aqua/5">
        <div className="absolute top-5 left-6 flex items-center gap-4">
           <div className="w-20 h-4 luna-skeleton" />
           <div className="w-24 h-4 luna-skeleton" />
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Title Skeleton */}
        <div className="w-3/4 h-8 luna-skeleton mb-4" />
        
        {/* Meta Skeleton */}
        <div className="flex gap-4 mb-6">
           <div className="w-24 h-3 luna-skeleton" />
           <div className="w-24 h-3 luna-skeleton" />
        </div>

        {/* Status Box Skeleton */}
        <div className="p-4 rounded-2xl bg-luna-midnight/60 border border-luna-aqua/5 mb-6">
           <div className="w-12 h-2 luna-skeleton mb-3" />
           <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl luna-skeleton" />
              <div className="w-32 h-5 luna-skeleton" />
           </div>
        </div>

        {/* Action Skeleton */}
        <div className="mt-auto pt-6 border-t border-luna-aqua/5 flex justify-end">
           <div className="w-10 h-10 rounded-2xl luna-skeleton" />
        </div>
      </div>
    </div>
  );
};

export default TicketSkeleton;
