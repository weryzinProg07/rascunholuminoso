
import React, { useState } from 'react';
import { Upload, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const OrderForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    service: '',
    name: '',
    email: '',
    phone: '',
    description: '',
    files: null as FileList | null
  });

  const services = [
    'Impressão de Documentos',
    'Criação de Flyers',
    'Redação de Documentos',
    'Encadernações',
    'Impressões Coloridas',
    'Outros Serviços Gráficos'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      files: e.target.files
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulação de envio do formulário
    toast({
      title: "Pedido enviado com sucesso!",
      description: "Entraremos em contato em breve via WhatsApp.",
    });

    // Reset form
    setFormData({
      service: '',
      name: '',
      email: '',
      phone: '',
      description: '',
      files: null
    });

    // Reset file input
    const fileInput = document.getElementById('files') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <section id="pedidos" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Faça seu <span className="text-orange-500">Pedido</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Preencha o formulário abaixo com os detalhes do seu projeto e anexe os arquivos necessários
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tipo de Serviço */}
              <div className="md:col-span-2">
                <label htmlFor="service" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Serviço *
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                >
                  <option value="">Selecione um serviço</option>
                  {services.map((service, index) => (
                    <option key={index} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="+244 9XX XXX XXX"
                />
              </div>

              {/* Upload de Arquivos */}
              <div>
                <label htmlFor="files" className="block text-sm font-semibold text-gray-700 mb-2">
                  Anexar Arquivos
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="files"
                    name="files"
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ai,.psd"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  <Upload className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, AI, PSD
                </p>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição do Projeto *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Descreva seu projeto, especificações, prazos e qualquer informação relevante..."
                />
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="mt-8 text-center">
              <button
                type="submit"
                className="bg-orange-500 text-white px-12 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
              >
                <Send size={20} />
                <span>Enviar Pedido</span>
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Responderemos em até 24 horas via WhatsApp
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
