-- Storage bucket for assignment file attachments (FR-ASGN-005)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assignment-files',
  'assignment-files',
  false,
  26214400, -- 25 MB
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Path format: {institution_id}/{assignment_id}/{filename}

CREATE OR REPLACE FUNCTION public.assignment_file_institution_id(object_name TEXT)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(split_part(object_name, '/', 1), '')::UUID;
$$;

CREATE POLICY "assignment_files_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'assignment-files'
    AND public.assignment_file_institution_id(name) = public.current_institution_id()
  );

CREATE POLICY "assignment_files_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignment-files'
    AND public.assignment_file_institution_id(name) = public.current_institution_id()
  );

CREATE POLICY "assignment_files_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'assignment-files'
    AND public.assignment_file_institution_id(name) = public.current_institution_id()
  )
  WITH CHECK (
    bucket_id = 'assignment-files'
    AND public.assignment_file_institution_id(name) = public.current_institution_id()
  );

CREATE POLICY "assignment_files_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'assignment-files'
    AND public.assignment_file_institution_id(name) = public.current_institution_id()
    AND (
      public.current_user_role() = 'teacher'
      OR public.is_admin()
    )
  );
