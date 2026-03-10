
-- Site visits tracking table
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  page_path text NOT NULL DEFAULT '/',
  user_id uuid,
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast date-range queries
CREATE INDEX idx_site_visits_visited_at ON public.site_visits (visited_at);
CREATE INDEX idx_site_visits_visitor_id ON public.site_visits (visitor_id);

-- Enable RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert visits (anonymous tracking)
CREATE POLICY "Anyone can insert visits" ON public.site_visits
  FOR INSERT TO public WITH CHECK (true);

-- Only admins can view visits
CREATE POLICY "Admins can view visits" ON public.site_visits
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() AND admin_users.is_active = true
  ));

-- Function to get all registered users with profiles (admin only)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    u.id,
    u.email,
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
$$;

-- Function to get visit stats
CREATE OR REPLACE FUNCTION public.get_visit_stats(period text DEFAULT 'daily')
RETURNS TABLE (
  period_label text,
  visit_count bigint,
  unique_visitors bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    CASE 
      WHEN period = 'daily' THEN to_char(visited_at, 'YYYY-MM-DD')
      WHEN period = 'weekly' THEN to_char(date_trunc('week', visited_at), 'YYYY-MM-DD')
      WHEN period = 'monthly' THEN to_char(visited_at, 'YYYY-MM')
    END as period_label,
    COUNT(*) as visit_count,
    COUNT(DISTINCT visitor_id) as unique_visitors
  FROM public.site_visits
  WHERE visited_at >= CASE
    WHEN period = 'daily' THEN now() - interval '30 days'
    WHEN period = 'weekly' THEN now() - interval '12 weeks'
    WHEN period = 'monthly' THEN now() - interval '12 months'
  END
  GROUP BY period_label
  ORDER BY period_label DESC;
$$;

-- Function to update user role (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() AND is_active = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Upsert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update existing role if different
  UPDATE public.user_roles SET role = new_role WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;
