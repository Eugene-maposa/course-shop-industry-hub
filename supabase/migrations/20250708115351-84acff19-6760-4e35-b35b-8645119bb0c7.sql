
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view themselves and lower roles" ON public.admin_users;
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admin_users;

-- Create a security definer function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.check_admin_status(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE admin_users.user_id = check_admin_status.user_id 
        AND is_active = true
    );
$$;

-- Create a security definer function to get admin role without recursion
CREATE OR REPLACE FUNCTION public.get_current_admin_role(user_id UUID)
RETURNS admin_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.admin_users 
    WHERE admin_users.user_id = get_current_admin_role.user_id 
    AND is_active = true
    LIMIT 1;
$$;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can view their own admin record" 
    ON public.admin_users FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all admin users" 
    ON public.admin_users FOR SELECT 
    USING (
        public.get_current_admin_role(auth.uid()) = 'super_admin'
    );

-- Allow super admins to insert/update admin users
CREATE POLICY "Super admins can manage admin users" 
    ON public.admin_users FOR ALL 
    USING (
        public.get_current_admin_role(auth.uid()) = 'super_admin'
    );
