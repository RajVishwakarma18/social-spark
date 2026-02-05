 import { useQuery } from '@tanstack/react-query';
 import { Link } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { formatDistanceToNow } from 'date-fns';
 import { Heart, MessageCircle, UserPlus, User } from 'lucide-react';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/lib/auth';
 
 interface Notification {
   id: string;
   user_id: string;
   actor_id: string;
   type: 'like' | 'comment' | 'follow';
   post_id: string | null;
   is_read: boolean;
   created_at: string;
   actor?: {
     username: string;
     avatar_url: string | null;
   };
   post?: {
     image_url: string;
   };
 }
 
 export default function Notifications() {
   const { user } = useAuth();
 
   const { data: notifications, isLoading } = useQuery({
     queryKey: ['notifications', user?.id],
     queryFn: async () => {
       if (!user) return [];
 
       const { data, error } = await supabase
         .from('notifications')
         .select('*')
         .eq('user_id', user.id)
         .order('created_at', { ascending: false })
         .limit(50);
 
       if (error) throw error;
 
       // Get actor profiles and post images
       const notificationsWithData = await Promise.all(
         (data || []).map(async (notification) => {
           const [actorResult, postResult] = await Promise.all([
             supabase
               .from('profiles')
               .select('username, avatar_url')
               .eq('user_id', notification.actor_id)
               .single(),
             notification.post_id
               ? supabase
                   .from('posts')
                   .select('image_url')
                   .eq('id', notification.post_id)
                   .single()
               : Promise.resolve({ data: null }),
           ]);
 
           return {
             ...notification,
             actor: actorResult.data,
             post: postResult.data,
           } as Notification;
         })
       );
 
       return notificationsWithData;
     },
     enabled: !!user,
   });
 
   const getNotificationIcon = (type: string) => {
     switch (type) {
       case 'like':
         return <Heart className="h-4 w-4 fill-destructive text-destructive" />;
       case 'comment':
         return <MessageCircle className="h-4 w-4 text-primary" />;
       case 'follow':
         return <UserPlus className="h-4 w-4 text-success" />;
       default:
         return null;
     }
   };
 
   const getNotificationText = (notification: Notification) => {
     switch (notification.type) {
       case 'like':
         return 'liked your post';
       case 'comment':
         return 'commented on your post';
       case 'follow':
         return 'started following you';
       default:
         return '';
     }
   };
 
   return (
     <MainLayout>
       <div className="px-4 py-4">
         <h1 className="text-xl font-semibold mb-4">Notifications</h1>
 
         {isLoading ? (
           <div className="space-y-4">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="flex items-center gap-3 animate-pulse">
                 <div className="h-10 w-10 rounded-full bg-muted" />
                 <div className="flex-1 space-y-2">
                   <div className="h-3 w-48 rounded bg-muted" />
                   <div className="h-2 w-24 rounded bg-muted" />
                 </div>
               </div>
             ))}
           </div>
         ) : notifications && notifications.length > 0 ? (
           <div className="space-y-1">
             {notifications.map((notification, index) => (
               <motion.div
                 key={notification.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.03 }}
               >
                 <Link
                   to={
                     notification.type === 'follow'
                       ? `/profile/${notification.actor?.username}`
                       : `/post/${notification.post_id}`
                   }
                   className={`flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted ${
                     !notification.is_read ? 'bg-muted/50' : ''
                   }`}
                 >
                   <div className="relative">
                     <Avatar className="h-10 w-10">
                       <AvatarImage src={notification.actor?.avatar_url || ''} />
                       <AvatarFallback>
                         <User className="h-4 w-4" />
                       </AvatarFallback>
                     </Avatar>
                     <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card">
                       {getNotificationIcon(notification.type)}
                     </div>
                   </div>
 
                   <div className="flex-1 min-w-0">
                     <p className="text-sm">
                       <span className="font-semibold">{notification.actor?.username}</span>{' '}
                       {getNotificationText(notification)}
                     </p>
                     <p className="text-xs text-muted-foreground">
                       {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                     </p>
                   </div>
 
                   {notification.post?.image_url && (
                     <img
                       src={notification.post.image_url}
                       alt=""
                       className="h-10 w-10 rounded object-cover"
                     />
                   )}
                 </Link>
               </motion.div>
             ))}
           </div>
         ) : (
           <div className="flex flex-col items-center justify-center py-16 text-center">
             <Heart className="h-12 w-12 text-muted-foreground mb-4" />
             <h2 className="font-semibold">No notifications yet</h2>
             <p className="text-sm text-muted-foreground">
               When someone likes, comments, or follows you, you'll see it here.
             </p>
           </div>
         )}
       </div>
     </MainLayout>
   );
 }