
-- Update Zimbabwe shop registration document requirements with specific documents
DELETE FROM public.shop_document_requirements WHERE country_code = 'ZW';

INSERT INTO public.shop_document_requirements (document_type, document_name, description, country_code, is_required) VALUES
('trading_license', 'Trading License', 'Valid trading license issued by local municipal authorities', 'ZW', true),
('tax_clearance', 'Tax Clearance Certificate', 'Current tax clearance certificate from ZIMRA (Zimbabwe Revenue Authority)', 'ZW', true),
('vat_certificate', 'VAT Registration Certificate', 'VAT registration certificate if your business is VAT registered', 'ZW', false),
('fire_certificate', 'Fire Safety Certificate', 'Fire department safety clearance certificate for business premises', 'ZW', true),
('business_license', 'Business License', 'Valid business operating license issued by relevant authorities', 'ZW', true),
('company_registration', 'Company Registration Certificate', 'Certificate of incorporation from Companies and Intellectual Property Registry', 'ZW', true);
