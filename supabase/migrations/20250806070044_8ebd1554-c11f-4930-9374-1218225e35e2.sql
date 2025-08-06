-- Add more product types relevant to Zimbabwe market

-- First, let's add more industries if needed
INSERT INTO public.industries (name, code, description) VALUES
('Retail & Commerce', 'RET', 'General retail and commercial activities'),
('Automotive', 'AUTO', 'Vehicle sales and automotive services'),
('Agriculture & Farming', 'AGRI', 'Agricultural products and farming equipment'),
('Construction', 'CONST', 'Construction materials and building supplies'),
('Services', 'SERV', 'Various service offerings'),
('Real Estate', 'REAL', 'Property sales and rentals'),
('Health & Wellness', 'HEALTH', 'Health and beauty products'),
('Arts & Culture', 'ARTS', 'Arts, crafts and cultural items')
ON CONFLICT (code) DO NOTHING;

-- Add comprehensive product types for Zimbabwe market
INSERT INTO public.product_types (name, code, description, industry_id) VALUES
-- Food & Beverages
('Groceries & Food', 'GROCERY', 'Fresh produce, packaged foods, and beverages', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Beverages', 'BEVERAGE', 'Soft drinks, juices, alcoholic beverages', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Fresh Produce', 'PRODUCE', 'Fresh fruits, vegetables, and organic products', (SELECT id FROM industries WHERE code = 'AGRI' LIMIT 1)),

-- Automotive
('Cars & Vehicles', 'CARS', 'New and used cars, motorcycles, trucks', (SELECT id FROM industries WHERE code = 'AUTO' LIMIT 1)),
('Car Parts & Accessories', 'CAR_PARTS', 'Spare parts, tires, car accessories', (SELECT id FROM industries WHERE code = 'AUTO' LIMIT 1)),

-- Electronics & Technology
('Electronics', 'ELECTRONICS', 'TVs, radios, home appliances', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Mobile Phones & Accessories', 'MOBILE', 'Smartphones, tablets, phone accessories', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Computers & IT', 'COMPUTERS', 'Laptops, desktops, software, IT equipment', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),

-- Fashion & Clothing
('Clothing & Fashion', 'CLOTHING', 'Men, women, and children clothing', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Shoes & Footwear', 'SHOES', 'All types of footwear and accessories', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Jewelry & Accessories', 'JEWELRY', 'Jewelry, watches, fashion accessories', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),

-- Home & Living
('Home & Garden', 'HOME_GARDEN', 'Furniture, home decor, gardening supplies', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Furniture', 'FURNITURE', 'Living room, bedroom, office furniture', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Kitchen & Dining', 'KITCHEN', 'Cookware, utensils, dining sets', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),

-- Health & Beauty
('Health & Beauty', 'HEALTH_BEAUTY', 'Cosmetics, skincare, health products', (SELECT id FROM industries WHERE code = 'HEALTH' LIMIT 1)),
('Pharmacy & Medicine', 'PHARMACY', 'Prescription drugs, over-the-counter medicine', (SELECT id FROM industries WHERE code = 'HEALTH' LIMIT 1)),

-- Education & Books
('Books & Education', 'BOOKS', 'Textbooks, novels, educational materials', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Educational Supplies', 'EDU_SUPPLIES', 'School supplies, stationery, learning materials', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),

-- Sports & Recreation
('Sports & Recreation', 'SPORTS', 'Sports equipment, fitness gear, outdoor activities', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Toys & Games', 'TOYS', 'Children toys, board games, puzzles', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),

-- Agriculture & Farming
('Agricultural Equipment', 'AGRI_EQUIP', 'Farming tools, tractors, irrigation equipment', (SELECT id FROM industries WHERE code = 'AGRI' LIMIT 1)),
('Seeds & Fertilizers', 'SEEDS_FERT', 'Seeds, fertilizers, pest control products', (SELECT id FROM industries WHERE code = 'AGRI' LIMIT 1)),
('Livestock & Poultry', 'LIVESTOCK', 'Cattle, goats, chickens, animal feed', (SELECT id FROM industries WHERE code = 'AGRI' LIMIT 1)),

-- Construction & Building
('Building Materials', 'BUILD_MAT', 'Cement, bricks, roofing materials', (SELECT id FROM industries WHERE code = 'CONST' LIMIT 1)),
('Tools & Hardware', 'TOOLS', 'Construction tools, hardware, power tools', (SELECT id FROM industries WHERE code = 'CONST' LIMIT 1)),
('Plumbing & Electrical', 'PLUMB_ELEC', 'Plumbing supplies, electrical components', (SELECT id FROM industries WHERE code = 'CONST' LIMIT 1)),

-- Services
('Professional Services', 'PROF_SERV', 'Legal, accounting, consulting services', (SELECT id FROM industries WHERE code = 'SERV' LIMIT 1)),
('Repair Services', 'REPAIR', 'Electronics repair, car repair, home repair', (SELECT id FROM industries WHERE code = 'SERV' LIMIT 1)),
('Transportation Services', 'TRANSPORT', 'Delivery, logistics, passenger transport', (SELECT id FROM industries WHERE code = 'SERV' LIMIT 1)),

-- Real Estate
('Property Sales', 'PROP_SALES', 'Houses, apartments, commercial property for sale', (SELECT id FROM industries WHERE code = 'REAL' LIMIT 1)),
('Property Rentals', 'PROP_RENT', 'Houses, apartments, office space for rent', (SELECT id FROM industries WHERE code = 'REAL' LIMIT 1)),

-- Arts & Crafts
('Arts & Crafts', 'ARTS_CRAFTS', 'Handmade items, traditional crafts, artwork', (SELECT id FROM industries WHERE code = 'ARTS' LIMIT 1)),
('Musical Instruments', 'MUSIC', 'Traditional and modern musical instruments', (SELECT id FROM industries WHERE code = 'ARTS' LIMIT 1)),

-- Miscellaneous
('Pet Supplies', 'PETS', 'Pet food, toys, accessories, veterinary supplies', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1)),
('Office Supplies', 'OFFICE', 'Business equipment, stationery, office furniture', (SELECT id FROM industries WHERE code = 'RET' LIMIT 1))

ON CONFLICT (code) DO NOTHING;