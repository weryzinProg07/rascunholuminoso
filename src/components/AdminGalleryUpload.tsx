
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, ImageIcon } from 'lucide-react';

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
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="text-orange-500" size={24} />
          <span>Upload para Galeria</span>
        </CardTitle>
        <CardDescription>
          Adicione novas imagens à galeria do site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview da imagem */}
          {previewUrl && (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <div className="text-center">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg object-cover"
                />
                <p className="text-sm text-gray-500 mt-2">Preview da imagem selecionada</p>
              </div>
            </div>
          )}

          {/* Upload de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Selecionar Imagem *</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
              required
            />
            <p className="text-sm text-gray-500">
              Formatos aceitos: JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Digite o título da imagem"
              required
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
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

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Adicione uma descrição para a imagem..."
              rows={3}
            />
          </div>

          {/* Botão de envio */}
          <Button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Fazendo upload...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Adicionar à Galeria
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminGalleryUpload;
