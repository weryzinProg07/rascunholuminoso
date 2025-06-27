
import React from 'react';
import { ExternalLink } from 'lucide-react';

const Gallery = () => {
  const galleryItems = [
    {
      title: "Container Laranja - Nossa Sede",
      category: "Espaço Físico",
      image: "/lovable-uploads/873aed8f-1846-43a9-9568-b9f29fefe083.png",
      color: "bg-orange-500"
    },
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
    },
    {
      title: "Flyer Promocional",
      category: "Design Gráfico",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
      color: "bg-orange-600"
    },
    {
      title: "Convite de Evento",
      category: "Convites",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
      color: "bg-blue-600"
    },
    {
      title: "Material Corporativo",
      category: "Identidade Visual",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop",
      color: "bg-pink-600"
    }
  ];

  return (
    <section id="galeria" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Nossa <span className="text-orange-500">Galeria</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Confira nossos trabalhos e conheça nosso espaço físico - o Container Laranja
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryItems.map((item, index) => (
            <div 
              key={index}
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
