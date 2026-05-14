-- Harden create_admin_user_with_auth: require super_admin caller
CREATE OR REPLACE FUNCTION public.create_admin_user_with_auth(
  user_email text,
  user_password text,
  admin_role public.admin_role DEFAULT 'admin'::public.admin_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_user_id uuid;
  admin_record jsonb;
BEGIN
  IF public.get_current_admin_role(auth.uid()) <> 'super_admin'::public.admin_role THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT id INTO new_user_id FROM auth.users WHERE email = user_email LIMIT 1;

  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found. Create the auth user first via Supabase auth.', user_email;
  END IF;

  UPDATE public.admin_users
  SET role = admin_role,
      is_active = true,
      email = user_email,
      updated_at = now(),
      created_by = auth.uid()
  WHERE user_id = new_user_id
  RETURNING to_jsonb(public.admin_users.*) INTO admin_record;

  IF admin_record IS NULL THEN
    INSERT INTO public.admin_users (user_id, role, email, created_by, is_active)
    VALUES (new_user_id, admin_role, user_email, auth.uid(), true)
    RETURNING to_jsonb(public.admin_users.*) INTO admin_record;
  END IF;

  RETURN admin_record;
END;
$$;

-- Harden get_user_by_email: require super_admin and exclude sensitive fields
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  IF public.get_current_admin_role(auth.uid()) <> 'super_admin'::public.admin_role THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'created_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at,
    'email_confirmed_at', u.email_confirmed_at
  )
  INTO result
  FROM auth.users u
  WHERE u.email = user_email
  LIMIT 1;

  RETURN result;
END;
$$;