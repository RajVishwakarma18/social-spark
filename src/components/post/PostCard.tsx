 import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, User } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Button } from '@/components/ui/button';
 import { Post, useToggleLike, useAddComment } from '@/hooks/usePosts';
 import { useAuth } from '@/lib/auth';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 interface PostCardProps {
   post: Post;
   onDelete?: () => void;
 }
 
 export function PostCard({ post, onDelete }: PostCardProps) {
   const { user } = useAuth();
   const toggleLike = useToggleLike();
   const addComment = useAddComment();
   const [comment, setComment] = useState('');
   const [showHeart, setShowHeart] = useState(false);
   const [isLiked, setIsLiked] = useState(post.is_liked);
   const [likesCount, setLikesCount] = useState(post.likes_count || 0);
   const [isSaved, setIsSaved] = useState(false);
 
   const handleLike = () => {
     if (!user) return;
     const newIsLiked = !isLiked;
     setIsLiked(newIsLiked);
     setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
     toggleLike.mutate({ postId: post.id, isLiked: !newIsLiked, postUserId: post.user_id });
   };
 
   const handleDoubleClick = () => {
     if (!user || isLiked) return;
     setShowHeart(true);
     setIsLiked(true);
     setLikesCount((prev) => prev + 1);
     toggleLike.mutate({ postId: post.id, isLiked: false, postUserId: post.user_id });
     setTimeout(() => setShowHeart(false), 1000);
   };
 
   const handleComment = (e: React.FormEvent) => {
     e.preventDefault();
     if (!comment.trim() || !user) return;
     addComment.mutate({ postId: post.id, content: comment, postUserId: post.user_id });
     setComment('');
   };
 
   const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
 
   return (
     <article className="post-card">
       {/* Header */}
       <div className="flex items-center justify-between px-4 py-3">
         <Link
           to={`/profile/${post.profile?.username || ''}`}
           className="flex items-center gap-3"
         >
           <div className="story-ring">
             <div className="story-ring-inner">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={post.profile?.avatar_url || ''} />
                 <AvatarFallback>
                   <User className="h-4 w-4" />
                 </AvatarFallback>
               </Avatar>
             </div>
           </div>
           <div>
             <p className="text-sm font-semibold">{post.profile?.username}</p>
             {post.location && (
               <p className="text-xs text-muted-foreground">{post.location}</p>
             )}
           </div>
         </Link>
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8">
               <MoreHorizontal className="h-5 w-5" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end">
             <DropdownMenuItem>Copy link</DropdownMenuItem>
             {user?.id === post.user_id && onDelete && (
               <DropdownMenuItem
                 className="text-destructive"
                 onClick={onDelete}
               >
                 Delete post
               </DropdownMenuItem>
             )}
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
 
       {/* Image */}
       <div
         className="relative aspect-square cursor-pointer bg-muted"
         onDoubleClick={handleDoubleClick}
       >
         <img
           src={post.image_url}
           alt={post.caption || 'Post image'}
           className="h-full w-full object-cover"
           loading="lazy"
         />
         <AnimatePresence>
           {showHeart && (
             <motion.div
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 1.5, opacity: 0 }}
               className="absolute inset-0 flex items-center justify-center"
             >
               <Heart className="h-24 w-24 fill-white text-white drop-shadow-lg" />
             </motion.div>
           )}
         </AnimatePresence>
       </div>
 
       {/* Actions */}
       <div className="flex items-center justify-between px-4 py-3">
         <div className="flex items-center gap-1">
           <motion.button
             whileTap={{ scale: 0.9 }}
             onClick={handleLike}
             className="action-btn"
           >
             <Heart
               className={`h-6 w-6 transition-colors ${
                 isLiked ? 'fill-destructive text-destructive' : ''
               }`}
             />
           </motion.button>
           <Link to={`/post/${post.id}`} className="action-btn">
             <MessageCircle className="h-6 w-6" />
           </Link>
           <button className="action-btn">
             <Send className="h-6 w-6" />
           </button>
         </div>
         <motion.button
           whileTap={{ scale: 0.9 }}
           onClick={() => setIsSaved(!isSaved)}
           className="action-btn"
         >
           <Bookmark
             className={`h-6 w-6 ${isSaved ? 'fill-foreground' : ''}`}
           />
         </motion.button>
       </div>
 
       {/* Likes */}
       <div className="px-4">
         <p className="text-sm font-semibold">{likesCount.toLocaleString()} likes</p>
       </div>
 
       {/* Caption */}
       {post.caption && (
         <div className="px-4 pt-1">
           <p className="text-sm">
             <Link
               to={`/profile/${post.profile?.username || ''}`}
               className="font-semibold mr-1"
             >
               {post.profile?.username}
             </Link>
             {post.caption}
           </p>
         </div>
       )}
 
       {/* Comments preview */}
       {(post.comments_count ?? 0) > 0 && (
         <Link
           to={`/post/${post.id}`}
           className="block px-4 pt-1 text-sm text-muted-foreground"
         >
           View all {post.comments_count} comments
         </Link>
       )}
 
       {/* Timestamp */}
       <p className="px-4 pt-1 pb-3 text-xs text-muted-foreground uppercase">
         {timeAgo}
       </p>
 
       {/* Add Comment */}
       {user && (
         <form
           onSubmit={handleComment}
           className="flex items-center gap-3 border-t border-border px-4 py-3"
         >
           <input
             type="text"
             placeholder="Add a comment..."
             value={comment}
             onChange={(e) => setComment(e.target.value)}
             className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
           />
           {comment.trim() && (
             <Button
               type="submit"
               variant="ghost"
               size="sm"
               className="text-primary font-semibold p-0 h-auto"
               disabled={addComment.isPending}
             >
               Post
             </Button>
           )}
         </form>
       )}
     </article>
   );
 }