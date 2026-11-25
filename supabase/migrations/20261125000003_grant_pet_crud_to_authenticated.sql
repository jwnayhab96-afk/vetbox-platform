-- The app performs CRUD operations for owners' pet records. Row-level
-- security policies continue to restrict which rows each account can access.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pets TO authenticated;
