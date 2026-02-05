 import { useRef } from 'react';
 import { motion } from 'framer-motion';
 import { Plus } from 'lucide-react';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { useAuth } from '@/lib/auth';
 import { useCurrentProfile } from '@/hooks/useProfile';
 
 // Placeholder story data - in a real app, this would come from the database
 const placeholderStories = [
   { id: '1', username: 'travel_vibes', avatar: null },
   { id: '2', username: 'foodie_life', avatar: null },
   { id: '3', username: 'sunset_lover', avatar: null },
   { id: '4', username: 'art_daily', avatar: null },
   { id: '5', username: 'fitness_pro', avatar: null },
   { id: '6', username: 'music_beats', avatar: null },
 ];
 
 export function StoriesBar() {
   const scrollRef = useRef<HTMLDivElement>(null);
   const { user } = useAuth();
   const { data: profile } = useCurrentProfile();
 
   return (
     <div className="border-b border-border bg-card py-4">
       <div
         ref={scrollRef}
         className="flex gap-4 overflow-x-auto px-4 no-scrollbar"
       >
         {/* Add Story Button */}
         {user && (
           <motion.button
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="flex flex-col items-center gap-1 flex-shrink-0"
           >
             <div className="relative">
               <Avatar className="h-16 w-16 border-2 border-border">
                 <AvatarImage src={profile?.avatar_url || ''} />
                 <AvatarFallback className="text-lg">
                   {profile?.username?.charAt(0).toUpperCase() || 'Y'}
                 </AvatarFallback>
               </Avatar>
               <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                 <Plus className="h-3 w-3" />
               </div>
             </div>
             <span className="text-xs">Your story</span>
           </motion.button>
         )}
 
         {/* Story Items */}
         {placeholderStories.map((story, index) => (
           <motion.button
             key={story.id}
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: index * 0.05 }}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="flex flex-col items-center gap-1 flex-shrink-0"
           >
             <div className="story-ring">
               <div className="story-ring-inner">
                 <Avatar className="h-14 w-14">
                   <AvatarImage src={story.avatar || ''} />
                   <AvatarFallback className="text-sm bg-muted">
                     {story.username.charAt(0).toUpperCase()}
                   </AvatarFallback>
                 </Avatar>
               </div>
             </div>
             <span className="text-xs w-16 truncate text-center">{story.username}</span>
           </motion.button>
         ))}
       </div>
     </div>
   );
 }