 import { useState } from 'react';
 import { useParams, Link, useNavigate } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { ArrowLeft, Heart, Send, Bookmark, MoreHorizontal, User } from 'lucide-react';
 import { formatDistanceToNow } from 'date-fns';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Button } from '@/components/ui/button';
 import { usePost, usePostComments, useToggleLike, useAddComment, useDeletePost } from '@/hooks/usePosts';
 import { useAuth } from '@/lib/auth';
 import { Loader2 } from 'lucide-react';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 export default function PostDetail() {
   const { postId } = useParams<{ postId: string }>();
   const navigate = useNavigate();
   const { user } = useAuth();
   const { data: post, isLoading } = usePost(postId || '');
   const { data: comments } = usePostComments(postId || '');
   const toggleLike = useToggleLike();
   const addComment = useAddComment();
   const deletePost = useDeletePost();
 
   const [comment, setComment] = useState('');
   const [isLiked, setIsLiked] = useState(false);
   const [likesCount, setLikesCount] = useState(0);
   const [isSaved, setIsSaved] = useState(false);
 
   // Update local state when post data loads
   useState(() => {
     if (post) {
       setIsLiked(post.is_liked || false);
       setLikesCount(post.likes_count || 0);
     }
   });
 
   const handleLike = () => {
     if (!user || !post) return;
     const newIsLiked = !isLiked;
     setIsLiked(newIsLiked);
     setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
     toggleLike.mutate({ postId: post.id, isLiked: !newIsLiked, postUserId: post.user_id });
   };
 
   const handleComment = (e: React.FormEvent) => {
     e.preventDefault();
     if (!comment.trim() || !user || !post) return;
     addComment.mutate({ postId: post.id, content: comment, postUserId: post.user_id });
     setComment('');
   };
 
   const handleDelete = async () => {
     if (!post) return;
     await deletePost.mutateAsync(post.id);
     navigate('/');
   };
 
   if (isLoading) {
     return (
       <MainLayout>
         <div className="flex items-center justify-center py-20">
           <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
       </MainLayout>
     );
   }
 
   if (!post) {
     return (
       <MainLayout>
         <div className="flex flex-col items-center justify-center py-20 text-center">
           <h2 className="text-xl font-semibold mb-2">Post not found</h2>
           <Link to="/" className="text-primary">
             Go back home
           </Link>
         </div>
       </MainLayout>
     );
   }
 
   const realLikesCount = post.likes_count || 0;
   const realIsLiked = post.is_liked || false;
 
   return (
     <MainLayout>
       <div className="border-b border-border">
         {/* Mobile Header */}
         <div className="flex items-center gap-4 px-4 py-3 lg:hidden">
           <button onClick={() => navigate(-1)}>
             <ArrowLeft className="h-6 w-6" />
           </button>
           <h1 className="font-semibold">Post</h1>
         </div>
 
         <div className="lg:flex">
           {/* Image */}
           <div className="aspect-square lg:flex-1">
             <img
               src={post.image_url}
               alt={post.caption || 'Post image'}
               className="h-full w-full object-cover"
             />
           </div>
 
           {/* Details */}
           <div className="flex flex-col lg:w-[400px] lg:border-l lg:border-border">
             {/* Post Header */}
             <div className="flex items-center justify-between border-b border-border px-4 py-3">
               <Link
                 to={`/profile/${post.profile?.username || ''}`}
                 className="flex items-center gap-3"
               >
                 <Avatar className="h-8 w-8">
                   <AvatarImage src={post.profile?.avatar_url || ''} />
                   <AvatarFallback>
                     <User className="h-4 w-4" />
                   </AvatarFallback>
                 </Avatar>
                 <p className="font-semibold text-sm">{post.profile?.username}</p>
               </Link>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8">
                     <MoreHorizontal className="h-5 w-5" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuItem>Copy link</DropdownMenuItem>
                   {user?.id === post.user_id && (
                     <DropdownMenuItem
                       className="text-destructive"
                       onClick={handleDelete}
                     >
                       Delete post
                     </DropdownMenuItem>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
 
             {/* Comments */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px] lg:max-h-none">
               {/* Caption */}
               {post.caption && (
                 <div className="flex gap-3">
                   <Avatar className="h-8 w-8 flex-shrink-0">
                     <AvatarImage src={post.profile?.avatar_url || ''} />
                     <AvatarFallback>
                       <User className="h-4 w-4" />
                     </AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-sm">
                       <Link
                         to={`/profile/${post.profile?.username || ''}`}
                         className="font-semibold mr-1"
                       >
                         {post.profile?.username}
                       </Link>
                       {post.caption}
                     </p>
                     <p className="text-xs text-muted-foreground mt-1">
                       {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                     </p>
                   </div>
                 </div>
               )}
 
               {/* Comments List */}
               {comments?.map((c, index) => (
                 <motion.div
                   key={c.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.03 }}
                   className="flex gap-3"
                 >
                   <Avatar className="h-8 w-8 flex-shrink-0">
                     <AvatarImage src={c.profile?.avatar_url || ''} />
                     <AvatarFallback>
                       <User className="h-4 w-4" />
                     </AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-sm">
                       <Link
                         to={`/profile/${c.profile?.username || ''}`}
                         className="font-semibold mr-1"
                       >
                         {c.profile?.username}
                       </Link>
                       {c.content}
                     </p>
                     <p className="text-xs text-muted-foreground mt-1">
                       {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                     </p>
                   </div>
                 </motion.div>
               ))}
             </div>
 
             {/* Actions */}
             <div className="border-t border-border">
               <div className="flex items-center justify-between px-4 py-3">
                 <div className="flex items-center gap-1">
                   <motion.button
                     whileTap={{ scale: 0.9 }}
                     onClick={handleLike}
                     className="action-btn"
                   >
                     <Heart
                       className={`h-6 w-6 transition-colors ${
                         realIsLiked ? 'fill-destructive text-destructive' : ''
                       }`}
                     />
                   </motion.button>
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
 
               <p className="px-4 text-sm font-semibold">{realLikesCount.toLocaleString()} likes</p>
               <p className="px-4 pb-3 text-xs text-muted-foreground uppercase">
                 {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
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
             </div>
           </div>
         </div>
       </div>
     </MainLayout>
   );
 }