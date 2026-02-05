 import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/lib/auth';
 
 export interface Post {
   id: string;
   user_id: string;
   image_url: string;
   caption: string | null;
   location: string | null;
   created_at: string;
   updated_at: string;
   profile?: {
     username: string;
     full_name: string | null;
     avatar_url: string | null;
   };
   likes_count?: number;
   comments_count?: number;
   is_liked?: boolean;
 }
 
 export interface Comment {
   id: string;
   user_id: string;
   post_id: string;
   content: string;
   created_at: string;
   profile?: {
     username: string;
     avatar_url: string | null;
   };
 }
 
 const POSTS_PER_PAGE = 10;
 
 export function useFeedPosts() {
   const { user } = useAuth();
 
   return useInfiniteQuery({
     queryKey: ['feed'],
     queryFn: async ({ pageParam = 0 }) => {
       const from = pageParam * POSTS_PER_PAGE;
       const to = from + POSTS_PER_PAGE - 1;
 
 
       const { data: posts, error } = await supabase
         .from('posts')
         .select('*')
         .order('created_at', { ascending: false })
         .range(from, to);
 
       if (error) throw error;
 
       // Get profile, likes and comments count for each post
       const postsWithCounts = await Promise.all(
         (posts ?? []).map(async (post) => {
           const [profileResult, likesResult, commentsResult, isLikedResult] = await Promise.all([
             supabase.from('profiles').select('username, full_name, avatar_url').eq('user_id', post.user_id).single(),
             supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post.id),
             supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', post.id),
             user
               ? supabase.from('likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle()
               : Promise.resolve({ data: null }),
           ]);
 
           return {
             ...post,
            profile: profileResult.data,
             likes_count: likesResult.count ?? 0,
             comments_count: commentsResult.count ?? 0,
             is_liked: !!isLikedResult.data,
          } as Post;
         })
       );
 
       return postsWithCounts;
     },
     getNextPageParam: (lastPage, allPages) => {
       return lastPage.length === POSTS_PER_PAGE ? allPages.length : undefined;
     },
     initialPageParam: 0,
   });
 }
 
 export function useUserPosts(userId: string) {
   return useQuery({
     queryKey: ['userPosts', userId],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('posts')
         .select('*')
         .eq('user_id', userId)
         .order('created_at', { ascending: false });
       if (error) throw error;
       return data as Post[];
     },
     enabled: !!userId,
   });
 }
 
 export function usePost(postId: string) {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['post', postId],
     queryFn: async () => {
       const [postResult, likesResult, commentsResult, isLikedResult] = await Promise.all([
         supabase.from('posts').select('*').eq('id', postId).single(),
         supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', postId),
         supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', postId),
         user
           ? supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle()
           : Promise.resolve({ data: null }),
       ]);
 
       if (postResult.error) throw postResult.error;
       const post = postResult.data;
 
       // Get profile separately
       const { data: profile } = await supabase
         .from('profiles')
         .select('username, full_name, avatar_url')
         .eq('user_id', post.user_id)
         .single();
 
       return {
         ...post,
         profile,
         likes_count: likesResult.count ?? 0,
         comments_count: commentsResult.count ?? 0,
         is_liked: !!isLikedResult.data,
       } as Post;
     },
     enabled: !!postId,
   });
 }
 
 export function usePostComments(postId: string) {
   return useQuery({
     queryKey: ['comments', postId],
     queryFn: async () => {
       const { data: comments, error } = await supabase
         .from('comments')
         .select('*')
         .eq('post_id', postId)
         .order('created_at', { ascending: true });
       if (error) throw error;
 
       // Get profiles for each comment
       const commentsWithProfiles = await Promise.all(
         (comments ?? []).map(async (comment) => {
           const { data: profile } = await supabase
             .from('profiles')
             .select('username, avatar_url')
             .eq('user_id', comment.user_id)
             .single();
           return { ...comment, profile } as Comment;
         })
       );
 
       return commentsWithProfiles;
     },
     enabled: !!postId,
   });
 }
 
 export function useCreatePost() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async ({ imageFile, caption, location }: { imageFile: File; caption?: string; location?: string }) => {
       if (!user) throw new Error('Not authenticated');
 
       // Upload image
       const fileExt = imageFile.name.split('.').pop();
       const fileName = `${user.id}/${Date.now()}.${fileExt}`;
       
       const { error: uploadError } = await supabase.storage
         .from('posts')
         .upload(fileName, imageFile);
 
       if (uploadError) throw uploadError;
 
       const { data: { publicUrl } } = supabase.storage
         .from('posts')
         .getPublicUrl(fileName);
 
       // Create post
       const { data, error } = await supabase
         .from('posts')
         .insert({
           user_id: user.id,
           image_url: publicUrl,
           caption,
           location,
         })
         .select()
         .single();
 
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['feed'] });
       queryClient.invalidateQueries({ queryKey: ['userPosts'] });
     },
   });
 }
 
 export function useDeletePost() {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async (postId: string) => {
       const { error } = await supabase.from('posts').delete().eq('id', postId);
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['feed'] });
       queryClient.invalidateQueries({ queryKey: ['userPosts'] });
     },
   });
 }
 
 export function useToggleLike() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async ({ postId, isLiked, postUserId }: { postId: string; isLiked: boolean; postUserId: string }) => {
       if (!user) throw new Error('Not authenticated');
 
       if (isLiked) {
         await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
       } else {
         await supabase.from('likes').insert({ post_id: postId, user_id: user.id });
         // Create notification if not own post
         if (postUserId !== user.id) {
           await supabase.from('notifications').insert({
             user_id: postUserId,
             actor_id: user.id,
             type: 'like',
             post_id: postId,
           });
         }
       }
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['feed'] });
       queryClient.invalidateQueries({ queryKey: ['post'] });
     },
   });
 }
 
 export function useAddComment() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async ({ postId, content, postUserId }: { postId: string; content: string; postUserId: string }) => {
       if (!user) throw new Error('Not authenticated');
 
       const { data, error } = await supabase
         .from('comments')
         .insert({ post_id: postId, user_id: user.id, content })
         .select()
         .single();
 
       if (error) throw error;
 
       // Create notification if not own post
       if (postUserId !== user.id) {
         await supabase.from('notifications').insert({
           user_id: postUserId,
           actor_id: user.id,
           type: 'comment',
           post_id: postId,
         });
       }
 
       return data;
     },
     onSuccess: (_, { postId }) => {
       queryClient.invalidateQueries({ queryKey: ['comments', postId] });
       queryClient.invalidateQueries({ queryKey: ['feed'] });
       queryClient.invalidateQueries({ queryKey: ['post'] });
     },
   });
 }