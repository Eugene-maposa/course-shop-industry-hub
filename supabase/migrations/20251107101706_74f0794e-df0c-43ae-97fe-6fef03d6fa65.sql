-- Allow users to delete their own shops
CREATE POLICY "Users can delete their own shops"
ON public.shops
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to delete products from their shops
CREATE POLICY "Users can delete products from their shops"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = products.shop_id
    AND shops.user_id = auth.uid()
  )
);

-- Allow users to update their own products (for edit functionality)
CREATE POLICY "Users can update their own products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.shops
    WHERE shops.id = products.shop_id
    AND shops.user_id = auth.uid()
  )
);