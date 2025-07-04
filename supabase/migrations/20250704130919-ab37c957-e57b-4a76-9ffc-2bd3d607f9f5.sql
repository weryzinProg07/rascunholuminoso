
-- Criar tabela para armazenar tokens FCM
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para busca rápida por tokens ativos
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_active ON public.fcm_tokens (is_active, user_type);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_fcm_tokens_updated_at ON public.fcm_tokens;
CREATE TRIGGER update_fcm_tokens_updated_at
    BEFORE UPDATE ON public.fcm_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Permitir acesso público à tabela (para administradores)
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção e consulta de tokens
CREATE POLICY "Permitir gerenciamento de tokens FCM" ON public.fcm_tokens
FOR ALL USING (true);
