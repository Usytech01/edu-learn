export type UserRole = 'teacher' | 'student' | 'school_admin' | 'it_admin';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type EnrollmentStatus = 'active' | 'withdrawn';
export type AssignmentType = 'homework' | 'project' | 'exam' | 'quiz';
export type AssignmentStatus = 'draft' | 'published' | 'archived';
export type SubmissionStatus = 'draft' | 'submitted' | 'graded';
export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_in_blank';
export type NotificationType = 
  | 'assignment_published'
  | 'submission_received'
  | 'grade_posted'
  | 'comment_added'
  | 'comment_reply'
  | 'due_reminder'
  | 'at_risk_alert';
export type AtRiskSeverity = 'low' | 'medium' | 'high';

export interface Institution {
  id: string;
  name: string;
  type: string;
  address?: string;
  timezone: string;
  grading_scale: 'percentage' | 'letter' | 'points';
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  institution_id?: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface InstitutionAccessRequest {
  id: string;
  user_id: string;
  institution_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  grade_level?: string;
  term?: string;
  teacher_id: string;
  institution_id: string;
  class_code: string;
  created_at: string;
  updated_at: string;
  teacher?: Profile;
}

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  status: EnrollmentStatus;
  student?: Profile;
  class?: Class;
}

export interface Assignment {
  id: string;
  title: string;
  type: AssignmentType;
  description?: string;
  class_id: string;
  due_date?: string;
  points: number;
  status: AssignmentStatus;
  settings_json: any;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content?: string;
  file_url?: string;
  submitted_at?: string;
  is_late: boolean;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
  student?: Profile;
  assignment?: Assignment;
  grade?: Grade;
}

export interface Grade {
  id: string;
  submission_id: string;
  score: number;
  max_score: number;
  feedback?: string;
  rubric_scores_json?: any;
  graded_by: string;
  graded_at: string;
}

export interface QuizQuestion {
  id: string;
  assignment_id: string;
  type: QuizQuestionType;
  prompt: string;
  options_json?: any; // e.g. string[] for MCQs
  correct_answer?: string;
  points: number;
  order_index: number;
  created_at: string;
}

export interface QuizAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  answer?: string;
  is_correct?: boolean;
  points_earned: number;
}

export interface Comment {
  id: string;
  student_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  author?: Profile;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read_at?: string;
  created_at: string;
}

export interface AtRiskAlert {
  id: string;
  student_id: string;
  class_id: string;
  trigger_reason: string;
  severity: AtRiskSeverity;
  resolved_at?: string;
  created_at: string;
  student?: Profile;
  class?: Class;
}
