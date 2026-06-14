# Edu-Learn Product Requirements Document (PRD)

**Version:** 1.2 | **Date:** June 13, 2026 | **Status:** Draft | **Prepared by:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Target Users & Personas](#4-target-users--personas)
5. [Core Features](#5-core-features)
6. [User Flows](#6-user-flows)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Security Requirements](#9-security-requirements)
10. [Data Requirements](#10-data-requirements)
11. [Integration Requirements](#11-integration-requirements)
12. [Success Metrics & KPIs](#12-success-metrics--kpis)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [MVP Scope & Product Roadmap](#14-mvp-scope--product-roadmap)
15. [Appendices](#15-appendices)

---

## 1. Executive Summary

Edu-Learn is a comprehensive web-based learning management platform designed to bridge the gap between teachers and students in modern educational environments. The platform provides teachers with powerful tools to manage student records, create assignments, deliver feedback, and gain actionable insights through automatic grading analytics. For students, it offers an intuitive interface to access assignments, track academic progress, receive personalized feedback, and leverage AI-driven learning insights to improve performance.

### Key Value Propositions

| Stakeholder | Value Proposition |
|-------------|-------------------|
| **Teachers** | Reduce administrative burden through automated grading insights and centralized student record management |
| **Students** | Gain visibility into academic performance and receive personalized learning recommendations |
| **Institutions** | Improve educational outcomes through data-driven decision making and streamlined workflows |

---

## 2. Problem Statement

### 2.1 Current Pain Points

| Stakeholder | Pain Point | Impact |
|-------------|-----------|--------|
| **Teachers** | Manual grade tracking across multiple spreadsheets and paper records | 5-10 hours/week spent on administrative tasks |
| **Teachers** | Difficulty identifying at-risk students early | Delayed intervention, lower pass rates |
| **Teachers** | Inconsistent feedback delivery | Students lack clear improvement pathways |
| **Students** | Fragmented view of academic progress across different platforms | Poor self-awareness of strengths/weaknesses |
| **Students** | Delayed or unclear feedback on assignments | Reduced learning effectiveness |
| **Students** | No personalized study guidance | Inefficient study time allocation |
| **Institutions** | Lack of centralized academic data | Inability to make data-driven policy decisions |

### 2.2 Market Gap Analysis

Existing Learning Management Systems (LMS) like Google Classroom, Canvas, and Blackboard provide basic assignment and grade management but lack:
- Intelligent automatic grading insights that identify patterns and trends
- Comprehensive teacher comment systems integrated with student records
- Personalized learning analytics for students
- Unified teacher-student communication around academic progress

### 2.3 Problem Statement (Formal)

> *Educational institutions lack an integrated platform that enables teachers to efficiently manage student records, deliver timely feedback, and gain actionable insights from grading data, while simultaneously empowering students to access their academic information, receive personalized guidance, and track their learning progress in a unified, intuitive interface.*

---

## 3. Product Vision & Goals

### 3.1 Vision Statement

> *To create the most intelligent and user-friendly educational platform that transforms how teachers teach and students learn by leveraging data-driven insights and seamless collaboration.*

### 3.2 Strategic Goals

| Goal ID | Goal | Priority | Timeline |
|---------|------|----------|----------|
| G1 | Reduce teacher administrative workload by 40% | High | Q1 |
| G2 | Increase student assignment completion rates by 25% | High | Q2 |
| G3 | Improve student academic performance through personalized insights | High | Q2 |
| G4 | Enable early identification of at-risk students (before 30% grade drop) | High | Q1 |
| G5 | Achieve 90% user satisfaction score among teachers and students | Medium | Q3 |
| G6 | Support institutions with actionable analytics for curriculum improvement | Medium | Q3 |

### 3.3 Product Objectives

1. **Streamline Administrative Workflows:** Automate routine tasks like grade calculation, progress tracking, and report generation
2. **Enhance Feedback Quality:** Enable rich, contextual feedback that students can act upon
3. **Drive Data-Informed Teaching:** Provide teachers with insights that inform instructional decisions
4. **Empower Student Agency:** Give students ownership of their learning through transparent progress tracking
5. **Foster Early Intervention:** Identify struggling students before they fall significantly behind

---

## 4. Target Users & Personas

### 4.1 Primary Users

#### Persona 1: Sarah Chen - High School Teacher
- **Age:** 34 | **Role:** Mathematics teacher, grades 9-12 | **Context:** Teaches 5 classes (120 students total)
- **Pain Points:** Spends evenings grading and entering scores; Struggles to remember individual student challenges; Wants to identify struggling students earlier
- **Goals:** Reduce grading time, provide better feedback, improve student outcomes
- **Tech Comfort:** Moderate - uses Google Classroom but finds it limiting

#### Persona 2: Marcus Johnson - Middle School Student
- **Age:** 13 | **Grade:** 8th grade | **Context:** Average student, sometimes struggles with math, excels in English
- **Pain Points:** Does not understand why he gets certain grades; Forgets about upcoming assignments; Does not know how to improve weak areas
- **Goals:** See clear progress, understand feedback, get study recommendations
- **Tech Comfort:** High - digital native, expects mobile-friendly interfaces

#### Persona 3: Dr. Emily Rodriguez - School Principal
- **Age:** 45 | **Role:** High school principal | **Context:** Oversees 40 teachers, 800 students
- **Pain Points:** Limited visibility into classroom-level performance; Reactive rather than proactive intervention; Difficulty measuring teaching effectiveness
- **Goals:** Data-driven decisions, early intervention programs, teacher support
- **Tech Comfort:** Moderate - uses dashboards but needs simplicity

### 4.2 Secondary Users

| User Type | Role | Key Needs |
|-----------|------|-----------|
| Parents | View child's progress, communicate with teachers | Read-only access to student data, notification preferences |
| School Administrators | Generate reports, manage users | System configuration, analytics dashboards |
| IT Staff | Maintain system, ensure security | Admin panel, audit logs, API access |

---

## 5. Core Features

### 5.1 Feature Overview

| Module | Feature | Teacher | Student | Admin |
|--------|---------|:-------:|:-------:|:-----:|
| **Authentication** | Role-based login | Yes | Yes | Yes |
| | SSO integration | Yes | Yes | Yes |
| **Dashboard** | Personalized home view | Yes | Yes | Yes |
| **Student Records** | View all student data | Yes | - | Yes |
| | View individual student profile | Yes | Yes | Yes |
| | Search and filter students | Yes | - | Yes |
| **Assignments** | Create assignments | Yes | - | - |
| | Edit/delete assignments | Yes | - | - |
| | View assigned work | Yes | Yes | Yes |
| | Submit assignments | - | Yes | - |
| | Grade submissions | Yes | - | - |
| **Teacher Comments** | Add comments to records | Yes | - | - |
| | View comments | Yes | Yes | Yes |
| | Reply to comments | - | Yes | - |
| **Quizzes** | Create quizzes | Yes | - | - |
| | Take quizzes | - | Yes | - |
| | Auto-grade quizzes | Yes | Yes | Yes |
| **Insights & Analytics** | Class performance analytics | Yes | - | Yes |
| | Individual student insights | Yes | Yes | Yes |
| | Learning recommendations | - | Yes | - |
| | At-risk student alerts | Yes | - | Yes |
| **Notifications** | Assignment reminders | Yes | Yes | - |
| | Grade notifications | - | Yes | - |
| | Comment notifications | Yes | Yes | - |
| **Reports** | Generate progress reports | Yes | Yes | Yes |
| | Export data | Yes | - | Yes |

---

## 6. User Flows

### 6.1 Complete User Flow Map

```
+-------------------------------------------------------------------------+
|                           EDU-LEARN USER FLOWS                           |
+-------------------------------------------------------------------------+
|                                                                          |
|  +--------------+     +--------------+     +--------------+             |
|  |   TEACHER    |     |   STUDENT    |     |    ADMIN     |             |
|  |   FLOWS      |     |   FLOWS      |     |   FLOWS      |             |
|  +--------------+     +--------------+     +--------------+             |
|                                                                          |
|  - Registration       - Registration       - User Management             |
|  - Login              - Login              - Institution Setup           |
|  - Dashboard          - Dashboard          - Analytics Overview          |
|  - Student Records    - Assignment Center  - System Configuration        |
|  - Create Assignment  - Take Quiz            - Reports                     |
|  - Grade & Comment    - View Records         - Security & Compliance        |
|  - Insights Dashboard - Learning Insights    - Support & Maintenance       |
|                                                                          |
+-------------------------------------------------------------------------+
```

### 6.2 System Architecture Flow

```
+-------------------------------------------------------------------------+
|                    EDU-LEARN COMPLETE USER FLOW MAP                      |
+-------------------------------------------------------------------------+
|                                                                          |
|  +-------------------------------------------------------------------+   |
|  |                        AUTHENTICATION                             |   |
|  |  +---------+    +---------+    +---------+    +---------+     |   |
|  |  | Landing |--->| Register|--->| Verify  |--->| Onboard |     |   |
|  |  | Page    |    | (Role)  |    | Email   |    | Tutorial|     |   |
|  |  +----+----+    +----+----+    +----+----+    +----+----+     |   |
|  |       |              |              |              |           |   |
|  |       +--------------+--------------+--------------+           |   |
|  |                      |                                          |   |
|  |                      v                                          |   |
|  |               +---------+                                       |   |
|  |               |  Login  |<----------------------------+        |   |
|  |               | (SSO/Pwd)|                             |        |   |
|  |               +----+----+                             |        |   |
|  |                    |                                   |        |   |
|  |         +---------+---------+                        |        |   |
|  |         |                     |                        |        |   |
|  |         v                     v                        |        |   |
|  |  +-------------+      +-------------+                   |        |   |
|  |  |   TEACHER   |      |   STUDENT   |                   |        |   |
|  |  |  DASHBOARD  |      |  DASHBOARD  |                   |        |   |
|  |  +------+------+      +------+------+                   |        |   |
|  |         |                     |                        |        |   |
|  |    +----+----+           +----+----+                   |        |   |
|  |    |         |           |         |                   |        |   |
|  |    v         v           v         v                   |        |   |
|  | +----+   +----+      +----+   +----+                  |        |   |
|  | |My  |   |Create|    |My  |   |View |                  |        |   |
|  | |Classes|  |Assign|    |Assign|  |Records|                 |        |   |
|  | +--+---+   +--+---+      +--+---+   +--+---+                  |        |   |
|  |    |       |           |       |                      |        |   |
|  |    v       v           v       v                      |        |   |
|  | +----+   +----+      +----+   +----+                  |        |   |
|  | |Student|  |Quiz  |    |Take |   |Insights|                 |        |   |
|  | |Records|  |Builder|   |Quiz |   |& Goals |                 |        |   |
|  | +--+---+   +--+---+      +--+---+   +--+---+                  |        |   |
|  |    |       |           |       |                      |        |   |
|  |    v       v           v       v                      |        |   |
|  | +----+   +----+      +----+   +----+                  |        |   |
|  | |Grade |   |Publish|   |Submit|   |Study |                  |        |   |
|  | |&     |   |Assign |   |& View|   |Plan  |                  |        |   |
|  | |Comment|   |      |   |Result|   |      |                  |        |   |
|  | +--+---+   +--+---+      +--+---+   +--+---+                  |        |   |
|  |    |       |           |       |                      |        |   |
|  |    +-------+-----------+-------+----------------------+        |   |
|  |                        |                                        |   |
|  |                        v                                        |   |
|  |                 +-------------+                                 |   |
|  |                 |  NOTIFICATIONS |                                 |   |
|  |                 |  (In-App/Email) |                                 |   |
|  |                 +------+------+                                 |   |
|  |                        |                                        |   |
|  |                        v                                        |   |
|  |                 +-------------+                                 |   |
|  |                 |   LOGOUT    |<--------------------------------+   |
|  |                 |             |                                     |
|  |                 +-------------+                                     |
|  +-------------------------------------------------------------------+   |
|                                                                          |
|  +-------------------------------------------------------------------+   |
|  |                        ADMIN FLOWS                                |   |
|  |  +---------+    +---------+    +---------+    +---------+     |   |
|  |  | Admin   |--->| User    |--->| Class   |--->| Reports |     |   |
|  |  | Login   |    | Manage  |    | Manage  |    | & Analytics    |   |
|  |  +---------+    +---------+    +---------+    +---------+     |   |
|  |       |                                                        |   |
|  |       v                                                        |   |
|  |  +---------+    +---------+    +---------+                     |   |
|  |  | System  |--->| Security|--->| Support |                     |   |
|  |  | Settings|    | & Audit |    | & Help  |                     |   |
|  |  +---------+    +---------+    +---------+                     |   |
|  +-------------------------------------------------------------------+   |
|                                                                          |
+-------------------------------------------------------------------------+
```

### 6.3 Teacher Registration & Onboarding Flow

```
+---------+    +--------------+    +-----------------+    +-------------+
|  START  |--->| Landing Page |--->| "Sign Up as     |--->| Institution |
|         |    |              |    |  Teacher"       |    |  Selection  |
+---------+    +--------------+    +-----------------+    +------+------+
                                                                  |
                    +---------------------------------------------+
                    |
                    v
           +--------------+    +--------------+    +--------------+
           |   Search     |--->|  Institution |--->| Request      |
           | Institution  |    |   Found?     |    | Access       |
           |   (name/ID)  |    |              |    | (pending)    |
           +--------------+    +------+-------+    +--------------+
                                      |
                           +----------+----------+
                           |                     |
                          YES                   NO
                           |                     |
                           v                     v
                    +--------------+    +--------------+
                    |  Enter       |    | Create New   |
                    |  Institution |    | Institution  |
                    |  Code/Invite |    | (if allowed) |
                    +------+-------+    +------+-------+
                           |                     |
                           v                     v
                    +--------------+    +--------------+
                    |  Fill Profile|    |  Institution |
                    |  - Name      |    |  Details     |
                    |  - Email     |    |  - Name      |
                    |  - Subject   |    |  - Type      |
                    |  - Password  |    |  - Address   |
                    |  - Phone     |    |  - Admin     |
                    +------+-------+    |  - Contact   |
                           |            +------+-------+
                           |                   |
                           +---------+---------+
                                     |
                                     v
                            +--------------+
                            |  Verify Email |
                            |  (6-digit     |
                            |   code)       |
                            +------+-------+
                                   |
                          +--------+--------+
                          |                 |
                         SUCCESS           FAIL
                          |                 |
                          v                 v
                   +--------------+  +--------------+
                   |  Onboarding  |  |  Resend Code |
                   |  Tutorial    |  |  (max 3)     |
                   |  - Dashboard |  |  -> Block 1hr|
                   |  - Students  |  +--------------+
                   |  - Assignments|
                   |  - Insights  |
                   +------+-------+
                          |
                          v
                   +--------------+
                   |  Dashboard   |
                   |   (Ready)    |
                   +--------------+
```

### 6.4 Teacher Daily Workflow Flow

```
+---------+    +--------------+    +-----------------+    +-------------+
|  START  |--->| Login Page   |--->|  Enter Credentials|--->| Validate   |
|         |    |              |    |  - Email          |    |  Credentials|
+---------+    +--------------+    |  - Password       |    +------+------+
                                   |  OR SSO (Google/  |           |
                                   |     Microsoft)     |           |
                                   +-------------------+           |
                                                                    |
                                                           +--------+--------+
                                                           |                 |
                                                          VALID           INVALID
                                                           |                 |
                                                           v                 v
                                                    +--------------+  +--------------+
                                                    | 2FA Required?|  | Error Message|
                                                    |              |  | - Try again  |
                                                    +------+-------+  | - Forgot pwd |
                                                           |          +------+-------+
                                                  +--------+--------+        |
                                                 YES               NO        |
                                                  |                 |        |
                                                  v                 v        |
                                           +--------------+  +--------------+ |
                                           | Enter 2FA    |  |  Dashboard   | |
                                           | Code / App   |  |   Landing    | |
                                           +------+-------+  +--------------+ |
                                                  |                            |
                                         +--------+--------+                  |
                                        VALID           INVALID               |
                                         |                 |                   |
                                         v                 v                   |
                                  +--------------+  +--------------+          |
                                  |  Dashboard   |  |  Retry/Help  |          |
                                  |              |  |              |          |
                                  +------+-------+  +--------------+          |
                                         |                                   |
                                         v                                   |
                    +------------------------------------------------------+     |
                    |              TEACHER DASHBOARD                            |     |
                    |  +------------+  +------------+  +------------+  |     |
                    |  |  My Classes |  |  Quick      |  |  At-Risk   |  |     |
                    |  |  (cards)    |  |  Actions    |  |  Alerts    |  |     |
                    |  |  - Class A  |  |  - Create   |  |  (count)   |  |     |
                    |  |  - Class B  |  |    Assign.  |  |  - Student |  |     |
                    |  |  - Class C  |  |  - View     |  |    X       |  |     |
                    |  |             |  |    Reports  |  |  - Student |  |     |
                    |  |             |  |  - Message   |  |    Y       |  |     |
                    |  |             |  |    Class    |  |            |  |     |
                    |  +------------+  +------------+  +------------+  |     |
                    |  +-------------------------------------------------+  |     |
                    |  |        Recent Activity Feed                        |  |     |
                    |  |  - New submission from Student A (2 min ago)      |  |     |
                    |  |  - Assignment "Quiz 3" due tomorrow               |  |     |
                    |  |  - Comment added to Student B's record            |  |     |
                    |  +-------------------------------------------------+  |     |
                    +------------------------------------------------------+     |
                                         |                                   |
                    +--------------------+--------------------+----------------+
                    |                    |                    |
                    v                    v                    v
            +--------------+    +--------------+    +--------------+
            | Click Class A |    | Quick Action |    | Click Alert  |
            | Card          |    | "Create      |    | "Student X"  |
            |               |    | Assignment"  |    |              |
            +------+-------+    +------+-------+    +------+-------+
                   |                   |                   |
                   v                   v                   v
            +--------------+    +--------------+    +--------------+
            | CLASS PAGE   |    | ASSIGNMENT   |    | STUDENT      |
            |              |    | CREATION     |    | PROFILE      |
            | Tabs:        |    | FLOW         |    | (At-Risk)    |
            | - Students   |    | (see 6.5)    |    |              |
            | - Assignments|    |              |    | - View record|
            | - Analytics  |    |              |    | - Add comment|
            | - Settings   |    |              |    | - View trend |
            +--------------+    +--------------+    | - Assign help|
                                                     +--------------+
```

### 6.5 Teacher Assignment Creation Flow

```
+--------------+
| "Create      |
| Assignment"  |
|   Button     |
+------+-------+
       |
       v
+-----------------------------------------------------------------+
|                    ASSIGNMENT CREATION WIZARD                      |
|  Step 1: Basic Info -> Step 2: Content -> Step 3: Settings -> Done |
+-----------------------------------------------------------------+
       |
       v
+--------------+    +--------------+    +--------------+
|  STEP 1:     |--->|  STEP 2:     |--->|  STEP 3:     |
|  BASIC INFO  |    |  CONTENT      |    |  SETTINGS    |
|              |    |               |    |              |
| - Title      |    | - Description |    | - Due Date   |
| - Type       |    | - Instructions|    | - Time Limit |
|   (Homework/ |    | - Attachments |    |   (quiz)     |
|    Quiz/     |    | - Rubric      |    | - Attempts   |
|    Project/  |    | - Questions   |    |   Allowed    |
|    Exam)     |    |   (if quiz)   |    | - Late       |
| - Class(es)  |    |               |    |   Submissions|
|   to assign  |    |               |    | - Points     |
|              |    |               |    | - Visibility |
+------+-------+    +------+-------+    +------+-------+
       |                   |                   |
       |              +----+----+
       |              |         |
       |            QUIZ    OTHER
       |              |         |
       |              v         |
       |       +----------+    |
       |       | Question |    |
       |       | Builder  |    |
       |       |          |    |
       |       | - MCQ    |    |
       |       | - T/F    |    |
       |       | - Short  |    |
       |       |   Answer |    |
       |       | - Essay  |    |
       |       | - Match  |    |
       |       | - Fill   |    |
       |       |   Blank  |    |
       |       |          |    |
       |       | + Add    |    |
       |       |   More   |    |
       |       +----+-----+    |
       |            |          |
       +------------+----------+-----------+
                    |
                    v
           +--------------+
           |  PREVIEW &   |
           |  CONFIRM     |
           |              |
           | [Save Draft] |
           | [Publish Now]|
           | [Schedule]   |
           +------+-------+
                  |
         +--------+--------+
         |                 |
      PUBLISH           DRAFT
         |                 |
         v                 v
  +--------------+  +--------------+
  |  Assignment  |  |  Saved to    |
  |  Published!  |  |  Drafts      |
  |              |  |              |
  | - Students   |  | - Resume     |
  |   notified   |  |   later      |
  | - Appears in |  |              |
  |   dashboards |  |              |
  | - Due date   |  |              |
  |   added to   |  |              |
  |   calendars  |  |              |
  +--------------+  +--------------+
```

---

## 7. Functional Requirements

### 7.1 Requirement Conventions

| Field | Description |
|-------|-------------|
| **ID** | Unique identifier (e.g., `FR-AUTH-001`) |
| **Priority** | Must Have (M), Should Have (S), Could Have (C) |
| **Phase** | MVP or Phase 2 — indicates target release |
| **Acceptance Criteria** | Testable conditions for completion |

Requirements marked **MVP** constitute the minimum viable product. All other requirements are scheduled for Phase 2 unless otherwise noted.

### 7.2 Authentication & User Management

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-AUTH-001 | Users shall register with email, password, role (Teacher/Student), and institution association | M | MVP | Registration completes only after valid institution code or admin approval; duplicate emails rejected |
| FR-AUTH-002 | Users shall verify email via 6-digit code before account activation | M | MVP | Code expires after 15 minutes; max 3 resend attempts before 1-hour lockout |
| FR-AUTH-003 | Users shall log in with email and password | M | MVP | Invalid credentials return generic error; account lockout after 5 failed attempts (15 min) |
| FR-AUTH-004 | Users shall reset password via email link | M | MVP | Reset link expires after 1 hour; single use only |
| FR-AUTH-005 | System shall enforce role-based access on every protected route and API endpoint | M | MVP | Unauthorized role access returns 403; verified by automated RBAC tests |
| FR-AUTH-006 | Teachers and students shall complete role-specific onboarding tutorial on first login | S | MVP | Tutorial skippable; progress saved; dashboard accessible after completion or skip |
| FR-AUTH-007 | Users shall authenticate via SSO (Google, Microsoft) | S | Phase 2 | SSO maps to existing institution account or triggers registration flow |
| FR-AUTH-008 | Admins shall enable optional 2FA for institution accounts | S | Phase 2 | TOTP-based 2FA; recovery codes issued on enrollment |
| FR-AUTH-009 | Admins shall create, edit, deactivate, and bulk-import user accounts | M | MVP | CSV import supports Teacher/Student roles; deactivation preserves historical records |
| FR-AUTH-010 | Teachers shall request institution access when institution is not found during registration | S | MVP | Pending requests visible to admin; approval grants institution membership |

### 7.3 Institution & Class Management

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-INST-001 | Admins shall create and configure institution profiles (name, type, address, contact) | M | MVP | Institution receives unique ID and invite code upon creation |
| FR-INST-002 | Admins shall manage institution settings (timezone, academic year, grading scale) | M | MVP | Settings apply to all classes within institution |
| FR-INST-003 | Teachers shall create classes with name, subject, grade level, and term | M | MVP | Class visible on teacher dashboard immediately after creation |
| FR-INST-004 | Teachers shall enroll students via class code, manual add, or roster import | M | MVP | Students added via code appear in class roster within 1 minute |
| FR-INST-005 | Teachers shall remove or transfer students between classes | S | MVP | Removal preserves grade history; student retains access to past submissions |
| FR-INST-006 | Admins shall view and manage all classes across the institution | M | MVP | Admin can reassign class ownership to another teacher |

### 7.4 Student Records

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-REC-001 | Teachers shall view searchable, filterable roster of all students in their classes | M | MVP | Filter by class, name, at-risk status; results return within 2 seconds for 500 students |
| FR-REC-002 | Teachers and admins shall view individual student profiles with academic history | M | MVP | Profile shows assignments, grades, comments, and trend summary |
| FR-REC-003 | Students shall view their own academic record and progress summary | M | MVP | Students cannot view other students' records |
| FR-REC-004 | Teachers shall add timestamped comments to student records | M | MVP | Comments support plain text up to 2,000 characters; visible to student and admin |
| FR-REC-005 | Students shall reply to teacher comments on their own record | S | MVP | Reply thread displayed chronologically; teacher notified on reply |
| FR-REC-006 | Admins shall export student record summaries (CSV/PDF) | S | Phase 2 | Export respects role permissions; audit log entry created |

### 7.5 Assignments

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-ASGN-001 | Teachers shall create assignments via a multi-step wizard (basic info, content, settings) | M | MVP | Wizard supports Homework, Project, and Exam types at MVP |
| FR-ASGN-002 | Teachers shall assign work to one or more classes with due date, points, and visibility settings | M | MVP | Published assignments appear on student dashboards within 1 minute |
| FR-ASGN-003 | Teachers shall save assignments as drafts and resume editing later | M | MVP | Drafts not visible to students until published |
| FR-ASGN-004 | Teachers shall schedule assignment publication for a future date/time | S | Phase 2 | Scheduled assignments auto-publish; failure triggers admin alert |
| FR-ASGN-005 | Teachers shall attach files (PDF, DOCX, images) up to 25 MB per assignment | M | MVP | Unsupported file types rejected with clear error message |
| FR-ASGN-006 | Teachers shall define rubrics with weighted criteria for manual grading | S | MVP | Rubric total points must match assignment point value |
| FR-ASGN-007 | Students shall submit assignments via text entry and/or file upload before due date | M | MVP | Submission timestamp recorded; confirmation shown to student |
| FR-ASGN-008 | System shall accept late submissions when teacher enables late submission policy | S | MVP | Late flag visible to teacher; optional point deduction configurable |
| FR-ASGN-009 | Teachers shall grade submissions with score, rubric breakdown, and written feedback | M | MVP | Grade saved triggers student notification; grade appears in student record |
| FR-ASGN-010 | Teachers shall edit or delete unpublished assignments; published assignments require archive action | M | MVP | Deleting published assignment preserves submitted work in read-only state |

### 7.6 Quizzes

> **Note:** Quizzes are implemented as a specialized assignment type (`type = quiz`) sharing the assignment data model, with additional question and auto-grading entities.

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-QUIZ-001 | Teachers shall create quizzes with multiple-choice and true/false questions at MVP | M | MVP | Minimum 1 question required; each question has point value |
| FR-QUIZ-002 | Teachers shall add short-answer, essay, matching, and fill-in-the-blank question types | S | Phase 2 | Essay questions require manual grading |
| FR-QUIZ-003 | Teachers shall set time limits and allowed attempts per quiz | S | MVP | Timer auto-submits quiz on expiry; attempt count enforced |
| FR-QUIZ-004 | Students shall take quizzes within the assignment interface | M | MVP | One active attempt at a time; answers auto-saved every 30 seconds |
| FR-QUIZ-005 | System shall auto-grade objective question types (MCQ, T/F) immediately on submission | M | MVP | Score calculated and visible to student within 5 seconds |
| FR-QUIZ-006 | Teachers shall review and override auto-graded quiz scores | M | MVP | Override logged with timestamp and teacher ID |

### 7.7 Insights, Analytics & AI

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-INS-001 | Teachers shall view class-level analytics (average grade, completion rate, grade distribution) | M | MVP | Analytics refresh within 15 minutes of new grade data |
| FR-INS-002 | Teachers and admins shall view individual student performance trends over time | M | MVP | Trend chart shows last 90 days by default; filterable by subject |
| FR-INS-003 | System shall flag at-risk students using rule-based criteria at MVP | M | MVP | Alert triggered when: (a) grade drops ≥20% over 14 days, (b) ≥2 missing assignments, or (c) quiz average below 60% |
| FR-INS-004 | At-risk alerts shall appear on teacher dashboard and class analytics views | M | MVP | Alert includes student name, trigger reason, and link to student profile |
| FR-INS-005 | Students shall view personal insights dashboard (grades, strengths, areas for improvement) | M | MVP | Dashboard shows subject-level performance; no peer comparison data exposed |
| FR-INS-006 | System shall generate AI-powered study recommendations based on student performance gaps | S | Phase 2 | Recommendations cite specific weak topics; teacher can disable per class |
| FR-INS-007 | Admins shall view institution-wide analytics across classes and subjects | S | Phase 2 | Aggregated data only; no individual student PII in institution summary export |
| FR-INS-008 | AI features shall include human-review pathway — teachers approve recommendations before student visibility | M | Phase 2 | Unapproved AI output not shown to students; approval status tracked |

### 7.8 Notifications

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-NOTIF-001 | System shall send in-app notifications for assignment publish, submission, grade, and comment events | M | MVP | Notifications appear in bell icon feed; mark-as-read supported |
| FR-NOTIF-002 | System shall send email notifications for assignment due reminders (24h and 1h before due) | M | MVP | Students can opt out of email reminders in profile settings |
| FR-NOTIF-003 | Teachers shall receive notifications for new submissions and student comment replies | M | MVP | Notification links directly to relevant grading or comment view |
| FR-NOTIF-004 | Admins shall configure institution-level notification defaults | S | Phase 2 | Defaults apply to new users; individual users can override |

### 7.9 Reports & Export

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-RPT-001 | Teachers shall generate class progress reports (PDF) | S | MVP | Report includes roster, assignment completion, and grade summary |
| FR-RPT-002 | Students shall download personal progress report (PDF) | S | MVP | Report covers current term only |
| FR-RPT-003 | Admins shall export gradebook data and user lists (CSV) | M | MVP | Export completes within 30 seconds for up to 1,000 records |
| FR-RPT-004 | All exports shall be logged in the audit trail | M | MVP | Log entry includes user, timestamp, export type, and record count |

### 7.10 Dashboard

| ID | Requirement | Priority | Phase | Acceptance Criteria |
|----|-------------|----------|-------|---------------------|
| FR-DASH-001 | Teachers shall see personalized dashboard with class cards, quick actions, at-risk alerts, and activity feed | M | MVP | Dashboard loads within 3 seconds on standard broadband |
| FR-DASH-002 | Students shall see dashboard with upcoming assignments, recent grades, and insights summary | M | MVP | Assignments sorted by due date; overdue items visually distinguished |
| FR-DASH-003 | Admins shall see institution overview with user counts, active classes, and system health indicators | M | MVP | Overview data refreshes on page load |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-001 | Page load time (dashboard, class page) | ≤ 3 seconds at P95 under normal load |
| NFR-PERF-002 | API response time (read operations) | ≤ 500 ms at P95 |
| NFR-PERF-003 | API response time (write operations: submit, grade) | ≤ 1 second at P95 |
| NFR-PERF-004 | Search and filter (student roster) | ≤ 2 seconds for up to 500 records |
| NFR-PERF-005 | File upload (25 MB) | ≤ 30 seconds on 10 Mbps connection |
| NFR-PERF-006 | Auto-grade quiz submission | ≤ 5 seconds from submit to score display |
| NFR-PERF-007 | Analytics dashboard refresh | ≤ 15 minutes from underlying data change |

### 8.2 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCALE-001 | Concurrent users per institution | 1,000 without performance degradation |
| NFR-SCALE-002 | Total platform users (Year 1) | 10,000 across all institutions |
| NFR-SCALE-003 | Assignments per class per term | Up to 100 |
| NFR-SCALE-004 | Students per teacher | Up to 200 across all classes |
| NFR-SCALE-005 | File storage per institution | 50 GB initial; expandable |

### 8.3 Availability & Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AVAIL-001 | System uptime | 99.5% monthly (excluding planned maintenance) |
| NFR-AVAIL-002 | Planned maintenance window | Sundays 02:00–06:00 UTC; notified 48 hours in advance |
| NFR-AVAIL-003 | Recovery Time Objective (RTO) | 4 hours |
| NFR-AVAIL-004 | Recovery Point Objective (RPO) | 1 hour |
| NFR-AVAIL-005 | Auto-save for quiz and assignment drafts | Every 30 seconds; no data loss on browser crash |

### 8.4 Usability & Accessibility

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-UX-001 | Responsive design | Fully functional on desktop (1280px+), tablet (768px+), and mobile (375px+) |
| NFR-UX-002 | WCAG compliance | Level AA for all student-facing and teacher-facing interfaces |
| NFR-UX-003 | Browser support | Latest two versions of Chrome, Firefox, Safari, Edge |
| NFR-UX-004 | Onboarding completion | New users reach dashboard within 5 minutes of registration |
| NFR-UX-005 | Error messages | User-friendly, actionable; no raw stack traces exposed to end users |

### 8.5 Maintainability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-MAINT-001 | Code coverage (unit + integration tests) | ≥ 80% for critical paths (auth, grading, RBAC) |
| NFR-MAINT-002 | API documentation | OpenAPI/Swagger spec auto-generated and kept current |
| NFR-MAINT-003 | Deployment | CI/CD pipeline with automated tests; deploy to staging before production |
| NFR-MAINT-004 | Logging | Structured JSON logs with correlation IDs for request tracing |

---

## 9. Security Requirements

### 9.1 Authentication & Authorization

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-AUTH-001 | Passwords hashed with bcrypt (cost factor ≥ 12) or Argon2id | M |
| SEC-AUTH-002 | Session tokens expire after 24 hours of inactivity; refresh token rotation enforced | M |
| SEC-AUTH-003 | RBAC enforced at API layer — not UI-only | M |
| SEC-AUTH-004 | Institution data isolated via tenant-scoped queries (multi-tenant architecture) | M |
| SEC-AUTH-005 | SSO tokens validated against provider JWKS; nonce and state parameters enforced | S |
| SEC-AUTH-006 | 2FA secrets encrypted at rest; recovery codes hashed | S |

### 9.2 Data Protection

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-DATA-001 | All data encrypted in transit via TLS 1.2+ | M |
| SEC-DATA-002 | PII and grade data encrypted at rest (AES-256) | M |
| SEC-DATA-003 | File uploads scanned for malware before storage | M |
| SEC-DATA-004 | Student records accessible only to authorized roles within the same institution | M |
| SEC-DATA-005 | Data retention: active records retained for academic year + 2 years; deletion upon institution request | M |
| SEC-DATA-006 | Right to erasure (GDPR): user deletion anonymizes PII while preserving anonymized grade aggregates | S |

### 9.3 Application Security

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-APP-001 | Protection against OWASP Top 10 (SQL injection, XSS, CSRF, etc.) | M |
| SEC-APP-002 | Rate limiting on auth endpoints (max 10 attempts/minute per IP) | M |
| SEC-APP-003 | Content Security Policy (CSP) headers on all pages | M |
| SEC-APP-004 | Input validation and sanitization on all user-submitted content | M |
| SEC-APP-005 | Dependency vulnerability scanning in CI pipeline | M |

### 9.4 Audit & Compliance

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-AUDIT-001 | Audit log for: login/logout, grade changes, record access, exports, admin actions | M |
| SEC-AUDIT-002 | Audit logs immutable and retained for 3 years | M |
| SEC-AUDIT-003 | FERPA-compliant access controls for student educational records | M |
| SEC-AUDIT-004 | COPPA compliance for users under 13 (parental consent workflow) | S |
| SEC-AUDIT-005 | Annual third-party security assessment | S |

---

## 10. Data Requirements

### 10.1 Core Entities

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| **Institution** | Top-level tenant (school/district) | `id`, `name`, `type`, `address`, `timezone`, `grading_scale`, `invite_code`, `created_at` |
| **User** | All platform users | `id`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `institution_id`, `status`, `created_at` |
| **Class** | A teacher's course section | `id`, `name`, `subject`, `grade_level`, `term`, `teacher_id`, `institution_id`, `class_code` |
| **Enrollment** | Student membership in a class | `id`, `student_id`, `class_id`, `enrolled_at`, `status` |
| **Assignment** | Homework, project, exam, or quiz | `id`, `title`, `type`, `description`, `class_id`, `due_date`, `points`, `status`, `settings_json`, `created_by` |
| **Submission** | Student work for an assignment | `id`, `assignment_id`, `student_id`, `content`, `file_url`, `submitted_at`, `is_late`, `status` |
| **Grade** | Score and feedback on a submission | `id`, `submission_id`, `score`, `max_score`, `feedback`, `rubric_scores_json`, `graded_by`, `graded_at` |
| **QuizQuestion** | Question within a quiz assignment | `id`, `assignment_id`, `type`, `prompt`, `options_json`, `correct_answer`, `points`, `order` |
| **QuizAnswer** | Student answer to a quiz question | `id`, `submission_id`, `question_id`, `answer`, `is_correct`, `points_earned` |
| **Comment** | Teacher-student communication on records | `id`, `student_id`, `author_id`, `content`, `parent_comment_id`, `created_at` |
| **Notification** | In-app and email notification record | `id`, `user_id`, `type`, `title`, `body`, `read_at`, `created_at` |
| **AtRiskAlert** | System-generated student risk flag | `id`, `student_id`, `class_id`, `trigger_reason`, `severity`, `resolved_at`, `created_at` |
| **AuditLog** | Security and compliance event | `id`, `user_id`, `action`, `resource_type`, `resource_id`, `metadata_json`, `ip_address`, `created_at` |

### 10.2 Entity Relationships

```
Institution 1──* User
Institution 1──* Class
User (Teacher) 1──* Class
Class *──* User (Student)  via Enrollment
Class 1──* Assignment
Assignment 1──* Submission
Submission 1──1 Grade
Assignment 1──* QuizQuestion  (when type = quiz)
Submission 1──* QuizAnswer
User (Student) 1──* Comment
User (Student) 1──* AtRiskAlert
```

### 10.3 Data Validation Rules

| Field | Rule |
|-------|------|
| Email | Valid RFC 5322 format; unique per institution |
| Password | Minimum 8 characters; at least 1 uppercase, 1 lowercase, 1 digit |
| Assignment title | 3–200 characters; required |
| Due date | Must be in the future at publish time (or allow backdating for imported records) |
| Grade score | 0 ≤ score ≤ max_score; max_score > 0 |
| Comment content | 1–2,000 characters; HTML stripped |
| File upload | Max 25 MB; allowed types: PDF, DOCX, PNG, JPG, JPEG |

### 10.4 Data Retention & Backup

| Data Type | Retention Policy | Backup Frequency |
|-----------|-----------------|------------------|
| Active academic records | Academic year + 2 years | Daily |
| Audit logs | 3 years | Daily |
| User accounts (deactivated) | 1 year, then anonymize | Daily |
| File attachments | Same as parent assignment record | Daily (replicated storage) |
| Analytics aggregates | 5 years | Weekly |

---

## 11. Integration Requirements

### 11.1 Authentication Integrations

| ID | Integration | Priority | Phase | Details |
|----|-------------|----------|-------|---------|
| INT-AUTH-001 | Google SSO | S | Phase 2 | OAuth 2.0 / OpenID Connect; Workspace and personal accounts |
| INT-AUTH-002 | Microsoft SSO | S | Phase 2 | Azure AD / Entra ID OAuth 2.0 |

### 11.2 Communication Integrations

| ID | Integration | Priority | Phase | Details |
|----|-------------|----------|-------|---------|
| INT-COMM-001 | Transactional email (SendGrid or AWS SES) | M | MVP | Assignment reminders, grade notifications, password reset |
| INT-COMM-002 | Email templates | M | MVP | Branded per institution; unsubscribe link in non-critical emails |

### 11.3 Calendar Integrations

| ID | Integration | Priority | Phase | Details |
|----|-------------|----------|-------|---------|
| INT-CAL-001 | iCal feed for assignment due dates | S | Phase 2 | Per-student feed URL; read-only subscription |
| INT-CAL-002 | Google Calendar sync | C | Phase 2 | OAuth-based; student opt-in |

### 11.4 Data Import/Export

| ID | Integration | Priority | Phase | Details |
|----|-------------|----------|-------|---------|
| INT-DATA-001 | CSV roster import | M | MVP | Columns: email, first_name, last_name, role; max 500 rows per upload |
| INT-DATA-002 | CSV gradebook export | M | MVP | Standard format: student, assignment, score, max_score, submitted_at |
| INT-DATA-003 | PDF report generation | S | MVP | Server-side rendering; institution logo support |
| INT-DATA-004 | SIS integration (Clever, ClassLink) | C | Phase 2 | Roster sync; single sign-on |

### 11.5 AI Service Integration

| ID | Integration | Priority | Phase | Details |
|----|-------------|----------|-------|---------|
| INT-AI-001 | LLM API for study recommendations | S | Phase 2 | Input: anonymized performance data; output: topic-level suggestions |
| INT-AI-002 | AI response guardrails | M | Phase 2 | Content filtering; no PII sent to external model; teacher approval required |

### 11.6 Infrastructure Integrations

| ID | Integration | Priority | Phase | Details |
|----|-------------|----------|-------|---------|
| INT-INFRA-001 | Cloud object storage (S3-compatible) | M | MVP | Assignment file attachments; signed URLs for download |
| INT-INFRA-002 | Monitoring and alerting (e.g., Datadog, Grafana) | M | MVP | Uptime, error rate, latency dashboards; PagerDuty for critical alerts |

---

## 12. Success Metrics & KPIs

### 12.1 KPI Framework

Each strategic goal (G1–G6) maps to measurable KPIs with defined baselines, targets, and measurement methods.

### 12.2 Goal-to-KPI Mapping

| Goal | KPI ID | Metric | Baseline | Target | Measurement |
|------|--------|--------|----------|--------|-------------|
| **G1** Reduce teacher admin workload 40% | KPI-G1-001 | Avg. weekly hours on grading and record-keeping | 7.5 hrs/week (survey) | ≤ 4.5 hrs/week | Quarterly teacher survey (n ≥ 30) |
| | KPI-G1-002 | Time from submission to graded feedback | 72 hours | ≤ 48 hours | Platform analytics: median `graded_at - submitted_at` |
| | KPI-G1-003 | % grades entered via Edu-Learn (vs. external tools) | 0% | ≥ 90% | Grade records with `graded_by` in platform |
| **G2** Increase assignment completion 25% | KPI-G2-001 | Assignment completion rate | 65% | ≥ 81% | `submissions / eligible_students` per assignment |
| | KPI-G2-002 | On-time submission rate | 55% | ≥ 70% | Submissions where `is_late = false` |
| | KPI-G2-003 | Student login frequency (weekly active) | — | ≥ 3 logins/week during term | Session analytics |
| **G3** Improve performance via insights | KPI-G3-001 | Students viewing insights dashboard monthly | 0% | ≥ 60% | Page view analytics |
| | KPI-G3-002 | Avg. grade improvement after insight engagement | — | ≥ 5% within 30 days | Compare pre/post insight view cohorts |
| | KPI-G3-003 | Study recommendation adoption rate | — | ≥ 40% (Phase 2) | Students acting on ≥ 1 recommendation |
| **G4** Early at-risk identification | KPI-G4-001 | % at-risk students flagged before 30% grade drop | 0% | ≥ 80% | Alerts where `created_at` precedes 30% drop event |
| | KPI-G4-002 | Median days from alert to teacher intervention | — | ≤ 5 days | Time from alert to teacher comment or grade adjustment |
| | KPI-G4-003 | False positive rate for at-risk alerts | — | ≤ 20% | Alerts resolved without intervention / total alerts |
| **G5** 90% user satisfaction | KPI-G5-001 | Teacher satisfaction score (CSAT) | — | ≥ 4.5 / 5.0 | Quarterly in-app survey |
| | KPI-G5-002 | Student satisfaction score (CSAT) | — | ≥ 4.5 / 5.0 | Quarterly in-app survey |
| | KPI-G5-003 | Net Promoter Score (NPS) | — | ≥ 50 | Semi-annual survey |
| **G6** Institution analytics | KPI-G6-001 | Admin dashboard monthly active usage | 0% | ≥ 75% of admins | Session analytics |
| | KPI-G6-002 | Data-driven curriculum actions per term | — | ≥ 2 per institution | Admin-reported via quarterly review |
| | KPI-G6-003 | Report export volume | — | ≥ 10 exports/institution/month | Audit log analytics |

### 12.3 Platform Health KPIs

| KPI ID | Metric | Target |
|--------|--------|--------|
| KPI-OPS-001 | System uptime | ≥ 99.5% monthly |
| KPI-OPS-002 | P95 page load time | ≤ 3 seconds |
| KPI-OPS-003 | Critical bug resolution time | ≤ 48 hours |
| KPI-OPS-004 | User-reported support tickets per 100 users | ≤ 5/month |

### 12.4 Review Cadence

| Review | Frequency | Participants |
|--------|-----------|--------------|
| KPI dashboard review | Monthly | Product, Engineering |
| Goal progress review | Quarterly | Product, Leadership, Pilot schools |
| Full PRD and KPI revision | Semi-annually | Product, Engineering, Design, Security |

---

## 13. Risks & Mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R-001 | **Scope creep** — feature set too large for initial release | High | High | Enforce MVP/Phase 2 tags on all requirements; quarterly scope review |
| R-002 | **Low teacher adoption** — teachers resist switching from existing tools | Medium | High | Pilot with 2–3 schools; onboarding tutorial; import from CSV; gather feedback in Q1 |
| R-003 | **Student disengagement** — students ignore notifications and insights | Medium | Medium | Mobile-responsive design; gamified progress indicators; due-date reminders |
| R-004 | **At-risk alert false positives** — teachers lose trust in alerts | Medium | High | Start with conservative rule-based thresholds; track false positive rate (KPI-G4-003); teacher dismiss/resolve workflow |
| R-005 | **AI recommendation inaccuracy** — misleading study guidance (Phase 2) | Medium | High | Teacher approval gate (FR-INS-008); no PII sent to external models; content guardrails |
| R-006 | **FERPA/COPPA compliance failure** | Low | Critical | Legal review before launch; RBAC enforcement; audit logging; parental consent for under-13 users |
| R-007 | **Data breach or unauthorized record access** | Low | Critical | Encryption at rest/transit; tenant isolation; penetration testing; incident response plan |
| R-008 | **Performance degradation at scale** | Medium | Medium | Load testing before each release; horizontal scaling; CDN for static assets |
| R-009 | **SSO integration complexity** (Phase 2) | Medium | Medium | Defer to Phase 2; support email/password for MVP; document provider-specific edge cases |
| R-010 | **File storage costs** — unchecked upload growth | Medium | Low | 25 MB per-file cap; institution storage quotas; lifecycle policies for old attachments |
| R-011 | **Dependency on third-party email delivery** | Low | Medium | Fallback provider configured; retry queue; monitor delivery rates |
| R-012 | **Key person risk** — small team, concentrated knowledge | Medium | Medium | Documentation (this PRD, API specs); code review requirements; bus factor mitigation plan |

---

## 14. MVP Scope & Product Roadmap

### 14.1 Roadmap Overview

Edu-Learn delivery is organized into three phases over 9 months, aligned with strategic goals G1–G6. Each phase has a clear theme, exit criteria, and measurable outcomes before the next phase begins.

```
2026 Timeline
─────────────────────────────────────────────────────────────────────────
Q1 (Months 1–3)          Q2 (Months 4–6)           Q3 (Months 7–9)
─────────────────────────────────────────────────────────────────────────
 PHASE 1: MVP             PHASE 2: Growth           PHASE 3: Scale
 "Teach & Track"          "Intelligence & Connect"  "Institution Ready"
─────────────────────────────────────────────────────────────────────────
 • Auth & RBAC            • SSO (Google/Microsoft)  • SIS integration
 • Classes & roster       • AI study recommendations• Parent portal
 • Assignments & grading  • Advanced quiz types     • COPPA compliance
 • Basic quizzes          • Institution analytics   • Calendar sync
 • Comments & feedback    • Scheduled publishing    • Performance tuning
 • Rule-based at-risk     • Parent read-only access • NPS / satisfaction
 • Dashboards & reports   • 2FA                     • Multi-school rollout
─────────────────────────────────────────────────────────────────────────
 Goals: G1, G4            Goals: G2, G3             Goals: G5, G6
 Pilot: 2–3 schools       Expand: 10 schools        Target: 25+ schools
```

### 14.2 MVP Definition (Phase 1)

#### 14.2.1 MVP Goal

Deliver a **working teacher–student loop** in a single institution: teachers create classes, assign and grade work, leave feedback, and identify at-risk students; students submit work, view grades, and track progress — all within a secure, role-based web application.

#### 14.2.2 MVP Success Criteria

| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | 2–3 pilot schools onboarded with ≥ 5 teachers and ≥ 100 students each | Admin dashboard user counts |
| 2 | Teachers complete full workflow: create class → assign → grade → comment | End-to-end test + pilot observation |
| 3 | Students submit assignments and view grades without support tickets | < 5 support tickets per 100 students in first month |
| 4 | At-risk alerts fire correctly for seeded test scenarios | QA test suite + KPI-G4-003 false positive ≤ 30% at pilot |
| 5 | System uptime ≥ 99% during pilot period | KPI-OPS-001 |
| 6 | P95 dashboard load ≤ 3 seconds | KPI-OPS-002 |

#### 14.2.3 In Scope — MVP

| Category | Included Capabilities | Requirement IDs |
|----------|----------------------|-----------------|
| **Users & roles** | Teacher, Student, School Admin; email/password auth; email verification; password reset; RBAC | FR-AUTH-001–006, 009–010 |
| **Institution** | Single-institution setup; invite codes; institution settings | FR-INST-001–006 |
| **Classes** | Create classes; enroll via class code, manual add, CSV import; remove students | FR-INST-003–005 |
| **Assignments** | Homework, Project, Exam types; wizard; drafts; file attachments (25 MB); rubrics; late submissions; grading with feedback | FR-ASGN-001–003, 005–010 |
| **Quizzes** | MCQ and True/False only; time limits; attempt limits; auto-grade; teacher override | FR-QUIZ-001, 003–006 |
| **Student records** | Searchable roster; individual profiles; teacher comments; student replies | FR-REC-001–005 |
| **Analytics** | Class-level analytics; individual student trends; rule-based at-risk alerts; student insights dashboard | FR-INS-001–005 |
| **Notifications** | In-app notifications; email for due reminders, grades, submissions | FR-NOTIF-001–003 |
| **Reports** | Class progress PDF; student progress PDF; admin CSV export; audit-logged exports | FR-RPT-001–004 |
| **Dashboards** | Teacher (classes, alerts, activity feed); Student (assignments, grades); Admin (overview) | FR-DASH-001–003 |
| **Infrastructure** | Responsive web (375px+); object storage; transactional email; monitoring | NFR-UX-001; INT-COMM-001, INT-INFRA-001–002 |
| **Security** | TLS, encryption at rest, tenant isolation, audit logs, OWASP protections | SEC-AUTH-001–004; SEC-DATA-001–005; SEC-APP-001–005; SEC-AUDIT-001–003 |

#### 14.2.4 Out of Scope — MVP (Deferred)

| Capability | Deferred To | Rationale |
|------------|-------------|-----------|
| SSO (Google, Microsoft) | Phase 2 | Reduces integration risk; email/password sufficient for pilot |
| Two-factor authentication | Phase 2 | Not required for initial pilot; adds onboarding friction |
| AI study recommendations | Phase 2 | Core insights work without AI; teacher-approval workflow needed first |
| Advanced quiz types (essay, matching, fill-in-blank) | Phase 2 | MCQ/T-F covers 80% of quiz use cases at MVP |
| Scheduled assignment publishing | Phase 2 | Manual publish acceptable for pilot |
| Institution-wide analytics dashboard | Phase 2 | Class-level analytics sufficient for G1/G4 |
| Parent portal | Phase 2 | Secondary user; not on critical path |
| SIS integration (Clever, ClassLink) | Phase 3 | CSV import sufficient for pilot schools |
| Calendar sync (iCal, Google Calendar) | Phase 3 | Email reminders cover due-date awareness at MVP |
| COPPA parental consent workflow | Phase 3 | Pilot targets middle/high school (ages 13+) |

### 14.3 Phase 1 — MVP Build Plan

Phase 1 is a **12-week build** followed by a **4-week pilot**. Work is organized into six two-week sprints.

#### Sprint 1 (Weeks 1–2): Foundation

| Deliverable | Details |
|-------------|---------|
| Project scaffold | Monorepo or full-stack app structure; CI/CD pipeline; dev/staging environments |
| Database schema | Core entities: Institution, User, Class, Enrollment (Section 10.1) |
| Auth module | Registration, email verification, login, password reset (FR-AUTH-001–005) |
| Admin seed | Institution creation; admin account; invite code generation (FR-INST-001) |

**Exit gate:** Admin can create institution; teacher can register and log in.

#### Sprint 2 (Weeks 3–4): Classes & Roster

| Deliverable | Details |
|-------------|---------|
| Class management | Create/edit classes; class codes (FR-INST-003) |
| Student enrollment | Class code join; manual add; CSV roster import (FR-INST-004, FR-AUTH-009) |
| Teacher dashboard shell | Class cards layout; navigation skeleton (FR-DASH-001 partial) |
| Onboarding tutorial | Role-specific first-login walkthrough (FR-AUTH-006) |

**Exit gate:** Teacher creates class; students enroll; roster visible.

#### Sprint 3 (Weeks 5–6): Assignments

| Deliverable | Details |
|-------------|---------|
| Assignment wizard | 3-step create flow: basic info, content, settings (FR-ASGN-001–003) |
| File uploads | Attachment support via object storage (FR-ASGN-005, INT-INFRA-001) |
| Student submission | Text + file submit; late submission policy (FR-ASGN-007–008) |
| Grading interface | Score, feedback, rubric grading (FR-ASGN-006, 009) |

**Exit gate:** Full assignment lifecycle: create → publish → submit → grade.

#### Sprint 4 (Weeks 7–8): Quizzes & Records

| Deliverable | Details |
|-------------|---------|
| Quiz builder | MCQ and T/F question types (FR-QUIZ-001) |
| Quiz taking | Timer, auto-save, attempt limits (FR-QUIZ-003–004) |
| Auto-grading | Immediate scoring for objective questions (FR-QUIZ-005–006) |
| Student records | Profiles, comment threads, student replies (FR-REC-001–005) |

**Exit gate:** Teacher creates and auto-grades quiz; comments visible to student.

#### Sprint 5 (Weeks 9–10): Analytics & Notifications

| Deliverable | Details |
|-------------|---------|
| Class analytics | Grade distribution, completion rates (FR-INS-001) |
| Student trends | 90-day performance charts (FR-INS-002) |
| At-risk engine | Rule-based alerts: grade drop, missing work, low quiz avg (FR-INS-003–004) |
| Notifications | In-app bell feed; email for grades, submissions, due dates (FR-NOTIF-001–003) |
| Student dashboard | Assignments, grades, insights summary (FR-DASH-002, FR-INS-005) |

**Exit gate:** At-risk alert fires on test data; notifications delivered.

#### Sprint 6 (Weeks 11–12): Reports, Admin & Hardening

| Deliverable | Details |
|-------------|---------|
| Reports & export | Class/student PDF reports; admin CSV export (FR-RPT-001–003) |
| Admin dashboard | Institution overview; user management; class management (FR-DASH-003, FR-INST-006) |
| Audit logging | All exports and grade changes logged (FR-RPT-004, SEC-AUDIT-001) |
| Security hardening | Rate limiting, CSP, input sanitization, RBAC test suite |
| QA & pilot prep | End-to-end tests; load test to 200 students; pilot school onboarding docs |

**Exit gate:** All MVP success criteria (14.2.2) met in staging.

#### Pilot Period (Weeks 13–16)

| Week | Activity |
|------|----------|
| 13 | Onboard 2 pilot schools; admin training; teacher onboarding sessions |
| 14 | Teachers create classes and first assignments; monitor support tickets |
| 15 | Full term usage; collect KPI-G1, G4 baseline data |
| 16 | Pilot retrospective; go/no-go decision for Phase 2 |

### 14.4 Phase 2 — Growth (Months 4–6)

**Theme:** Intelligence & Connect — add AI, enterprise auth, and broader stakeholder access.

| Workstream | Features | Requirement IDs | Goals |
|------------|----------|-----------------|-------|
| **Enterprise auth** | Google SSO, Microsoft SSO, optional 2FA | FR-AUTH-007–008, INT-AUTH-001–002 | Reduce login friction for schools with existing identity providers |
| **AI insights** | Study recommendations with teacher approval gate | FR-INS-006, 008, INT-AI-001–002 | G3 |
| **Advanced assessments** | Short-answer, essay, matching, fill-in-blank quiz types; scheduled publishing | FR-QUIZ-002, FR-ASGN-004 | G2 |
| **Institution analytics** | Cross-class dashboards for principals/admins | FR-INS-007 | G6 |
| **Parent access** | Read-only child progress view; notification preferences | Appendix A (Parent column) | Extend stakeholder reach |
| **Notification config** | Institution-level notification defaults | FR-NOTIF-004 | Admin control |
| **Calendar** | iCal feed for assignment due dates | INT-CAL-001 | Student due-date awareness |

**Phase 2 exit criteria:**
- KPI-G2-001 assignment completion ≥ 75% (progress toward 81% target)
- KPI-G3-001 insights dashboard viewed by ≥ 40% of students
- SSO live at ≥ 1 pilot school
- AI recommendations approved and viewed by ≥ 20% of students in pilot classes

### 14.5 Phase 3 — Scale (Months 7–9)

**Theme:** Institution Ready — compliance, integrations, performance, and multi-school rollout.

| Workstream | Features | Requirement IDs | Goals |
|------------|----------|-----------------|-------|
| **SIS integration** | Clever / ClassLink roster sync | INT-DATA-004 | Eliminate manual CSV imports at scale |
| **Compliance** | COPPA parental consent; GDPR erasure workflow; annual security assessment | SEC-AUDIT-004–005, SEC-DATA-006 | Legal readiness for K-8 and EU |
| **Calendar sync** | Google Calendar two-way sync | INT-CAL-002 | Student engagement |
| **Performance** | Load testing to 10,000 users; CDN; query optimization | NFR-SCALE-002, R-008 | Platform reliability at scale |
| **Satisfaction** | In-app CSAT surveys; NPS collection | KPI-G5-001–003 | G5 |
| **Multi-school rollout** | Onboarding playbook; support documentation; expand to 25+ schools | — | G5, G6 |

**Phase 3 exit criteria:**
- KPI-G5-001/002 CSAT ≥ 4.5/5.0
- KPI-G6-001 admin dashboard used by ≥ 75% of admins monthly
- 25+ schools onboarded
- 99.5% uptime sustained over 3 consecutive months

### 14.6 Feature Priority Matrix

Features classified by user impact and implementation effort to guide sprint planning within each phase.

```
                        HIGH IMPACT
                            │
         ┌──────────────────┼──────────────────┐
         │  DO FIRST        │  PLAN CAREFULLY   │
         │  (MVP core)      │  (Phase 2)        │
         │                  │                   │
  LOW    │  • Auth/RBAC     │  • AI recommend.  │  HIGH
  EFFORT │  • Assignments   │  • SSO            │  EFFORT
         │  • Basic quizzes │  • SIS integration│
         │  • Grading       │  • Parent portal  │
         │  • At-risk rules │  • 2FA            │
         ├──────────────────┼──────────────────┤
         │  QUICK WINS      │  DEFER / CUT      │
         │  (MVP polish)    │  (Phase 3+)       │
         │                  │                   │
         │  • Onboarding    │  • Google Cal sync│
         │  • Email remind. │  • Essay quizzes  │
         │  • PDF reports   │  • Schedule publish│
         │  • Comment reply │  • Gamification   │
         └──────────────────┼──────────────────┘
                            │
                        LOW IMPACT
```

### 14.7 Requirement Traceability by Phase

| Phase | Functional Requirements | Integration Requirements | Goals Addressed |
|-------|------------------------|--------------------------|-----------------|
| **MVP** | FR-AUTH-001–006, 009–010; FR-INST-001–006; FR-REC-001–005; FR-ASGN-001–003, 005–010; FR-QUIZ-001, 003–006; FR-INS-001–005; FR-NOTIF-001–003; FR-RPT-001–004; FR-DASH-001–003 | INT-COMM-001–002; INT-DATA-001–003; INT-INFRA-001–002 | G1, G4 |
| **Phase 2** | FR-AUTH-007–008; FR-ASGN-004; FR-QUIZ-002; FR-INS-006–008; FR-NOTIF-004; FR-REC-006 | INT-AUTH-001–002; INT-CAL-001; INT-AI-001–002 | G2, G3, G6 (partial) |
| **Phase 3** | — (infrastructure, compliance, and integration-focused) | INT-CAL-002; INT-DATA-004; SEC-AUDIT-004–005 | G5, G6 |

### 14.8 Team & Resource Assumptions

| Role | MVP (Phase 1) | Phase 2 | Phase 3 |
|------|---------------|---------|---------|
| Full-stack engineer | 2 | 2 | 2–3 |
| Frontend engineer | 1 | 1 | 1 |
| Product manager | 1 | 1 | 1 |
| UI/UX designer | 0.5 | 0.5 | 0.5 |
| QA engineer | 0.5 | 1 | 1 |
| DevOps | 0.25 | 0.5 | 0.5 |

**Total MVP team:** ~5 FTE for 12 weeks.

### 14.9 Go / No-Go Decision Points

| Gate | Timing | Proceed If | Pause If |
|------|--------|------------|----------|
| **G1: Sprint 2** | Week 4 | Auth + classes working in staging | RBAC failures or enrollment blockers |
| **G2: Sprint 4** | Week 8 | Assignment + quiz lifecycle complete | Grading or auto-grade defects unresolved |
| **G3: MVP launch** | Week 12 | All 6 MVP success criteria met | Uptime < 99% or P95 load > 5s in load test |
| **G4: Phase 2 start** | Week 16 | Pilot CSAT ≥ 3.5; ≥ 3 teachers active per school | < 2 active teachers per school or critical pilot bugs |
| **G5: Phase 3 start** | Month 6 | G2/G3 KPIs on track (≥ 70% of targets) | Completion rate unchanged vs. baseline |
| **G6: General availability** | Month 9 | G5 CSAT ≥ 4.5; 25+ schools committed | Security assessment fails or compliance gaps |

---

## 15. Appendices

### Appendix A: Role-Based Access Control Matrix

| Permission | Teacher | Student | Parent | School Admin | IT Admin |
|------------|:-------:|:-------:|:------:|:------------:|:--------:|
| Register / login | Yes | Yes | Phase 2 | Yes | Yes |
| View own profile | Yes | Yes | Yes | Yes | Yes |
| View all students in institution | - | - | - | Yes | Yes |
| View students in own classes | Yes | - | - | Yes | Yes |
| View own academic record | - | Yes | Phase 2 | - | - |
| View individual student profile | Yes | Own only | Phase 2 | Yes | Yes |
| Search and filter students | Yes | - | - | Yes | Yes |
| Create / edit / delete assignments | Yes | - | - | - | - |
| View assigned work | Yes | Yes | Phase 2 | Yes | Yes |
| Submit assignments | - | Yes | - | - | - |
| Grade submissions | Yes | - | - | - | - |
| Create quizzes | Yes | - | - | - | - |
| Take quizzes | - | Yes | - | - | - |
| View quiz results (auto-graded) | Yes | Own only | Phase 2 | Yes | Yes |
| Add comments to student records | Yes | - | - | - | - |
| View comments | Yes | Yes | Phase 2 | Yes | Yes |
| Reply to comments | - | Yes | - | - | - |
| View class analytics | Yes | - | - | Yes | Yes |
| View own performance analytics | - | Yes | - | - | - |
| View institution analytics | - | - | - | Yes | Yes |
| View at-risk alerts | Yes | - | - | Yes | Yes |
| Receive learning recommendations | - | Yes | - | - | - |
| Manage users | - | - | - | Yes | Yes |
| Manage institution settings | - | - | - | Yes | - |
| System configuration | - | - | - | - | Yes |
| View audit logs | - | - | - | - | Yes |
| Export data / reports | Yes | Own only | Phase 2 | Yes | Yes |

> **Role mapping:** School Admin includes the Principal persona (Dr. Emily Rodriguez). IT Admin is a separate elevated role for technical operations. Parent access is deferred to Phase 2.

### Appendix B: Glossary

| Term | Definition |
|------|-----------|
| **LMS** | Learning Management System |
| **SSO** | Single Sign-On |
| **RBAC** | Role-Based Access Control |
| **FERPA** | Family Educational Rights and Privacy Act (US) |
| **COPPA** | Children's Online Privacy Protection Act (US) |
| **GDPR** | General Data Protection Regulation (EU) |
| **PII** | Personally Identifiable Information |
| **RTO** | Recovery Time Objective |
| **RPO** | Recovery Point Objective |
| **WCAG** | Web Content Accessibility Guidelines |

### Appendix C: Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-06-13 | Product Team | Initial PRD (Sections 1–6) |
| 1.1 | 2026-06-13 | Product Team | Added Sections 7–13 (functional, non-functional, security, data, integration, KPIs, risks); completed Appendix A RBAC matrix |
| 1.2 | 2026-06-13 | Product Team | Added Section 14 (MVP scope, 3-phase roadmap, 6-sprint build plan, go/no-go gates) |

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| Security Officer | | | |
| Legal/Compliance | | | |

---

This PRD provides a comprehensive foundation for the Edu-Learn project. It should be treated as a living document and updated as the product evolves through development, testing, and user feedback cycles.
