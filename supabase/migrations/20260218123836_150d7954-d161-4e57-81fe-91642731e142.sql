
-- Add latitude and longitude columns to shops for map positioning
ALTER TABLE public.shops ADD COLUMN latitude DOUBLE PRECISION DEFAULT NULL;
ALTER TABLE public.shops ADD COLUMN longitude DOUBLE PRECISION DEFAULT NULL;
