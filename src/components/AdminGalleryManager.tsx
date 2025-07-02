
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
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const loadGalleryItems = async () => {
    console.log('🔄 Admin: Carregando itens da galeria...');
    setIsLoading(true);
    
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
  };

  const permanentDeleteItem = async (itemId: string, itemTitle: string) => {
    console.log('🗑️ Admin: Iniciando exclusão PERMANENTE do item:', itemId);
    setDeletingItemId(itemId);

    try {
      // 1. Executar DELETE diretamente no banco
      const { error: deleteError } = await supabase
        .from('gallery_uploads')
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error('❌ Erro ao deletar do banco:', deleteError);
        throw deleteError;
      }

      console.log('✅ Item PERMANENTEMENTE deletado do banco');

      // 2. Atualizar estado local IMEDIATAMENTE
      setGalleryItems(prevItems => {
        const updatedItems = prevItems.filter(item => item.id !== itemId);
        console.log(`📝 Estado atualizado: ${updatedItems.length} itens restantes`);
        return updatedItems;
      });

      // 3. Confirmar exclusão
      toast({
        title: "✅ Exclusão bem-sucedida!",
        description: `"${itemTitle}" foi removido PERMANENTEMENTE da galeria.`,
      });

    } catch (error) {
      console.error('❌ FALHA na exclusão permanente:', error);
      toast({
        title: "❌ Erro na exclusão",
        description: "Não foi possível excluir o item permanentemente.",
        variant: "destructive",
      });
    } finally {
      setDeletingItemId(null);
    }
  };

  useEffect(() => {
    loadGalleryItems();
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
                        disabled={deletingItemId === item.id}
                      >
                        <Trash2 size={14} />
                        <span>{deletingItemId === item.id ? 'Excluindo permanentemente...' : 'Excluir Permanentemente'}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>⚠️ Exclusão Permanente</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>ATENÇÃO:</strong> Tem certeza que deseja excluir "{item.title}" PERMANENTEMENTE? 
                          <br /><br />
                          Esta ação é <strong>IRREVERSÍVEL</strong> e o item será removido definitivamente do banco de dados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => permanentDeleteItem(item.id, item.title)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deletingItemId === item.id}
                        >
                          {deletingItemId === item.id ? 'Excluindo...' : 'Sim, excluir PERMANENTEMENTE'}
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
