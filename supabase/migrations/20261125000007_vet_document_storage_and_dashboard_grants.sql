-- Private storage for veterinarian licensing documents.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vet-verification-documents',
    'vet-verification-documents',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Vets upload own verification documents" ON storage.objects;
CREATE POLICY "Vets upload own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'vet-verification-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "Vets and admins read verification documents" ON storage.objects;
CREATE POLICY "Vets and admins read verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'vet-verification-documents'
    AND (
        (storage.foldername(name))[1] = (SELECT auth.uid()::text)
        OR public.current_user_role() = 'admin'
    )
);

DROP POLICY IF EXISTS "Vets delete own verification documents" ON storage.objects;
CREATE POLICY "Vets delete own verification documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'vet-verification-documents'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

GRANT SELECT, INSERT, DELETE ON TABLE storage.objects TO authenticated;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.veterinarian_profiles TO authenticated;
GRANT UPDATE (
    license_number,
    syndicate_card_url,
    years_of_experience,
    specializations,
    education,
    bio,
    consultation_fee,
    emergency_available,
    clinic_affiliation_name,
    updated_at
) ON TABLE public.veterinarian_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_veterinarian_verification(TEXT, INTEGER, TEXT) TO authenticated;

-- Dashboard reads, and veterinarian responses to their own connection requests.
GRANT SELECT ON TABLE public.medical_visits TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.pet_vet_links TO authenticated;
