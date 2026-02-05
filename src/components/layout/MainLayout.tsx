 import { ReactNode } from 'react';
 import { Navigate } from 'react-router-dom';
 import { useAuth } from '@/lib/auth';
 import { Navbar } from './Navbar';
 import { Loader2 } from 'lucide-react';
 
 interface MainLayoutProps {
   children: ReactNode;
   requireAuth?: boolean;
 }
 
 export function MainLayout({ children, requireAuth = true }: MainLayoutProps) {
   const { user, loading } = useAuth();
 
   if (loading) {
     return (
       <div className="flex min-h-screen items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
     );
   }
 
   if (requireAuth && !user) {
     return <Navigate to="/auth" replace />;
   }
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
       {/* Main content with responsive padding */}
       <main className="pt-14 pb-14 lg:pt-0 lg:pb-0 lg:pl-[72px] xl:pl-[244px]">
         <div className="mx-auto max-w-[630px] px-0 lg:px-4 lg:py-6">
           {children}
         </div>
       </main>
     </div>
   );
 }