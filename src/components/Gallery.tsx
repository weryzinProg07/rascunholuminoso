
import React, { useEffect, useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface GalleryItem {
  id?: string;
  title: string;
  category: string;
  image: string;
  color: string;
  description?: string;
}

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGalleryData = async () => {
    console.log('🔄 Gallery: Buscando dados atualizados...');
    
    try {
      const { data, error } = await supabase
        .from('gallery_uploads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Gallery: Erro na consulta:', error);
        setGalleryItems([]);
        return;
      }

      console.log(`✅ Gallery: ${data?.length || 0} itens encontrados`);
      
      const processedItems: GalleryItem[] = (data || []).map((item, index) => ({
        id: item.id,
        title: item.title,
        category: item.category || 'Trabalhos Realizados',
        image: item.image_url,
        color: ['bg-orange-600', 'bg-blue-600', 'bg-pink-600', 'bg-green-600', 'bg-purple-600'][index % 5],
        description: item.description
      }));

      setGalleryItems(processedItems);
      
    } catch (error) {
      console.error('❌ Gallery: Falha ao buscar dados:', error);
      setGalleryItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (item: GalleryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  if (isLoading) {
    return (
      <section id="galeria" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando galeria...</p>
          </div>
        </div>
      </section>
    );
  }

  const itemsToShow = showAll ? galleryItems : galleryItems.slice(0, 6);
  const hasMoreItems = galleryItems.length > 6;

  return (
    <>
      <section id="galeria" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Nossa <span className="text-orange-500">Galeria</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Transformamos ideias em soluções criativas: design de flyers, convites personalizados e muito mais. Confira alguns dos trabalhos que já realizamos com qualidade e dedicação!
            </p>
          </div>

          {galleryItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600">
                Em breve, novos trabalhos serão adicionados à nossa galeria!
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {itemsToShow.map((item, index) => (
                  <div 
                    key={item.id || index}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img 
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          console.log('🖼️ Gallery: Erro ao carregar imagem:', item.image);
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className={`${item.color} text-xs px-3 py-1 rounded-full inline-block mb-2`}>
                          {item.category}
                        </div>
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm mb-2 opacity-90">{item.description}</p>
                        )}
                        <button 
                          onClick={() => handleViewDetails(item)}
                          className="flex items-center space-x-2 text-sm hover:text-orange-300 transition-colors"
                        >
                          <span>Ver detalhes</span>
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMoreItems && (
                <div className="text-center mt-12">
                  <button 
                    onClick={() => setShowAll(!showAll)}
                    className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
                  >
                    <span>{showAll ? 'Ver menos trabalhos' : 'Ver mais trabalhos'}</span>
                    {showAll ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Modal para detalhes da imagem */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Imagem completa */}
              <div className="relative">
                <img 
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              {/* Detalhes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className={`${selectedItem.color} text-white text-sm px-3 py-1 rounded-full`}>
                    {selectedItem.category}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Título</h3>
                  <p className="text-gray-600">{selectedItem.title}</p>
                </div>
                
                {selectedItem.description && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Descrição</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Categoria</h3>
                  <p className="text-gray-600">{selectedItem.category}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;
