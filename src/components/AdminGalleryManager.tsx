
import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Image as ImageIcon, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  created_at: string;
}

const AdminGalleryManager = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadGalleryItems = useCallback(async () => {
    console.log('🔄 Carregando itens da galeria...');
    
    try {
      const { data, error } = await supabase
        .from('gallery_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} itens carregados`);
      setGalleryItems(data || []);
    } catch (error) {
      console.error('❌ Falha no carregamento:', error);
      toast({
        title: "Erro ao carregar galeria",
        description: "Não foi possível carregar os itens da galeria.",
        variant: "destructive",
      });
      setGalleryItems([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshGallery = useCallback(async () => {
    setIsRefreshing(true);
    await loadGalleryItems();
  }, [loadGalleryItems]);

  const deleteImage = useCallback(async (item: GalleryItem) => {
    console.log('🗑️ Iniciando exclusão de:', item.title);
    
    setDeletingItems(prev => new Set(prev).add(item.id));

    try {
      // 1. Deletar do banco de dados primeiro
      const { error: dbError } = await supabase
        .from('gallery_uploads')
        .delete()
        .eq('id', item.id);

      if (dbError) {
        console.error('❌ Erro ao deletar do banco:', dbError);
        throw new Error(`Erro ao excluir do banco: ${dbError.message}`);
      }

      console.log('✅ Deletado do banco de dados');

      // 2. Tentar deletar arquivo do storage
      try {
        const url = new URL(item.image_url);
        const fileName = url.pathname.split('/').pop()?.split('?')[0];
        
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('gallery-images')
            .remove([fileName]);

          if (storageError) {
            console.warn('⚠️ Erro ao deletar arquivo do storage:', storageError);
          } else {
            console.log('✅ Arquivo deletado do storage');
          }
        }
      } catch (storageError) {
        console.warn('⚠️ Erro no storage (continuando):', storageError);
      }

      // 3. Atualizar a lista local
      setGalleryItems(current => current.filter(img => img.id !== item.id));

      toast({
        title: "✅ Imagem excluída!",
        description: `"${item.title}" foi removida da galeria.`,
      });

      console.log('🎉 Exclusão concluída com sucesso');

    } catch (error) {
      console.error('💥 Erro na exclusão:', error);
      
      toast({
        title: "❌ Erro na exclusão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });

      // Recarregar para sincronizar
      setTimeout(() => loadGalleryItems(), 1000);
    } finally {
      setDeletingItems(prev => {
        const updated = new Set(prev);
        updated.delete(item.id);
        return updated;
      });
    }
  }, [loadGalleryItems]);

  useEffect(() => {
    loadGalleryItems();

    const realtimeChannel = supabase
      .channel('admin-gallery-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gallery_uploads'
        },
        () => {
          console.log('➕ Nova inserção detectada, recarregando...');
          setTimeout(() => loadGalleryItems(), 1000);
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Desconectando listener');
      supabase.removeChannel(realtimeChannel);
    };
  }, [loadGalleryItems]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="text-orange-500" size={24} />
            <span>Gerenciar Galeria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando itens...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="text-orange-500" size={24} />
            <span>Gerenciar Galeria ({galleryItems.length} itens)</span>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshGallery}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {galleryItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum item encontrado na galeria.</p>
            <Button onClick={refreshGallery} variant="outline">
              Recarregar
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('🖼️ Erro ao carregar imagem:', item.image_url);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                  {item.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full flex items-center space-x-2"
                        disabled={deletingItems.has(item.id)}
                      >
                        <Trash2 size={14} />
                        <span>{deletingItems.has(item.id) ? 'Excluindo...' : 'Excluir'}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir "{item.title}"? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteImage(item)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Sim, excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminGalleryManager;
