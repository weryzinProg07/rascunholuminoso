
import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLogin from '@/components/AdminLogin';
import AdminGalleryManager from '@/components/AdminGalleryManager';

const AdminArea = () => {
  const { isAuthenticated } = useAdminAuth();

  return isAuthenticated ? <AdminGalleryManager /> : <AdminLogin />;
};

export default AdminArea;
