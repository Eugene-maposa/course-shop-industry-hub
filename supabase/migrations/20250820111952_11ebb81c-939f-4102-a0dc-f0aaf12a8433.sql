-- Drop the problematic foreign key constraint if it exists
ALTER TABLE public.admin_users 
DROP CONSTRAINT IF EXISTS admin_users_created_by_fkey;

-- Fix email column type
ALTER TABLE public.admin_users 
ALTER COLUMN email TYPE text USING email::text;

-- Add proper created_by column if it doesn't exist
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS created_by uuid;

-- Create function to create admin user safely
CREATE OR REPLACE FUNCTION public.create_admin_user_safe(
  user_email text,
  admin_role admin_role DEFAULT 'admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user_id uuid;
  admin_record jsonb;
BEGIN
  -- Get user ID by email from auth.users
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email
  LIMIT 1;
  
  -- If user doesn't exist, return error
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Create admin record
  INSERT INTO public.admin_users (user_id, role, email, created_by)
  VALUES (target_user_id, admin_role, user_email, auth.uid())
  RETURNING to_jsonb(admin_users.*) INTO admin_record;
  
  RETURN admin_record;
END;
$$;