 import { useState, useRef, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { X, Camera, Loader2, User } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Label } from '@/components/ui/label';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { useCurrentProfile, useUpdateProfile } from '@/hooks/useProfile';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/lib/auth';
 import { useToast } from '@/hooks/use-toast';
 
 interface EditProfileModalProps {
   isOpen: boolean;
   onClose: () => void;
 }
 
 export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
   const { user } = useAuth();
   const { data: profile } = useCurrentProfile();
   const updateProfile = useUpdateProfile();
   const { toast } = useToast();
   const fileInputRef = useRef<HTMLInputElement>(null);
 
   const [formData, setFormData] = useState({
     full_name: '',
     username: '',
     bio: '',
     website: '',
   });
   const [avatarFile, setAvatarFile] = useState<File | null>(null);
   const [avatarPreview, setAvatarPreview] = useState<string>('');
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   useEffect(() => {
     if (profile) {
       setFormData({
         full_name: profile.full_name || '',
         username: profile.username || '',
         bio: profile.bio || '',
         website: profile.website || '',
       });
       setAvatarPreview(profile.avatar_url || '');
     }
   }, [profile]);
 
   const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       setAvatarFile(file);
       setAvatarPreview(URL.createObjectURL(file));
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!user) return;
 
     setIsSubmitting(true);
 
     try {
       let avatarUrl = profile?.avatar_url;
 
       if (avatarFile) {
         const fileExt = avatarFile.name.split('.').pop();
         const fileName = `${user.id}/${Date.now()}.${fileExt}`;
 
         const { error: uploadError } = await supabase.storage
           .from('avatars')
           .upload(fileName, avatarFile);
 
         if (uploadError) throw uploadError;
 
         const { data: { publicUrl } } = supabase.storage
           .from('avatars')
           .getPublicUrl(fileName);
 
         avatarUrl = publicUrl;
       }
 
       await updateProfile.mutateAsync({
         ...formData,
         avatar_url: avatarUrl,
       });
 
       toast({
         title: 'Profile updated',
         description: 'Your profile has been updated successfully.',
       });
 
       onClose();
     } catch (error: any) {
       toast({
         title: 'Error',
         description: error.message || 'Failed to update profile',
         variant: 'destructive',
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   return (
     <AnimatePresence>
       {isOpen && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
           onClick={onClose}
         >
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             onClick={(e) => e.stopPropagation()}
             className="relative w-full max-w-md overflow-hidden rounded-xl bg-card"
           >
             {/* Header */}
             <div className="flex items-center justify-between border-b border-border px-4 py-3">
               <button onClick={onClose}>
                 <X className="h-6 w-6" />
               </button>
               <h2 className="font-semibold">Edit profile</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 className="text-primary font-semibold"
                 onClick={handleSubmit}
                 disabled={isSubmitting}
               >
                 {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Done'}
               </Button>
             </div>
 
             {/* Form */}
             <form onSubmit={handleSubmit} className="p-4 space-y-4">
               {/* Avatar */}
               <div className="flex flex-col items-center gap-2">
                 <div className="relative">
                   <Avatar className="h-24 w-24">
                     <AvatarImage src={avatarPreview} />
                     <AvatarFallback>
                       <User className="h-10 w-10" />
                     </AvatarFallback>
                   </Avatar>
                   <button
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                   >
                     <Camera className="h-4 w-4" />
                   </button>
                 </div>
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={handleAvatarSelect}
                 />
                 <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className="text-sm text-primary font-medium"
                 >
                   Change profile photo
                 </button>
               </div>
 
               {/* Fields */}
               <div className="space-y-3">
                 <div>
                   <Label htmlFor="full_name">Name</Label>
                   <Input
                     id="full_name"
                     value={formData.full_name}
                     onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                     placeholder="Your name"
                   />
                 </div>
 
                 <div>
                   <Label htmlFor="username">Username</Label>
                   <Input
                     id="username"
                     value={formData.username}
                     onChange={(e) =>
                       setFormData({
                         ...formData,
                         username: e.target.value.toLowerCase().replace(/\s/g, ''),
                       })
                     }
                     placeholder="username"
                   />
                 </div>
 
                 <div>
                   <Label htmlFor="bio">Bio</Label>
                   <Textarea
                     id="bio"
                     value={formData.bio}
                     onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                     placeholder="Tell people about yourself"
                     maxLength={150}
                     className="resize-none"
                     rows={3}
                   />
                 </div>
 
                 <div>
                   <Label htmlFor="website">Website</Label>
                   <Input
                     id="website"
                     value={formData.website}
                     onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                     placeholder="yourwebsite.com"
                   />
                 </div>
               </div>
             </form>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 }