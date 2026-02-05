 import { useState } from 'react';
 import { Navigate } from 'react-router-dom';
 import { motion, AnimatePresence } from 'framer-motion';
 import { useAuth } from '@/lib/auth';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2, Instagram } from 'lucide-react';
 
 export default function Auth() {
   const { user, loading, signIn, signUp } = useAuth();
   const [isLogin, setIsLogin] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     email: '',
     password: '',
     username: '',
     fullName: '',
   });
 
   if (loading) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
     );
   }
 
   if (user) {
     return <Navigate to="/" replace />;
   }
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
 
     try {
       if (isLogin) {
         const { error } = await signIn(formData.email, formData.password);
         if (error) {
           toast({
             title: 'Login failed',
             description: error.message,
             variant: 'destructive',
           });
         }
       } else {
         if (!formData.username.trim()) {
           toast({
             title: 'Username required',
             description: 'Please enter a username',
             variant: 'destructive',
           });
           setIsSubmitting(false);
           return;
         }
         const { error } = await signUp(
           formData.email,
           formData.password,
           formData.username,
           formData.fullName
         );
         if (error) {
           toast({
             title: 'Sign up failed',
             description: error.message,
             variant: 'destructive',
           });
         } else {
           toast({
             title: 'Check your email',
             description: 'We sent you a confirmation link to verify your account.',
           });
         }
       }
     } finally {
       setIsSubmitting(false);
     }
   };
 
   return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-sm"
       >
         {/* Logo */}
         <div className="mb-8 text-center">
           <div className="inline-flex items-center justify-center gap-2 mb-2">
             <div className="p-3 rounded-2xl gradient-button">
               <Instagram className="h-8 w-8 text-white" />
             </div>
           </div>
           <h1 className="text-3xl font-semibold gradient-text">Photogram</h1>
           <p className="mt-2 text-muted-foreground text-sm">
             Share moments with friends
           </p>
         </div>
 
         {/* Form Card */}
         <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
           <AnimatePresence mode="wait">
             <motion.form
               key={isLogin ? 'login' : 'register'}
               initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
               transition={{ duration: 0.2 }}
               onSubmit={handleSubmit}
               className="space-y-4"
             >
               {!isLogin && (
                 <>
                   <div className="space-y-2">
                     <Label htmlFor="fullName">Full Name</Label>
                     <Input
                       id="fullName"
                       type="text"
                       placeholder="John Doe"
                       value={formData.fullName}
                       onChange={(e) =>
                         setFormData({ ...formData, fullName: e.target.value })
                       }
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="username">Username</Label>
                     <Input
                       id="username"
                       type="text"
                       placeholder="johndoe"
                       value={formData.username}
                       onChange={(e) =>
                         setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })
                       }
                       required={!isLogin}
                     />
                   </div>
                 </>
               )}
 
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input
                   id="email"
                   type="email"
                   placeholder="you@example.com"
                   value={formData.email}
                   onChange={(e) =>
                     setFormData({ ...formData, email: e.target.value })
                   }
                   required
                 />
               </div>
 
               <div className="space-y-2">
                 <Label htmlFor="password">Password</Label>
                 <Input
                   id="password"
                   type="password"
                   placeholder="••••••••"
                   value={formData.password}
                   onChange={(e) =>
                     setFormData({ ...formData, password: e.target.value })
                   }
                   required
                   minLength={6}
                 />
               </div>
 
               <Button
                 type="submit"
                 className="w-full gradient-button text-white font-medium"
                 disabled={isSubmitting}
               >
                 {isSubmitting ? (
                   <Loader2 className="h-4 w-4 animate-spin" />
                 ) : isLogin ? (
                   'Log In'
                 ) : (
                   'Sign Up'
                 )}
               </Button>
             </motion.form>
           </AnimatePresence>
 
           <div className="relative my-6">
             <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-border" />
             </div>
             <div className="relative flex justify-center text-xs">
               <span className="bg-card px-2 text-muted-foreground">OR</span>
             </div>
           </div>
 
           <Button
             type="button"
             variant="outline"
             className="w-full"
             onClick={() => {
               setIsLogin(!isLogin);
               setFormData({ email: '', password: '', username: '', fullName: '' });
             }}
           >
             {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
           </Button>
         </div>
       </motion.div>
     </div>
   );
 }