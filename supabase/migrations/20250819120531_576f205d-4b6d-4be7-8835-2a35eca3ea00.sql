-- Fix database security issues and add missing functionality

-- Fix function search paths for security
ALTER FUNCTION public.update_admin_role(uuid, admin_role) SET search_path = '';
ALTER FUNCTION public.validate_product_legality() SET search_path = '';
ALTER FUNCTION public.check_admin_status(uuid) SET search_path = '';
ALTER FUNCTION public.is_admin(uuid) SET search_path = '';
ALTER FUNCTION public.get_admin_role(uuid) SET search_path = '';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = '';
ALTER FUNCTION public.create_admin_user(uuid, admin_role, uuid) SET search_path = '';
ALTER FUNCTION public.get_current_admin_role(uuid) SET search_path = '';
ALTER FUNCTION public.deactivate_admin_user(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_count() SET search_path = '';
ALTER FUNCTION public.check_product_legality(text, text) SET search_path = '';
ALTER FUNCTION public.log_admin_action(uuid, text, text, text, jsonb, jsonb) SET search_path = '';

-- Add missing triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Add triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_shops_updated_at ON public.shops;
CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_industries_updated_at ON public.industries;
CREATE TRIGGER update_industries_updated_at
  BEFORE UPDATE ON public.industries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_types_updated_at ON public.product_types;
CREATE TRIGGER update_product_types_updated_at
  BEFORE UPDATE ON public.product_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add validation trigger for products
DROP TRIGGER IF EXISTS validate_product_trigger ON public.products;
CREATE TRIGGER validate_product_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_product_legality();

-- Enable realtime for key tables
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.shops REPLICA IDENTITY FULL;
ALTER TABLE public.industries REPLICA IDENTITY FULL;
ALTER TABLE public.admin_audit_log REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shops;
ALTER PUBLICATION supabase_realtime ADD TABLE public.industries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_audit_log;