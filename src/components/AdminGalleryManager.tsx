
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

  const loadGalleryItems = useCallback(async () => {
    console.log('🔄 Admin: Carregando itens da galeria...');
    
    try {
      const { data, error } = await supabase
        .from('gallery_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Admin: Erro ao carregar:', error);
        throw error;
      }

      console.log(`✅ Admin: ${data?.length || 0} itens carregados`);
      setGalleryItems(data || []);
    } catch (error) {
      console.error('❌ Admin: Falha no carregamento:', error);
      toast({
        title: "Erro ao carregar galeria",
        description: "Não foi possível carregar os itens da galeria.",
        variant: "destructive",
      });
      setGalleryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteImage = useCallback(async (item: GalleryItem) => {
    console.log('🗑️ Admin: Deletando imagem com ID:', item.id);
    
    setDeletingItems(prev => new Set(prev).add(item.id));

    try {
      // Deletar do banco de dados usando o ID
      const { error } = await supabase
        .from('gallery_uploads')
        .delete()
        .eq('id', item.id);

      if (error) {
        console.error('❌ Erro ao deletar do banco:', error);
        throw error;
      }

      console.log('✅ Imagem deletada do banco com sucesso');

      // Atualizar lista local imediatamente
      setGalleryItems(current => current.filter(img => img.id !== item.id));

      toast({
        title: "✅ Imagem excluída!",
        description: `"${item.title}" foi removida permanentemente.`,
      });

    } catch (error) {
      console.error('❌ Erro na exclusão:', error);
      
      toast({
        title: "❌ Erro na exclusão",
        description: "Não foi possível excluir a imagem.",
        variant: "destructive",
      });
    } finally {
      setDeletingItems(prev => {
        const updated = new Set(prev);
        updated.delete(item.id);
        return updated;
      });
    }
  }, []);

  useEffect(() => {
    loadGalleryItems();
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
            onClick={loadGalleryItems}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {galleryItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum item encontrado na galeria.</p>
            <Button onClick={loadGalleryItems} variant="outline">
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
                      console.log('🖼️ Admin: Erro ao carregar imagem:', item.image_url);
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
                        <AlertDialogTitle>Excluir imagem permanentemente?</AlertDialogTitle>
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
                          Sim, excluir permanentemente
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
