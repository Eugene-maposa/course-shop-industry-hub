CREATE OR REPLACE FUNCTION public.get_public_shops()
 RETURNS TABLE(id uuid, name text, description text, icon_url text, industry_id uuid, industry_name text, industry_code text, status shop_status, latitude double precision, longitude double precision, website text, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    s.id, s.name, s.description, s.icon_url, s.industry_id,
    i.name AS industry_name, i.code AS industry_code,
    s.status, s.latitude, s.longitude, s.website, s.created_at
  FROM public.shops s
  LEFT JOIN public.industries i ON i.id = s.industry_id
  ORDER BY s.created_at DESC;
$function$;