
-- Insert the user into the admin_users table with super_admin role
INSERT INTO public.admin_users (user_id, role, is_active)
VALUES ('3e8f9bf3-7ab2-4011-813f-bf86f2036134', 'super_admin', true)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  is_active = true,
  updated_at = now();
