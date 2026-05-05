
-- =========================================================
-- 1. STORAGE: shop-documents -> private, owner/admin scoped
-- =========================================================
UPDATE storage.buckets SET public = false WHERE id = 'shop-documents';

DROP POLICY IF EXISTS "Anyone can view shop documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload shop documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own shop documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all shop documents" ON storage.objects;

CREATE POLICY "Owner or admin can view shop documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'shop-documents' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true)
  )
);

CREATE POLICY "Owners can upload to their own folder in shop-documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners can update their own shop documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shop-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners or admins can delete shop documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shop-documents' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true)
  )
);

-- =========================================================
-- 2. STORAGE: avatars -> per-user ownership
-- =========================================================
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =========================================================
-- 3. STORAGE: product-images -> authenticated write, public read
-- =========================================================
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete product images" ON storage.objects;

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IS NOT NULL
);

-- =========================================================
-- 4. STORAGE: shop-icons -> add UPDATE/DELETE for authenticated
-- =========================================================
CREATE POLICY "Authenticated users can update shop icons"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shop-icons'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated users can delete shop icons"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shop-icons'
  AND auth.uid() IS NOT NULL
);

-- =========================================================
-- 5. industries -> admin-only writes
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can insert industries" ON public.industries;

CREATE POLICY "Admins can insert industries"
ON public.industries FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true));

CREATE POLICY "Admins can update industries"
ON public.industries FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true));

CREATE POLICY "Admins can delete industries"
ON public.industries FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true));

-- =========================================================
-- 6. product_types -> admin-only writes
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can insert product types" ON public.product_types;

CREATE POLICY "Admins can insert product types"
ON public.product_types FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true));

CREATE POLICY "Admins can update product types"
ON public.product_types FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true));

CREATE POLICY "Admins can delete product types"
ON public.product_types FOR DELETE
USING (EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true));

-- =========================================================
-- 7. Realtime publication: stop broadcasting sensitive tables
-- =========================================================
ALTER PUBLICATION supabase_realtime DROP TABLE public.shops;
ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_audit_log;
