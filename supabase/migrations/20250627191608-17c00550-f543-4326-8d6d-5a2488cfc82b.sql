
-- Create table for uploaded gallery images
CREATE TABLE public.gallery_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'Trabalhos Realizados',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery-images', 'gallery-images', true);

-- Create storage policy to allow public read access
CREATE POLICY "Public can view gallery images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery-images');

-- Create storage policy to allow uploads (we'll handle auth in the app)
CREATE POLICY "Anyone can upload gallery images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gallery-images');

-- Add Row Level Security but allow public access for gallery
ALTER TABLE public.gallery_uploads ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to gallery
CREATE POLICY "Public can view gallery uploads" 
ON public.gallery_uploads 
FOR SELECT 
USING (true);

-- Create policy for inserts (we'll handle auth in the app)
CREATE POLICY "Allow gallery uploads" 
ON public.gallery_uploads 
FOR INSERT 
WITH CHECK (true);
