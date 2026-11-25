-- The profile and veterinarian-profile SELECT policies inspect these tables
-- when checking linked records. RLS on both tables remains enabled.
GRANT SELECT ON TABLE public.pets, public.pet_vet_links TO authenticated;
