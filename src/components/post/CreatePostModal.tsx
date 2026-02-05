 import { useState, useRef } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { X, Image as ImageIcon, MapPin, Loader2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Input } from '@/components/ui/input';
 import { useCreatePost } from '@/hooks/usePosts';
 import { useToast } from '@/hooks/use-toast';
 
 interface CreatePostModalProps {
   isOpen: boolean;
   onClose: () => void;
 }
 
 export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
   const [step, setStep] = useState<'select' | 'edit'>('select');
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [preview, setPreview] = useState<string>('');
   const [caption, setCaption] = useState('');
   const [location, setLocation] = useState('');
   const fileInputRef = useRef<HTMLInputElement>(null);
   const createPost = useCreatePost();
   const { toast } = useToast();
 
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       if (!file.type.startsWith('image/')) {
         toast({
           title: 'Invalid file type',
           description: 'Please select an image file',
           variant: 'destructive',
         });
         return;
       }
       setSelectedFile(file);
       setPreview(URL.createObjectURL(file));
       setStep('edit');
     }
   };
 
   const handleShare = async () => {
     if (!selectedFile) return;
 
     try {
       await createPost.mutateAsync({
         imageFile: selectedFile,
         caption: caption.trim() || undefined,
         location: location.trim() || undefined,
       });
       toast({
         title: 'Post shared!',
         description: 'Your post has been published.',
       });
       handleClose();
     } catch (error) {
       toast({
         title: 'Error',
         description: 'Failed to create post. Please try again.',
         variant: 'destructive',
       });
     }
   };
 
   const handleClose = () => {
     setStep('select');
     setSelectedFile(null);
     setPreview('');
     setCaption('');
     setLocation('');
     onClose();
   };
 
   return (
     <AnimatePresence>
       {isOpen && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
           onClick={handleClose}
         >
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             onClick={(e) => e.stopPropagation()}
             className="relative w-full max-w-lg overflow-hidden rounded-xl bg-card"
           >
             {/* Header */}
             <div className="flex items-center justify-between border-b border-border px-4 py-3">
               <button onClick={handleClose}>
                 <X className="h-6 w-6" />
               </button>
               <h2 className="font-semibold">Create new post</h2>
               {step === 'edit' && (
                 <Button
                   variant="ghost"
                   size="sm"
                   className="text-primary font-semibold"
                   onClick={handleShare}
                   disabled={createPost.isPending}
                 >
                   {createPost.isPending ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                   ) : (
                     'Share'
                   )}
                 </Button>
               )}
               {step === 'select' && <div className="w-12" />}
             </div>
 
             {/* Content */}
             {step === 'select' ? (
               <div className="flex flex-col items-center justify-center gap-4 py-16">
                 <div className="rounded-full bg-muted p-6">
                   <ImageIcon className="h-12 w-12 text-muted-foreground" />
                 </div>
                 <p className="text-xl">Drag photos here</p>
                 <Button
                   onClick={() => fileInputRef.current?.click()}
                   className="gradient-button text-white"
                 >
                   Select from device
                 </Button>
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept="image/*"
                   className="hidden"
                   onChange={handleFileSelect}
                 />
               </div>
             ) : (
               <div className="flex flex-col md:flex-row">
                 <div className="aspect-square w-full md:w-1/2">
                   <img
                     src={preview}
                     alt="Preview"
                     className="h-full w-full object-cover"
                   />
                 </div>
                 <div className="flex-1 p-4">
                   <Textarea
                     placeholder="Write a caption..."
                     value={caption}
                     onChange={(e) => setCaption(e.target.value)}
                     className="min-h-[120px] resize-none border-0 p-0 focus-visible:ring-0"
                     maxLength={2200}
                   />
                   <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                     <MapPin className="h-4 w-4 text-muted-foreground" />
                     <Input
                       placeholder="Add location"
                       value={location}
                       onChange={(e) => setLocation(e.target.value)}
                       className="border-0 p-0 h-auto focus-visible:ring-0"
                     />
                   </div>
                 </div>
               </div>
             )}
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 }