
-- Criar função para inserir ou atualizar tokens FCM
CREATE OR REPLACE FUNCTION public.upsert_fcm_token(
  p_token TEXT,
  p_user_type TEXT DEFAULT 'admin',
  p_is_active BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.fcm_tokens (token, user_type, is_active)
  VALUES (p_token, p_user_type, p_is_active)
  ON CONFLICT (token) 
  DO UPDATE SET 
    user_type = EXCLUDED.user_type,
    is_active = EXCLUDED.is_active,
    updated_at = now();
END;
$$;
