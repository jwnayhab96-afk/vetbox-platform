-- Allow authenticated clients to submit and read clinical visits.
-- RLS below still restricts inserts to the pet owner or an authorized, verified veterinarian.
GRANT SELECT, INSERT ON TABLE public.medical_visits TO authenticated;

DROP POLICY IF EXISTS "Authorized vet or owner can insert visits" ON public.medical_visits;
CREATE POLICY "Authorized vet or owner can insert visits"
ON public.medical_visits FOR INSERT TO authenticated
WITH CHECK (
    public.has_pet_access(pet_id)
    AND created_by = (SELECT auth.uid())
    AND (
        (
            author_role = 'veterinarian'::public.medical_author_role
            AND public.current_user_role() = 'veterinarian'::public.user_role
            AND vet_id = (SELECT auth.uid())
            AND public.is_verified_veterinarian((SELECT auth.uid()))
        )
        OR
        (
            author_role = 'owner'::public.medical_author_role
            AND public.current_user_role() = 'owner'::public.user_role
            AND vet_id IS NULL
            AND public.current_user_owns_pet(pet_id)
        )
    )
);
