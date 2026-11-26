-- Keep owner reminders in sync with dates entered by veterinarians.
-- The trigger functions run as the database owner because the reminder belongs to
-- the pet owner, while the initiating authenticated user is the veterinarian.
GRANT SELECT, INSERT, UPDATE ON TABLE public.reminders TO authenticated;
CREATE INDEX IF NOT EXISTS idx_reminders_reference_type
ON public.reminders (reference_id, reminder_type)
WHERE reference_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.sync_visit_followup_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
    pet_owner_id UUID;
    pet_name TEXT;
    reminder_title TEXT;
BEGIN
    IF TG_OP = 'UPDATE'
       AND OLD.next_appointment_date IS NOT DISTINCT FROM NEW.next_appointment_date
       AND OLD.pet_id = NEW.pet_id THEN
        RETURN NEW;
    END IF;

    IF NEW.next_appointment_date IS NULL THEN
        DELETE FROM public.reminders
        WHERE reference_id = NEW.id AND reminder_type = 'visit_followup';
        RETURN NEW;
    END IF;

    SELECT p.owner_id, p.name
    INTO pet_owner_id, pet_name
    FROM public.pets p
    WHERE p.id = NEW.pet_id;

    IF pet_owner_id IS NULL THEN
        RETURN NEW;
    END IF;

    reminder_title := 'موعد زيارة قادم - ' || COALESCE(NULLIF(pet_name, ''), 'الحيوان');
    UPDATE public.reminders
    SET user_id = pet_owner_id,
        pet_id = NEW.pet_id,
        title = reminder_title,
        due_date = NEW.next_appointment_date,
        is_completed = false,
        completed_at = NULL
    WHERE reference_id = NEW.id AND reminder_type = 'visit_followup';

    IF NOT FOUND THEN
        INSERT INTO public.reminders (user_id, pet_id, reminder_type, title, due_date, reference_id)
        VALUES (pet_owner_id, NEW.pet_id, 'visit_followup', reminder_title, NEW.next_appointment_date, NEW.id);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_visit_followup_reminder_trigger ON public.medical_visits;
CREATE TRIGGER sync_visit_followup_reminder_trigger
AFTER INSERT OR UPDATE OF next_appointment_date, pet_id ON public.medical_visits
FOR EACH ROW EXECUTE FUNCTION public.sync_visit_followup_reminder();

CREATE OR REPLACE FUNCTION public.sync_vaccination_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
    pet_owner_id UUID;
    pet_name TEXT;
    reminder_title TEXT;
BEGIN
    IF TG_OP = 'UPDATE'
       AND OLD.next_due_date IS NOT DISTINCT FROM NEW.next_due_date
       AND OLD.pet_id = NEW.pet_id THEN
        RETURN NEW;
    END IF;

    IF NEW.next_due_date IS NULL THEN
        DELETE FROM public.reminders
        WHERE reference_id = NEW.id AND reminder_type = 'vaccination';
        RETURN NEW;
    END IF;

    SELECT p.owner_id, p.name
    INTO pet_owner_id, pet_name
    FROM public.pets p
    WHERE p.id = NEW.pet_id;

    IF pet_owner_id IS NULL THEN
        RETURN NEW;
    END IF;

    reminder_title := 'جرعة تنشيطية - ' || COALESCE(NULLIF(NEW.vaccine_name, ''), 'تطعيم')
        || ' (' || COALESCE(NULLIF(pet_name, ''), 'الحيوان') || ')';
    UPDATE public.reminders
    SET user_id = pet_owner_id,
        pet_id = NEW.pet_id,
        title = reminder_title,
        due_date = NEW.next_due_date,
        is_completed = false,
        completed_at = NULL
    WHERE reference_id = NEW.id AND reminder_type = 'vaccination';

    IF NOT FOUND THEN
        INSERT INTO public.reminders (user_id, pet_id, reminder_type, title, due_date, reference_id)
        VALUES (pet_owner_id, NEW.pet_id, 'vaccination', reminder_title, NEW.next_due_date, NEW.id);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_vaccination_reminder_trigger ON public.vaccination_records;
CREATE TRIGGER sync_vaccination_reminder_trigger
AFTER INSERT OR UPDATE OF next_due_date, pet_id ON public.vaccination_records
FOR EACH ROW EXECUTE FUNCTION public.sync_vaccination_reminder();

CREATE OR REPLACE FUNCTION public.sync_vaccination_plan_reminder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
SET row_security = off
AS $$
DECLARE
    pet_owner_id UUID;
    pet_name TEXT;
    reminder_title TEXT;
BEGIN
    IF TG_OP = 'UPDATE'
       AND OLD.status IS NOT DISTINCT FROM NEW.status
       AND OLD.recommended_date IS NOT DISTINCT FROM NEW.recommended_date
       AND OLD.pet_id = NEW.pet_id
       AND OLD.vaccine_name IS NOT DISTINCT FROM NEW.vaccine_name THEN
        RETURN NEW;
    END IF;

    IF NEW.status = 'cancelled' THEN
        DELETE FROM public.reminders
        WHERE reference_id = NEW.id AND reminder_type = 'vaccination';
        RETURN NEW;
    END IF;

    SELECT p.owner_id, p.name
    INTO pet_owner_id, pet_name
    FROM public.pets p
    WHERE p.id = NEW.pet_id;

    IF pet_owner_id IS NULL THEN
        RETURN NEW;
    END IF;

    reminder_title := 'جرعة تنشيطية - ' || COALESCE(NULLIF(NEW.vaccine_name, ''), 'تطعيم')
        || ' (' || COALESCE(NULLIF(pet_name, ''), 'الحيوان') || ')';
    UPDATE public.reminders
    SET user_id = pet_owner_id,
        pet_id = NEW.pet_id,
        title = reminder_title,
        due_date = NEW.recommended_date,
        is_completed = (NEW.status = 'administered'),
        completed_at = CASE WHEN NEW.status = 'administered' THEN now() ELSE NULL END
    WHERE reference_id = NEW.id AND reminder_type = 'vaccination';

    IF NOT FOUND THEN
        INSERT INTO public.reminders (
            user_id, pet_id, reminder_type, title, due_date, is_completed, completed_at, reference_id
        ) VALUES (
            pet_owner_id, NEW.pet_id, 'vaccination', reminder_title, NEW.recommended_date,
            NEW.status = 'administered',
            CASE WHEN NEW.status = 'administered' THEN now() ELSE NULL END,
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_vaccination_plan_reminder_trigger ON public.vaccination_plans;
CREATE TRIGGER sync_vaccination_plan_reminder_trigger
AFTER INSERT OR UPDATE OF status, recommended_date, pet_id, vaccine_name ON public.vaccination_plans
FOR EACH ROW EXECUTE FUNCTION public.sync_vaccination_plan_reminder();

-- Backfill existing veterinarian-entered dates without duplicating linked reminders.
INSERT INTO public.reminders (user_id, pet_id, reminder_type, title, due_date, reference_id)
SELECT p.owner_id, p.id, 'visit_followup',
       'موعد زيارة قادم - ' || COALESCE(NULLIF(p.name, ''), 'الحيوان'),
       v.next_appointment_date, v.id
FROM public.medical_visits v
JOIN public.pets p ON p.id = v.pet_id
WHERE v.next_appointment_date IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.reminders r
      WHERE r.reference_id = v.id AND r.reminder_type = 'visit_followup'
  );

INSERT INTO public.reminders (user_id, pet_id, reminder_type, title, due_date, reference_id)
SELECT p.owner_id, p.id, 'vaccination',
       'جرعة تنشيطية - ' || COALESCE(NULLIF(v.vaccine_name, ''), 'تطعيم')
           || ' (' || COALESCE(NULLIF(p.name, ''), 'الحيوان') || ')',
       v.next_due_date, v.id
FROM public.vaccination_records v
JOIN public.pets p ON p.id = v.pet_id
WHERE v.next_due_date IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM public.reminders r
      WHERE r.reference_id = v.id AND r.reminder_type = 'vaccination'
  );

INSERT INTO public.reminders (user_id, pet_id, reminder_type, title, due_date, is_completed, completed_at, reference_id)
SELECT p.owner_id, p.id, 'vaccination',
       'جرعة تنشيطية - ' || COALESCE(NULLIF(vp.vaccine_name, ''), 'تطعيم')
           || ' (' || COALESCE(NULLIF(p.name, ''), 'الحيوان') || ')',
       vp.recommended_date, vp.status = 'administered',
       CASE WHEN vp.status = 'administered' THEN now() ELSE NULL END,
       vp.id
FROM public.vaccination_plans vp
JOIN public.pets p ON p.id = vp.pet_id
WHERE vp.status IN ('planned', 'rescheduled', 'administered')
  AND NOT EXISTS (
      SELECT 1 FROM public.reminders r
      WHERE r.reference_id = vp.id AND r.reminder_type = 'vaccination'
  );
