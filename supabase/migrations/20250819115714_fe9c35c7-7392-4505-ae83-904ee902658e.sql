-- Fix RLS policies for admin_audit_log table
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_log;

-- Create proper RLS policies for admin_audit_log
CREATE POLICY "Admins can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = auth.uid() 
    AND admin_users.is_active = true
  )
);

-- Ensure admin_audit_log has RLS enabled
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;