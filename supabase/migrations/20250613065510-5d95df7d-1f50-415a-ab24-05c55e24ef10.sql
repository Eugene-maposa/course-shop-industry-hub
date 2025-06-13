
-- Create storage bucket for shop icons
INSERT INTO storage.buckets (id, name, public) 
VALUES ('shop-icons', 'shop-icons', true);

-- Create policy to allow anyone to view shop icons
CREATE POLICY "Anyone can view shop icons" ON storage.objects
FOR SELECT USING (bucket_id = 'shop-icons');

-- Create policy to allow authenticated users to upload shop icons
CREATE POLICY "Authenticated users can upload shop icons" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'shop-icons' AND auth.role() = 'authenticated');

-- Add icon_url column to shops table
ALTER TABLE public.shops ADD COLUMN icon_url TEXT;
