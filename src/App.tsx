 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { AuthProvider } from "@/lib/auth";
 import Home from "./pages/Home";
 import Auth from "./pages/Auth";
 import Profile from "./pages/Profile";
 import Search from "./pages/Search";
 import Create from "./pages/Create";
 import Notifications from "./pages/Notifications";
 import PostDetail from "./pages/PostDetail";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <AuthProvider>
       <TooltipProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<Home />} />
             <Route path="/auth" element={<Auth />} />
             <Route path="/profile/:username" element={<Profile />} />
             <Route path="/search" element={<Search />} />
             <Route path="/create" element={<Create />} />
             <Route path="/notifications" element={<Notifications />} />
             <Route path="/post/:postId" element={<PostDetail />} />
             {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </AuthProvider>
   </QueryClientProvider>
 );
 
 export default App;
