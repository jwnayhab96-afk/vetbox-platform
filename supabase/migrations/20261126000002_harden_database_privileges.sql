-- The original bootstrap migration granted ALL on every table to anon and authenticated.
-- RLS does not protect TRUNCATE, so remove dangerous table privileges and stop inheriting
-- the broad defaults for future application tables.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- Restore only the client permissions used by the app; row access remains controlled by RLS.
GRANT SELECT ON TABLE public.clinics TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clinics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.articles TO authenticated;
GRANT SELECT ON TABLE public.profiles, public.veterinarian_profiles, public.pets,
    public.pet_vet_links, public.medical_visits, public.medical_entries,
    public.vaccination_records, public.vaccination_plans, public.medications,
    public.reminders, public.prescriptions, public.audit_logs TO authenticated;
GRANT INSERT ON TABLE public.pets, public.pet_vet_links, public.medical_visits,
    public.medical_entries, public.vaccination_records, public.vaccination_plans,
    public.medications, public.reminders, public.prescriptions TO authenticated;
GRANT UPDATE ON TABLE public.pets, public.pet_vet_links, public.reminders,
    public.vaccination_plans TO authenticated;
GRANT DELETE ON TABLE public.pets TO authenticated;
GRANT UPDATE (status, dispensed_at, updated_at) ON TABLE public.prescriptions TO authenticated;

-- Ensure public content is read through its intended safe views.
GRANT SELECT ON TABLE public.published_articles, public.veterinarian_directory TO anon, authenticated;

-- This helper verifies the actual owner of a pet without invoking that table's RLS policy.
CREATE OR REPLACE FUNCTION public.pet_belongs_to_owner(target_pet_id UUID, target_owner_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.pets p
        WHERE p.id = target_pet_id AND p.owner_id = target_owner_id
    );
$$;
REVOKE ALL ON FUNCTION public.pet_belongs_to_owner(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pet_belongs_to_owner(UUID, UUID) TO authenticated;

-- Replace the tautological owner comparison found in the live prescription policy.
DROP POLICY IF EXISTS "Authorized vets can issue prescriptions" ON public.prescriptions;
CREATE POLICY "Authorized vets can issue prescriptions"
ON public.prescriptions FOR INSERT TO authenticated
WITH CHECK (
    veterinarian_id = (SELECT auth.uid())
    AND public.current_user_role() = 'veterinarian'::public.user_role
    AND public.has_pet_access(pet_id)
    AND public.is_verified_veterinarian((SELECT auth.uid()))
    AND public.pet_belongs_to_owner(pet_id, owner_id)
    AND status = 'active'
    AND dispensed_at IS NULL
);

-- Replace nested profile lookups with the verified-vet helper in clinical write policies.
DROP POLICY IF EXISTS "Authorized users can insert medical entries" ON public.medical_entries;
CREATE POLICY "Authorized users can insert medical entries"
ON public.medical_entries FOR INSERT TO authenticated
WITH CHECK (
    public.has_pet_access(pet_id)
    AND created_by = (SELECT auth.uid())
    AND (
        (
            author_role = 'veterinarian'::public.medical_author_role
            AND public.current_user_role() = 'veterinarian'::public.user_role
            AND verified_by_vet_id = (SELECT auth.uid())
            AND public.is_verified_veterinarian((SELECT auth.uid()))
        )
        OR
        (
            author_role = 'owner'::public.medical_author_role
            AND public.current_user_role() = 'owner'::public.user_role
            AND verified_by_vet_id IS NULL
            AND is_verified_by_vet = false
            AND public.current_user_owns_pet(pet_id)
        )
    )
);

DROP POLICY IF EXISTS "Veterinarians can add verified vaccination records" ON public.vaccination_records;
CREATE POLICY "Veterinarians can add verified vaccination records"
ON public.vaccination_records FOR INSERT TO authenticated
WITH CHECK (
    public.has_pet_access(pet_id)
    AND created_by = (SELECT auth.uid())
    AND public.current_user_role() = 'veterinarian'::public.user_role
    AND administered_by_vet_id = (SELECT auth.uid())
    AND is_verified_by_vet = true
    AND public.is_verified_veterinarian((SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Veterinarians can prescribe medications" ON public.medications;
CREATE POLICY "Veterinarians can prescribe medications"
ON public.medications FOR INSERT TO authenticated
WITH CHECK (
    public.has_pet_access(pet_id)
    AND created_by = (SELECT auth.uid())
    AND public.current_user_role() = 'veterinarian'::public.user_role
    AND prescribed_by_vet_id = (SELECT auth.uid())
    AND public.is_verified_veterinarian((SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Verified vets can manage vaccination plans" ON public.vaccination_plans;
CREATE POLICY "Verified vets can manage vaccination plans"
ON public.vaccination_plans FOR ALL TO authenticated
USING (
    public.has_pet_access(pet_id)
    AND public.current_user_role() = 'veterinarian'::public.user_role
    AND public.is_verified_veterinarian((SELECT auth.uid()))
)
WITH CHECK (
    public.has_pet_access(pet_id)
    AND public.current_user_role() = 'veterinarian'::public.user_role
    AND prescribed_by_vet_id = (SELECT auth.uid())
    AND public.is_verified_veterinarian((SELECT auth.uid()))
);

-- Keep owner UI read-only for dispensing; prescription status changes belong to the vet/RPC.
REVOKE UPDATE ON TABLE public.prescriptions FROM authenticated;
GRANT UPDATE (status, dispensed_at, updated_at) ON TABLE public.prescriptions TO authenticated;
