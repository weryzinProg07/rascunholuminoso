
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  }, []);

  const refreshGallery = useCallback(async () => {
    setIsRefreshing(true);
    await loadGalleryItems();
  }, [loadGalleryItems]);

  // PASSO 3: Remoção DEFINITIVA do Banco de Dados
  const deleteFromDatabase = useCallback(async (itemId: string) => {
    console.log('🗄️ EXECUTANDO DELETE DEFINITIVO no banco de dados para ID:', itemId);
    
    try {
      // Usando delete definitivo no Supabase
      const { error, count } = await supabase
        .from('gallery_uploads')
        .delete({ count: 'exact' })
        .eq('id', itemId);

      if (error) {
        console.error('❌ Erro no DELETE do banco:', error);
        throw new Error(`Falha ao excluir do banco: ${error.message}`);
      }

      console.log(`✅ DELETE executado com sucesso. ${count} registro(s) removido(s)`);
      
      if (count === 0) {
        throw new Error('Nenhum registro foi encontrado para exclusão');
      }

      return true;
    } catch (error) {
      console.error('💥 ERRO CRÍTICO no deleteFromDatabase:', error);
      throw error;
    }
  }, []);

  // PASSO 4: Remoção Física do Arquivo no Storage
  const deleteFileFromStorage = useCallback(async (imageUrl: string) => {
    console.log('🗃️ REMOVENDO arquivo físico do storage:', imageUrl);
    
    try {
      // Extrair o nome do arquivo da URL
      const url = new URL(imageUrl);
      const filePath = url.pathname;
      const fileName = filePath.split('/').pop()?.split('?')[0];
      
      if (!fileName) {
        console.warn('⚠️ Nome do arquivo não encontrado na URL');
        return;
      }

      console.log('📁 Excluindo arquivo físico:', fileName);
      
      const { error } = await supabase.storage
        .from('gallery-images')
        .remove([fileName]);

      if (error) {
        console.error('❌ Erro ao remover arquivo físico:', error);
        // Não vamos falhar a operação se o arquivo não existir no storage
        console.warn('⚠️ Continuando mesmo com erro no storage...');
      } else {
        console.log('✅ Arquivo físico removido com sucesso');
      }
    } catch (error) {
      console.error('💥 Erro na remoção do arquivo físico:', error);
      // Não vamos falhar a operação principal por erro no storage
    }
  }, []);

  // Função principal de exclusão seguindo os passos exatos
  const executeCompleteDelete = useCallback(async (item: GalleryItem) => {
    console.log('🚀 INICIANDO EXCLUSÃO COMPLETA - ID:', item.id, 'TÍTULO:', item.title);
    
    // Marcar como "deletando" na interface
    setDeletingItems(prev => new Set(prev).add(item.id));

    try {
      // PASSO 3: PRIMEIRO - Excluir DEFINITIVAMENTE do banco de dados
      console.log('📋 PASSO 3: Executando DELETE no banco de dados...');
      await deleteFromDatabase(item.id);
      
      // PASSO 4: SEGUNDO - Remover arquivo físico do storage
      console.log('📋 PASSO 4: Removendo arquivo físico...');
      await deleteFileFromStorage(item.image_url);
      
      // PASSO 5: Atualizar interface imediatamente (remover da lista local)
      console.log('📋 PASSO 5: Atualizando interface...');
      setGalleryItems(currentItems => {
        const updatedItems = currentItems.filter(img => img.id !== item.id);
        console.log(`📊 Interface atualizada: ${updatedItems.length} itens restantes`);
        return updatedItems;
      });

      // Sucesso total
      console.log('🎉 EXCLUSÃO COMPLETA BEM-SUCEDIDA!');
      
      toast({
        title: "✅ Imagem excluída definitivamente!",
        description: `"${item.title}" foi removida permanentemente da galeria.`,
        duration: 3000,
      });

    } catch (error) {
      console.error('💥 FALHA NA EXCLUSÃO COMPLETA:', error);
      
      // Em caso de erro, recarregar para sincronizar com o banco
      console.log('🔄 Recarregando galeria devido ao erro...');
      setTimeout(() => loadGalleryItems(), 1000);
      
      toast({
        title: "❌ Erro na exclusão",
        description: error instanceof Error ? error.message : "Erro desconhecido na exclusão",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      // Remover status "deletando"
      setDeletingItems(prev => {
        const updated = new Set(prev);
        updated.delete(item.id);
        return updated;
      });
    }
  }, [deleteFromDatabase, deleteFileFromStorage, loadGalleryItems]);

  const memoizedGalleryItems = useMemo(() => galleryItems, [galleryItems]);

  useEffect(() => {
    loadGalleryItems();

    // Listener para mudanças em tempo real
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
            <span>Gerenciar Galeria ({memoizedGalleryItems.length} itens)</span>
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
        {memoizedGalleryItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Nenhum item encontrado na galeria.</p>
            <Button onClick={refreshGallery} variant="outline">
              Recarregar
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memoizedGalleryItems.map((item) => (
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
                  
                  {/* PASSO 2: Confirmação do Admin */}
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
                        <AlertDialogTitle>🗑️ Excluir imagem definitivamente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>ATENÇÃO:</strong> Tem certeza que deseja excluir permanentemente "{item.title}"? 
                          <br /><br />
                          Esta ação irá:
                          <br />• Remover a imagem do banco de dados
                          <br />• Deletar o arquivo físico do servidor
                          <br />• Essa ação NÃO pode ser desfeita
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => executeCompleteDelete(item)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          🗑️ Sim, excluir definitivamente
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
