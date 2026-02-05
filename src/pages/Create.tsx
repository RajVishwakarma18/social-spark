 import { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { CreatePostModal } from '@/components/post/CreatePostModal';
 import { useEffect } from 'react';
 
 export default function Create() {
   const [isOpen, setIsOpen] = useState(true);
   const navigate = useNavigate();
 
   const handleClose = () => {
     setIsOpen(false);
     navigate('/');
   };
 
   return (
     <MainLayout>
       <CreatePostModal isOpen={isOpen} onClose={handleClose} />
     </MainLayout>
   );
 }