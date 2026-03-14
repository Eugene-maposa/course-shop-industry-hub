-- Resolve permissive WITH CHECK(true) warnings
DROP POLICY IF EXISTS "Authenticated users can insert industries" ON public.industries;
CREATE POLICY "Authenticated users can insert industries"
ON public.industries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can insert product types" ON public.product_types;
CREATE POLICY "Authenticated users can insert product types"
ON public.product_types
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can insert visits" ON public.site_visits;
CREATE POLICY "Anyone can insert visits"
ON public.site_visits
FOR INSERT
TO public
WITH CHECK (
  visitor_id IS NOT NULL
  AND length(trim(visitor_id)) > 0
  AND page_path IS NOT NULL
  AND length(trim(page_path)) > 0
);