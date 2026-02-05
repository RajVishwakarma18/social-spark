 import { Link, useLocation } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { Home, Search, PlusSquare, Heart, User, Instagram } from 'lucide-react';
 import { useAuth } from '@/lib/auth';
 import { useCurrentProfile } from '@/hooks/useProfile';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 
 const navItems = [
   { path: '/', icon: Home, label: 'Home' },
   { path: '/search', icon: Search, label: 'Search' },
   { path: '/create', icon: PlusSquare, label: 'Create' },
   { path: '/notifications', icon: Heart, label: 'Notifications' },
 ];
 
 export function Navbar() {
   const location = useLocation();
   const { user } = useAuth();
   const { data: profile } = useCurrentProfile();
 
   return (
     <>
       {/* Desktop Sidebar */}
       <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col border-r border-border bg-background lg:flex xl:w-[244px]">
         <div className="flex h-full flex-col px-3 py-6">
           {/* Logo */}
           <Link to="/" className="mb-8 flex items-center gap-3 px-3">
             <div className="p-2 rounded-xl gradient-button">
               <Instagram className="h-5 w-5 text-white" />
             </div>
             <span className="hidden text-xl font-semibold xl:block">Photogram</span>
           </Link>
 
           {/* Nav Items */}
           <nav className="flex flex-1 flex-col gap-1">
             {navItems.map((item) => {
               const isActive = location.pathname === item.path;
               return (
                 <Link
                   key={item.path}
                   to={item.path}
                   className="group relative flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-muted"
                 >
                   {isActive && (
                     <motion.div
                       layoutId="activeNav"
                       className="absolute inset-0 rounded-lg bg-muted"
                       transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                     />
                   )}
                   <item.icon
                     className={`relative z-10 h-6 w-6 transition-transform group-hover:scale-105 ${
                       isActive ? 'stroke-[2.5px]' : ''
                     }`}
                   />
                   <span
                     className={`relative z-10 hidden xl:block ${isActive ? 'font-semibold' : ''}`}
                   >
                     {item.label}
                   </span>
                 </Link>
               );
             })}
 
             {/* Profile Link */}
             {user && (
               <Link
                 to={`/profile/${profile?.username || ''}`}
                 className="group relative flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-muted"
               >
                 {location.pathname.startsWith('/profile') && (
                   <motion.div
                     layoutId="activeNav"
                     className="absolute inset-0 rounded-lg bg-muted"
                     transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                   />
                 )}
                 <Avatar className="relative z-10 h-6 w-6">
                   <AvatarImage src={profile?.avatar_url || ''} />
                   <AvatarFallback>
                     <User className="h-4 w-4" />
                   </AvatarFallback>
                 </Avatar>
                 <span
                   className={`relative z-10 hidden xl:block ${
                     location.pathname.startsWith('/profile') ? 'font-semibold' : ''
                   }`}
                 >
                   Profile
                 </span>
               </Link>
             )}
           </nav>
         </div>
       </aside>
 
       {/* Mobile Top Bar */}
       <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
         <Link to="/" className="flex items-center gap-2">
           <div className="p-1.5 rounded-lg gradient-button">
             <Instagram className="h-4 w-4 text-white" />
           </div>
           <span className="text-lg font-semibold">Photogram</span>
         </Link>
         <div className="flex items-center gap-2">
           <Link to="/notifications" className="action-btn">
             <Heart className="h-6 w-6" />
           </Link>
         </div>
       </header>
 
       {/* Mobile Bottom Nav */}
       <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-border bg-background lg:hidden">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <Link
               key={item.path}
               to={item.path}
               className="flex flex-1 items-center justify-center py-3"
             >
               <item.icon
                 className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : ''}`}
               />
             </Link>
           );
         })}
         {user && (
           <Link
             to={`/profile/${profile?.username || ''}`}
             className="flex flex-1 items-center justify-center py-3"
           >
             <Avatar className="h-6 w-6">
               <AvatarImage src={profile?.avatar_url || ''} />
               <AvatarFallback>
                 <User className="h-4 w-4" />
               </AvatarFallback>
             </Avatar>
           </Link>
         )}
       </nav>
     </>
   );
 }