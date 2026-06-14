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
