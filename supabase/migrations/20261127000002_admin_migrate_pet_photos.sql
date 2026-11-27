-- Allow the administrator to migrate legacy pet image URLs without granting
-- broad UPDATE access to every column in public.pets.
CREATE OR REPLACE FUNCTION public.admin_set_pet_photo(target_pet_id UUID, new_photo_url TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
BEGIN
    IF public.current_user_role() IS DISTINCT FROM 'admin'::public.user_role THEN
        RAISE EXCEPTION 'Administrator role required';
    END IF;

    UPDATE public.pets
    SET photo_url = new_photo_url,
        updated_at = now()
    WHERE id = target_pet_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pet not found';
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_pet_photo(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_pet_photo(UUID, TEXT) TO authenticated;
