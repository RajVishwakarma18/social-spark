 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/lib/auth';
 
 export interface Profile {
   id: string;
   user_id: string;
   username: string;
   full_name: string | null;
   avatar_url: string | null;
   bio: string | null;
   website: string | null;
   is_private: boolean;
   created_at: string;
   updated_at: string;
 }
 
 export function useCurrentProfile() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['profile', user?.id],
     queryFn: async () => {
       if (!user) return null;
       const { data, error } = await supabase
         .from('profiles')
         .select('*')
         .eq('user_id', user.id)
         .maybeSingle();
       if (error) throw error;
       return data as Profile | null;
     },
     enabled: !!user,
   });
 }
 
 export function useProfile(username: string) {
   return useQuery({
     queryKey: ['profile', 'username', username],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('profiles')
         .select('*')
         .eq('username', username)
         .maybeSingle();
       if (error) throw error;
       return data as Profile | null;
     },
     enabled: !!username,
   });
 }
 
 export function useUpdateProfile() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async (updates: Partial<Profile>) => {
       if (!user) throw new Error('Not authenticated');
       const { data, error } = await supabase
         .from('profiles')
         .update(updates)
         .eq('user_id', user.id)
         .select()
         .single();
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['profile'] });
     },
   });
 }
 
 export function useFollowCounts(userId: string) {
   return useQuery({
     queryKey: ['followCounts', userId],
     queryFn: async () => {
       const [followersResult, followingResult] = await Promise.all([
         supabase.from('follows').select('id', { count: 'exact' }).eq('following_id', userId),
         supabase.from('follows').select('id', { count: 'exact' }).eq('follower_id', userId),
       ]);
       return {
         followers: followersResult.count ?? 0,
         following: followingResult.count ?? 0,
       };
     },
     enabled: !!userId,
   });
 }
 
 export function useIsFollowing(targetUserId: string) {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ['isFollowing', user?.id, targetUserId],
     queryFn: async () => {
       if (!user) return false;
       const { data } = await supabase
         .from('follows')
         .select('id')
         .eq('follower_id', user.id)
         .eq('following_id', targetUserId)
         .maybeSingle();
       return !!data;
     },
     enabled: !!user && !!targetUserId && user.id !== targetUserId,
   });
 }
 
 export function useToggleFollow() {
   const queryClient = useQueryClient();
   const { user } = useAuth();
 
   return useMutation({
     mutationFn: async ({ targetUserId, isFollowing }: { targetUserId: string; isFollowing: boolean }) => {
       if (!user) throw new Error('Not authenticated');
       
       if (isFollowing) {
         await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
       } else {
         await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId });
         // Create notification
         await supabase.from('notifications').insert({
           user_id: targetUserId,
           actor_id: user.id,
           type: 'follow',
         });
       }
     },
     onSuccess: (_, { targetUserId }) => {
       queryClient.invalidateQueries({ queryKey: ['isFollowing'] });
       queryClient.invalidateQueries({ queryKey: ['followCounts', targetUserId] });
       queryClient.invalidateQueries({ queryKey: ['followCounts', user?.id] });
     },
   });
 }