-- Keep public profiles in sync with Supabase Auth, including users created
-- before the signup trigger was installed.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    requested_role TEXT;
    safe_role public.user_role;
BEGIN
    requested_role := NEW.raw_user_meta_data->>'role';
    safe_role := CASE
        WHEN requested_role = 'veterinarian' THEN 'veterinarian'::public.user_role
        ELSE 'owner'::public.user_role
    END;

    INSERT INTO public.profiles (id, full_name, role, phone, governorate)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
        safe_role,
        NULLIF(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'governorate', ''), 'Cairo')
    )
    ON CONFLICT (id) DO NOTHING;

    IF safe_role = 'veterinarian' THEN
        INSERT INTO public.veterinarian_profiles (id, license_number, verification_status)
        VALUES (NEW.id, NULLIF(NEW.raw_user_meta_data->>'license_number', ''), 'pending')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing Auth users whose corresponding public profile is missing.
INSERT INTO public.profiles (id, full_name, role, phone, governorate)
SELECT
    u.id,
    COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)),
    CASE WHEN u.raw_user_meta_data->>'role' = 'veterinarian'
        THEN 'veterinarian'::public.user_role
        ELSE 'owner'::public.user_role
    END,
    NULLIF(u.raw_user_meta_data->>'phone', ''),
    COALESCE(NULLIF(u.raw_user_meta_data->>'governorate', ''), 'Cairo')
FROM auth.users AS u
LEFT JOIN public.profiles AS p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.veterinarian_profiles (id, license_number, verification_status)
SELECT p.id, NULLIF(u.raw_user_meta_data->>'license_number', ''), 'pending'
FROM auth.users AS u
JOIN public.profiles AS p ON p.id = u.id
LEFT JOIN public.veterinarian_profiles AS vp ON vp.id = p.id
WHERE p.role = 'veterinarian'::public.user_role
  AND vp.id IS NULL
ON CONFLICT (id) DO NOTHING;
