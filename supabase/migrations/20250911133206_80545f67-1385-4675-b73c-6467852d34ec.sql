-- Create shop-documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-documents',
  'shop-documents',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for shop-documents bucket
CREATE POLICY "Anyone can view shop documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'shop-documents');

CREATE POLICY "Authenticated users can upload shop documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'shop-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all shop documents" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'shop-documents' AND 
  auth.uid() IN (
    SELECT user_id FROM admin_users WHERE is_active = true
  )
);

CREATE POLICY "Users can update their own shop documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'shop-documents' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);