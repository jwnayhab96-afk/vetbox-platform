-- Production hardening and tables used by the live application.
-- Apply with `supabase db push` before deploying the application.

CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rx_number TEXT NOT NULL UNIQUE,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    veterinarian_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id) ON DELETE RESTRICT,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    diagnosis TEXT NOT NULL,
    clinical_notes TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    qr_verification_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dispensed', 'expired')),
    dispensed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (jsonb_typeof(items) = 'array')
);

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.has_pet_access(target_pet_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.pets WHERE id = target_pet_id AND owner_id = auth.uid()
        UNION
        SELECT 1 FROM public.pet_vet_links
        WHERE pet_id = target_pet_id AND vet_id = auth.uid() AND status = 'accepted'
        UNION
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

-- Keep personal contact details private while exposing only approved directory fields.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;
CREATE POLICY "Users and admins can view profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR public.current_user_role() = 'admin' OR EXISTS (
            SELECT 1 FROM public.pet_vet_links l
            JOIN public.pets p ON p.id = l.pet_id
            WHERE l.status IN ('pending', 'accepted')
              AND ((profiles.id = l.vet_id AND p.owner_id = auth.uid())
                OR (profiles.id = p.owner_id AND l.vet_id = auth.uid()))
        )
    );

DROP POLICY IF EXISTS "Vet profiles are viewable by all" ON public.veterinarian_profiles;
DROP POLICY IF EXISTS "Vets and connected parties can view veterinarian profiles" ON public.veterinarian_profiles;
CREATE POLICY "Vets and connected parties can view veterinarian profiles" ON public.veterinarian_profiles
    FOR SELECT USING (
        auth.uid() = id OR public.current_user_role() = 'admin' OR EXISTS (
            SELECT 1 FROM public.pet_vet_links l
            JOIN public.pets p ON p.id = l.pet_id
            WHERE l.vet_id = veterinarian_profiles.id AND l.status IN ('pending', 'accepted')
              AND (l.requested_by = auth.uid() OR p.owner_id = auth.uid() OR l.vet_id = auth.uid())
        )
    );

CREATE OR REPLACE VIEW public.veterinarian_directory WITH (security_barrier = true) AS
SELECT vp.id, vp.license_number, vp.years_of_experience, vp.specializations, vp.education, vp.bio,
       vp.verification_status, vp.verified_at, vp.consultation_fee, vp.emergency_available,
       vp.clinic_affiliation_name, vp.created_at, vp.updated_at,
       jsonb_build_object('id', p.id, 'full_name', p.full_name, 'avatar_url', p.avatar_url,
                          'governorate', p.governorate, 'city', p.city) AS profile
FROM public.veterinarian_profiles vp
JOIN public.profiles p ON p.id = vp.id
WHERE vp.verification_status = 'verified';
GRANT SELECT ON public.veterinarian_directory TO anon, authenticated;

CREATE OR REPLACE VIEW public.published_articles WITH (security_barrier = true) AS
SELECT a.*,
       CASE WHEN reviewer.id IS NULL THEN NULL ELSE
         jsonb_build_object('id', reviewer.id, 'profile', jsonb_build_object('id', rp.id, 'full_name', rp.full_name, 'avatar_url', rp.avatar_url))
       END AS reviewer
FROM public.articles a
LEFT JOIN public.veterinarian_profiles reviewer ON reviewer.id = a.reviewer_id
LEFT JOIN public.profiles rp ON rp.id = reviewer.id
WHERE a.is_published = true;
GRANT SELECT ON public.published_articles TO anon, authenticated;

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.prescriptions TO authenticated;
DROP POLICY IF EXISTS "Prescription parties can view prescriptions" ON public.prescriptions;
CREATE POLICY "Prescription parties can view prescriptions" ON public.prescriptions
    FOR SELECT USING (
        owner_id = auth.uid() OR veterinarian_id = auth.uid() OR public.current_user_role() = 'admin'
    );
DROP POLICY IF EXISTS "Authorized vets can issue prescriptions" ON public.prescriptions;
CREATE POLICY "Authorized vets can issue prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (
        veterinarian_id = auth.uid()
        AND public.current_user_role() = 'veterinarian'
        AND public.has_pet_access(pet_id)
        AND EXISTS (SELECT 1 FROM public.veterinarian_profiles WHERE id = auth.uid() AND verification_status = 'verified')
        AND EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_id AND p.owner_id = owner_id)
    );
DROP POLICY IF EXISTS "Vets and admins can update prescriptions" ON public.prescriptions;
CREATE POLICY "Vets and admins can update prescriptions" ON public.prescriptions
    FOR UPDATE USING (veterinarian_id = auth.uid() OR public.current_user_role() = 'admin')
    WITH CHECK (veterinarian_id = auth.uid() OR public.current_user_role() = 'admin');

-- A signup form must never be able to create an administrator account.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    requested_role TEXT;
    safe_role public.user_role;
BEGIN
    requested_role := NEW.raw_user_meta_data->>'role';
    safe_role := CASE WHEN requested_role = 'veterinarian' THEN 'veterinarian'::public.user_role ELSE 'owner'::public.user_role END;

    INSERT INTO public.profiles (id, full_name, role, phone, governorate)
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
        safe_role,
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'governorate', ''), 'Cairo')
    )
    ON CONFLICT (id) DO NOTHING;

    IF safe_role = 'veterinarian' THEN
        INSERT INTO public.veterinarian_profiles (id, license_number, verification_status)
        VALUES (NEW.id, NEW.raw_user_meta_data->>'license_number', 'pending')
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Users may edit contact/profile fields but cannot promote themselves or change roles.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url, governorate, city, updated_at) ON public.profiles TO authenticated;

-- Only administrators may change veterinarian approval fields; vets may edit their public bio/details.
DROP POLICY IF EXISTS "Vets can edit own profile" ON public.veterinarian_profiles;
CREATE POLICY "Vets can edit own profile" ON public.veterinarian_profiles
    FOR UPDATE USING (auth.uid() = id OR public.current_user_role() = 'admin')
    WITH CHECK (auth.uid() = id OR public.current_user_role() = 'admin');
REVOKE UPDATE ON public.veterinarian_profiles FROM authenticated;
GRANT UPDATE (license_number, syndicate_card_url, years_of_experience, specializations, education, bio, consultation_fee, emergency_available, clinic_affiliation_name, updated_at)
    ON public.veterinarian_profiles TO authenticated;
CREATE OR REPLACE FUNCTION public.review_veterinarian(
    target_vet_id UUID,
    new_status public.vet_verification_status,
    reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    IF public.current_user_role() <> 'admin' THEN
        RAISE EXCEPTION 'Administrator role required';
    END IF;
    UPDATE public.veterinarian_profiles
    SET verification_status = new_status,
        verified_at = CASE WHEN new_status = 'verified' THEN now() ELSE NULL END,
        verified_by = auth.uid(),
        rejection_reason = CASE WHEN new_status = 'rejected' THEN reason ELSE NULL END,
        updated_at = now()
    WHERE id = target_vet_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Veterinarian profile not found';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
REVOKE ALL ON FUNCTION public.review_veterinarian(UUID, public.vet_verification_status, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_veterinarian(UUID, public.vet_verification_status, TEXT) TO authenticated;
CREATE OR REPLACE FUNCTION public.submit_veterinarian_verification(
    license TEXT,
    experience_years INTEGER,
    education_text TEXT
)
RETURNS VOID AS $$
BEGIN
    IF public.current_user_role() <> 'veterinarian' THEN
        RAISE EXCEPTION 'Veterinarian role required';
    END IF;
    UPDATE public.veterinarian_profiles
    SET license_number = license,
        years_of_experience = GREATEST(0, experience_years),
        education = education_text,
    verification_status = CASE WHEN verification_status = 'verified' THEN 'verified'::public.vet_verification_status ELSE 'pending'::public.vet_verification_status END,
        updated_at = now()
    WHERE id = auth.uid();
    IF NOT FOUND THEN RAISE EXCEPTION 'Veterinarian profile not found'; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
REVOKE ALL ON FUNCTION public.submit_veterinarian_verification(TEXT, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_veterinarian_verification(TEXT, INTEGER, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.verify_prescription(number TEXT)
RETURNS JSONB AS $$
    SELECT jsonb_build_object(
        'id', p.id, 'rx_number', p.rx_number, 'pet_id', p.pet_id,
        'pet_name', pet.name, 'pet_species', pet.species, 'pet_breed', pet.breed,
        'owner_name', NULL,
        'owner_phone', NULL, 'veterinarian_id', p.veterinarian_id,
        'veterinarian_name', vet_profile.full_name, 'veterinarian_license', vp.license_number,
        'clinic_name', COALESCE(c.name_ar, c.name, vp.clinic_affiliation_name, ''),
        'clinic_phone', c.phone, 'clinic_address', c.address,
        'diagnosis', p.diagnosis, 'clinical_notes', p.clinical_notes,
        'issue_date', p.issue_date, 'valid_until', p.valid_until,
        'items', p.items, 'qr_verification_code', p.qr_verification_code,
        'status', p.status, 'created_at', p.created_at
    )
    FROM public.prescriptions p
    JOIN public.pets pet ON pet.id = p.pet_id
    JOIN public.profiles owner_profile ON owner_profile.id = p.owner_id
    JOIN public.veterinarian_profiles vp ON vp.id = p.veterinarian_id
    JOIN public.profiles vet_profile ON vet_profile.id = vp.id
    LEFT JOIN public.clinics c ON c.id = p.clinic_id
    WHERE p.rx_number = number
      AND p.veterinarian_id IS NOT NULL
      AND vp.verification_status = 'verified'
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';
REVOKE ALL ON FUNCTION public.verify_prescription(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_prescription(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.verify_pet_passport(target_pet_id UUID)
RETURNS JSONB AS $$
    SELECT jsonb_build_object(
        'id', p.id, 'name', p.name, 'species', p.species, 'breed', p.breed,
        'gender', p.gender, 'birth_date', p.birth_date, 'is_age_estimated', p.is_age_estimated,
        'estimated_age_months', p.estimated_age_months, 'photo_url', p.photo_url,
        'microchip_number', p.microchip_number, 'identifying_marks', p.identifying_marks,
        'created_at', p.created_at
    )
    FROM public.pets p
    WHERE p.id = target_pet_id AND p.is_deceased = false
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';
REVOKE ALL ON FUNCTION public.verify_pet_passport(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_pet_passport(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mark_prescription_dispensed(target_prescription_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.prescriptions
    SET status = 'dispensed', dispensed_at = now(), updated_at = now()
    WHERE id = target_prescription_id
      AND status = 'active'
      AND (public.current_user_role() = 'admin' OR (
        veterinarian_id = auth.uid() AND EXISTS (
          SELECT 1 FROM public.veterinarian_profiles WHERE id = auth.uid() AND verification_status = 'verified'
        )
      ));
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Prescription is unavailable or you are not authorized to confirm dispensing';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
REVOKE ALL ON FUNCTION public.mark_prescription_dispensed(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_prescription_dispensed(UUID) TO authenticated;

-- Admin-only writes for public directory and editorial content.
DROP POLICY IF EXISTS "Clinics are viewable by everyone" ON public.clinics;
CREATE POLICY "Clinics are viewable by everyone" ON public.clinics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage clinics" ON public.clinics;
CREATE POLICY "Admins manage clinics" ON public.clinics FOR ALL
    USING (public.current_user_role() = 'admin') WITH CHECK (public.current_user_role() = 'admin');
DROP POLICY IF EXISTS "Admins manage articles" ON public.articles;
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL
    USING (public.current_user_role() = 'admin') WITH CHECK (public.current_user_role() = 'admin');

-- Enforce author identity and role-specific attribution on clinical records.
DROP POLICY IF EXISTS "Authorized vet or owner can insert visits" ON public.medical_visits;
CREATE POLICY "Authorized vet or owner can insert visits" ON public.medical_visits
    FOR INSERT WITH CHECK (
        public.has_pet_access(pet_id) AND created_by = auth.uid() AND
        ((author_role = 'veterinarian' AND public.current_user_role() = 'veterinarian' AND vet_id = auth.uid() AND
            EXISTS (SELECT 1 FROM public.veterinarian_profiles WHERE id = auth.uid() AND verification_status = 'verified')) OR
         (author_role = 'owner' AND public.current_user_role() = 'owner' AND EXISTS (
            SELECT 1 FROM public.pets p WHERE p.id = pet_id AND p.owner_id = auth.uid()
         )))
    );

DROP POLICY IF EXISTS "Authorized users can insert medical entries" ON public.medical_entries;
CREATE POLICY "Authorized users can insert medical entries" ON public.medical_entries
    FOR INSERT WITH CHECK (
        public.has_pet_access(pet_id) AND created_by = auth.uid() AND
        ((author_role = 'veterinarian' AND public.current_user_role() = 'veterinarian' AND verified_by_vet_id = auth.uid() AND
            EXISTS (SELECT 1 FROM public.veterinarian_profiles WHERE id = auth.uid() AND verification_status = 'verified')) OR
         (author_role = 'owner' AND public.current_user_role() = 'owner' AND verified_by_vet_id IS NULL AND is_verified_by_vet = false))
    );

DROP POLICY IF EXISTS "Authorized users can add vaccination records" ON public.vaccination_records;
DROP POLICY IF EXISTS "Veterinarians can add verified vaccination records" ON public.vaccination_records;
CREATE POLICY "Veterinarians can add verified vaccination records" ON public.vaccination_records
    FOR INSERT WITH CHECK (
        public.has_pet_access(pet_id) AND created_by = auth.uid()
        AND public.current_user_role() = 'veterinarian'
        AND administered_by_vet_id = auth.uid()
        AND is_verified_by_vet = true
        AND EXISTS (SELECT 1 FROM public.veterinarian_profiles WHERE id = auth.uid() AND verification_status = 'verified')
    );

DROP POLICY IF EXISTS "Authorized users can insert medications" ON public.medications;
DROP POLICY IF EXISTS "Veterinarians can prescribe medications" ON public.medications;
CREATE POLICY "Veterinarians can prescribe medications" ON public.medications
    FOR INSERT WITH CHECK (
        public.has_pet_access(pet_id) AND created_by = auth.uid()
        AND public.current_user_role() = 'veterinarian'
        AND prescribed_by_vet_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.veterinarian_profiles WHERE id = auth.uid() AND verification_status = 'verified')
    );

DROP POLICY IF EXISTS "Vets can manage vaccination plans" ON public.vaccination_plans;
DROP POLICY IF EXISTS "Verified vets can manage vaccination plans" ON public.vaccination_plans;
CREATE POLICY "Verified vets can manage vaccination plans" ON public.vaccination_plans
    FOR ALL USING (
        public.has_pet_access(pet_id) AND public.current_user_role() = 'veterinarian'
        AND EXISTS (SELECT 1 FROM public.veterinarian_profiles WHERE id = auth.uid() AND verification_status = 'verified')
    ) WITH CHECK (
        public.has_pet_access(pet_id) AND public.current_user_role() = 'veterinarian'
        AND prescribed_by_vet_id = auth.uid()
        AND EXISTS (SELECT 1 FROM public.veterinarian_profiles WHERE id = auth.uid() AND verification_status = 'verified')
    );

DROP POLICY IF EXISTS "Reminders manageable by creator" ON public.reminders;
CREATE POLICY "Reminders manageable by creator" ON public.reminders
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id AND EXISTS (
        SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Owners can create link requests" ON public.pet_vet_links;
CREATE POLICY "Owners can create link requests" ON public.pet_vet_links
    FOR INSERT WITH CHECK (
        auth.uid() = requested_by
        AND EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
        AND EXISTS (SELECT 1 FROM public.veterinarian_profiles WHERE id = vet_id AND verification_status = 'verified')
    );

CREATE OR REPLACE FUNCTION public.guard_pet_vet_link_update()
RETURNS TRIGGER AS $$
DECLARE owner_id UUID;
BEGIN
    IF NEW.pet_id <> OLD.pet_id OR NEW.vet_id <> OLD.vet_id OR NEW.requested_by <> OLD.requested_by THEN
        RAISE EXCEPTION 'Connection participants cannot be changed';
    END IF;
    IF public.current_user_role() = 'admin' THEN RETURN NEW; END IF;
    SELECT p.owner_id INTO owner_id FROM public.pets p WHERE p.id = OLD.pet_id;
    IF auth.uid() = OLD.vet_id AND OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected') THEN
        RETURN NEW;
    END IF;
    IF auth.uid() = owner_id AND NEW.status = 'revoked' AND OLD.status IN ('pending', 'accepted') THEN
        RETURN NEW;
    END IF;
    IF auth.uid() = OLD.vet_id AND NEW.status = 'revoked' AND OLD.status = 'accepted' THEN
        RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Invalid connection status transition';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
DROP TRIGGER IF EXISTS guard_pet_vet_link_update_trigger ON public.pet_vet_links;
CREATE TRIGGER guard_pet_vet_link_update_trigger
    BEFORE UPDATE ON public.pet_vet_links
    FOR EACH ROW EXECUTE FUNCTION public.guard_pet_vet_link_update();

-- Make administration actions auditable in the database.
CREATE OR REPLACE FUNCTION public.review_veterinarian(
    target_vet_id UUID,
    new_status public.vet_verification_status,
    reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    IF public.current_user_role() <> 'admin' THEN RAISE EXCEPTION 'Administrator role required'; END IF;
    UPDATE public.veterinarian_profiles
    SET verification_status = new_status,
        verified_at = CASE WHEN new_status = 'verified' THEN now() ELSE NULL END,
        verified_by = auth.uid(), rejection_reason = CASE WHEN new_status = 'rejected' THEN reason ELSE NULL END,
        updated_at = now()
    WHERE id = target_vet_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Veterinarian profile not found'; END IF;
    INSERT INTO public.audit_logs(user_id, action, resource_type, resource_id, metadata)
    VALUES(auth.uid(), 'VETERINARIAN_REVIEWED', 'veterinarian_profile', target_vet_id,
        jsonb_build_object('status', new_status, 'reason', reason));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

