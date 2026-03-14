-- 1) Harden role assignment defaults/policies
ALTER TABLE public.user_roles
ALTER COLUMN role SET DEFAULT 'user'::public.app_role;

DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
CREATE POLICY "Users can insert their own roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'user'::public.app_role
);

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2) Harden notifications direct inserts
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3) Require authentication for write paths
DROP POLICY IF EXISTS "Anyone can insert shops" ON public.shops;
CREATE POLICY "Authenticated users can insert their own shops"
ON public.shops
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
CREATE POLICY "Authenticated users can insert products for their shops"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.shops s
    WHERE s.id = products.shop_id
      AND s.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Anyone can insert industries" ON public.industries;
CREATE POLICY "Authenticated users can insert industries"
ON public.industries
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert product_types" ON public.product_types;
CREATE POLICY "Authenticated users can insert product types"
ON public.product_types
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4) Protect sensitive shop columns by removing public SELECT on base table
DROP POLICY IF EXISTS "Anyone can view shops" ON public.shops;
DROP POLICY IF EXISTS "Users can view their own shops" ON public.shops;

CREATE POLICY "Shop owners can view their own shops"
ON public.shops
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all shops"
ON public.shops
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.is_active = true
  )
);

-- 5) Public-safe read functions for shop browsing
CREATE OR REPLACE FUNCTION public.get_public_shops()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  icon_url text,
  industry_id uuid,
  industry_name text,
  industry_code text,
  status public.shop_status,
  latitude double precision,
  longitude double precision,
  website text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.name,
    s.description,
    s.icon_url,
    s.industry_id,
    i.name AS industry_name,
    i.code AS industry_code,
    s.status,
    s.latitude,
    s.longitude,
    s.website,
    s.created_at
  FROM public.shops s
  LEFT JOIN public.industries i ON i.id = s.industry_id
  WHERE s.status = 'active'::public.shop_status
  ORDER BY s.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_public_industry_stats()
RETURNS TABLE (
  industry_id uuid,
  active_shops_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.industry_id,
    COUNT(*)::bigint AS active_shops_count
  FROM public.shops s
  WHERE s.status = 'active'::public.shop_status
    AND s.industry_id IS NOT NULL
  GROUP BY s.industry_id;
$$;

CREATE OR REPLACE FUNCTION public.get_public_shop_by_id(p_shop_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  website text,
  industry_name text,
  industry_code text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.name,
    s.website,
    i.name AS industry_name,
    i.code AS industry_code
  FROM public.shops s
  LEFT JOIN public.industries i ON i.id = s.industry_id
  WHERE s.id = p_shop_id
    AND s.status = 'active'::public.shop_status
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_shops() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_industry_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_shop_by_id(uuid) TO anon, authenticated;

-- 6) Harden admin SECURITY DEFINER RPCs with explicit authorization checks
CREATE OR REPLACE FUNCTION public.create_admin_user(
  target_user_id uuid,
  admin_role public.admin_role,
  created_by_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
  admin_record jsonb;
BEGIN
  IF public.get_current_admin_role(auth.uid()) <> 'super_admin'::public.admin_role THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF created_by_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT u.email INTO target_email
  FROM auth.users u
  WHERE u.id = target_user_id
  LIMIT 1;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  UPDATE public.admin_users
  SET role = admin_role,
      is_active = true,
      email = target_email,
      updated_at = now(),
      created_by = created_by_id
  WHERE user_id = target_user_id
  RETURNING to_jsonb(public.admin_users.*) INTO admin_record;

  IF admin_record IS NULL THEN
    INSERT INTO public.admin_users (user_id, role, created_by, email, is_active)
    VALUES (target_user_id, admin_role, created_by_id, target_email, true)
    RETURNING to_jsonb(public.admin_users.*) INTO admin_record;
  END IF;

  RETURN admin_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_admin_user_safe(
  user_email text,
  admin_role public.admin_role DEFAULT 'admin'::public.admin_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
  admin_record jsonb;
BEGIN
  IF public.get_current_admin_role(auth.uid()) <> 'super_admin'::public.admin_role THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT u.id INTO target_user_id
  FROM auth.users u
  WHERE u.email = user_email
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  UPDATE public.admin_users
  SET role = admin_role,
      is_active = true,
      email = user_email,
      updated_at = now(),
      created_by = auth.uid()
  WHERE user_id = target_user_id
  RETURNING to_jsonb(public.admin_users.*) INTO admin_record;

  IF admin_record IS NULL THEN
    INSERT INTO public.admin_users (user_id, role, email, created_by, is_active)
    VALUES (target_user_id, admin_role, user_email, auth.uid(), true)
    RETURNING to_jsonb(public.admin_users.*) INTO admin_record;
  END IF;

  RETURN admin_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_admin_role(
  target_user_id uuid,
  new_role public.admin_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_record jsonb;
BEGIN
  IF public.get_current_admin_role(auth.uid()) <> 'super_admin'::public.admin_role THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.admin_users
  SET role = new_role,
      updated_at = now()
  WHERE user_id = target_user_id
  RETURNING to_jsonb(public.admin_users.*) INTO updated_record;

  IF updated_record IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;

  RETURN updated_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.deactivate_admin_user(
  target_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_record jsonb;
BEGIN
  IF public.get_current_admin_role(auth.uid()) <> 'super_admin'::public.admin_role THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.admin_users
  SET is_active = false,
      updated_at = now()
  WHERE user_id = target_user_id
  RETURNING to_jsonb(public.admin_users.*) INTO updated_record;

  IF updated_record IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;

  RETURN updated_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE(
  id uuid,
  email text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  company text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.is_active = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    u.created_at,
    u.last_sign_in_at,
    up.first_name,
    up.last_name,
    up.phone,
    up.avatar_url,
    up.company
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.user_id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_admin_user(uuid, public.admin_role, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_admin_user_safe(text, public.admin_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_admin_role(uuid, public.admin_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.deactivate_admin_user(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_all_users() FROM anon;