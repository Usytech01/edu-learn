-- Dev seed data (local only — run via `supabase db reset`)
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
