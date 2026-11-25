-- VetBox Core PostgreSQL Schema & Row Level Security (RLS)
-- Multi-species, Owner-Vet Relationship, Clinical Visits, Vaccinations, Reminders, Audits

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'veterinarian', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vet_verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE pet_gender AS ENUM ('male', 'female', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE medical_author_role AS ENUM ('veterinarian', 'owner', 'imported');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visit_status AS ENUM ('draft', 'finalized', 'amended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'owner',
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    governorate TEXT NOT NULL DEFAULT 'Cairo',
    city TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. VETERINARIAN PROFILES
CREATE TABLE IF NOT EXISTS public.veterinarian_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_number TEXT,
    syndicate_card_url TEXT,
    years_of_experience INT NOT NULL DEFAULT 0,
    specializations TEXT[] NOT NULL DEFAULT '{}',
    education TEXT,
    bio TEXT,
    verification_status vet_verification_status NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id),
    rejection_reason TEXT,
    consultation_fee NUMERIC(10, 2) DEFAULT 200.00,
    emergency_available BOOLEAN NOT NULL DEFAULT false,
    clinic_affiliation_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CLINICS & HOSPITALS
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT,
    clinic_type TEXT NOT NULL DEFAULT 'clinic' CHECK (clinic_type IN ('clinic', 'hospital', 'center', 'mobile_unit')),
    phone TEXT NOT NULL,
    emergency_phone TEXT,
    email TEXT,
    address TEXT NOT NULL,
    governorate TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    opening_hours JSONB DEFAULT '{"everyday": "10:00 AM - 10:00 PM"}'::jsonb,
    services TEXT[] NOT NULL DEFAULT '{"examination", "vaccination", "surgery"}',
    species_treated TEXT[] NOT NULL DEFAULT '{"dogs", "cats"}',
    is_emergency_247 BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. CLINIC MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.clinic_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    vet_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'attending_vet',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(clinic_id, vet_id)
);

-- 7. PETS TABLE
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL, -- 'dog', 'cat', 'rabbit', 'bird', 'horse', 'cattle', 'sheep', 'goat', 'exotic'
    breed TEXT,
    gender pet_gender NOT NULL DEFAULT 'unknown',
    birth_date DATE,
    is_age_estimated BOOLEAN NOT NULL DEFAULT false,
    estimated_age_months INT,
    weight_kg NUMERIC(6, 2),
    weight_recorded_at DATE,
    color TEXT,
    microchip_number TEXT,
    identifying_marks TEXT,
    photo_url TEXT,
    is_spayed_neutered BOOLEAN NOT NULL DEFAULT false,
    species_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_deceased BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. PET-VET LINKS (Connections with explicit status & permissions)
CREATE TABLE IF NOT EXISTS public.pet_vet_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    vet_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id) ON DELETE CASCADE,
    status connection_status NOT NULL DEFAULT 'pending',
    permission_scope TEXT NOT NULL DEFAULT 'full_clinical_access' CHECK (permission_scope IN ('read_only', 'full_clinical_access')),
    requested_by UUID NOT NULL REFERENCES public.profiles(id),
    responded_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(pet_id, vet_id)
);

-- 9. MEDICAL VISITS
CREATE TABLE IF NOT EXISTS public.medical_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    vet_id UUID REFERENCES public.veterinarian_profiles(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    author_role medical_author_role NOT NULL,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    visit_type TEXT NOT NULL DEFAULT 'routine_checkup' CHECK (visit_type IN ('routine_checkup', 'emergency', 'follow_up', 'surgery', 'vaccination', 'home_visit', 'owner_observation')),
    visit_reason TEXT NOT NULL,
    presenting_complaints TEXT,
    clinical_examination TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    temperature_celsius NUMERIC(4, 1),
    heart_rate_bpm INT,
    respiratory_rate_bpm INT,
    is_verified_diagnosis BOOLEAN NOT NULL DEFAULT false,
    next_appointment_date DATE,
    follow_up_recommendations TEXT,
    status visit_status NOT NULL DEFAULT 'finalized',
    amendment_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. MEDICAL ENTRIES (Timeline Events)
CREATE TABLE IF NOT EXISTS public.medical_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.medical_visits(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    author_role medical_author_role NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('symptom', 'diagnosis', 'treatment', 'lab_result', 'imaging', 'surgery', 'weight_log', 'note')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_verified_by_vet BOOLEAN NOT NULL DEFAULT false,
    verified_by_vet_id UUID REFERENCES public.veterinarian_profiles(id) ON DELETE SET NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. VACCINATION RECORDS (Administered)
CREATE TABLE IF NOT EXISTS public.vaccination_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.medical_visits(id) ON DELETE SET NULL,
    administered_by_vet_id UUID REFERENCES public.veterinarian_profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    vaccine_name TEXT NOT NULL,
    target_diseases TEXT,
    administration_date DATE NOT NULL,
    next_due_date DATE,
    batch_number TEXT,
    manufacturer TEXT,
    route_of_administration TEXT DEFAULT 'Subcutaneous',
    notes TEXT,
    is_verified_by_vet BOOLEAN NOT NULL DEFAULT false,
    document_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. VACCINATION PLANS (Recommended future schedule)
CREATE TABLE IF NOT EXISTS public.vaccination_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    prescribed_by_vet_id UUID NOT NULL REFERENCES public.veterinarian_profiles(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    target_disease TEXT,
    recommended_date DATE NOT NULL,
    dose_number INT NOT NULL DEFAULT 1,
    total_doses INT NOT NULL DEFAULT 1,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'administered', 'cancelled', 'rescheduled')),
    administered_record_id UUID REFERENCES public.vaccination_records(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. MEDICATIONS
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.medical_visits(id) ON DELETE SET NULL,
    prescribed_by_vet_id UUID REFERENCES public.veterinarian_profiles(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_ongoing BOOLEAN NOT NULL DEFAULT false,
    instructions_warnings TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. REMINDERS
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('vaccination', 'medication', 'visit_followup', 'deworming', 'hygiene', 'general')),
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    due_time TIME,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. ATTACHMENTS (Medical records, labs, private documents)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES public.medical_visits(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general_document' CHECK (category IN ('lab_report', 'x_ray', 'prescription', 'vaccination_card', 'general_document')),
    title TEXT NOT NULL,
    notes TEXT,
    is_private BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. KNOWLEDGE ARTICLES
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT NOT NULL,
    species_target TEXT NOT NULL DEFAULT 'all',
    cover_image_url TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES public.veterinarian_profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    read_time_minutes INT NOT NULL DEFAULT 4,
    references_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'visit_added', 'vaccination_due', 'medication_reminder', 'system')),
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(species);
CREATE INDEX IF NOT EXISTS idx_pet_vet_links_pet ON public.pet_vet_links(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_vet_links_vet ON public.pet_vet_links(vet_id);
CREATE INDEX IF NOT EXISTS idx_pet_vet_links_status ON public.pet_vet_links(status);
CREATE INDEX IF NOT EXISTS idx_visits_pet_id ON public.medical_visits(pet_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON public.medical_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_pet_date ON public.medical_entries(pet_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_vaccines_pet ON public.vaccination_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON public.reminders(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_clinics_gov ON public.clinics(governorate);

-- 20. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_vet_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_pet_access(target_pet_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        -- User is pet owner
        SELECT 1 FROM public.pets WHERE id = target_pet_id AND owner_id = auth.uid()
        UNION
        -- User is authorized veterinarian with accepted link
        SELECT 1 FROM public.pet_vet_links
        WHERE pet_id = target_pet_id
          AND vet_id = auth.uid()
          AND status = 'accepted'
        UNION
        -- User is admin
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Public read, own profile edit
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Veterinarian Profiles: Viewable by all, editable by owner vet or admin
CREATE POLICY "Vet profiles are viewable by all" ON public.veterinarian_profiles
    FOR SELECT USING (true);
CREATE POLICY "Vets can insert own profile" ON public.veterinarian_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Vets can edit own profile" ON public.veterinarian_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Clinics: Viewable by all, managed by admins or clinic members
CREATE POLICY "Clinics are viewable by everyone" ON public.clinics
    FOR SELECT USING (true);

-- Pets: Accessible by owner or linked vet
CREATE POLICY "Owners can see their own pets" ON public.pets
    FOR SELECT USING (public.has_pet_access(id));
CREATE POLICY "Owners can insert their pets" ON public.pets
    FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their pets" ON public.pets
    FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their pets" ON public.pets
    FOR DELETE USING (auth.uid() = owner_id);

-- Pet-Vet Links: Owner and vet can see and manage according to status
CREATE POLICY "Links viewable by involved owner or vet" ON public.pet_vet_links
    FOR SELECT USING (
        auth.uid() = requested_by OR
        auth.uid() = vet_id OR
        EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
    );

CREATE POLICY "Owners can create link requests" ON public.pet_vet_links
    FOR INSERT WITH CHECK (
        auth.uid() = requested_by AND
        EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
    );

CREATE POLICY "Involved parties can update connection status" ON public.pet_vet_links
    FOR UPDATE USING (
        auth.uid() = vet_id OR
        EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
    );

-- Medical Visits & Entries: Strictly checked via has_pet_access
CREATE POLICY "Visits viewable by authorized users" ON public.medical_visits
    FOR SELECT USING (public.has_pet_access(pet_id));

CREATE POLICY "Authorized vet or owner can insert visits" ON public.medical_visits
    FOR INSERT WITH CHECK (
        public.has_pet_access(pet_id) AND
        auth.uid() = created_by AND
        -- Ensure author_role cannot be faked
        (
            (author_role = 'veterinarian' AND public.current_user_role() = 'veterinarian') OR
            (author_role = 'owner' AND public.current_user_role() = 'owner')
        )
    );

CREATE POLICY "Visits updateable by creator" ON public.medical_visits
    FOR UPDATE USING (auth.uid() = created_by);

-- Medical Entries
CREATE POLICY "Medical entries viewable by authorized users" ON public.medical_entries
    FOR SELECT USING (public.has_pet_access(pet_id));

CREATE POLICY "Authorized users can insert medical entries" ON public.medical_entries
    FOR INSERT WITH CHECK (public.has_pet_access(pet_id) AND auth.uid() = created_by);

-- Vaccinations & Medications
CREATE POLICY "Vaccinations viewable by authorized users" ON public.vaccination_records
    FOR SELECT USING (public.has_pet_access(pet_id));
CREATE POLICY "Authorized users can add vaccination records" ON public.vaccination_records
    FOR INSERT WITH CHECK (public.has_pet_access(pet_id));

CREATE POLICY "Vaccination plans viewable by authorized users" ON public.vaccination_plans
    FOR SELECT USING (public.has_pet_access(pet_id));
CREATE POLICY "Vets can manage vaccination plans" ON public.vaccination_plans
    FOR ALL USING (public.has_pet_access(pet_id) AND public.current_user_role() = 'veterinarian');

CREATE POLICY "Medications viewable by authorized users" ON public.medications
    FOR SELECT USING (public.has_pet_access(pet_id));
CREATE POLICY "Authorized users can insert medications" ON public.medications
    FOR INSERT WITH CHECK (public.has_pet_access(pet_id));

-- Reminders: Owned by user
CREATE POLICY "Reminders viewable by creator" ON public.reminders
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Reminders manageable by creator" ON public.reminders
    FOR ALL USING (auth.uid() = user_id);

-- Knowledge Articles: Published articles are public
CREATE POLICY "Published articles are public" ON public.articles
    FOR SELECT USING (is_published = true OR public.current_user_role() = 'admin');

-- Notifications
CREATE POLICY "Users can view and manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Audit Logs: Admins only
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.current_user_role() = 'admin');

-- 11. GRANT PERMISSIONS TO POSTGREST ROLES (anon, authenticated, service_role)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 12. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
    user_role_val user_role;
    user_phone TEXT;
    user_gov TEXT;
    user_license TEXT;
BEGIN
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    user_phone := NEW.raw_user_meta_data->>'phone';
    user_gov := COALESCE(NEW.raw_user_meta_data->>'governorate', 'Cairo');
    
    BEGIN
        user_role_val := (NEW.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN OTHERS THEN
        user_role_val := 'owner'::user_role;
    END;

    INSERT INTO public.profiles (id, full_name, role, phone, governorate)
    VALUES (NEW.id, user_full_name, user_role_val, user_phone, user_gov)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

    IF user_role_val = 'veterinarian' THEN
        user_license := NEW.raw_user_meta_data->>'license_number';
        INSERT INTO public.veterinarian_profiles (id, license_number, verification_status)
        VALUES (NEW.id, user_license, 'pending')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


