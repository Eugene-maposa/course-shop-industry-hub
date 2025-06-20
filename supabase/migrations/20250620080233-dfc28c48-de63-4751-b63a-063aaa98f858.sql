
-- Create admin role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin_users table to track admin accounts
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role admin_role NOT NULL DEFAULT 'admin',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
CREATE POLICY "Super admins can view all admin users" 
    ON public.admin_users FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role = 'super_admin' 
            AND au.is_active = true
        )
    );

CREATE POLICY "Admins can view themselves and lower roles" 
    ON public.admin_users FOR SELECT 
    USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.admin_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('super_admin', 'admin') 
            AND au.is_active = true
        )
    );

-- Add audit logging table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) NOT NULL,
    action TEXT NOT NULL,
    target_table TEXT,
    target_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE admin_users.user_id = is_admin.user_id 
        AND is_active = true
    );
$$;

-- Function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(user_id UUID)
RETURNS admin_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.admin_users 
    WHERE admin_users.user_id = get_admin_role.user_id 
    AND is_active = true
    LIMIT 1;
$$;

-- Function to create admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
    target_user_id UUID,
    admin_role admin_role,
    created_by_id UUID
)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
    INSERT INTO public.admin_users (user_id, role, created_by)
    VALUES (target_user_id, admin_role, created_by_id)
    RETURNING to_jsonb(admin_users.*);
$$;

-- Function to update admin role
CREATE OR REPLACE FUNCTION public.update_admin_role(
    target_user_id UUID,
    new_role admin_role
)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
    UPDATE public.admin_users 
    SET role = new_role, updated_at = now()
    WHERE user_id = target_user_id
    RETURNING to_jsonb(admin_users.*);
$$;

-- Function to deactivate admin user
CREATE OR REPLACE FUNCTION public.deactivate_admin_user(
    target_user_id UUID
)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
    UPDATE public.admin_users 
    SET is_active = false, updated_at = now()
    WHERE user_id = target_user_id
    RETURNING to_jsonb(admin_users.*);
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
    admin_id UUID,
    action_type TEXT,
    target_table TEXT DEFAULT NULL,
    target_id TEXT DEFAULT NULL,
    old_values JSONB DEFAULT NULL,
    new_values JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE SQL
SECURITY DEFINER
AS $$
    INSERT INTO public.admin_audit_log 
    (admin_user_id, action, target_table, target_id, old_values, new_values)
    VALUES (admin_id, action_type, target_table, target_id::UUID, old_values, new_values)
    RETURNING to_jsonb(admin_audit_log.*);
$$;

-- Function to get user count
CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT COUNT(*)::INTEGER FROM auth.users;
$$;
