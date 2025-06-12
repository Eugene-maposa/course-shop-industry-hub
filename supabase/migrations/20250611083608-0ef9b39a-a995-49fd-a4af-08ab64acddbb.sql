
-- Create enum types for better data consistency
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE shop_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE industry_status AS ENUM ('active', 'inactive', 'pending');

-- Create industries table
CREATE TABLE public.industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE NOT NULL,
  status industry_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  industry_id UUID REFERENCES public.industries(id),
  status shop_status DEFAULT 'pending',
  registration_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_types table (equivalent to intakes)
CREATE TABLE public.product_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT UNIQUE NOT NULL,
  industry_id UUID REFERENCES public.industries(id),
  status product_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  sku TEXT UNIQUE,
  product_type_id UUID REFERENCES public.product_types(id),
  shop_id UUID REFERENCES public.shops(id),
  status product_status DEFAULT 'pending',
  registration_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed)
CREATE POLICY "Anyone can view industries" ON public.industries FOR SELECT USING (true);
CREATE POLICY "Anyone can view shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Anyone can view product_types" ON public.product_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Create policies for insert (adjust as needed for your auth requirements)
CREATE POLICY "Anyone can insert industries" ON public.industries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert shops" ON public.shops FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert product_types" ON public.product_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);

-- Insert some sample data
INSERT INTO public.industries (name, description, code) VALUES
('Technology', 'Technology and software industry', 'TECH'),
('Manufacturing', 'Manufacturing and production industry', 'MANUF'),
('Retail', 'Retail and consumer goods', 'RETAIL'),
('Healthcare', 'Healthcare and medical services', 'HEALTH'),
('Education', 'Educational services and institutions', 'EDU');

INSERT INTO public.product_types (name, description, code, industry_id) VALUES
('Electronics', 'Electronic devices and components', 'ELEC', (SELECT id FROM public.industries WHERE code = 'TECH')),
('Software', 'Software applications and services', 'SOFT', (SELECT id FROM public.industries WHERE code = 'TECH')),
('Automotive Parts', 'Vehicle components and accessories', 'AUTO', (SELECT id FROM public.industries WHERE code = 'MANUF')),
('Clothing', 'Apparel and fashion items', 'CLOTH', (SELECT id FROM public.industries WHERE code = 'RETAIL')),
('Medical Equipment', 'Healthcare devices and tools', 'MEDIQ', (SELECT id FROM public.industries WHERE code = 'HEALTH'));
