-- Create jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  title VARCHAR(255),
  original_text TEXT NOT NULL,
  refined_text TEXT,
  skills_must_have TEXT[],
  skills_nice_to_have TEXT[],
  
  -- Configuration
  tone VARCHAR(50),
  length VARCHAR(50),
  
  -- Sharing
  share_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  share_expires_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Manager Review
  manager_feedback TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'manager')),
  created_at TIMESTAMP DEFAULT NOW()
);


-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  user_email VARCHAR(255),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs
CREATE POLICY "Users view own jobs" ON jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public share access" ON jobs
  FOR SELECT USING (
    share_token IS NOT NULL 
    AND share_expires_at IS NOT NULL 
    AND share_expires_at > NOW()
  );

-- RLS Policies for comments
CREATE POLICY "Comments readable by owner or shared" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = comments.job_id 
      AND (
        jobs.user_id = auth.uid() 
        OR (jobs.share_expires_at IS NOT NULL AND jobs.share_expires_at > NOW())
      )
    )
  );

CREATE POLICY "Anyone can create comments on shared jobs" ON comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = comments.job_id 
      AND jobs.share_expires_at > NOW()
    )
  );

-- Managers can view pending submissions
CREATE POLICY "Managers view pending submissions" ON jobs
  FOR SELECT USING (
    status = 'pending_approval' 
    AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'manager'
    )
  );

-- Managers can update job status and feedback
CREATE POLICY "Managers update job status" ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'manager'
    )
  );

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Helper function to check if user is manager
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

-- Create indexes
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_share_token ON jobs(share_token);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_comments_job_id ON comments(job_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
