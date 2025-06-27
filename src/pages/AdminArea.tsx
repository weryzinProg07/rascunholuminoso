
import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLogin from '@/components/AdminLogin';
import AdminUpload from '@/components/AdminUpload';

const AdminArea = () => {
  const { isAuthenticated } = useAdminAuth();

  return isAuthenticated ? <AdminUpload /> : <AdminLogin />;
};

export default AdminArea;
