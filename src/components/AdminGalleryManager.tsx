
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Image as ImageIcon } from 'lucide-react';

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

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setGalleryItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar itens da galeria:', error);
      toast({
        title: "Erro ao carregar galeria",
        description: "Não foi possível carregar os itens da galeria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (item: GalleryItem) => {
    if (!confirm(`Tem certeza que deseja excluir "${item.title}"?`)) {
      return;
    }

    try {
      // Extrair nome do arquivo da URL
      const urlParts = item.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('gallery-images')
        .remove([fileName]);

      if (storageError) {
        console.error('Erro ao deletar arquivo:', storageError);
      }

      // Deletar registro do banco de dados
      const { error: dbError } = await supabase
        .from('gallery_uploads')
        .delete()
        .eq('id', item.id);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Item excluído com sucesso!",
        description: "O item foi removido da galeria.",
      });

      // Atualizar lista
      await fetchGalleryItems();

    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast({
        title: "Erro ao excluir item",
        description: "Não foi possível excluir o item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchGalleryItems();
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
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="text-orange-500" size={24} />
          <span>Gerenciar Galeria ({galleryItems.length} itens)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {galleryItems.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Nenhum item encontrado na galeria.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
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
                  <Button
                    onClick={() => deleteItem(item)}
                    variant="destructive"
                    size="sm"
                    className="w-full flex items-center space-x-2"
                  >
                    <Trash2 size={14} />
                    <span>Excluir</span>
                  </Button>
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
