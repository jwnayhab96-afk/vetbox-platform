-- Public read keeps existing photo_url rendering and public pet passports working.
-- Writes and deletes are restricted to the authenticated user's own folder.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pet-photos', 'pet-photos', true, 5242880, ARRAY['image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public pet photos are viewable" ON storage.objects;
CREATE POLICY "Public pet photos are viewable"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'pet-photos');

DROP POLICY IF EXISTS "Users upload pet photos to own folder" ON storage.objects;
CREATE POLICY "Users upload pet photos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

DROP POLICY IF EXISTS "Users delete pet photos from own folder" ON storage.objects;
CREATE POLICY "Users delete pet photos from own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);
