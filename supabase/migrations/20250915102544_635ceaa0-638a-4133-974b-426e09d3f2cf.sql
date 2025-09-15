-- Add user_id to shops table to link shops to users
ALTER TABLE public.shops 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX idx_shops_user_id ON public.shops(user_id);

-- Add RLS policy for shop owners to manage their own shops
CREATE POLICY "Users can view their own shops" ON public.shops
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own shops" ON public.shops 
FOR UPDATE USING (auth.uid() = user_id);

-- Update shops to link them to users based on email matching
-- This will match shop emails with auth.users emails
UPDATE public.shops 
SET user_id = (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = shops.email 
  LIMIT 1
)
WHERE user_id IS NULL 
AND email IS NOT NULL;