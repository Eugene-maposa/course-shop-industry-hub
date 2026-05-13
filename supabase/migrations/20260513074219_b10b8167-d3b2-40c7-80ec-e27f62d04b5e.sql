
CREATE POLICY "Admins can update all shops" ON public.shops FOR UPDATE USING (public.check_admin_status(auth.uid())) WITH CHECK (public.check_admin_status(auth.uid()));
CREATE POLICY "Admins can delete all shops" ON public.shops FOR DELETE USING (public.check_admin_status(auth.uid()));
CREATE POLICY "Admins can update all products" ON public.products FOR UPDATE USING (public.check_admin_status(auth.uid())) WITH CHECK (public.check_admin_status(auth.uid()));
CREATE POLICY "Admins can delete all products" ON public.products FOR DELETE USING (public.check_admin_status(auth.uid()));
CREATE POLICY "Admins can insert products for any shop" ON public.products FOR INSERT WITH CHECK (public.check_admin_status(auth.uid()));
CREATE POLICY "Admins can insert shops for any user" ON public.shops FOR INSERT WITH CHECK (public.check_admin_status(auth.uid()));
