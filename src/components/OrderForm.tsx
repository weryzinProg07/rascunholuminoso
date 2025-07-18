import React, { useState } from 'react';
import { Upload, Send, CheckCircle, AlertCircle, Mail, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const OrderForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const uploadFiles = async (files: FileList) => {
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `orders/${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, file);
      
      if (error) {
        console.error('Erro ao fazer upload do arquivo:', error);
        throw error;
      }
      
      const { data: publicUrl } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(fileName);
      
      uploadedFiles.push({
        name: file.name,
        url: publicUrl.publicUrl
      });
    }
    
    return uploadedFiles;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('=== INICIANDO ENVIO DE PEDIDO ===');

    try {
      let uploadedFiles = [];
      
      // Upload files se existirem
      if (formData.files && formData.files.length > 0) {
        console.log('📎 Fazendo upload de arquivos...');
        uploadedFiles = await uploadFiles(formData.files);
        console.log('✅ Upload concluído:', uploadedFiles.length, 'arquivos');
      }

      // Salvar pedido no banco de dados
      console.log('💾 Salvando pedido no banco...');
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          service: formData.service,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
          files: uploadedFiles.length > 0 ? uploadedFiles : null
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Erro ao salvar no banco:', orderError);
        throw orderError;
      }
      console.log('✅ Pedido salvo no banco com ID:', orderData.id);

      // Preparar dados para envio de e-mail
      const emailData = {
        service: formData.service,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        files: uploadedFiles,
        orderId: orderData.id
      };

      // Enviar e-mail de notificação através da edge function
      console.log('📧 Enviando e-mail de notificação...');
      let emailSuccess = false;

      try {
        console.log('🔄 Chamando edge function send-order-email...');
        const { data, error } = await supabase.functions.invoke('send-order-email', {
          body: emailData
        });

        console.log('📬 Resposta da edge function:', { data, error });

        if (error) {
          console.error('❌ Erro na edge function:', error);
        } else if (data?.success) {
          console.log('✅ E-mail enviado com sucesso!', data);
          emailSuccess = true;
        } else {
          console.warn('⚠️ Resposta inesperada da function:', data);
        }
      } catch (emailErr: any) {
        console.error('❌ Erro ao enviar e-mail:', emailErr);
      }

      // Mostrar mensagem de sucesso
      toast({
        title: "✅ Pedido enviado com sucesso!",
        description: emailSuccess 
          ? "Recebemos o seu pedido e foi enviada uma notificação por e-mail. Entraremos em contacto consigo em breve!"
          : "Recebemos o seu pedido e entraremos em contacto consigo em breve. Obrigado pela sua confiança!",
        className: "bg-green-50 border-green-200",
      });

      // Log sobre e-mail
      if (!emailSuccess) {
        console.warn('📧 E-mail de notificação pode não ter sido enviado, mas pedido foi salvo');
      }

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

    } catch (error: any) {
      console.error('❌ ERRO GERAL no envio do pedido:', error);
      
      let errorMessage = "Ocorreu um erro ao processar seu pedido.";
      
      if (error.message?.includes('upload')) {
        errorMessage = "Erro no upload dos arquivos. Verifique se os arquivos são válidos.";
      } else if (error.message?.includes('insert') || error.message?.includes('database')) {
        errorMessage = "Erro ao salvar o pedido. Tente novamente em alguns instantes.";
      }
      
      toast({
        title: "❌ Erro ao enviar pedido",
        description: `${errorMessage} Se o problema persistir, entre em contacto pelo WhatsApp.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log('=== PROCESSO FINALIZADO ===');
    }
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
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:opacity-50"
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
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:opacity-50"
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
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:opacity-50"
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
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:opacity-50"
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
                    disabled={isSubmitting}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.ai,.psd"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50"
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
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none disabled:opacity-50"
                  placeholder="Descreva seu projeto, especificações, prazos e qualquer informação relevante..."
                />
              </div>
            </div>

            {/* Botão de Envio */}
            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 text-white px-12 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Enviar Pedido</span>
                  </>
                )}
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
