-- Admin read/write permissions. Existing RLS policies continue to restrict
-- admin-only operations on clinics, articles, and audit logs.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE
    public.profiles,
    public.veterinarian_profiles,
    public.pets,
    public.clinics,
    public.articles,
    public.audit_logs
TO authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.clinics, public.articles TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_veterinarian(UUID, public.vet_verification_status, TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    platform_name TEXT NOT NULL DEFAULT 'فيت بوكس (VetBox)',
    support_email TEXT NOT NULL DEFAULT 'johnehab.m@gmail.com',
    emergency_hotline TEXT NOT NULL DEFAULT '0227508900',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

INSERT INTO public.platform_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage platform settings" ON public.platform_settings;
CREATE POLICY "Admins manage platform settings"
ON public.platform_settings
FOR ALL
TO authenticated
USING (public.current_user_role() = 'admin')
WITH CHECK (public.current_user_role() = 'admin');

GRANT SELECT, UPDATE ON TABLE public.platform_settings TO authenticated;
