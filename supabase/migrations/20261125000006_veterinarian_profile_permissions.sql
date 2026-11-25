-- Client-side veterinarian profile reads/edits and verification RPC access.
-- Row-level security continues to restrict rows to the owning veterinarian/admin.
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
