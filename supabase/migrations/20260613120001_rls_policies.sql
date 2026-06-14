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
