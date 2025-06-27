
import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  // Itens estáticos iniciais - vamos remover o container laranja
  const staticItems: GalleryItem[] = [
    {
      title: "Anúncio de Grande Abertura",
      category: "Eventos",
      image: "/lovable-uploads/3516f003-5aa0-4a67-8e73-b8da9fcc1f76.png",
      color: "bg-blue-500"
    },
    {
      title: "Logo Rascunho Luminoso",
      category: "Identidade Visual",
      image: "/lovable-uploads/1ffdcb72-0326-435f-95bd-863af501cc71.png",
      color: "bg-pink-500"
    }
  ];

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery_uploads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar itens da galeria:', error);
          setGalleryItems(staticItems);
        } else {
          // Combinar itens estáticos com itens do banco
          const dbItems: GalleryItem[] = data.map((item, index) => ({
            id: item.id,
            title: item.title,
            category: item.category || 'Trabalhos Realizados',
            image: item.image_url,
            color: ['bg-orange-600', 'bg-blue-600', 'bg-pink-600', 'bg-green-600', 'bg-purple-600'][index % 5],
            description: item.description
          }));

          setGalleryItems([...staticItems, ...dbItems]);
        }
      } catch (error) {
        console.error('Erro ao carregar galeria:', error);
        setGalleryItems(staticItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryItems();
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

  return (
    <section id="galeria" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Nossa <span className="text-orange-500">Galeria</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Confira aqui alguns trabalhos feitos por nós
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <div 
              key={item.id || index}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
                  <button className="flex items-center space-x-2 text-sm hover:text-orange-300 transition-colors">
                    <span>Ver detalhes</span>
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl">
            Ver Mais Trabalhos
          </button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
