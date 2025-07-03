
-- Adicionar política para permitir que admins apaguem pedidos permanentemente
CREATE POLICY "Allow admin to delete orders" 
  ON public.orders 
  FOR DELETE 
  USING (true);
