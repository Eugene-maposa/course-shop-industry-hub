
-- Update shop icons with working Unsplash images per industry
UPDATE shops SET icon_url = CASE id
  WHEN '11111111-0001-0000-0000-000000000001'::uuid THEN 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000002'::uuid THEN 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000003'::uuid THEN 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000004'::uuid THEN 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000005'::uuid THEN 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000006'::uuid THEN 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000007'::uuid THEN 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000008'::uuid THEN 'https://images.unsplash.com/photo-1565793979206-6d5c2bdb6c19?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000009'::uuid THEN 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000010'::uuid THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000011'::uuid THEN 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000012'::uuid THEN 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000013'::uuid THEN 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000014'::uuid THEN 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000015'::uuid THEN 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000016'::uuid THEN 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000017'::uuid THEN 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000018'::uuid THEN 'https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000019'::uuid THEN 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000020'::uuid THEN 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000021'::uuid THEN 'https://images.unsplash.com/photo-1522335789203-aaa8e7f9b3da?w=400&h=400&fit=crop'
  WHEN '11111111-0001-0000-0000-000000000022'::uuid THEN 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=400&h=400&fit=crop'
END
WHERE id::text LIKE '11111111-0001%';

-- Helper: build catalog rows then update each product by sku
WITH catalog(sku, pname, pprice, pimg) AS (
  VALUES
  -- Shop 001: Harare Fresh Farms (Agriculture)
  ('PN-001-001','Fresh Bananas (1kg)',2.50,'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800'),
  ('PN-001-002','Tomatoes (1kg)',3.00,'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'),
  ('PN-001-003','Onions (1kg)',2.20,'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?w=800'),
  ('PN-001-004','Maize Meal (10kg)',12.50,'https://images.unsplash.com/photo-1568376794508-ae52c6ab3929?w=800'),
  ('PN-001-005','Fresh Carrots (1kg)',2.80,'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800'),
  ('PN-001-006','Cabbage (head)',2.00,'https://images.unsplash.com/photo-1551271292-df40bb9aa8a3?w=800'),
  ('PN-001-007','Sweet Potatoes (1kg)',3.50,'https://images.unsplash.com/photo-1596097635121-14b8b67217ec?w=800'),
  ('PN-001-008','Green Beans (500g)',3.20,'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=800'),
  ('PN-001-009','Spinach Bunch',1.50,'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800'),
  ('PN-001-010','Avocados (each)',1.80,'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=800'),
  ('PN-001-011','Butternut Squash',2.50,'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=800'),

  -- Shop 002: Bulawayo Builders Hub (Construction)
  ('PN-002-001','Cement Bag (50kg)',14.00,'https://images.unsplash.com/photo-1590725140246-20acdee442be?w=800'),
  ('PN-002-002','Common Bricks (per 100)',45.00,'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=800'),
  ('PN-002-003','River Sand (per ton)',38.00,'https://images.unsplash.com/photo-1605152276897-4f618f831968?w=800'),
  ('PN-002-004','Concrete Mixer',420.00,'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800'),
  ('PN-002-005','Roofing Sheets (IBR)',28.00,'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800'),
  ('PN-002-006','Steel Reinforcement Bar',18.00,'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800'),
  ('PN-002-007','Wheelbarrow',55.00,'https://images.unsplash.com/photo-1591955506264-3f5a6834570a?w=800'),
  ('PN-002-008','Building Sand (per ton)',32.00,'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=800'),
  ('PN-002-009','Quarry Stone (per ton)',35.00,'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800'),
  ('PN-002-010','PVC Pipe (3m)',12.50,'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'),
  ('PN-002-011','Construction Helmet',8.50,'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800'),

  -- Shop 003: TechZim Solutions (IT Services)
  ('PN-003-001','Website Hosting (Annual)',85.00,'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'),
  ('PN-003-002','Domain Registration',15.00,'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'),
  ('PN-003-003','Cloud Storage (1TB)',25.00,'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'),
  ('PN-003-004','VPN Service (Monthly)',8.00,'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800'),
  ('PN-003-005','Office 365 License',18.00,'https://images.unsplash.com/photo-1611174743420-3d7df880ce32?w=800'),
  ('PN-003-006','Antivirus Software',22.00,'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800'),
  ('PN-003-007','IT Consultation Hour',45.00,'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800'),
  ('PN-003-008','Network Setup Service',180.00,'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800'),
  ('PN-003-009','Data Recovery Service',75.00,'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'),
  ('PN-003-010','Computer Repair',35.00,'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'),
  ('PN-003-011','Server Maintenance',120.00,'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800'),

  -- Shop 004: Mutare Auto Centre (Automotive)
  ('PN-004-001','Engine Oil 5L',28.00,'https://images.unsplash.com/photo-1635008702301-3eccd6dc15ed?w=800'),
  ('PN-004-002','Brake Pads (set)',42.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-004-003','Car Battery 12V',95.00,'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800'),
  ('PN-004-004','Tyres 195/65R15 (each)',75.00,'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800'),
  ('PN-004-005','Spark Plugs (set of 4)',18.00,'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800'),
  ('PN-004-006','Air Filter',12.00,'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'),
  ('PN-004-007','Wiper Blades (pair)',15.00,'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'),
  ('PN-004-008','Headlight Bulb',10.00,'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'),
  ('PN-004-009','Coolant 5L',16.00,'https://images.unsplash.com/photo-1632823471565-1ecdf5a7ca3a?w=800'),
  ('PN-004-010','Brake Fluid 1L',9.50,'https://images.unsplash.com/photo-1632823471565-1ecdf5a7ca3a?w=800'),
  ('PN-004-011','Car Wash Soap 2L',7.50,'https://images.unsplash.com/photo-1605618826115-fb9e775cf795?w=800'),

  -- Shop 005: Victoria Falls Hospitality (Hospitality)
  ('PN-005-001','Safari Tour (per person)',150.00,'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'),
  ('PN-005-002','Hotel Room (per night)',95.00,'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'),
  ('PN-005-003','Bungee Jump Ticket',180.00,'https://images.unsplash.com/photo-1531259736915-66b96374e387?w=800'),
  ('PN-005-004','Helicopter Flight (15min)',220.00,'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=800'),
  ('PN-005-005','Sunset Cruise Ticket',65.00,'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'),
  ('PN-005-006','Guided Falls Tour',35.00,'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800'),
  ('PN-005-007','Airport Transfer',40.00,'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'),
  ('PN-005-008','Local Cuisine Dinner',28.00,'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'),
  ('PN-005-009','Spa Massage (60min)',55.00,'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'),
  ('PN-005-010','Curio Souvenir',12.00,'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800'),
  ('PN-005-011','Conference Room (day)',180.00,'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800'),

  -- Shop 006: Gweru Health Pharmacy (Healthcare)
  ('PN-006-001','Paracetamol (24 tabs)',3.50,'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800'),
  ('PN-006-002','Vitamin C (60 tabs)',8.00,'https://images.unsplash.com/photo-1550572017-edd951b55104?w=800'),
  ('PN-006-003','Multivitamin (30 tabs)',12.00,'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800'),
  ('PN-006-004','First Aid Kit',22.00,'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800'),
  ('PN-006-005','Digital Thermometer',9.50,'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800'),
  ('PN-006-006','Blood Pressure Monitor',45.00,'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800'),
  ('PN-006-007','Hand Sanitizer 500ml',5.50,'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800'),
  ('PN-006-008','Face Masks (50 pack)',8.00,'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800'),
  ('PN-006-009','Cough Syrup 200ml',6.50,'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800'),
  ('PN-006-010','Bandage Roll',2.50,'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800'),
  ('PN-006-011','Glucose Test Strips',18.00,'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'),

  -- Shop 007: Masvingo Agro Supplies (Agriculture)
  ('PN-007-001','Maize Seeds (10kg)',35.00,'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800'),
  ('PN-007-002','NPK Fertilizer (50kg)',42.00,'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800'),
  ('PN-007-003','Chicken Feed (50kg)',28.00,'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=800'),
  ('PN-007-004','Cattle Dip Chemical 1L',18.00,'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800'),
  ('PN-007-005','Sunflower Seeds (5kg)',22.00,'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800'),
  ('PN-007-006','Pesticide Spray 1L',15.00,'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800'),
  ('PN-007-007','Garden Hoe',12.00,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'),
  ('PN-007-008','Watering Can 10L',8.50,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'),
  ('PN-007-009','Irrigation Pipe (per m)',2.50,'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800'),
  ('PN-007-010','Wheat Seeds (10kg)',32.00,'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800'),
  ('PN-007-011','Soya Bean Seeds (5kg)',24.00,'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800'),

  -- Shop 008: Kwekwe Steel Works (Construction)
  ('PN-008-001','Steel I-Beam (6m)',180.00,'https://images.unsplash.com/photo-1565793979206-6d5c2bdb6c19?w=800'),
  ('PN-008-002','Welding Rods (5kg)',24.00,'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800'),
  ('PN-008-003','Steel Plate 1m x 1m',95.00,'https://images.unsplash.com/photo-1565793979206-6d5c2bdb6c19?w=800'),
  ('PN-008-004','Galvanised Wire (50m)',38.00,'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800'),
  ('PN-008-005','Angle Iron (6m)',45.00,'https://images.unsplash.com/photo-1565793979206-6d5c2bdb6c19?w=800'),
  ('PN-008-006','Steel Mesh Sheet',28.00,'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800'),
  ('PN-008-007','Square Tubing (6m)',42.00,'https://images.unsplash.com/photo-1565793979206-6d5c2bdb6c19?w=800'),
  ('PN-008-008','Steel Pipe (6m)',55.00,'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800'),
  ('PN-008-009','Welding Helmet',32.00,'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800'),
  ('PN-008-010','Grinding Disc (10pk)',15.00,'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800'),
  ('PN-008-011','Steel Hinges (pair)',6.50,'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800'),

  -- Shop 009: Chinhoyi Dairy Co-op (Agriculture)
  ('PN-009-001','Fresh Milk 2L',3.20,'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800'),
  ('PN-009-002','Yoghurt 500ml',2.50,'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'),
  ('PN-009-003','Cheddar Cheese 500g',8.50,'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800'),
  ('PN-009-004','Butter 500g',5.50,'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800'),
  ('PN-009-005','Cream 250ml',2.80,'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800'),
  ('PN-009-006','Cottage Cheese 250g',4.20,'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800'),
  ('PN-009-007','Sour Milk 2L',3.50,'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800'),
  ('PN-009-008','Flavoured Milk 500ml',1.80,'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800'),
  ('PN-009-009','Ice Cream 1L',6.50,'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800'),
  ('PN-009-010','Powdered Milk 500g',7.50,'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800'),
  ('PN-009-011','Mozzarella Cheese 250g',6.00,'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800'),

  -- Shop 010: Harare Mobile World (Consumer Electronics)
  ('PN-010-001','Smartphone (Mid-range)',250.00,'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'),
  ('PN-010-002','Phone Charger USB-C',8.50,'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800'),
  ('PN-010-003','Bluetooth Earphones',25.00,'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'),
  ('PN-010-004','Phone Case (Universal)',6.50,'https://images.unsplash.com/photo-1601593346740-925612772716?w=800'),
  ('PN-010-005','Screen Protector',3.50,'https://images.unsplash.com/photo-1601593346740-925612772716?w=800'),
  ('PN-010-006','Power Bank 10000mAh',22.00,'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800'),
  ('PN-010-007','Smartwatch',75.00,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
  ('PN-010-008','Tablet 10-inch',180.00,'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'),
  ('PN-010-009','Wireless Mouse',12.00,'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800'),
  ('PN-010-010','USB Flash Drive 32GB',8.00,'https://images.unsplash.com/photo-1618410320928-25228d811631?w=800'),
  ('PN-010-011','Memory Card 64GB',10.00,'https://images.unsplash.com/photo-1618410320928-25228d811631?w=800'),

  -- Shop 011: Bulawayo Fashion House (Apparel)
  ('PN-011-001','Mens Cotton T-Shirt',12.00,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'),
  ('PN-011-002','Womens Summer Dress',28.00,'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'),
  ('PN-011-003','Denim Jeans',32.00,'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'),
  ('PN-011-004','Leather Belt',15.00,'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800'),
  ('PN-011-005','Sneakers',45.00,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'),
  ('PN-011-006','Formal Shirt',22.00,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800'),
  ('PN-011-007','Womens Handbag',38.00,'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'),
  ('PN-011-008','Sun Hat',8.50,'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800'),
  ('PN-011-009','Sunglasses',18.00,'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'),
  ('PN-011-010','Wool Scarf',12.00,'https://images.unsplash.com/photo-1601925240970-98447ae15bcc?w=800'),
  ('PN-011-011','Childrens Outfit',16.00,'https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?w=800'),

  -- Shop 012: Mash Solar Energy (Energy)
  ('PN-012-001','Solar Panel 100W',95.00,'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'),
  ('PN-012-002','Solar Panel 200W',175.00,'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800'),
  ('PN-012-003','Solar Battery 100Ah',180.00,'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800'),
  ('PN-012-004','Solar Charge Controller',45.00,'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800'),
  ('PN-012-005','Solar Inverter 1000W',220.00,'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?w=800'),
  ('PN-012-006','Solar Light Kit',55.00,'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800'),
  ('PN-012-007','Solar Water Heater',380.00,'https://images.unsplash.com/photo-1545209463-e2825498edbf?w=800'),
  ('PN-012-008','LED Bulb 9W',2.50,'https://images.unsplash.com/photo-1550985543-49bee3167284?w=800'),
  ('PN-012-009','Solar Cable (per m)',1.80,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'),
  ('PN-012-010','Mounting Bracket Set',28.00,'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800'),
  ('PN-012-011','Solar Power Bank',32.00,'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800'),

  -- Shop 013: Kariba Lake Foods (Food & Beverage)
  ('PN-013-001','Fresh Kapenta Fish (1kg)',8.50,'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=800'),
  ('PN-013-002','Dried Kapenta (500g)',6.50,'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=800'),
  ('PN-013-003','Bream Fish (1kg)',12.00,'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800'),
  ('PN-013-004','Fish Fillets (500g)',9.00,'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800'),
  ('PN-013-005','Smoked Fish (500g)',10.50,'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=800'),
  ('PN-013-006','Fish Pie',5.50,'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'),
  ('PN-013-007','Tilapia (1kg)',11.00,'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800'),
  ('PN-013-008','Catfish (1kg)',9.50,'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800'),
  ('PN-013-009','Frozen Prawns (500g)',14.00,'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800'),
  ('PN-013-010','Fish Sauce 250ml',3.50,'https://images.unsplash.com/photo-1542456885-89667376a074?w=800'),
  ('PN-013-011','Lake Salt (1kg)',2.20,'https://images.unsplash.com/photo-1518110925495-b37653737e84?w=800'),

  -- Shop 014: NUST Tech Innovations (Software)
  ('PN-014-001','Mobile App Development',450.00,'https://images.unsplash.com/photo-1551650975-87deedd944c1?w=800'),
  ('PN-014-002','Custom Web Application',380.00,'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800'),
  ('PN-014-003','POS System License',220.00,'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800'),
  ('PN-014-004','Inventory Software',180.00,'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'),
  ('PN-014-005','HR Management System',250.00,'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800'),
  ('PN-014-006','School Management Software',280.00,'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'),
  ('PN-014-007','Accounting Software',195.00,'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800'),
  ('PN-014-008','API Integration Service',145.00,'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'),
  ('PN-014-009','UI/UX Design Package',225.00,'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=800'),
  ('PN-014-010','Software Training (day)',95.00,'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800'),
  ('PN-014-011','Tech Support (Monthly)',55.00,'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800'),

  -- Shop 015: Marondera Poultry Farm (Agriculture)
  ('PN-015-001','Live Broiler Chicken',8.50,'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800'),
  ('PN-015-002','Fresh Eggs (Tray of 30)',6.50,'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800'),
  ('PN-015-003','Day-Old Chicks (each)',1.20,'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800'),
  ('PN-015-004','Layers Mash (50kg)',32.00,'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=800'),
  ('PN-015-005','Broiler Starter (50kg)',38.00,'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?w=800'),
  ('PN-015-006','Whole Frozen Chicken',9.50,'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800'),
  ('PN-015-007','Chicken Drumsticks (1kg)',7.50,'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800'),
  ('PN-015-008','Chicken Breast (1kg)',9.00,'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800'),
  ('PN-015-009','Chicken Gizzards (500g)',4.50,'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800'),
  ('PN-015-010','Fertilised Eggs (each)',0.80,'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800'),
  ('PN-015-011','Poultry Vaccine',12.00,'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'),

  -- Shop 016: Harare Home & Garden (Consumer Goods)
  ('PN-016-001','Garden Spade',12.00,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'),
  ('PN-016-002','Plant Pots (set of 3)',8.50,'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'),
  ('PN-016-003','Outdoor Chair',45.00,'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'),
  ('PN-016-004','Garden Hose 20m',22.00,'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800'),
  ('PN-016-005','Lawn Mower',180.00,'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800'),
  ('PN-016-006','Indoor Plant Set',18.00,'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'),
  ('PN-016-007','Garden Gloves',4.50,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'),
  ('PN-016-008','Wall Clock',15.00,'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=800'),
  ('PN-016-009','Door Mat',6.50,'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'),
  ('PN-016-010','Curtains (pair)',28.00,'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'),
  ('PN-016-011','Bedside Table',55.00,'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800'),

  -- Shop 017: Bulawayo Auto Spares (Automotive)
  ('PN-017-001','Clutch Plate Kit',85.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-002','Shock Absorber',45.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-003','Alternator',125.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-004','Starter Motor',95.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-005','Fuel Pump',65.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-006','Radiator',110.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-007','Timing Belt',32.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-008','Fuel Filter',12.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-009','Side Mirror',28.00,'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'),
  ('PN-017-010','Exhaust Pipe',75.00,'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=800'),
  ('PN-017-011','Car Floor Mats (set)',22.00,'https://images.unsplash.com/photo-1605618826115-fb9e775cf795?w=800'),

  -- Shop 018: Mutare Coffee Roasters (Food & Beverage)
  ('PN-018-001','Roasted Coffee Beans (500g)',12.00,'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'),
  ('PN-018-002','Ground Coffee (250g)',7.50,'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800'),
  ('PN-018-003','Coffee Espresso Blend (500g)',14.50,'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'),
  ('PN-018-004','Instant Coffee 200g',8.00,'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800'),
  ('PN-018-005','Decaf Coffee (250g)',9.00,'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800'),
  ('PN-018-006','Coffee Filter Papers',3.50,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'),
  ('PN-018-007','Coffee Mug Ceramic',6.50,'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800'),
  ('PN-018-008','Coffee French Press',22.00,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'),
  ('PN-018-009','Coffee Grinder',45.00,'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'),
  ('PN-018-010','Coffee Sampler Pack',18.00,'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'),
  ('PN-018-011','Cappuccino Mix (200g)',6.00,'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800'),

  -- Shop 019: Zim Office Supplies (Consumer Goods)
  ('PN-019-001','A4 Paper Ream (500 sheets)',5.50,'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800'),
  ('PN-019-002','Ballpoint Pens (12 pack)',4.00,'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800'),
  ('PN-019-003','Office Stapler',6.50,'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=800'),
  ('PN-019-004','Notebooks (pack of 5)',8.00,'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800'),
  ('PN-019-005','Printer Ink Cartridge',32.00,'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800'),
  ('PN-019-006','Office Chair',95.00,'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800'),
  ('PN-019-007','Desk Lamp',22.00,'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800'),
  ('PN-019-008','Filing Cabinet',150.00,'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'),
  ('PN-019-009','Whiteboard 90x60cm',45.00,'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'),
  ('PN-019-010','Calculator Scientific',12.00,'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800'),
  ('PN-019-011','Document Folders (10 pack)',6.00,'https://images.unsplash.com/photo-1568667256549-094345857637?w=800'),

  -- Shop 020: Hwange Mining Supplies (Construction)
  ('PN-020-001','Mining Helmet with Lamp',45.00,'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800'),
  ('PN-020-002','Safety Boots',55.00,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'),
  ('PN-020-003','High-Vis Vest',12.00,'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800'),
  ('PN-020-004','Mining Pickaxe',28.00,'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800'),
  ('PN-020-005','Heavy Duty Shovel',22.00,'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800'),
  ('PN-020-006','Industrial Gloves (pair)',8.50,'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800'),
  ('PN-020-007','Dust Mask Respirator',15.00,'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800'),
  ('PN-020-008','Coal Sample Kit',38.00,'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800'),
  ('PN-020-009','Mining Lamp Battery',32.00,'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800'),
  ('PN-020-010','Conveyor Belt Section',180.00,'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800'),
  ('PN-020-011','Ear Protection Set',18.00,'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800'),

  -- Shop 021: Chitungwiza Beauty Co (Healthcare/Beauty)
  ('PN-021-001','Shea Butter Moisturiser',8.50,'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'),
  ('PN-021-002','Natural Hair Shampoo',6.50,'https://images.unsplash.com/photo-1522335789203-aaa8e7f9b3da?w=800'),
  ('PN-021-003','Hair Conditioner 500ml',7.00,'https://images.unsplash.com/photo-1522335789203-aaa8e7f9b3da?w=800'),
  ('PN-021-004','Body Lotion 400ml',5.50,'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800'),
  ('PN-021-005','Face Cream Anti-Aging',15.00,'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800'),
  ('PN-021-006','Lip Balm',2.50,'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800'),
  ('PN-021-007','Nail Polish',3.50,'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800'),
  ('PN-021-008','Makeup Brush Set',18.00,'https://images.unsplash.com/photo-1522335789203-aaa8e7f9b3da?w=800'),
  ('PN-021-009','Perfume 50ml',25.00,'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800'),
  ('PN-021-010','Hair Braiding Extension',12.00,'https://images.unsplash.com/photo-1522335789203-aaa8e7f9b3da?w=800'),
  ('PN-021-011','Bath Soap (Pack of 4)',5.00,'https://images.unsplash.com/photo-1607006483224-75d0686b06b1?w=800'),

  -- Shop 022: Victoria Falls Adventure Gear (Hospitality)
  ('PN-022-001','Hiking Backpack 50L',55.00,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'),
  ('PN-022-002','Camping Tent (4-person)',95.00,'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'),
  ('PN-022-003','Sleeping Bag',38.00,'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'),
  ('PN-022-004','Hiking Boots',65.00,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'),
  ('PN-022-005','Water Bottle 1L',8.50,'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800'),
  ('PN-022-006','Headlamp Torch',18.00,'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800'),
  ('PN-022-007','Camping Stove',45.00,'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'),
  ('PN-022-008','Binoculars',75.00,'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'),
  ('PN-022-009','Insect Repellent',5.50,'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800'),
  ('PN-022-010','First Aid Travel Kit',22.00,'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800'),
  ('PN-022-011','Travel Adapter Plug',8.00,'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800')
)
UPDATE products p
SET name = c.pname,
    price = c.pprice,
    main_image_url = c.pimg,
    gallery_images = jsonb_build_array(
      c.pimg,
      c.pimg || '&sat=-30',
      c.pimg || '&blur=10',
      c.pimg || '&fit=crop&crop=center'
    ),
    description = 'Quality ' || c.pname || ' available at ' || s.name || '. Locally sourced and verified.',
    updated_at = now()
FROM catalog c, shops s
WHERE p.sku = c.sku
  AND p.shop_id = s.id;
