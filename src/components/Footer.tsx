
import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/lovable-uploads/1ffdcb72-0326-435f-95bd-863af501cc71.png"
                alt="Rascunho Luminoso Logo" 
                className="w-14 h-14 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold">Rascunho Luminoso</h3>
                <p className="text-sm text-orange-500">Serviços Gráficos</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Transformando ideias em realidade através de serviços gráficos de qualidade superior na Humpata, Angola.
            </p>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Nossos Serviços</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Impressão de Documentos</li>
              <li>• Criação de Flyers</li>
              <li>• Redação de Documentos</li>
              <li>• Encadernações</li>
              <li>• Design Gráfico</li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>📱 +244 949 157 934</p>
              <p>✉️ rascunholuminoso@gmail.com</p>
              <p>📍 Humpata / Rua do hospital municipal</p>
              <p>🕒 Segunda à Sexta: 8h às 18h</p>
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 Rascunho Luminoso. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Desenvolvido por</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-orange-500">WeryTec | Soluções Digitais</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
