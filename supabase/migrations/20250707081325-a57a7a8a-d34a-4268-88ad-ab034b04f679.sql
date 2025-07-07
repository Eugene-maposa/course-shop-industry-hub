
-- Fix the email column type in admin_users table
ALTER TABLE public.admin_users 
ALTER COLUMN email TYPE text;
