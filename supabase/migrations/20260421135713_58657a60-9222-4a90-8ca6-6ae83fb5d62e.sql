
-- Seed 22 shop-owner auth users with password '1234' and link them to shops
DO $$
DECLARE
  shop_record RECORD;
  new_user_id UUID;
  owner_index INT := 0;
  owner_email TEXT;
  hashed_pw TEXT;
  encrypted_pw TEXT;
  fname TEXT;
  lname TEXT;
BEGIN
  -- Use bcrypt via pgcrypto for password hashing (Supabase auth uses bcrypt)
  -- Loop shops in deterministic order
  FOR shop_record IN
    SELECT id, name FROM public.shops ORDER BY created_at ASC, id ASC
  LOOP
    owner_index := owner_index + 1;
    owner_email := 'owner' || owner_index || '@industryhub.local';

    -- Check if user already exists
    SELECT id INTO new_user_id FROM auth.users WHERE email = owner_email LIMIT 1;

    IF new_user_id IS NULL THEN
      new_user_id := gen_random_uuid();
      encrypted_pw := crypt('1234', gen_salt('bf'));

      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        owner_email,
        encrypted_pw,
        now(),
        NULL,
        NULL,
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('shop_name', shop_record.name, 'role', 'user'),
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      -- Insert identity (required for email login)
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        new_user_id,
        jsonb_build_object('sub', new_user_id::text, 'email', owner_email, 'email_verified', true),
        'email',
        new_user_id::text,
        now(),
        now(),
        now()
      );
    END IF;

    -- Derive a friendly name from shop name
    fname := 'Owner';
    lname := split_part(shop_record.name, ' ', 1);

    -- Ensure user_role row exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'user')
    ON CONFLICT DO NOTHING;

    -- Ensure profile exists
    INSERT INTO public.user_profiles (user_id, first_name, last_name, company)
    VALUES (new_user_id, fname, lname, shop_record.name)
    ON CONFLICT DO NOTHING;

    -- Link this user as the shop owner
    UPDATE public.shops
       SET user_id = new_user_id
     WHERE id = shop_record.id;
  END LOOP;
END $$;
