
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, ImageIcon, Plus } from 'lucide-react';

const AdminGalleryUpload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Trabalhos Realizados'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, adicione um título para a imagem.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    console.log('📤 Iniciando upload...');

    try {
      // 1. Upload da imagem para o Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log('🗂️ Fazendo upload para storage:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload concluído:', uploadData);

      // 2. Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;
      console.log('🔗 URL pública gerada:', imageUrl);

      // 3. Salvar informações no banco de dados
      const { data: dbData, error: dbError } = await supabase
        .from('gallery_uploads')
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim() || null,
            image_url: imageUrl,
            category: formData.category
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Erro ao salvar no banco:', dbError);
        throw dbError;
      }

      console.log('✅ Salvo no banco:', dbData);

      // 4. Resetar formulário
      setFormData({
        title: '',
        description: '',
        category: 'Trabalhos Realizados'
      });
      setSelectedFile(null);
      setPreviewUrl(null);

      // 5. Resetar input de arquivo
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      toast({
        title: "✅ Upload realizado com sucesso!",
        description: `"${formData.title}" foi adicionado à galeria.`,
      });

    } catch (error) {
      console.error('❌ Erro no processo de upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Upload className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Upload de Imagem
          </h2>
          <p className="text-gray-600">
            Adicione novas imagens à galeria do site
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Área de Upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
            {previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg object-cover shadow-md"
                />
                <p className="text-sm text-gray-600">Preview da imagem selecionada</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="mt-2"
                >
                  Remover imagem
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Selecione uma imagem
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Arraste e solte ou clique para selecionar
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <Label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      asChild
                    >
                      <span>
                        <Plus className="h-4 w-4 mr-2" />
                        Escolher arquivo
                      </span>
                    </Button>
                  </Label>
                  <p className="text-sm text-gray-500 mt-2">
                    Formatos aceitos: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Título *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Digite o título da imagem"
                className="w-full"
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Categoria
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trabalhos Realizados">Trabalhos Realizados</SelectItem>
                  <SelectItem value="Projetos">Projetos</SelectItem>
                  <SelectItem value="Inspirações">Inspirações</SelectItem>
                  <SelectItem value="Processo">Processo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Adicione uma descrição para a imagem..."
              rows={4}
              className="w-full"
            />
          </div>

          {/* Botão de envio */}
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg"
              disabled={uploading}
              size="lg"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Fazendo upload...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Adicionar à Galeria
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminGalleryUpload;
