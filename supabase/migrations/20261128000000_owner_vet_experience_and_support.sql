-- Practical directory hours, verified owner reviews, and in-app support tickets.
ALTER TABLE public.veterinarian_profiles
  ADD COLUMN IF NOT EXISTS opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.veterinarian_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veterinarian_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT CHECK (char_length(review) <= 1200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (veterinarian_id, owner_id)
);
ALTER TABLE public.veterinarian_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.veterinarian_reviews FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_veterinarian_review(target_vet_id UUID, target_rating INTEGER, target_review TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'owner'::public.user_role THEN
    RAISE EXCEPTION 'Owner account required';
  END IF;
  IF target_rating NOT BETWEEN 1 AND 5 OR char_length(coalesce(target_review, '')) > 1200 THEN
    RAISE EXCEPTION 'Invalid review';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.pets p
    JOIN public.pet_vet_links l ON l.pet_id = p.id AND l.vet_id = target_vet_id AND l.status = 'accepted'
    JOIN public.medical_visits v ON v.pet_id = p.id AND v.vet_id = target_vet_id
      AND v.author_role = 'veterinarian' AND v.status = 'finalized'
    WHERE p.owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'A completed visit with this veterinarian is required';
  END IF;
  INSERT INTO public.veterinarian_reviews (veterinarian_id, owner_id, rating, review)
  VALUES (target_vet_id, auth.uid(), target_rating, nullif(btrim(target_review), ''))
  ON CONFLICT (veterinarian_id, owner_id) DO UPDATE
    SET rating = EXCLUDED.rating, review = EXCLUDED.review, updated_at = now();
END;
$$;
REVOKE ALL ON FUNCTION public.submit_veterinarian_review(UUID, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_veterinarian_review(UUID, INTEGER, TEXT) TO authenticated;

CREATE OR REPLACE VIEW public.veterinarian_directory WITH (security_barrier = true) AS
SELECT vp.id, vp.license_number, vp.years_of_experience, vp.specializations, vp.education, vp.bio,
       vp.verification_status, vp.verified_at, vp.consultation_fee, vp.emergency_available,
       vp.clinic_affiliation_name, vp.created_at, vp.updated_at,
       jsonb_build_object('id', p.id, 'full_name', p.full_name, 'avatar_url', p.avatar_url,
                          'governorate', p.governorate, 'city', p.city) AS profile,
       vp.opening_hours,
       COALESCE(r.average_rating, 0)::numeric(3,1) AS average_rating,
       COALESCE(r.rating_count, 0)::bigint AS rating_count
FROM public.veterinarian_profiles vp
JOIN public.profiles p ON p.id = vp.id
LEFT JOIN (
  SELECT veterinarian_id, avg(rating)::numeric(3,1) AS average_rating, count(*) AS rating_count
  FROM public.veterinarian_reviews GROUP BY veterinarian_id
) r ON r.veterinarian_id = vp.id
WHERE vp.verification_status = 'verified';
GRANT SELECT ON public.veterinarian_directory TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('account', 'pet_link', 'medical_record', 'notification', 'technical', 'other')),
  subject TEXT NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 160),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 5 AND 4000),
  page_path TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.support_tickets FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
DROP POLICY IF EXISTS "Users read own support tickets or admins read all" ON public.support_tickets;
CREATE POLICY "Users read own support tickets or admins read all" ON public.support_tickets
  FOR SELECT USING (user_id = auth.uid() OR public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Users create own support tickets" ON public.support_tickets;
CREATE POLICY "Users create own support tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins update support tickets" ON public.support_tickets;
CREATE POLICY "Admins update support tickets" ON public.support_tickets
  FOR UPDATE USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');
