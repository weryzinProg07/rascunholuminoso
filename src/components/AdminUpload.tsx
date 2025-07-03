
import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Upload, ShoppingBag } from 'lucide-react';
import AdminGalleryManager from '@/components/AdminGalleryManager';
import AdminOrders from '@/components/AdminOrders';

const AdminUpload = () => {
  const { logout } = useAdminAuth();

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
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Galeria</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Pedidos Recebidos</span>
            </TabsTrigger>
          </TabsList>

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
