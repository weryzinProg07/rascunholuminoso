
import React from 'react';
import { Printer, FileText, Palette, BookOpen, Camera, Settings } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: Printer,
      title: "Impressão de Documentos",
      description: "Impressões de alta qualidade em cores e preto & branco",
      color: "bg-orange-500"
    },
    {
      icon: Palette,
      title: "Criação de Flyers",
      description: "Design profissional para seus materiais promocionais",
      color: "bg-blue-500"
    },
    {
      icon: FileText,
      title: "Redação de Documentos",
      description: "Elaboração profissional de textos e documentos",
      color: "bg-pink-500"
    },
    {
      icon: BookOpen,
      title: "Encadernações",
      description: "Serviços de encadernação com acabamento perfeito",
      color: "bg-orange-600"
    },
    {
      icon: Camera,
      title: "Impressões Coloridas",
      description: "Impressões vibrantes com tecnologia avançada",
      color: "bg-blue-600"
    },
    {
      icon: Settings,
      title: "Outros Serviços Gráficos",
      description: "Soluções personalizadas para suas necessidades",
      color: "bg-pink-600"
    }
  ];

  return (
    <section id="servicos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Nossos <span className="text-orange-500">Serviços</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Oferecemos uma gama completa de serviços gráficos para atender todas as suas necessidades profissionais e pessoais
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:-translate-y-2 group"
              >
                <div className={`${service.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button className="text-orange-500 font-semibold hover:text-orange-600 transition-colors flex items-center space-x-2">
                    <span>Saiba mais</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
