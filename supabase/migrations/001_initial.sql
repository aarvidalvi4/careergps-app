-- ═══════════════════════════════════════════════════════════
--  Career Co-Pilot — Supabase schema
--  Run this in your Supabase SQL editor (Dashboard → SQL editor)
-- ═══════════════════════════════════════════════════════════

-- ── profiles ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name                  TEXT        NOT NULL DEFAULT '',
  email                 TEXT        NOT NULL DEFAULT '',
  account_type          TEXT        NOT NULL DEFAULT 'student' CHECK (account_type IN ('student','recruiter')),
  -- student fields
  degree                TEXT        NOT NULL DEFAULT 'B.Tech Computer Science',
  year                  TEXT        NOT NULL DEFAULT '1st year',
  region                TEXT        NOT NULL DEFAULT '',
  interest              TEXT        NOT NULL DEFAULT 'Backend Engineering',
  free_hours            INTEGER     NOT NULL DEFAULT 9,
  gh_username           TEXT,
  projects_done         INTEGER     NOT NULL DEFAULT 0,
  visibility            TEXT        NOT NULL DEFAULT 'recruiter' CHECK (visibility IN ('public','recruiter','private')),
  roadmap_completions   JSONB       NOT NULL DEFAULT '{}',
  google_verified       BOOLEAN     NOT NULL DEFAULT FALSE,
  onboarded             BOOLEAN     NOT NULL DEFAULT FALSE,
  -- recruiter fields
  company               TEXT,
  title                 TEXT,
  linkedin              TEXT,
  verified              BOOLEAN     DEFAULT FALSE,
  verification_checks   JSONB       DEFAULT '{"email":false,"linkedin":false,"google":false}',
  -- timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── user_skills ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_skills (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skill      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, skill)
);

-- ── user_projects (custom, user-added) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_projects (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT        NOT NULL,
  stack       TEXT[]      NOT NULL DEFAULT '{}',
  description TEXT,
  gh_url      TEXT,
  live_url    TEXT,
  shipped     BOOLEAN     NOT NULL DEFAULT FALSE,
  level       TEXT,
  stretch     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── user_internships ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_internships (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title       TEXT        NOT NULL DEFAULT 'Intern',
  company     TEXT        NOT NULL,
  start       TEXT        NOT NULL DEFAULT '',
  "end"       TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── recruiter_watchlist ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recruiter_watchlist (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  student_id   UUID        REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recruiter_id, student_id)
);

-- ── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row-Level Security ───────────────────────────────────────────────────────
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_internships    ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_watchlist ENABLE ROW LEVEL SECURITY;

-- profiles: own row + public/recruiter visibility
DROP POLICY IF EXISTS "own profile"         ON profiles;
DROP POLICY IF EXISTS "public profiles"     ON profiles;
DROP POLICY IF EXISTS "recruiter visible"   ON profiles;
DROP POLICY IF EXISTS "insert own profile"  ON profiles;
DROP POLICY IF EXISTS "update own profile"  ON profiles;

CREATE POLICY "own profile"        ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "public profiles"    ON profiles FOR SELECT USING (visibility = 'public');
CREATE POLICY "recruiter visible"  ON profiles FOR SELECT USING (visibility = 'recruiter');
CREATE POLICY "insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- skills / projects / internships: only owner
DROP POLICY IF EXISTS "own skills"      ON user_skills;
DROP POLICY IF EXISTS "own projects"    ON user_projects;
DROP POLICY IF EXISTS "own internships" ON user_internships;
DROP POLICY IF EXISTS "own watchlist"   ON recruiter_watchlist;

CREATE POLICY "own skills"        ON user_skills        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own projects"      ON user_projects      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own internships"   ON user_internships   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own watchlist"     ON recruiter_watchlist FOR ALL USING (auth.uid() = recruiter_id);
