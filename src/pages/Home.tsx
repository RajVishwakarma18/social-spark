 import { useEffect, useCallback, useRef } from 'react';
 import { motion } from 'framer-motion';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { StoriesBar } from '@/components/stories/StoriesBar';
 import { PostCard } from '@/components/post/PostCard';
 import { PostSkeleton } from '@/components/post/PostSkeleton';
 import { useFeedPosts, useDeletePost } from '@/hooks/usePosts';
 import { Loader2 } from 'lucide-react';
 
 export default function Home() {
   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeedPosts();
   const deletePost = useDeletePost();
   const observerRef = useRef<IntersectionObserver | null>(null);
 
   const lastPostRef = useCallback(
     (node: HTMLDivElement | null) => {
       if (isFetchingNextPage) return;
       if (observerRef.current) observerRef.current.disconnect();
 
       observerRef.current = new IntersectionObserver((entries) => {
         if (entries[0].isIntersecting && hasNextPage) {
           fetchNextPage();
         }
       });
 
       if (node) observerRef.current.observe(node);
     },
     [isFetchingNextPage, hasNextPage, fetchNextPage]
   );
 
   const posts = data?.pages.flat() ?? [];
 
   return (
     <MainLayout>
       <StoriesBar />
 
       <div className="divide-y divide-border">
         {isLoading ? (
           <>
             <PostSkeleton />
             <PostSkeleton />
             <PostSkeleton />
           </>
         ) : posts.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
             >
               <h2 className="text-xl font-semibold mb-2">Welcome to Photogram!</h2>
               <p className="text-muted-foreground">
                 Start following people to see their posts here, or create your first post.
               </p>
             </motion.div>
           </div>
         ) : (
           posts.map((post, index) => (
             <motion.div
               key={post.id}
               ref={index === posts.length - 1 ? lastPostRef : null}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: Math.min(index * 0.05, 0.3) }}
             >
               <PostCard
                 post={post}
                 onDelete={() => deletePost.mutate(post.id)}
               />
             </motion.div>
           ))
         )}
 
         {isFetchingNextPage && (
           <div className="flex justify-center py-8">
             <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
           </div>
         )}
       </div>
     </MainLayout>
   );
 }