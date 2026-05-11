
-- Restrict UPDATE/DELETE on product-images and shop-icons to file owner or active admin
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update shop icons" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete shop icons" ON storage.objects;

CREATE POLICY "Owner or admin can update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-images' AND (
    owner = auth.uid()
    OR EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true)
  )
);

CREATE POLICY "Owner or admin can delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-images' AND (
    owner = auth.uid()
    OR EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true)
  )
);

CREATE POLICY "Owner or admin can update shop icons"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'shop-icons' AND (
    owner = auth.uid()
    OR EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true)
  )
);

CREATE POLICY "Owner or admin can delete shop icons"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'shop-icons' AND (
    owner = auth.uid()
    OR EXISTS (SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid() AND a.is_active = true)
  )
);

-- Scope products UPDATE/DELETE policies to authenticated role only
DROP POLICY IF EXISTS "Users can update their own products" ON public.products;
DROP POLICY IF EXISTS "Users can delete products from their shops" ON public.products;

CREATE POLICY "Users can update their own products"
ON public.products FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.user_id = auth.uid()));

CREATE POLICY "Users can delete products from their shops"
ON public.products FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = products.shop_id AND shops.user_id = auth.uid()));

-- Default-deny on realtime.messages so channel subscriptions require an explicit allow
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read public realtime topics" ON realtime.messages;
CREATE POLICY "Authenticated users can read public realtime topics"
ON realtime.messages FOR SELECT TO authenticated
USING (
  realtime.topic() IN ('public:products', 'public:product_reviews', 'public:industries', 'public:shops')
);
