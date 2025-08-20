-- Fix admin_users table schema - change email column from uuid to text
ALTER TABLE public.admin_users 
ALTER COLUMN email TYPE text USING email::text;

-- Update admin_users table to properly reference auth.users
ALTER TABLE public.admin_users 
ADD CONSTRAINT admin_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create function to create admin user with proper auth user creation
CREATE OR REPLACE FUNCTION public.create_admin_user_with_auth(
  user_email text,
  user_password text,
  admin_role admin_role DEFAULT 'admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id uuid;
  admin_record jsonb;
BEGIN
  -- Create auth user first
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;
  
  -- Create admin record
  INSERT INTO public.admin_users (user_id, role, email)
  VALUES (new_user_id, admin_role, user_email)
  RETURNING to_jsonb(admin_users.*) INTO admin_record;
  
  RETURN admin_record;
END;
$$;

-- Create function to get user by email for admin management
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT to_jsonb(users.*) FROM auth.users 
  WHERE email = user_email
  LIMIT 1;
$function$;