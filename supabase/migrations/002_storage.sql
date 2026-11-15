-- Create private storage bucket for student files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-files',
  'student-files',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Storage RLS policies
CREATE POLICY "Students can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can view own files"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Students can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'student-files' AND auth.uid()::text = (storage.foldername(name))[1]);
