-- Migration script to update existing database
-- Run this in your Supabase SQL Editor

-- 1. Add new columns to jobs table (safely)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'manager_feedback') THEN
        ALTER TABLE jobs ADD COLUMN manager_feedback TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'reviewed_by') THEN
        ALTER TABLE jobs ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'reviewed_at') THEN
        ALTER TABLE jobs ADD COLUMN reviewed_at TIMESTAMP;
    END IF;
END $$;

-- 2. Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'manager')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create Helper function (drop first to ensure update)
DROP FUNCTION IF EXISTS is_manager;
CREATE OR REPLACE FUNCTION is_manager(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add RLS Policies (Drop first to avoid "policy already exists" errors)

-- Policies for jobs
DROP POLICY IF EXISTS "Managers view pending submissions" ON jobs;
CREATE POLICY "Managers view pending submissions" ON jobs
  FOR SELECT USING (
    status = 'pending_approval' 
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'manager'
    )
  );

DROP POLICY IF EXISTS "Managers update job status" ON jobs;
CREATE POLICY "Managers update job status" ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'manager'
    )
  );

-- Policies for user_roles
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
CREATE POLICY "Users can insert own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create Indexes (IF NOT EXISTS is not standard in all Postgres versions for indexes, so we use a DO block)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_jobs_status') THEN
        CREATE INDEX idx_jobs_status ON jobs(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_roles_user_id') THEN
        CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
    END IF;
END $$;

-- 7. (Optional) Set yourself as manager
-- Replace 'YOUR_USER_ID' with your actual User UUID from auth.users
-- INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'manager');
