
-- Primeiro, vamos verificar as políticas existentes e criar uma política para DELETE
-- Remover políticas existentes se necessário e recriar todas corretamente
DROP POLICY IF EXISTS "Allow gallery uploads" ON public.gallery_uploads;
DROP POLICY IF EXISTS "Public can view gallery uploads" ON public.gallery_uploads;

-- Criar políticas mais específicas
-- Permitir visualização pública
CREATE POLICY "Public read access" 
  ON public.gallery_uploads 
  FOR SELECT 
  USING (true);

-- Permitir inserção (para uploads)
CREATE POLICY "Allow uploads" 
  ON public.gallery_uploads 
  FOR INSERT 
  WITH CHECK (true);

-- IMPORTANTE: Permitir exclusão (esta política estava faltando)
CREATE POLICY "Allow admin delete" 
  ON public.gallery_uploads 
  FOR DELETE 
  USING (true);

-- Permitir atualização se necessário
CREATE POLICY "Allow admin update" 
  ON public.gallery_uploads 
  FOR UPDATE 
  USING (true);
