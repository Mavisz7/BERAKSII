/*
# Add Storage RLS policies for edu-videos bucket

1. Purpose
   The `edu-videos` storage bucket has no RLS policies on `storage.objects`,
   so the anon-key frontend client cannot upload files (MP4 videos and thumbnails).
   This migration adds public read + anon/authenticated write/delete policies
   scoped to the `edu-videos` bucket only.

2. Security changes
   - SELECT (read/download): public — anyone can view educational videos.
   - INSERT (upload): anon + authenticated.
   - UPDATE (overwrite/upsert): anon + authenticated.
   - DELETE: anon + authenticated.
*/

DROP POLICY IF EXISTS "edu_videos_public_read" ON storage.objects;
CREATE POLICY "edu_videos_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'edu-videos');

DROP POLICY IF EXISTS "edu_videos_anon_upload" ON storage.objects;
CREATE POLICY "edu_videos_anon_upload" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'edu-videos');

DROP POLICY IF EXISTS "edu_videos_anon_update" ON storage.objects;
CREATE POLICY "edu_videos_anon_update" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'edu-videos') WITH CHECK (bucket_id = 'edu-videos');

DROP POLICY IF EXISTS "edu_videos_anon_delete" ON storage.objects;
CREATE POLICY "edu_videos_anon_delete" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'edu-videos');