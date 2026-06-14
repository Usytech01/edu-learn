-- Edu-Learn initial schema (PRD Section 10)
-- Uses Supabase Auth (auth.users) + public.profiles for app users

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM (
  'teacher',
  'student',
  'school_admin',
  'it_admin'
);

CREATE TYPE public.user_status AS ENUM (
  'active',
  'inactive',
  'pending'
);

CREATE TYPE public.enrollment_status AS ENUM (
  'active',
  'withdrawn'
);

CREATE TYPE public.assignment_type AS ENUM (
  'homework',
  'project',
  'exam',
  'quiz'
);

CREATE TYPE public.assignment_status AS ENUM (
  'draft',
  'published',
  'archived'
);

CREATE TYPE public.submission_status AS ENUM (
  'draft',
  'submitted',
  'graded'
);

CREATE TYPE public.quiz_question_type AS ENUM (
  'multiple_choice',
  'true_false',
  'short_answer',
  'essay',
  'matching',
  'fill_in_blank'
);

CREATE TYPE public.notification_type AS ENUM (
  'assignment_published',
  'submission_received',
  'grade_posted',
  'comment_added',
  'comment_reply',
  'due_reminder',
  'at_risk_alert'
);

CREATE TYPE public.at_risk_severity AS ENUM (
  'low',
  'medium',
  'high'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.institutions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  type          TEXT NOT NULL DEFAULT 'high_school',
  address       TEXT,
  timezone      TEXT NOT NULL DEFAULT 'UTC',
  grading_scale TEXT NOT NULL DEFAULT 'percentage'
    CHECK (grading_scale IN ('percentage', 'letter', 'points')),
  invite_code   TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id  UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  role            public.user_role NOT NULL,
  first_name      TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 100),
  last_name       TEXT NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 100),
  status          public.user_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (institution_id, email)
);

CREATE TABLE public.institution_access_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id  UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE public.classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  subject         TEXT NOT NULL,
  grade_level     TEXT,
  term            TEXT,
  teacher_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  institution_id  UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  class_code      TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      public.enrollment_status NOT NULL DEFAULT 'active',
  UNIQUE (student_id, class_id)
);

CREATE TABLE public.assignments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  type           public.assignment_type NOT NULL,
  description    TEXT,
  class_id       UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  due_date       TIMESTAMPTZ,
  points         NUMERIC(8, 2) NOT NULL DEFAULT 100 CHECK (points > 0),
  status         public.assignment_status NOT NULL DEFAULT 'draft',
  settings_json  JSONB NOT NULL DEFAULT '{}',
  created_by     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT,
  file_url      TEXT,
  submitted_at  TIMESTAMPTZ,
  is_late       BOOLEAN NOT NULL DEFAULT false,
  status        public.submission_status NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE public.grades (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id       UUID NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  score               NUMERIC(8, 2) NOT NULL CHECK (score >= 0),
  max_score           NUMERIC(8, 2) NOT NULL CHECK (max_score > 0),
  feedback            TEXT,
  rubric_scores_json  JSONB,
  graded_by           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  graded_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (score <= max_score)
);

CREATE TABLE public.quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  type          public.quiz_question_type NOT NULL,
  prompt        TEXT NOT NULL,
  options_json  JSONB,
  correct_answer TEXT,
  points        NUMERIC(8, 2) NOT NULL DEFAULT 1 CHECK (points > 0),
  order_index   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  question_id   UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answer        TEXT,
  is_correct    BOOLEAN,
  points_earned NUMERIC(8, 2) DEFAULT 0,
  UNIQUE (submission_id, question_id)
);

CREATE TABLE public.comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content           TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       public.notification_type NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.at_risk_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id        UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  trigger_reason  TEXT NOT NULL,
  severity        public.at_risk_severity NOT NULL DEFAULT 'medium',
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   UUID,
  metadata_json JSONB NOT NULL DEFAULT '{}',
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Utility functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.generate_random_code(code_length INTEGER DEFAULT 8)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars  TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i      INTEGER;
BEGIN
  FOR i IN 1..code_length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER institutions_set_updated_at
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER classes_set_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER assignments_set_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER submissions_set_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile when a Supabase Auth user signs up.
-- Pass role, institution_id, first_name, last_name in signUp options.data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    institution_id,
    role,
    first_name,
    last_name,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'institution_id', '')::UUID,
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::public.user_role,
      'student'
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    'pending'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Public RPC: validate institution invite code during registration (no auth required)
CREATE OR REPLACE FUNCTION public.validate_invite_code(code TEXT)
RETURNS TABLE (institution_id UUID, institution_name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name
  FROM public.institutions
  WHERE invite_code = upper(trim(code));
$$;

GRANT EXECUTE ON FUNCTION public.validate_invite_code(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_profiles_institution_id ON public.profiles (institution_id);
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_classes_teacher_id ON public.classes (teacher_id);
CREATE INDEX idx_classes_institution_id ON public.classes (institution_id);
CREATE INDEX idx_enrollments_class_id ON public.enrollments (class_id);
CREATE INDEX idx_enrollments_student_id ON public.enrollments (student_id);
CREATE INDEX idx_assignments_class_id ON public.assignments (class_id);
CREATE INDEX idx_assignments_status ON public.assignments (status);
CREATE INDEX idx_submissions_assignment_id ON public.submissions (assignment_id);
CREATE INDEX idx_submissions_student_id ON public.submissions (student_id);
CREATE INDEX idx_quiz_questions_assignment_id ON public.quiz_questions (assignment_id);
CREATE INDEX idx_comments_student_id ON public.comments (student_id);
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_unread ON public.notifications (user_id) WHERE read_at IS NULL;
CREATE INDEX idx_at_risk_alerts_class_id ON public.at_risk_alerts (class_id);
CREATE INDEX idx_at_risk_alerts_unresolved ON public.at_risk_alerts (class_id) WHERE resolved_at IS NULL;
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);



-- Row Level Security policies for multi-tenant institution isolation

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER for consistent RLS checks)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_institution_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('school_admin', 'it_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_it_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'it_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.teaches_class(_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes
    WHERE id = _class_id AND teacher_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.enrolled_in_class(_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments
    WHERE class_id = _class_id
      AND student_id = auth.uid()
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.class_in_institution(_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes
    WHERE id = _class_id
      AND institution_id = public.current_institution_id()
  );
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------------------------

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.at_risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- institutions
-- ---------------------------------------------------------------------------

CREATE POLICY "institutions_select_same_tenant"
  ON public.institutions FOR SELECT
  TO authenticated
  USING (id = public.current_institution_id() OR public.is_admin());

CREATE POLICY "institutions_insert_admin"
  ON public.institutions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_it_admin());

CREATE POLICY "institutions_update_admin"
  ON public.institutions FOR UPDATE
  TO authenticated
  USING (id = public.current_institution_id() AND public.is_admin())
  WITH CHECK (id = public.current_institution_id() AND public.is_admin());

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE POLICY "profiles_select_same_tenant"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR institution_id = public.current_institution_id()
  );

CREATE POLICY "profiles_update_self_or_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR (institution_id = public.current_institution_id() AND public.is_admin())
  )
  WITH CHECK (
    id = auth.uid()
    OR (institution_id = public.current_institution_id() AND public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- institution_access_requests
-- ---------------------------------------------------------------------------

CREATE POLICY "access_requests_select"
  ON public.institution_access_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (institution_id = public.current_institution_id() AND public.is_admin())
  );

CREATE POLICY "access_requests_insert_self"
  ON public.institution_access_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "access_requests_update_admin"
  ON public.institution_access_requests FOR UPDATE
  TO authenticated
  USING (institution_id = public.current_institution_id() AND public.is_admin())
  WITH CHECK (institution_id = public.current_institution_id() AND public.is_admin());

-- ---------------------------------------------------------------------------
-- classes
-- ---------------------------------------------------------------------------

CREATE POLICY "classes_select"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR public.enrolled_in_class(id)
    OR (institution_id = public.current_institution_id() AND public.is_admin())
  );

CREATE POLICY "classes_insert_teacher"
  ON public.classes FOR INSERT
  TO authenticated
  WITH CHECK (
    teacher_id = auth.uid()
    AND institution_id = public.current_institution_id()
    AND public.current_user_role() = 'teacher'
  );

CREATE POLICY "classes_update"
  ON public.classes FOR UPDATE
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR (institution_id = public.current_institution_id() AND public.is_admin())
  )
  WITH CHECK (
    teacher_id = auth.uid()
    OR (institution_id = public.current_institution_id() AND public.is_admin())
  );

CREATE POLICY "classes_delete"
  ON public.classes FOR DELETE
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR (institution_id = public.current_institution_id() AND public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- enrollments
-- ---------------------------------------------------------------------------

CREATE POLICY "enrollments_select"
  ON public.enrollments FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR public.teaches_class(class_id)
    OR (public.class_in_institution(class_id) AND public.is_admin())
  );

CREATE POLICY "enrollments_insert"
  ON public.enrollments FOR INSERT
  TO authenticated
  WITH CHECK (
    (student_id = auth.uid() AND public.current_user_role() = 'student')
    OR public.teaches_class(class_id)
    OR (public.class_in_institution(class_id) AND public.is_admin())
  );

CREATE POLICY "enrollments_update"
  ON public.enrollments FOR UPDATE
  TO authenticated
  USING (
    public.teaches_class(class_id)
    OR (public.class_in_institution(class_id) AND public.is_admin())
  )
  WITH CHECK (
    public.teaches_class(class_id)
    OR (public.class_in_institution(class_id) AND public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- assignments
-- ---------------------------------------------------------------------------

CREATE POLICY "assignments_select"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    public.teaches_class(class_id)
    OR (
      public.enrolled_in_class(class_id)
      AND status = 'published'
    )
    OR (public.class_in_institution(class_id) AND public.is_admin())
  );

CREATE POLICY "assignments_insert"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.teaches_class(class_id)
    AND created_by = auth.uid()
  );

CREATE POLICY "assignments_update"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (public.teaches_class(class_id))
  WITH CHECK (public.teaches_class(class_id));

CREATE POLICY "assignments_delete"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (public.teaches_class(class_id));

-- ---------------------------------------------------------------------------
-- submissions
-- ---------------------------------------------------------------------------

CREATE POLICY "submissions_select"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR public.teaches_class((
      SELECT class_id FROM public.assignments WHERE id = assignment_id
    ))
    OR (
      public.class_in_institution((
        SELECT class_id FROM public.assignments WHERE id = assignment_id
      ))
      AND public.is_admin()
    )
  );

CREATE POLICY "submissions_insert"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND public.current_user_role() = 'student'
    AND public.enrolled_in_class((
      SELECT class_id FROM public.assignments WHERE id = assignment_id
    ))
  );

CREATE POLICY "submissions_update"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR public.teaches_class((
      SELECT class_id FROM public.assignments WHERE id = assignment_id
    ))
  )
  WITH CHECK (
    student_id = auth.uid()
    OR public.teaches_class((
      SELECT class_id FROM public.assignments WHERE id = assignment_id
    ))
  );

-- ---------------------------------------------------------------------------
-- grades
-- ---------------------------------------------------------------------------

CREATE POLICY "grades_select"
  ON public.grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_id
        AND (
          s.student_id = auth.uid()
          OR public.teaches_class(a.class_id)
          OR (public.class_in_institution(a.class_id) AND public.is_admin())
        )
    )
  );

CREATE POLICY "grades_insert"
  ON public.grades FOR INSERT
  TO authenticated
  WITH CHECK (
    graded_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_id
        AND public.teaches_class(a.class_id)
    )
  );

CREATE POLICY "grades_update"
  ON public.grades FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_id
        AND public.teaches_class(a.class_id)
    )
  )
  WITH CHECK (graded_by = auth.uid());

-- ---------------------------------------------------------------------------
-- quiz_questions
-- ---------------------------------------------------------------------------

CREATE POLICY "quiz_questions_select"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assignments a
      WHERE a.id = assignment_id
        AND (
          public.teaches_class(a.class_id)
          OR (
            public.enrolled_in_class(a.class_id)
            AND a.status = 'published'
          )
          OR (public.class_in_institution(a.class_id) AND public.is_admin())
        )
    )
  );

CREATE POLICY "quiz_questions_write_teacher"
  ON public.quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.assignments a
      WHERE a.id = assignment_id AND public.teaches_class(a.class_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.assignments a
      WHERE a.id = assignment_id AND public.teaches_class(a.class_id)
    )
  );

-- ---------------------------------------------------------------------------
-- quiz_answers
-- ---------------------------------------------------------------------------

CREATE POLICY "quiz_answers_select"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_id
        AND (
          s.student_id = auth.uid()
          OR public.teaches_class(a.class_id)
          OR (public.class_in_institution(a.class_id) AND public.is_admin())
        )
    )
  );

CREATE POLICY "quiz_answers_write"
  ON public.quiz_answers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.submissions s
      WHERE s.id = submission_id AND s.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_id AND public.teaches_class(a.class_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.submissions s
      WHERE s.id = submission_id AND s.student_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      WHERE s.id = submission_id AND public.teaches_class(a.class_id)
    )
  );

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------

CREATE POLICY "comments_select"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR author_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.enrollments e
      JOIN public.classes c ON c.id = e.class_id
      WHERE e.student_id = comments.student_id
        AND c.teacher_id = auth.uid()
    )
    OR (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = comments.student_id
          AND p.institution_id = public.current_institution_id()
      )
      AND public.is_admin()
    )
  );

CREATE POLICY "comments_insert"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      (student_id = auth.uid() AND parent_comment_id IS NOT NULL)
      OR EXISTS (
        SELECT 1
        FROM public.enrollments e
        JOIN public.classes c ON c.id = e.class_id
        WHERE e.student_id = comments.student_id
          AND c.teacher_id = auth.uid()
      )
    )
  );

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- at_risk_alerts
-- ---------------------------------------------------------------------------

CREATE POLICY "at_risk_alerts_select"
  ON public.at_risk_alerts FOR SELECT
  TO authenticated
  USING (
    public.teaches_class(class_id)
    OR (public.class_in_institution(class_id) AND public.is_admin())
  );

CREATE POLICY "at_risk_alerts_update"
  ON public.at_risk_alerts FOR UPDATE
  TO authenticated
  USING (
    public.teaches_class(class_id)
    OR (public.class_in_institution(class_id) AND public.is_admin())
  )
  WITH CHECK (
    public.teaches_class(class_id)
    OR (public.class_in_institution(class_id) AND public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- audit_logs (IT admin read; authenticated insert for own actions)
-- ---------------------------------------------------------------------------

CREATE POLICY "audit_logs_select_it_admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_it_admin());

CREATE POLICY "audit_logs_insert_authenticated"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);



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



-- Grant API roles access to public schema objects

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;




-- Seed

-- Dev seed data (local only â€” run via `supabase db reset`)
-- Creates a demo institution. Users must be created via Supabase Auth signup.

INSERT INTO public.institutions (name, type, address, timezone, invite_code)
VALUES (
  'Lincoln High School',
  'high_school',
  '123 Education Ave, Springfield',
  'America/New_York',
  'LINCOLN01'
)
ON CONFLICT (invite_code) DO NOTHING;

