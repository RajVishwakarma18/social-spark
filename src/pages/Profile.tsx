 import { useState } from 'react';
 import { useParams, Link } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { Settings, Grid3X3, Bookmark, UserPlus, LogOut, Camera, User } from 'lucide-react';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Button } from '@/components/ui/button';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useProfile, useFollowCounts, useIsFollowing, useToggleFollow, useCurrentProfile } from '@/hooks/useProfile';
 import { useUserPosts } from '@/hooks/usePosts';
 import { useAuth } from '@/lib/auth';
 import { EditProfileModal } from '@/components/profile/EditProfileModal';
 import { Loader2 } from 'lucide-react';
 
 export default function Profile() {
   const { username } = useParams<{ username: string }>();
   const { user, signOut } = useAuth();
   const { data: profile, isLoading: profileLoading } = useProfile(username || '');
   const { data: currentProfile } = useCurrentProfile();
   const { data: followCounts } = useFollowCounts(profile?.user_id || '');
   const { data: isFollowing } = useIsFollowing(profile?.user_id || '');
   const { data: posts, isLoading: postsLoading } = useUserPosts(profile?.user_id || '');
   const toggleFollow = useToggleFollow();
   const [showEditModal, setShowEditModal] = useState(false);
 
   const isOwnProfile = user?.id === profile?.user_id;
 
   if (profileLoading) {
     return (
       <MainLayout>
         <div className="flex items-center justify-center py-20">
           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
       </MainLayout>
     );
   }
 
   if (!profile) {
     return (
       <MainLayout>
         <div className="flex flex-col items-center justify-center py-20 text-center">
           <h2 className="text-xl font-semibold mb-2">User not found</h2>
           <p className="text-muted-foreground">This user doesn't exist or has been removed.</p>
           <Link to="/" className="mt-4 text-primary">
             Go back home
           </Link>
         </div>
       </MainLayout>
     );
   }
 
   const handleFollowToggle = () => {
     toggleFollow.mutate({
       targetUserId: profile.user_id,
       isFollowing: isFollowing || false,
     });
   };
 
   return (
     <MainLayout>
       <div className="px-4 py-6">
         {/* Profile Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-8"
         >
           {/* Avatar */}
           <div className="relative">
             <Avatar className="h-24 w-24 md:h-36 md:w-36">
               <AvatarImage src={profile.avatar_url || ''} />
               <AvatarFallback className="text-3xl">
                 <User className="h-10 w-10" />
               </AvatarFallback>
             </Avatar>
             {isOwnProfile && (
               <button
                 className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                 onClick={() => setShowEditModal(true)}
               >
                 <Camera className="h-4 w-4" />
               </button>
             )}
           </div>
 
           {/* Info */}
           <div className="flex-1 text-center md:text-left">
             <div className="flex flex-col items-center gap-4 md:flex-row">
               <h1 className="text-xl font-medium">{profile.username}</h1>
               {isOwnProfile ? (
                 <div className="flex gap-2">
                   <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
                     Edit profile
                   </Button>
                   <Button variant="ghost" size="icon" onClick={signOut}>
                     <LogOut className="h-4 w-4" />
                   </Button>
                 </div>
               ) : (
                 <Button
                   variant={isFollowing ? 'secondary' : 'default'}
                   size="sm"
                   onClick={handleFollowToggle}
                   disabled={toggleFollow.isPending}
                   className={!isFollowing ? 'gradient-button text-white' : ''}
                 >
                   {isFollowing ? 'Following' : 'Follow'}
                 </Button>
               )}
             </div>
 
             {/* Stats */}
             <div className="mt-4 flex justify-center gap-8 md:justify-start">
               <div className="text-center">
                 <span className="font-semibold">{posts?.length || 0}</span>
                 <p className="text-sm text-muted-foreground">posts</p>
               </div>
               <div className="text-center">
                 <span className="font-semibold">{followCounts?.followers || 0}</span>
                 <p className="text-sm text-muted-foreground">followers</p>
               </div>
               <div className="text-center">
                 <span className="font-semibold">{followCounts?.following || 0}</span>
                 <p className="text-sm text-muted-foreground">following</p>
               </div>
             </div>
 
             {/* Bio */}
             <div className="mt-4">
               {profile.full_name && (
                 <p className="font-semibold">{profile.full_name}</p>
               )}
               {profile.bio && (
                 <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
               )}
               {profile.website && (
                 <a
                   href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-sm text-primary font-medium"
                 >
                   {profile.website.replace(/^https?:\/\//, '')}
                 </a>
               )}
             </div>
           </div>
         </motion.div>
 
         {/* Posts Grid */}
         <Tabs defaultValue="posts" className="mt-8">
           <TabsList className="w-full justify-center border-t border-border bg-transparent rounded-none">
             <TabsTrigger
               value="posts"
               className="gap-2 rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
             >
               <Grid3X3 className="h-4 w-4" />
               <span className="hidden sm:inline">Posts</span>
             </TabsTrigger>
             {isOwnProfile && (
               <TabsTrigger
                 value="saved"
                 className="gap-2 rounded-none border-t-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent"
               >
                 <Bookmark className="h-4 w-4" />
                 <span className="hidden sm:inline">Saved</span>
               </TabsTrigger>
             )}
           </TabsList>
 
           <TabsContent value="posts" className="mt-4">
             {postsLoading ? (
               <div className="grid grid-cols-3 gap-1">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className="aspect-square skeleton-shimmer" />
                 ))}
               </div>
             ) : posts && posts.length > 0 ? (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="grid grid-cols-3 gap-1"
               >
                 {posts.map((post, index) => (
                   <motion.div
                     key={post.id}
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: index * 0.03 }}
                   >
                     <Link to={`/post/${post.id}`}>
                       <div className="aspect-square overflow-hidden">
                         <img
                           src={post.image_url}
                           alt=""
                           className="h-full w-full object-cover transition-transform hover:scale-105"
                           loading="lazy"
                         />
                       </div>
                     </Link>
                   </motion.div>
                 ))}
               </motion.div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center">
                 <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                 <h3 className="font-semibold">No Posts Yet</h3>
                 <p className="text-sm text-muted-foreground">
                   {isOwnProfile ? 'Share your first photo!' : 'No posts to show.'}
                 </p>
               </div>
             )}
           </TabsContent>
 
           <TabsContent value="saved" className="mt-4">
             <div className="flex flex-col items-center justify-center py-12 text-center">
               <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
               <h3 className="font-semibold">Saved Posts</h3>
               <p className="text-sm text-muted-foreground">
                 Only you can see what you've saved.
               </p>
             </div>
           </TabsContent>
         </Tabs>
       </div>
 
       <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} />
     </MainLayout>
   );
 }