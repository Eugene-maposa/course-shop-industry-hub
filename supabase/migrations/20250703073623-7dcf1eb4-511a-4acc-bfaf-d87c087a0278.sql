
-- Drop the problematic RLS policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can view themselves and lower roles" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view their own admin record" 
    ON public.admin_users FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all admin users" 
    ON public.admin_users FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users sa 
            WHERE sa.user_id = auth.uid() 
            AND sa.role = 'super_admin' 
            AND sa.is_active = true
            AND sa.id != admin_users.id  -- Prevent self-reference
        )
    );

-- Update the shop_document_requirements policy to avoid referencing admin_users recursively
DROP POLICY IF EXISTS "Only admins can modify document requirements" ON public.shop_document_requirements;

CREATE POLICY "Only admins can modify document requirements" 
    ON public.shop_document_requirements FOR ALL 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.admin_users 
            WHERE is_active = true
        )
    );

-- Fix the prohibited_products policy as well
DROP POLICY IF EXISTS "Only admins can modify prohibited products" ON public.prohibited_products;

CREATE POLICY "Only admins can modify prohibited products" 
    ON public.prohibited_products FOR ALL 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.admin_users 
            WHERE is_active = true
        )
    );

-- Fix the shops policy for admin updates
DROP POLICY IF EXISTS "Admins can update shop verification status" ON public.shops;

CREATE POLICY "Admins can update shop verification status" 
    ON public.shops FOR UPDATE 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.admin_users 
            WHERE is_active = true
        )
    );
