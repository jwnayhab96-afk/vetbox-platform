-- Grant the Supabase Edge Function's service role only the public-table access
-- used by platform-actions. This is separate from end-user RLS permissions.
GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT ON TABLE
    public.profiles,
    public.veterinarian_profiles,
    public.pet_vet_links,
    public.pets
TO service_role;

GRANT INSERT ON TABLE
    public.notifications,
    public.audit_logs
TO service_role;
