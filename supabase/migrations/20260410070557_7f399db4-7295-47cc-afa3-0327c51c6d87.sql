
-- Add national ID fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS national_id_front_url text,
ADD COLUMN IF NOT EXISTS national_id_back_url text,
ADD COLUMN IF NOT EXISTS id_verification_status text DEFAULT 'pending';

-- Create document_verifications table
CREATE TABLE IF NOT EXISTS public.document_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
  document_url text NOT NULL,
  document_type text NOT NULL,
  verification_status text NOT NULL DEFAULT 'pending',
  ai_confidence_score integer,
  ai_analysis text,
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verifications
CREATE POLICY "Users can view their own verifications"
ON public.document_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all verifications
CREATE POLICY "Admins can view all verifications"
ON public.document_verifications
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
));

-- Admins can update verifications
CREATE POLICY "Admins can update verifications"
ON public.document_verifications
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
));

-- Service role inserts (edge function uses service role)
CREATE POLICY "Service role can insert verifications"
ON public.document_verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_document_verifications_updated_at
BEFORE UPDATE ON public.document_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
