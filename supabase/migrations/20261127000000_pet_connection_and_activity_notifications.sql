-- Make owners' own pets directly visible in the vet directory connection flow,
-- and generate trusted notifications for link, visit, and vaccination events.

DROP POLICY IF EXISTS "Owners can see their own pets" ON public.pets;
CREATE POLICY "Owners can see their own pets"
ON public.pets FOR SELECT TO authenticated
USING (public.current_user_owns_pet(id) OR public.has_pet_access(id));

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'connection_request',
        'connection_accepted',
        'visit_added',
        'vaccination_added',
        'vaccination_due',
        'medication_reminder',
        'system'
    ));

CREATE OR REPLACE FUNCTION public.notify_pet_vet_link_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
    pet_name TEXT;
    vet_name TEXT;
BEGIN
    SELECT p.name INTO pet_name FROM public.pets p WHERE p.id = NEW.pet_id;

    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        SELECT pr.full_name INTO vet_name
        FROM public.profiles pr WHERE pr.id = NEW.requested_by;

        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            NEW.vet_id,
            'طلب ربط حيوان جديد',
            COALESCE(NULLIF(vet_name, ''), 'أحد المربين') || ' يطلب ربط الحيوان ' || COALESCE(NULLIF(pet_name, ''), 'الحيوان') || ' بملفك الطبي.',
            'connection_request',
            '/veterinarian/connection-requests'
        );
    ELSIF TG_OP = 'UPDATE'
       AND OLD.status = 'pending'
       AND NEW.status = 'accepted' THEN
        SELECT pr.full_name INTO vet_name
        FROM public.profiles pr WHERE pr.id = NEW.vet_id;

        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            NEW.requested_by,
            'تم قبول طلب ربط الحيوان',
            'وافق ' || COALESCE(NULLIF(vet_name, ''), 'الطبيب البيطري') || ' على ربط ' || COALESCE(NULLIF(pet_name, ''), 'حيوانك') || ' بملفه الطبي.',
            'connection_accepted',
            '/owner/pets/' || NEW.pet_id::TEXT
        );
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_pet_vet_link_change_trigger ON public.pet_vet_links;
CREATE TRIGGER notify_pet_vet_link_change_trigger
AFTER INSERT OR UPDATE OF status ON public.pet_vet_links
FOR EACH ROW EXECUTE FUNCTION public.notify_pet_vet_link_change();

CREATE OR REPLACE FUNCTION public.notify_owner_of_vet_visit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
    pet_owner_id UUID;
    pet_name TEXT;
    vet_name TEXT;
    notification_title TEXT;
    notification_message TEXT;
BEGIN
    IF NEW.author_role <> 'veterinarian'::public.medical_author_role THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE'
       AND OLD.next_appointment_date IS NOT DISTINCT FROM NEW.next_appointment_date THEN
        RETURN NEW;
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.next_appointment_date IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT p.owner_id, p.name INTO pet_owner_id, pet_name
    FROM public.pets p WHERE p.id = NEW.pet_id;
    IF pet_owner_id IS NULL OR pet_owner_id = NEW.created_by THEN
        RETURN NEW;
    END IF;
    SELECT pr.full_name INTO vet_name FROM public.profiles pr WHERE pr.id = NEW.created_by;

    IF NEW.next_appointment_date IS NOT NULL THEN
        notification_title := 'تم تحديد موعد متابعة';
        notification_message := COALESCE(NULLIF(vet_name, ''), 'الطبيب البيطري')
            || ' حدد موعدًا قادمًا لـ ' || COALESCE(NULLIF(pet_name, ''), 'حيوانك')
            || ' بتاريخ ' || to_char(NEW.next_appointment_date, 'YYYY-MM-DD') || '.';
    ELSE
        notification_title := 'تم تسجيل زيارة طبية';
        notification_message := COALESCE(NULLIF(vet_name, ''), 'الطبيب البيطري')
            || ' أضاف زيارة طبية جديدة إلى سجل ' || COALESCE(NULLIF(pet_name, ''), 'حيوانك') || '.';
    END IF;

    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (pet_owner_id, notification_title, notification_message, 'visit_added', '/owner/pets/' || NEW.pet_id::TEXT);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_owner_of_vet_visit_trigger ON public.medical_visits;
CREATE TRIGGER notify_owner_of_vet_visit_trigger
AFTER INSERT OR UPDATE OF next_appointment_date ON public.medical_visits
FOR EACH ROW EXECUTE FUNCTION public.notify_owner_of_vet_visit();

CREATE OR REPLACE FUNCTION public.notify_owner_of_vaccination()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
    pet_owner_id UUID;
    pet_name TEXT;
BEGIN
    IF NEW.administered_by_vet_id IS NULL THEN
        RETURN NEW;
    END IF;
    SELECT p.owner_id, p.name INTO pet_owner_id, pet_name
    FROM public.pets p WHERE p.id = NEW.pet_id;
    IF pet_owner_id IS NULL OR pet_owner_id = NEW.administered_by_vet_id THEN
        RETURN NEW;
    END IF;

    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
        pet_owner_id,
        'تم تسجيل تطعيم جديد',
        'سجّل الطبيب تطعيم ' || COALESCE(NULLIF(NEW.vaccine_name, ''), 'جديد')
            || ' للحيوان ' || COALESCE(NULLIF(pet_name, ''), 'حيوانك')
            || CASE WHEN NEW.next_due_date IS NULL THEN '.' ELSE '، والجرعة القادمة بتاريخ ' || to_char(NEW.next_due_date, 'YYYY-MM-DD') || '.' END,
        'vaccination_added',
        '/owner/pets/' || NEW.pet_id::TEXT
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_owner_of_vaccination_trigger ON public.vaccination_records;
CREATE TRIGGER notify_owner_of_vaccination_trigger
AFTER INSERT ON public.vaccination_records
FOR EACH ROW EXECUTE FUNCTION public.notify_owner_of_vaccination();

-- Enable live refresh in the owner's notifications screen where Realtime is available.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_publication WHERE pubname = 'supabase_realtime')
       AND NOT EXISTS (
           SELECT 1 FROM pg_catalog.pg_publication_tables
           WHERE pubname = 'supabase_realtime'
             AND schemaname = 'public'
             AND tablename = 'notifications'
       ) THEN
        EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
    END IF;
END;
$$;
