 export function PostSkeleton() {
   return (
     <div className="post-card animate-pulse">
       {/* Header */}
       <div className="flex items-center gap-3 px-4 py-3">
         <div className="h-8 w-8 rounded-full bg-muted" />
         <div className="space-y-1">
           <div className="h-3 w-24 rounded bg-muted" />
           <div className="h-2 w-16 rounded bg-muted" />
         </div>
       </div>
 
       {/* Image */}
       <div className="aspect-square skeleton-shimmer" />
 
       {/* Actions */}
       <div className="flex items-center gap-3 px-4 py-3">
         <div className="h-6 w-6 rounded bg-muted" />
         <div className="h-6 w-6 rounded bg-muted" />
         <div className="h-6 w-6 rounded bg-muted" />
       </div>
 
       {/* Content */}
       <div className="space-y-2 px-4 pb-4">
         <div className="h-3 w-20 rounded bg-muted" />
         <div className="h-3 w-3/4 rounded bg-muted" />
         <div className="h-2 w-16 rounded bg-muted" />
       </div>
     </div>
   );
 }