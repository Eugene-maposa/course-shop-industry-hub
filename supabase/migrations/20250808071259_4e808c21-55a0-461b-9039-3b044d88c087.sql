-- Fix email column type and add super admin
-- First, fix the email column type
ALTER TABLE public.admin_users 
ALTER COLUMN email TYPE text USING email::text;

-- Now add super admin access for mapseujers@gmail.com
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Find the user by email in auth.users
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'mapseujers@gmail.com' 
    LIMIT 1;
    
    -- Check if user exists
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email mapseujers@gmail.com not found. User must sign up first.';
    END IF;
    
    -- Insert or update admin record
    INSERT INTO public.admin_users (user_id, role, email, is_active)
    VALUES (target_user_id, 'super_admin'::admin_role, 'mapseujers@gmail.com', true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = 'super_admin'::admin_role,
        email = 'mapseujers@gmail.com',
        is_active = true,
        updated_at = now();
        
    RAISE NOTICE 'Successfully granted super_admin access to mapseujers@gmail.com';
END $$;