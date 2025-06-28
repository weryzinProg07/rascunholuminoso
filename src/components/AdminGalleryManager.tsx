
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

  const fetchGalleryItems = async (skipLoading = false) => {
    if (!skipLoading) {
      console.log('AdminGalleryManager: Buscando itens da galeria...');
    }
    
    try {
      // Força uma nova consulta sem cache
      const { data, error } = await supabase
        .from('gallery_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('AdminGalleryManager: Erro na consulta:', error);
        throw error;
      }

      console.log('AdminGalleryManager: Itens encontrados:', data?.length || 0);
      console.log('AdminGalleryManager: IDs dos itens:', data?.map(item => item.id) || []);
      
      setGalleryItems(data || []);
    } catch (error) {
      console.error('AdminGalleryManager: Erro ao carregar itens da galeria:', error);
      toast({
        title: "Erro ao carregar galeria",
        description: "Não foi possível carregar os itens da galeria.",
        variant: "destructive",
      });
      setGalleryItems([]);
    } finally {
      if (!skipLoading) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const refreshGallery = async () => {
    setIsRefreshing(true);
    await fetchGalleryItems();
  };

  const deleteItem = async (item: GalleryItem) => {
    console.log('=== INICIANDO PROCESSO DE EXCLUSÃO DEFINITIVA ===');
    console.log('AdminGalleryManager: Item a ser deletado:', {
      id: item.id,
      title: item.title,
      image_url: item.image_url
    });
    
    // Adicionar item ao conjunto de itens sendo deletados
    setDeletingItems(prev => new Set(prev).add(item.id));

    try {
      // 1. PRIMEIRO: Remover da lista local IMEDIATAMENTE para feedback visual
      console.log('AdminGalleryManager: Passo 1 - Removendo da lista local...');
      setGalleryItems(prevItems => {
        const filtered = prevItems.filter(galleryItem => galleryItem.id !== item.id);
        console.log('AdminGalleryManager: Lista local atualizada:', filtered.length, 'itens restantes');
        return filtered;
      });

      // 2. SEGUNDO: Extrair nome do arquivo do storage
      const url = new URL(item.image_url);
      let fileName = url.pathname.split('/').pop() || '';
      
      // Remover parâmetros de query se existirem
      if (fileName.includes('?')) {
        fileName = fileName.split('?')[0];
      }

      console.log('AdminGalleryManager: Nome do arquivo para exclusão:', fileName);

      // 3. TERCEIRO: Deletar do banco de dados
      console.log('AdminGalleryManager: Passo 2 - Deletando do banco de dados...');
      const { error: dbError } = await supabase
        .from('gallery_uploads')
        .delete()
        .eq('id', item.id);

      if (dbError) {
        console.error('AdminGalleryManager: ERRO no banco de dados:', dbError);
        throw new Error(`Erro ao deletar do banco: ${dbError.message}`);
      }

      console.log('AdminGalleryManager: ✅ Registro deletado do banco com sucesso');

      // 4. QUARTO: Deletar arquivo do storage
      console.log('AdminGalleryManager: Passo 3 - Deletando arquivo do storage...');
      const { error: storageError } = await supabase.storage
        .from('gallery-images')
        .remove([fileName]);

      if (storageError) {
        console.warn('AdminGalleryManager: Aviso - Erro ao deletar arquivo do storage:', storageError);
        // Não falhar aqui, pois o registro já foi removido do banco
      } else {
        console.log('AdminGalleryManager: ✅ Arquivo deletado do storage com sucesso');
      }

      // 5. QUINTO: Fazer uma nova consulta para confirmar exclusão
      console.log('AdminGalleryManager: Passo 4 - Confirmando exclusão com nova consulta...');
      
      // Aguardar um pouco para garantir que a operação foi processada
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recarregar dados do servidor para confirmar
      await fetchGalleryItems(true);

      console.log('AdminGalleryManager: === EXCLUSÃO DEFINITIVA CONCLUÍDA ===');

      toast({
        title: "✅ Imagem excluída com sucesso!",
        description: `A imagem "${item.title}" foi removida definitivamente da galeria.`,
        duration: 3000,
      });

    } catch (error) {
      console.error('AdminGalleryManager: === ERRO NO PROCESSO DE EXCLUSÃO ===');
      console.error('AdminGalleryManager: Detalhes do erro:', error);
      
      // Restaurar item na lista em caso de erro
      setGalleryItems(prevItems => {
        if (prevItems.find(i => i.id === item.id)) {
          return prevItems; // Item já está na lista
        }
        return [...prevItems, item].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      
      toast({
        title: "❌ Erro ao excluir imagem",
        description: error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });

      // Recarregar lista completa em caso de erro
      setTimeout(() => fetchGalleryItems(true), 2000);
    } finally {
      // Remover item do conjunto de itens sendo deletados
      setDeletingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchGalleryItems();

    // Configurar listener para mudanças em tempo real
    const channel = supabase
      .channel('admin-gallery-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gallery_uploads'
        },
        (payload) => {
          console.log('AdminGalleryManager: Mudança detectada na tabela:', payload);
          // Aguardar um pouco antes de recarregar para garantir consistência
          setTimeout(() => {
            fetchGalleryItems(true);
          }, 500);
        }
      )
      .subscribe();

    return () => {
      console.log('AdminGalleryManager: Removendo listener');
      supabase.removeChannel(channel);
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
                      console.log('AdminGalleryManager: Erro ao carregar imagem:', item.image_url);
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
                        <AlertDialogTitle>Tem certeza que deseja excluir esta foto?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A imagem "{item.title}" será permanentemente removida da galeria e não aparecerá mais para os visitantes do site.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteItem(item)}
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
