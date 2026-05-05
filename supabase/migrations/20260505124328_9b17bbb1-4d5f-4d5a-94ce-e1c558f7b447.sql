
DO $$
DECLARE
  mapping JSONB := '[
    {"old":"owner1@industryhub.local","first":"Tendai","last":"Moyo"},
    {"old":"owner2@industryhub.local","first":"Tatenda","last":"Ncube"},
    {"old":"owner3@industryhub.local","first":"Farai","last":"Chirwa"},
    {"old":"owner4@industryhub.local","first":"Tinashe","last":"Mlambo"},
    {"old":"owner5@industryhub.local","first":"Rumbidzai","last":"Sibanda"},
    {"old":"owner6@industryhub.local","first":"Chipo","last":"Mutasa"},
    {"old":"owner7@industryhub.local","first":"Takudzwa","last":"Dube"},
    {"old":"owner8@industryhub.local","first":"Kudzai","last":"Chigumba"},
    {"old":"owner9@industryhub.local","first":"Nyasha","last":"Marufu"},
    {"old":"owner10@industryhub.local","first":"Tapiwa","last":"Mhlanga"},
    {"old":"owner11@industryhub.local","first":"Vimbai","last":"Nyathi"},
    {"old":"owner12@industryhub.local","first":"Munashe","last":"Chivasa"},
    {"old":"owner13@industryhub.local","first":"Rutendo","last":"Mapfumo"},
    {"old":"owner14@industryhub.local","first":"Panashe","last":"Zhou"},
    {"old":"owner15@industryhub.local","first":"Shamiso","last":"Mukamuri"},
    {"old":"owner16@industryhub.local","first":"Blessing","last":"Madziva"},
    {"old":"owner17@industryhub.local","first":"Tariro","last":"Bhebhe"},
    {"old":"owner18@industryhub.local","first":"Simbarashe","last":"Gumbo"},
    {"old":"owner19@industryhub.local","first":"Anesu","last":"Chikomba"},
    {"old":"owner20@industryhub.local","first":"Tafadzwa","last":"Nkomo"},
    {"old":"owner21@industryhub.local","first":"Ropafadzo","last":"Mawere"},
    {"old":"owner22@industryhub.local","first":"Mukundi","last":"Shumba"}
  ]'::jsonb;
  item JSONB;
  new_email TEXT;
  uid UUID;
  existing_profile UUID;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(mapping)
  LOOP
    new_email := lower(item->>'first') || '.' || lower(item->>'last') || '@gmail.com';

    SELECT id INTO uid FROM auth.users WHERE email = item->>'old';
    IF uid IS NULL THEN CONTINUE; END IF;

    UPDATE auth.users
      SET email = new_email,
          raw_user_meta_data = COALESCE(raw_user_meta_data,'{}'::jsonb)
            || jsonb_build_object('first_name', item->>'first', 'last_name', item->>'last', 'full_name', (item->>'first')||' '||(item->>'last'))
      WHERE id = uid;

    UPDATE auth.identities
      SET identity_data = COALESCE(identity_data,'{}'::jsonb)
        || jsonb_build_object('email', new_email, 'first_name', item->>'first', 'last_name', item->>'last')
      WHERE user_id = uid AND provider = 'email';

    SELECT id INTO existing_profile FROM public.user_profiles WHERE user_id = uid LIMIT 1;
    IF existing_profile IS NOT NULL THEN
      UPDATE public.user_profiles
        SET first_name = item->>'first',
            last_name = item->>'last',
            updated_at = now()
        WHERE id = existing_profile;
    ELSE
      INSERT INTO public.user_profiles (user_id, first_name, last_name)
        VALUES (uid, item->>'first', item->>'last');
    END IF;
  END LOOP;
END $$;
