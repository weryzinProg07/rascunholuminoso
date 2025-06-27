
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">RL</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Rascunho Luminoso</h1>
              <p className="text-sm text-orange-500">Serviços Gráficos</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
            >
              Início
            </button>
            <button 
              onClick={() => scrollToSection('servicos')}
              className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
            >
              Serviços
            </button>
            <button 
              onClick={() => scrollToSection('galeria')}
              className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
            >
              Galeria
            </button>
            <button 
              onClick={() => scrollToSection('pedidos')}
              className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
            >
              Pedidos
            </button>
            <button 
              onClick={() => scrollToSection('contato')}
              className="text-gray-700 hover:text-orange-500 transition-colors font-medium"
            >
              Contato
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-4">
              <button 
                onClick={() => scrollToSection('inicio')}
                className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-left"
              >
                Início
              </button>
              <button 
                onClick={() => scrollToSection('servicos')}
                className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-left"
              >
                Serviços
              </button>
              <button 
                onClick={() => scrollToSection('galeria')}
                className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-left"
              >
                Galeria
              </button>
              <button 
                onClick={() => scrollToSection('pedidos')}
                className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-left"
              >
                Pedidos
              </button>
              <button 
                onClick={() => scrollToSection('contato')}
                className="text-gray-700 hover:text-orange-500 transition-colors font-medium text-left"
              >
                Contato
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
