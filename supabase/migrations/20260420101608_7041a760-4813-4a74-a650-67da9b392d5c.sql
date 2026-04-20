
-- Wipe existing shop/product data
DELETE FROM public.product_reviews;
DELETE FROM public.document_verifications;
DELETE FROM public.products;
DELETE FROM public.shops;

-- Seed 22 shops
INSERT INTO public.shops (id, name, description, address, phone, email, website, industry_id, latitude, longitude, status, document_verification_status, verified_at, registration_date, documents) VALUES
('11111111-0001-0000-0000-000000000001', 'Harare Fresh Farms', 'Premium fresh produce supplier serving Harare and surrounding regions with farm-to-table vegetables and fruits.', '12 Mbuya Nehanda St, Harare CBD', '+263 242 700 101', 'info@hararefreshfarms.co.zw', 'https://hararefreshfarms.co.zw', 'd2f5cb74-8e74-46b8-9552-b72bc9877e35', -17.8292, 31.0522, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000002', 'Bulawayo Builders Hub', 'Leading construction materials supplier in Matabeleland providing cement, steel, bricks, and tools.', '45 Joshua Mqabuko Nkomo St, Bulawayo CBD', '+263 292 700 102', 'sales@bulawayobuilders.co.zw', 'https://bulawayobuilders.co.zw', 'c20cba77-f9a7-4d4b-bf73-5ebca68c0b06', -20.1500, 28.5833, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000003', 'TechZim Solutions', 'Enterprise IT services and software solutions for Zimbabwean businesses.', '88 Samora Machel Ave, Harare', '+263 242 700 103', 'hello@techzim.co.zw', 'https://techzim.co.zw', 'f2958359-eaea-474c-ac49-90a5cad86086', -17.8245, 31.0335, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000004', 'Mutare Auto Centre', 'Trusted vehicle dealership and spares centre serving Manicaland province.', '23 Herbert Chitepo St, Mutare', '+263 202 700 104', 'sales@mutareauto.co.zw', 'https://mutareauto.co.zw', '405ca009-5965-4033-a8b4-4c7b73532f4d', -18.9707, 32.6709, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000005', 'Victoria Falls Hospitality', 'Tourism and hospitality supplies for hotels and lodges in Victoria Falls.', '7 Livingstone Way, Victoria Falls', '+263 213 700 105', 'info@vfhospitality.co.zw', 'https://vfhospitality.co.zw', '709221c1-fcaf-4281-aace-d901f9e73f5b', -17.9243, 25.8572, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000006', 'Gweru Health Pharmacy', 'Full-service pharmacy and medical supplies serving Midlands province.', '15 Robert Mugabe Way, Gweru', '+263 542 700 106', 'care@gweruhealth.co.zw', 'https://gweruhealth.co.zw', 'e7aa9eaa-bb48-4a49-9312-d09b23734c52', -19.4500, 29.8167, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000007', 'Masvingo Agro Supplies', 'Quality seeds, fertilizers, and farm inputs for southern Zimbabwe farmers.', '32 Hughes St, Masvingo', '+263 392 700 107', 'sales@masvingoagro.co.zw', 'https://masvingoagro.co.zw', 'd2f5cb74-8e74-46b8-9552-b72bc9877e35', -20.0633, 30.8328, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000008', 'Kwekwe Steel Works', 'Steel fabrication and structural materials for industrial and construction projects.', '50 Industrial Sites, Kwekwe', '+263 552 700 108', 'orders@kwekwesteel.co.zw', 'https://kwekwesteel.co.zw', 'c20cba77-f9a7-4d4b-bf73-5ebca68c0b06', -18.9281, 29.8149, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000009', 'Chinhoyi Dairy Co-op', 'Fresh dairy products and livestock feed from Mashonaland West.', '9 Magamba Way, Chinhoyi', '+263 672 700 109', 'info@chinhoyidairy.co.zw', 'https://chinhoyidairy.co.zw', 'd2f5cb74-8e74-46b8-9552-b72bc9877e35', -17.3667, 30.2000, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000010', 'Harare Mobile World', 'Smartphones, accessories, and mobile device repair services.', '101 First Street Mall, Harare', '+263 242 700 110', 'shop@hararemobile.co.zw', 'https://hararemobile.co.zw', 'c3c1b2b5-d0b0-43a4-8b71-3740dfeb01cb', -17.8312, 31.0490, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000011', 'Bulawayo Fashion House', 'Modern apparel boutique featuring African-inspired designs and imported fashion.', '78 George Silundika Ave, Bulawayo', '+263 292 700 111', 'style@bfh.co.zw', 'https://bfh.co.zw', 'ac9f884d-57aa-4995-9054-06b89a6a70ef', -20.1611, 28.5879, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000012', 'Mash Solar Energy', 'Solar panel installation and renewable energy solutions across Zimbabwe.', '14 Borrowdale Rd, Harare', '+263 242 700 112', 'info@mashsolar.co.zw', 'https://mashsolar.co.zw', 'c70ca008-d225-4b8e-825d-7f99d30ad538', -17.7722, 31.0844, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000013', 'Kariba Lake Foods', 'Fresh fish, beverages, and packaged foods from the Kariba region.', '22 Lakeshore Drive, Kariba', '+263 612 700 113', 'orders@karibafoods.co.zw', 'https://karibafoods.co.zw', 'dafc0713-3fc2-4675-a36b-a6a123951b9a', -16.5167, 28.8000, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000014', 'NUST Tech Innovations', 'Software development, custom applications, and tech consulting from Bulawayo.', 'NUST Campus, Cnr Gwanda Rd & Cecil Ave, Bulawayo', '+263 292 700 114', 'innovate@nusttech.co.zw', 'https://nusttech.co.zw', '44352d4e-008f-4d7b-ab2b-e8f58ad000cc', -20.2325, 28.6929, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000015', 'Marondera Poultry Farm', 'Commercial poultry, eggs, and livestock feed for Mashonaland East.', '5 Ruzawi Rd, Marondera', '+263 652 700 115', 'farm@maronderapoultry.co.zw', 'https://maronderapoultry.co.zw', 'd2f5cb74-8e74-46b8-9552-b72bc9877e35', -18.1853, 31.5519, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000016', 'Harare Home & Garden', 'Premium home décor, furniture, and garden essentials.', '67 Enterprise Rd, Highlands, Harare', '+263 242 700 116', 'shop@hararehome.co.zw', 'https://hararehome.co.zw', 'fe6fb069-8e03-4ecd-b94f-b4528e3560ec', -17.8089, 31.0900, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000017', 'Bulawayo Auto Spares', 'Genuine and aftermarket vehicle parts for all makes and models.', '34 Lobengula St, Bulawayo', '+263 292 700 117', 'parts@byoautospares.co.zw', 'https://byoautospares.co.zw', '405ca009-5965-4033-a8b4-4c7b73532f4d', -20.1450, 28.5800, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000018', 'Mutare Coffee Roasters', 'Specialty Eastern Highlands coffee and gourmet beverages.', '11 Aerodrome Rd, Mutare', '+263 202 700 118', 'beans@mutarecoffee.co.zw', 'https://mutarecoffee.co.zw', 'dafc0713-3fc2-4675-a36b-a6a123951b9a', -18.9750, 32.6750, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000019', 'Zim Office Supplies', 'Office furniture, stationery, and business equipment for SMEs and enterprises.', '90 Nelson Mandela Ave, Harare', '+263 242 700 119', 'orders@zimoffice.co.zw', 'https://zimoffice.co.zw', 'fe6fb069-8e03-4ecd-b94f-b4528e3560ec', -17.8270, 31.0480, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000020', 'Hwange Mining Supplies', 'Industrial and mining equipment for the Matabeleland North region.', '3 Coalfields Rd, Hwange', '+263 812 700 120', 'sales@hwangemining.co.zw', 'https://hwangemining.co.zw', 'c20cba77-f9a7-4d4b-bf73-5ebca68c0b06', -18.3647, 26.4978, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000021', 'Chitungwiza Beauty Co', 'Skincare, cosmetics, and personal care products for the modern Zimbabwean.', '56 Seke Rd, Chitungwiza', '+263 270 700 121', 'beauty@chitungwizabeauty.co.zw', 'https://chitungwizabeauty.co.zw', 'e7aa9eaa-bb48-4a49-9312-d09b23734c52', -18.0127, 31.0756, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb),
('11111111-0001-0000-0000-000000000022', 'Victoria Falls Adventure Gear', 'Outdoor adventure equipment and tourism gear for Zimbabwe explorers.', '19 Adam Stander Dr, Victoria Falls', '+263 213 700 122', 'gear@vfadventure.co.zw', 'https://vfadventure.co.zw', '709221c1-fcaf-4281-aace-d901f9e73f5b', -17.9300, 25.8400, 'active', 'approved', now(), CURRENT_DATE, '{"business_registration":"verified","tax_clearance":"verified"}'::jsonb);

-- Seed 11 products per shop using a generator. We attach to a generic product_type per industry where useful.
WITH shop_data AS (
  SELECT id, name,
    ROW_NUMBER() OVER (ORDER BY id) AS shop_idx,
    CASE
      WHEN name LIKE '%Farms%' OR name LIKE '%Agro%' OR name LIKE '%Dairy%' OR name LIKE '%Poultry%' THEN 'd3efe3e1-d8fb-4b89-a5ed-b9d526ac82d8'::uuid
      WHEN name LIKE '%Builders%' OR name LIKE '%Steel%' OR name LIKE '%Mining%' THEN '30b81f49-8135-48e5-96b3-a1019d3b1477'::uuid
      WHEN name LIKE '%Auto%' THEN 'b556cf39-5710-4242-bfc2-555aa497becc'::uuid
      WHEN name LIKE '%Mobile%' OR name LIKE '%Tech%' OR name LIKE '%NUST%' THEN '6f337987-1117-447d-8cae-b22439c0d1ca'::uuid
      WHEN name LIKE '%Fashion%' THEN 'ff8b3668-2d5e-4871-87cd-ee33ea94f725'::uuid
      WHEN name LIKE '%Pharmacy%' OR name LIKE '%Health%' OR name LIKE '%Beauty%' THEN '596eb0d6-4b11-4038-a54d-510a5400e78f'::uuid
      WHEN name LIKE '%Foods%' OR name LIKE '%Coffee%' THEN '5940fc2a-86b9-4273-9126-02a1bf4d755a'::uuid
      WHEN name LIKE '%Home%' OR name LIKE '%Office%' THEN '1131cbcb-b087-46d2-b378-f5e66ed93131'::uuid
      WHEN name LIKE '%Solar%' OR name LIKE '%Energy%' THEN '003ad9b6-fb34-45c7-a376-c6883c0d594a'::uuid
      WHEN name LIKE '%Hospitality%' OR name LIKE '%Adventure%' THEN 'dbbf7b7b-a887-48a3-98b0-9492e24352fc'::uuid
      ELSE 'cd45c07f-5a1e-471f-a381-f09a9c20efe7'::uuid
    END AS pt_id
  FROM public.shops
),
nums AS (SELECT generate_series(1,11) AS n)
INSERT INTO public.products (shop_id, product_type_id, name, description, price, sku, status, registration_date, main_image_url, gallery_images)
SELECT
  s.id,
  s.pt_id,
  s.name || ' - Item ' || n,
  'High quality product number ' || n || ' offered by ' || s.name || '. Sourced and quality-checked for the Zimbabwean market.',
  ROUND((20 + (n * 17) + (s.shop_idx * 11))::numeric, 2),
  'PN-' || LPAD(s.shop_idx::text, 3, '0') || '-' || LPAD(n::text, 3, '0'),
  'active',
  CURRENT_DATE,
  'https://images.unsplash.com/photo-15' || (10000000 + s.shop_idx * 11 + n) || '?w=800',
  jsonb_build_array(
    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800'
  )
FROM shop_data s CROSS JOIN nums;
