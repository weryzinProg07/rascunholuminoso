import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LogOut, Upload, ShoppingBag, Settings } from 'lucide-react';
import AdminGalleryUpload from '@/components/AdminGalleryUpload';
import AdminGalleryManager from '@/components/AdminGalleryManager';
import AdminOrders from '@/components/AdminOrders';
import { supabase } from '@/integrations/supabase/client';

const AdminUpload = () => {
  const { logout } = useAdminAuth();
  const [unseenOrdersCount, setUnseenOrdersCount] = useState(0);

  useEffect(() => {
    fetchUnseenOrdersCount();
    
    // Subscribe to real-time updates for new orders
    const channel = supabase
      .channel('orders-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
      }, () => {
        fetchUnseenOrdersCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnseenOrdersCount = async () => {
    try {
      const lastViewedTimestamp = localStorage.getItem('lastViewedOrders');
      
      let query = supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });
      
      if (lastViewedTimestamp) {
        query = query.gt('created_at', lastViewedTimestamp);
      }
      
      const { count } = await query;
      setUnseenOrdersCount(count || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem de pedidos não vistos:', error);
    }
  };

  const markOrdersAsSeen = () => {
    localStorage.setItem('lastViewedOrders', new Date().toISOString());
    setUnseenOrdersCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/9d315dc9-03f6-4949-85dc-8c64f34b1b8f.png"
                alt="Rascunho Luminoso Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Painel <span className="text-orange-500">Administrativo</span>
                </h1>
                <p className="text-sm text-gray-600">Rascunho Luminoso</p>
              </div>
            </div>
            <Button 
              onClick={logout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Gerenciar Galeria</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex items-center space-x-2 relative"
              onClick={markOrdersAsSeen}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pedidos Recebidos</span>
              {unseenOrdersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs p-0 min-w-[20px]"
                >
                  {unseenOrdersCount > 99 ? '99+' : unseenOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <AdminGalleryUpload />
          </TabsContent>

          <TabsContent value="gallery">
            <AdminGalleryManager />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUpload;