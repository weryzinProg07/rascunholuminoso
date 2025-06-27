
import React from 'react';
import { ArrowRight, Printer, FileText, Palette } from 'lucide-react';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="pt-20 pb-16 bg-gradient-to-br from-orange-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex justify-start mb-4">
              <img 
                src="/lovable-uploads/1ffdcb72-0326-435f-95bd-863af501cc71.png" 
                alt="Rascunho Luminoso Logo" 
                className="h-20 object-contain"
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
                Bem-vindos à 
                <span className="text-orange-500 block">Rascunho Luminoso</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transformamos suas ideias em realidade com serviços gráficos de qualidade superior. 
                Localizada na Humpata, oferecemos soluções completas para todas as suas necessidades de impressão e design.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md">
                <Printer className="w-5 h-5 text-orange-500" />
                <span className="text-gray-700 font-medium">Impressão Digital</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 font-medium">Redação</span>
              </div>
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md">
                <Palette className="w-5 h-5 text-pink-500" />
                <span className="text-gray-700 font-medium">Design Gráfico</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => scrollToSection('servicos')}
                className="bg-orange-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>Nossos Serviços</span>
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => scrollToSection('pedidos')}
                className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition-colors"
              >
                Fazer Pedido
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <img 
                src="/lovable-uploads/873aed8f-1846-43a9-9568-b9f29fefe083.png" 
                alt="Container Laranja Rascunho Luminoso" 
                className="w-full h-auto rounded-t-2xl"
              />
              <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <h3 className="text-xl font-bold mb-2">Nosso Espaço Físico</h3>
                <p>Container Laranja - Facilmente identificável na Humpata</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-500 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
