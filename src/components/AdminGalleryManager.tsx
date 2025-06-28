
import React, { useEffect, useState } from 'react';
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

  const loadGalleryItems = async () => {
    console.log('🔄 AdminGalleryManager: Carregando itens da galeria...');
    
    try {
      const { data, error } = await supabase
        .from('gallery_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ AdminGalleryManager: Erro ao carregar:', error);
        throw error;
      }

      console.log(`✅ AdminGalleryManager: ${data?.length || 0} itens carregados`);
      setGalleryItems(data || []);
    } catch (error) {
      console.error('❌ AdminGalleryManager: Falha no carregamento:', error);
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
  };

  const refreshGallery = async () => {
    setIsRefreshing(true);
    await loadGalleryItems();
  };

  const deleteImage = async (item: GalleryItem) => {
    console.log('🗑️ INICIANDO EXCLUSÃO DEFINITIVA:', { id: item.id, title: item.title });
    
    setDeletingItems(prev => new Set(prev).add(item.id));

    try {
      // PASSO 1: Verificar se o item ainda existe no banco
      const { data: existingItem, error: checkError } = await supabase
        .from('gallery_uploads')
        .select('id')
        .eq('id', item.id)
        .single();

      if (checkError || !existingItem) {
        console.log('⚠️ Item já foi excluído ou não existe mais');
        setGalleryItems(current => current.filter(img => img.id !== item.id));
        return;
      }

      // PASSO 2: Deletar DEFINITIVAMENTE do banco de dados
      console.log('🗄️ Excluindo DEFINITIVAMENTE do banco de dados...');
      const { error: dbDeleteError } = await supabase
        .from('gallery_uploads')
        .delete()
        .eq('id', item.id);

      if (dbDeleteError) {
        throw new Error(`Falha na exclusão do banco: ${dbDeleteError.message}`);
      }
      console.log('✅ Registro EXCLUÍDO DEFINITIVAMENTE do banco de dados');

      // PASSO 3: Extrair nome do arquivo e deletar do storage
      const imageUrl = new URL(item.image_url);
      const fileName = imageUrl.pathname.split('/').pop()?.split('?')[0];
      
      if (fileName) {
        console.log('🗃️ Deletando arquivo do storage:', fileName);
        const { error: storageDeleteError } = await supabase.storage
          .from('gallery-images')
          .remove([fileName]);

        if (storageDeleteError) {
          console.warn('⚠️ Aviso no storage:', storageDeleteError);
        } else {
          console.log('✅ Arquivo removido do storage');
        }
      }

      // PASSO 4: Remover IMEDIATAMENTE do frontend
      console.log('🖥️ Removendo da interface...');
      setGalleryItems(current => {
        const updated = current.filter(img => img.id !== item.id);
        console.log(`📊 Itens restantes: ${updated.length}`);
        return updated;
      });

      // PASSO 5: Verificar se a exclusão foi bem-sucedida
      const { data: verifyData, error: verifyError } = await supabase
        .from('gallery_uploads')
        .select('id')
        .eq('id', item.id)
        .maybeSingle();

      if (verifyData) {
        throw new Error('A imagem ainda existe no banco após exclusão');
      }

      console.log('🎉 EXCLUSÃO DEFINITIVA CONCLUÍDA COM SUCESSO');
      
      toast({
        title: "✅ Imagem excluída definitivamente!",
        description: `"${item.title}" foi removida para sempre da galeria.`,
        duration: 5000,
      });

    } catch (error) {
      console.error('💥 ERRO NA EXCLUSÃO DEFINITIVA:', error);
      
      toast({
        title: "❌ Erro ao excluir imagem",
        description: error instanceof Error ? error.message : "Erro desconhecido na exclusão",
        variant: "destructive",
        duration: 6000,
      });

      // Recarregar dados em caso de erro para garantir sincronia
      setTimeout(() => loadGalleryItems(), 1500);
    } finally {
      setDeletingItems(prev => {
        const updated = new Set(prev);
        updated.delete(item.id);
        return updated;
      });
    }
  };

  useEffect(() => {
    loadGalleryItems();

    // Listener para mudanças em tempo real (apenas para inserções)
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
  }, []);

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
                        <span>{deletingItems.has(item.id) ? 'Excluindo...' : 'Excluir Definitivamente'}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>⚠️ Excluir imagem definitivamente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>ATENÇÃO:</strong> Esta ação é irreversível! A imagem "{item.title}" será excluída permanentemente do banco de dados e do armazenamento. Ela não poderá ser recuperada e desaparecerá completamente da galeria.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteImage(item)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Sim, excluir definitivamente
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
