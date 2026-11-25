-- Allow signed-in users to create pet records only for their own account.
DROP POLICY IF EXISTS "Owners can insert their pets" ON public.pets;
CREATE POLICY "Owners can insert their pets"
ON public.pets
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

GRANT INSERT, SELECT ON TABLE public.pets TO authenticated;
