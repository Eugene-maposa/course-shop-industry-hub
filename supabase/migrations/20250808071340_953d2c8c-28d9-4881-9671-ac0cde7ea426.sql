-- Check if user exists and grant super admin access
DO $$
DECLARE
    target_user_id uuid;
    user_email text := 'mapseujers@gmail.com';
BEGIN
    -- Find the user by email in auth.users
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email 
    LIMIT 1;
    
    -- Check if user exists
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User with email % not found in auth.users. They need to sign up first.', user_email;
        RETURN;
    END IF;
    
    -- Insert admin record (without email field for now)
    INSERT INTO public.admin_users (user_id, role, is_active)
    VALUES (target_user_id, 'super_admin'::admin_role, true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = 'super_admin'::admin_role,
        is_active = true,
        updated_at = now();
        
    RAISE NOTICE 'Successfully granted super_admin access to user ID: %', target_user_id;
END $$;