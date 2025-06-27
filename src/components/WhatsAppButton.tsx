
import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá! Gostaria de saber mais sobre os serviços da Rascunho Luminoso.");
    window.open(`https://wa.me/244949157934?text=${message}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50 group animate-pulse hover:animate-none"
      aria-label="Contato via WhatsApp"
    >
      <MessageCircle size={28} className="group-hover:scale-110 transition-transform duration-300" />
      <div className="absolute -top-12 -left-16 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Fale conosco!
      </div>
    </button>
  );
};

export default WhatsAppButton;
