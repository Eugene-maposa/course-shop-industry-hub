
-- Add document fields to shops table
ALTER TABLE public.shops 
ADD COLUMN documents JSONB DEFAULT '{}',
ADD COLUMN document_verification_status TEXT DEFAULT 'pending',
ADD COLUMN verification_notes TEXT,
ADD COLUMN verified_by UUID REFERENCES auth.users(id),
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;

-- Create required documents configuration table for Zimbabwe
CREATE TABLE IF NOT EXISTS public.shop_document_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    description TEXT,
    country_code TEXT DEFAULT 'ZW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert Zimbabwe shop registration document requirements
INSERT INTO public.shop_document_requirements (document_type, document_name, description) VALUES
('business_license', 'Business License', 'Valid business operating license issued by local authorities'),
('tax_clearance', 'Tax Clearance Certificate', 'Current tax clearance certificate from ZIMRA'),
('company_registration', 'Company Registration Certificate', 'Certificate of incorporation from Companies Registry'),
('vat_certificate', 'VAT Registration Certificate', 'VAT registration certificate if applicable'),
('trading_license', 'Trading License', 'Municipal trading license for the business location'),
('fire_certificate', 'Fire Safety Certificate', 'Fire department safety clearance certificate');

-- Enable RLS on document requirements table
ALTER TABLE public.shop_document_requirements ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view document requirements
CREATE POLICY "Anyone can view document requirements" 
    ON public.shop_document_requirements FOR SELECT 
    USING (true);

-- Policy to allow only admins to modify document requirements
CREATE POLICY "Only admins can modify document requirements" 
    ON public.shop_document_requirements FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Update shops table to set default status to 'pending' for new registrations
ALTER TABLE public.shops ALTER COLUMN status SET DEFAULT 'pending';

-- Add RLS policies for shop document verification by admins
CREATE POLICY "Admins can update shop verification status" 
    ON public.shops FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );
