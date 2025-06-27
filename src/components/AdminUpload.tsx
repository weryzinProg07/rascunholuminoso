import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, LogOut, Image as ImageIcon } from 'lucide-react';
import AdminGalleryManager from './AdminGalleryManager';

const AdminUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { logout } = useAdminAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos JPG, PNG ou JPEG.",
          variant: "destructive",
        });
        return;
      }

      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione uma imagem e adicione um título.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload da imagem para o Supabase Storage
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(fileName);

      // Salvar informações no banco de dados
      const { error: dbError } = await supabase
        .from('gallery_uploads')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          image_url: publicUrl,
          category: 'Trabalhos Realizados'
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Upload realizado com sucesso!",
        description: "A imagem foi adicionada à galeria.",
      });

      // Limpar formulário
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Limpar input de arquivo
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer o upload. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/0126bf4f-e3d3-4872-8212-a0957cb88626.png"
              alt="Rascunho Luminoso Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Área <span className="text-orange-500">Administrativa</span>
              </h1>
              <p className="text-gray-600">Gerencie uploads e galeria</p>
            </div>
          </div>
          <Button 
            onClick={logout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </Button>
        </div>

        {/* Tabs para Upload e Gerenciar Galeria */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Novo Upload</TabsTrigger>
            <TabsTrigger value="manage">Gerenciar Galeria</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            {/* Formulário de Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="text-orange-500" size={24} />
                  <span>Novo Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Seleção de arquivo */}
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Imagem *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {previewUrl ? (
                          <div className="space-y-4">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                            />
                            <p className="text-sm text-gray-600">Clique para alterar a imagem</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <ImageIcon className="mx-auto text-gray-400" size={48} />
                            <p className="text-gray-600">Clique aqui para selecionar uma imagem</p>
                            <p className="text-sm text-gray-500">JPG, PNG ou JPEG (máx. 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Título */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Título do Trabalho *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Logo para Empresa Local"
                      required
                    />
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Adicione detalhes sobre o trabalho realizado..."
                      rows={3}
                    />
                  </div>

                  {/* Botão de envio */}
                  <Button 
                    type="submit" 
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={isUploading || !selectedFile || !title.trim()}
                  >
                    {isUploading ? 'Enviando...' : 'Enviar para Galeria'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <AdminGalleryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminUpload;
