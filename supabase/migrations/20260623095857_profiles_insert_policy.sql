-- Add missing INSERT policy on profiles table.
-- Without this, authenticated users cannot create their own profile
-- during onboarding (upsert fails with RLS violation).

CREATE POLICY "profiles_insert_self"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);
