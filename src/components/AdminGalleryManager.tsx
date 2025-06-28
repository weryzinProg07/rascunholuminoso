
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

  const permanentlyDeleteImage = async (item: GalleryItem) => {
    console.log('🗑️ INICIANDO EXCLUSÃO DEFINITIVA');
    console.log('📄 Item:', { id: item.id, title: item.title, url: item.image_url });
    
    // Marcar como sendo deletado
    setDeletingItems(prev => new Set(prev).add(item.id));

    try {
      // PASSO 1: Remover do estado local imediatamente para feedback visual
      console.log('1️⃣ Removendo da interface...');
      setGalleryItems(current => current.filter(img => img.id !== item.id));

      // PASSO 2: Extrair nome do arquivo para exclusão do storage
      const imageUrl = new URL(item.image_url);
      const fileName = imageUrl.pathname.split('/').pop()?.split('?')[0];
      
      if (!fileName) {
        throw new Error('Nome do arquivo não encontrado na URL');
      }
      console.log('📂 Arquivo a ser deletado:', fileName);

      // PASSO 3: Deletar registro do banco de dados
      console.log('2️⃣ Deletando do banco de dados...');
      const { error: dbDeleteError } = await supabase
        .from('gallery_uploads')
        .delete()
        .eq('id', item.id);

      if (dbDeleteError) {
        throw new Error(`Falha no banco: ${dbDeleteError.message}`);
      }
      console.log('✅ Registro removido do banco');

      // PASSO 4: Deletar arquivo físico do storage
      console.log('3️⃣ Deletando arquivo do storage...');
      const { error: storageDeleteError } = await supabase.storage
        .from('gallery-images')
        .remove([fileName]);

      if (storageDeleteError) {
        console.warn('⚠️ Aviso no storage:', storageDeleteError);
        // Não falhar aqui, pois o registro já foi removido
      } else {
        console.log('✅ Arquivo removido do storage');
      }

      // PASSO 5: Verificação final (aguardar propagação)
      console.log('4️⃣ Verificando exclusão...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data: checkData } = await supabase
        .from('gallery_uploads')
        .select('id')
        .eq('id', item.id)
        .maybeSingle();

      if (checkData) {
        throw new Error('Item ainda existe no banco após exclusão');
      }

      console.log('🎉 EXCLUSÃO DEFINITIVA CONCLUÍDA COM SUCESSO');
      
      toast({
        title: "✅ Imagem excluída com sucesso!",
        description: `"${item.title}" foi removida definitivamente da galeria.`,
        duration: 4000,
      });

    } catch (error) {
      console.error('💥 ERRO NA EXCLUSÃO:', error);
      
      // Restaurar item na lista em caso de erro
      setGalleryItems(current => {
        if (current.find(img => img.id === item.id)) {
          return current; // Já existe
        }
        return [...current, item].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      
      toast({
        title: "❌ Erro ao excluir imagem",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
        duration: 6000,
      });

      // Recarregar dados após erro
      setTimeout(() => loadGalleryItems(), 2000);
    } finally {
      // Remover do conjunto de deletando
      setDeletingItems(prev => {
        const updated = new Set(prev);
        updated.delete(item.id);
        return updated;
      });
    }
  };

  useEffect(() => {
    loadGalleryItems();

    // Listener para mudanças em tempo real
    const realtimeChannel = supabase
      .channel('admin-gallery-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gallery_uploads'
        },
        (payload) => {
          console.log('🔄 Mudança detectada:', payload.eventType);
          
          if (payload.eventType === 'DELETE') {
            console.log('🗑️ Exclusão detectada, atualizando lista...');
            setGalleryItems(current => 
              current.filter(item => item.id !== payload.old?.id)
            );
          } else if (payload.eventType === 'INSERT') {
            console.log('➕ Inserção detectada, recarregando...');
            setTimeout(() => loadGalleryItems(), 800);
          }
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
                        <span>{deletingItems.has(item.id) ? 'Excluindo...' : 'Excluir'}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza que deseja excluir esta imagem?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A imagem "{item.title}" será permanentemente removida da galeria e não aparecerá mais para os visitantes do site.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => permanentlyDeleteImage(item)}
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
