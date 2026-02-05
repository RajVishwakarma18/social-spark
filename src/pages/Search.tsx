 import { useState, useEffect } from 'react';
 import { Link } from 'react-router-dom';
 import { motion } from 'framer-motion';
 import { Search as SearchIcon, X, User } from 'lucide-react';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { Input } from '@/components/ui/input';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { supabase } from '@/integrations/supabase/client';
 import { Profile } from '@/hooks/useProfile';
 
 export default function Search() {
   const [query, setQuery] = useState('');
   const [results, setResults] = useState<Profile[]>([]);
   const [isSearching, setIsSearching] = useState(false);
 
   useEffect(() => {
     const searchUsers = async () => {
       if (!query.trim()) {
         setResults([]);
         return;
       }
 
       setIsSearching(true);
       const { data } = await supabase
         .from('profiles')
         .select('*')
         .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
         .limit(20);
 
       setResults(data as Profile[] || []);
       setIsSearching(false);
     };
 
     const debounce = setTimeout(searchUsers, 300);
     return () => clearTimeout(debounce);
   }, [query]);
 
   return (
     <MainLayout>
       <div className="p-4">
         {/* Search Input */}
         <div className="relative">
           <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
           <Input
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Search"
             className="pl-10 pr-10 bg-muted border-0"
           />
           {query && (
             <button
               onClick={() => setQuery('')}
               className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
             >
               <X className="h-4 w-4" />
             </button>
           )}
         </div>
 
         {/* Results */}
         <div className="mt-4">
           {isSearching ? (
             <div className="space-y-3">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex items-center gap-3 animate-pulse">
                   <div className="h-12 w-12 rounded-full bg-muted" />
                   <div className="space-y-2">
                     <div className="h-3 w-24 rounded bg-muted" />
                     <div className="h-2 w-32 rounded bg-muted" />
                   </div>
                 </div>
               ))}
             </div>
           ) : results.length > 0 ? (
             <div className="space-y-1">
               {results.map((profile, index) => (
                 <motion.div
                   key={profile.id}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: index * 0.05 }}
                 >
                   <Link
                     to={`/profile/${profile.username}`}
                     className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                   >
                     <Avatar className="h-12 w-12">
                       <AvatarImage src={profile.avatar_url || ''} />
                       <AvatarFallback>
                         <User className="h-5 w-5" />
                       </AvatarFallback>
                     </Avatar>
                     <div>
                       <p className="font-semibold text-sm">{profile.username}</p>
                       <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                     </div>
                   </Link>
                 </motion.div>
               ))}
             </div>
           ) : query ? (
             <div className="py-8 text-center text-muted-foreground">
               No results found for "{query}"
             </div>
           ) : (
             <div className="py-8 text-center text-muted-foreground">
               Search for users by username or name
             </div>
           )}
         </div>
       </div>
     </MainLayout>
   );
 }