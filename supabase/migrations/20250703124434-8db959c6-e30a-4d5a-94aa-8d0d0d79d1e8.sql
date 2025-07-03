
-- Create a table to store orders from the contact form
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  description TEXT NOT NULL,
  files JSONB,
  status TEXT NOT NULL DEFAULT 'novo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) but allow public access for inserting orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert orders (for the contact form)
CREATE POLICY "Allow public order creation" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

-- Allow admin to view all orders (you'll need to implement admin authentication later)
CREATE POLICY "Allow admin to view all orders" 
  ON public.orders 
  FOR SELECT 
  USING (true);

-- Allow admin to update order status
CREATE POLICY "Allow admin to update orders" 
  ON public.orders 
  FOR UPDATE 
  USING (true);

-- Create an index for better performance when ordering by created_at
CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);
