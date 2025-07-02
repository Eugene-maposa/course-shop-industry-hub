
-- Create a table for prohibited products/keywords
CREATE TABLE public.prohibited_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL, -- e.g., 'weapons', 'drugs', 'explosives'
    description TEXT,
    country_code TEXT DEFAULT 'ZW',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on prohibited products table
ALTER TABLE public.prohibited_products ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to view prohibited products (for validation)
CREATE POLICY "Anyone can view prohibited products" 
    ON public.prohibited_products FOR SELECT 
    USING (is_active = true);

-- Policy to allow only admins to modify prohibited products
CREATE POLICY "Only admins can modify prohibited products" 
    ON public.prohibited_products FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Insert prohibited items for Zimbabwe
INSERT INTO public.prohibited_products (keyword, category, description) VALUES
-- Weapons and explosives
('bomb', 'explosives', 'Explosive devices and components'),
('explosive', 'explosives', 'Explosive materials'),
('grenade', 'weapons', 'Military explosive devices'),
('dynamite', 'explosives', 'Commercial explosives'),
('gun', 'weapons', 'Firearms and weapons'),
('weapon', 'weapons', 'All types of weapons'),
('rifle', 'weapons', 'Firearms'),
('pistol', 'weapons', 'Handguns'),
('ammunition', 'weapons', 'Bullets and ammunition'),
('knife', 'weapons', 'Bladed weapons'),

-- Drugs and narcotics  
('cocaine', 'drugs', 'Illegal narcotics'),
('heroin', 'drugs', 'Illegal narcotics'),
('marijuana', 'drugs', 'Controlled substances'),
('cannabis', 'drugs', 'Controlled substances'),
('methamphetamine', 'drugs', 'Illegal stimulants'),
('opium', 'drugs', 'Illegal narcotics'),
('ecstasy', 'drugs', 'Illegal party drugs'),
('lsd', 'drugs', 'Hallucinogenic drugs'),
('crack', 'drugs', 'Illegal stimulants'),

-- Hazardous materials
('poison', 'hazardous', 'Toxic substances'),
('chemical weapon', 'hazardous', 'Chemical warfare agents'),
('radioactive', 'hazardous', 'Radioactive materials'),
('uranium', 'hazardous', 'Nuclear materials'),

-- Counterfeit and illegal items
('counterfeit', 'illegal', 'Fake branded products'),
('stolen', 'illegal', 'Stolen goods'),
('pirated', 'illegal', 'Pirated content'),

-- Human trafficking related
('human organ', 'illegal', 'Human body parts'),
('slave', 'illegal', 'Human trafficking'),

-- Tobacco and alcohol (if regulated)
('cigarette', 'regulated', 'Tobacco products'),
('tobacco', 'regulated', 'Tobacco products'),
('alcohol', 'regulated', 'Alcoholic beverages');

-- Add a function to check if a product contains prohibited content
CREATE OR REPLACE FUNCTION public.check_product_legality(
    product_name TEXT,
    product_description TEXT DEFAULT ''
)
RETURNS TABLE (
    is_legal BOOLEAN,
    violations TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prohibited_item RECORD;
    violation_list TEXT[] := '{}';
    combined_text TEXT;
BEGIN
    -- Combine name and description for checking
    combined_text := LOWER(COALESCE(product_name, '') || ' ' || COALESCE(product_description, ''));
    
    -- Check against prohibited keywords
    FOR prohibited_item IN 
        SELECT keyword, category 
        FROM public.prohibited_products 
        WHERE is_active = true
    LOOP
        IF combined_text LIKE '%' || LOWER(prohibited_item.keyword) || '%' THEN
            violation_list := array_append(violation_list, prohibited_item.keyword || ' (' || prohibited_item.category || ')');
        END IF;
    END LOOP;
    
    -- Return result
    RETURN QUERY SELECT 
        (array_length(violation_list, 1) IS NULL) as is_legal,
        violation_list;
END;
$$;

-- Update products table to have default status as 'pending' for new products
ALTER TABLE public.products ALTER COLUMN status SET DEFAULT 'pending';

-- Add a trigger to automatically check product legality on insert/update
CREATE OR REPLACE FUNCTION public.validate_product_legality()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    legality_check RECORD;
BEGIN
    -- Check if the product is legal
    SELECT * INTO legality_check 
    FROM public.check_product_legality(NEW.name, NEW.description);
    
    -- If product contains prohibited content, reject it
    IF NOT legality_check.is_legal THEN
        RAISE EXCEPTION 'Product contains prohibited content: %', 
            array_to_string(legality_check.violations, ', ');
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER validate_product_before_insert_update
    BEFORE INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_product_legality();
