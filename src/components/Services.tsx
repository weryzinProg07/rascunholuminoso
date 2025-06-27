
import React, { useState } from 'react';
import { Printer, FileText, Palette, BookOpen, Camera, Settings, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  detailedDescription: string;
  features: string[];
}

const Services = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const services: Service[] = [
    {
      icon: Printer,
      title: "Impressão de Documentos",
      description: "Impressões de alta qualidade em cores e preto & branco",
      color: "bg-orange-500",
      detailedDescription: "Oferecemos serviços completos de impressão de documentos com equipamentos de última geração. Garantimos a melhor qualidade com preços acessíveis para todos os tipos de documentos.",
      features: [
        "Impressões em preto e branco ou coloridas",
        "Suporte para diversos tamanhos de papel",
        "Opções de papel especial disponíveis",
        "Impressão frente e verso",
        "Acabamento profissional"
      ]
    },
    {
      icon: Palette,
      title: "Criação de Flyers",
      description: "Design profissional para seus materiais promocionais",
      color: "bg-blue-500",
      detailedDescription: "Criamos materiais promocionais que chamam a atenção e transmitem sua mensagem com clareza. Nossos designers trabalham para garantir que seu flyer tenha impacto visual e seja efetivo.",
      features: [
        "Design personalizado e único",
        "Diversas opções de tamanho e formato",
        "Revisão gratuita antes da impressão final",
        "Papel de alta qualidade",
        "Prazo rápido de entrega"
      ]
    },
    {
      icon: FileText,
      title: "Redação de Documentos",
      description: "Elaboração profissional de textos e documentos",
      color: "bg-pink-500",
      detailedDescription: "Nossa equipe de redatores profissionais pode criar ou revisar qualquer tipo de documento. Garantimos textos claros, objetivos e livres de erros gramaticais.",
      features: [
        "Redação de currículos e cartas de apresentação",
        "Documentos acadêmicos e profissionais",
        "Revisão ortográfica e gramatical",
        "Tradução de documentos",
        "Formatação conforme normas específicas"
      ]
    },
    {
      icon: BookOpen,
      title: "Encadernações",
      description: "Serviços de encadernação com acabamento perfeito",
      color: "bg-orange-600",
      detailedDescription: "Oferecemos diversos tipos de encadernação para seus documentos, garantindo durabilidade e apresentação profissional para trabalhos acadêmicos, relatórios e materiais corporativos.",
      features: [
        "Encadernação espiral",
        "Encadernação capa dura",
        "Encadernação térmica",
        "Diversos modelos de capas",
        "Opções em diferentes cores e materiais"
      ]
    },
    {
      icon: Camera,
      title: "Impressões Coloridas",
      description: "Impressões vibrantes com tecnologia avançada",
      color: "bg-blue-600",
      detailedDescription: "Utilizamos tecnologia de ponta para garantir impressões coloridas vibrantes e detalhadas. Ideal para fotos, artes gráficas, pôsteres e qualquer material que exija qualidade de impressão superior.",
      features: [
        "Alta resolução e definição de cores",
        "Papel fotográfico de qualidade",
        "Impressão de fotos em diversos tamanhos",
        "Ajustes de brilho e contraste",
        "Acabamento fosco ou brilhante"
      ]
    },
    {
      icon: Settings,
      title: "Outros Serviços Gráficos",
      description: "Soluções personalizadas para suas necessidades",
      color: "bg-pink-600",
      detailedDescription: "Além dos serviços listados, oferecemos soluções personalizadas para suas necessidades específicas. Entre em contato conosco para discutir seu projeto e encontrarmos a melhor solução.",
      features: [
        "Criação de logotipos e identidade visual",
        "Design de cartões de visita",
        "Banners e faixas promocionais",
        "Digitalização de documentos",
        "Plastificação de documentos"
      ]
    }
  ];

  const openServiceDetails = (service: Service) => {
    setSelectedService(service);
  };

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
                  <button 
                    onClick={() => openServiceDetails(service)}
                    className="text-orange-500 font-semibold hover:text-orange-600 transition-colors flex items-center space-x-2"
                  >
                    <span>Saiba mais</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dialog para mostrar detalhes do serviço */}
      <Dialog open={selectedService !== null} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {selectedService && (
              <>
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`${selectedService.color} w-10 h-10 rounded-md flex items-center justify-center`}>
                    {React.createElement(selectedService.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <DialogTitle className="text-2xl">{selectedService.title}</DialogTitle>
                </div>
                <DialogDescription>
                  {selectedService.detailedDescription}
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          
          {selectedService && (
            <div className="py-4">
              <h4 className="font-semibold text-lg mb-2">O que oferecemos:</h4>
              <ul className="space-y-2">
                {selectedService.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setSelectedService(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Services;
