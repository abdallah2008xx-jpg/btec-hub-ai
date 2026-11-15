-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================
-- TABLES
-- =====================

-- Specializations
CREATE TABLE specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Qualifications
CREATE TABLE qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  level TEXT NOT NULL,
  specialization_id UUID REFERENCES specializations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  unit_number INTEGER NOT NULL,
  qualification_id UUID REFERENCES qualifications(id),
  description_ar TEXT,
  description_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Profiles
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  student_id TEXT,
  specialization_id UUID REFERENCES specializations(id),
  qualification_id UUID REFERENCES qualifications(id),
  preferred_language TEXT DEFAULT 'ar' CHECK (preferred_language IN ('ar','en')),
  ai_usage_today INTEGER DEFAULT 0,
  ai_usage_total INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uploaded Files
CREATE TABLE uploaded_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending','processing','done','error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES units(id),
  file_id UUID REFERENCES uploaded_files(id),
  raw_text TEXT,
  parsed_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from uploaded_files to assignments
ALTER TABLE uploaded_files ADD CONSTRAINT fk_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_number TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Criteria
CREATE TABLE assessment_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES activities(id),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('pass','merit','distinction')),
  description TEXT NOT NULL,
  evidence_required TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES assignments(id),
  title TEXT NOT NULL DEFAULT 'محادثة جديدة',
  mode TEXT DEFAULT 'general',
  messages_count INTEGER DEFAULT 0,
  last_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  metadata JSONB,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Tasks (Checklist)
CREATE TABLE student_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  criteria_id UUID REFERENCES assessment_criteria(id),
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Documents (RAG)
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  unit_id UUID REFERENCES units(id),
  qualification_id UUID REFERENCES qualifications(id),
  specialization_id UUID REFERENCES specializations(id),
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Reports
CREATE TABLE review_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES assignments(id),
  report_file_id UUID REFERENCES uploaded_files(id),
  ai_review JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Usage Log
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id),
  mode TEXT NOT NULL,
  tokens_input INTEGER DEFAULT 0,
  tokens_output INTEGER DEFAULT 0,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_assignments_student_id ON assignments(student_id);
CREATE INDEX idx_conversations_student_id ON conversations(student_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_uploaded_files_student_id ON uploaded_files(student_id);
CREATE INDEX idx_activities_assignment_id ON activities(assignment_id);
CREATE INDEX idx_assessment_criteria_assignment_id ON assessment_criteria(assignment_id);
CREATE INDEX idx_ai_usage_student_id ON ai_usage(student_id);
CREATE INDEX idx_knowledge_docs_embedding ON knowledge_documents USING ivfflat (embedding vector_cosine_ops);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- student_profiles policies
CREATE POLICY "Users can view own profile" ON student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON student_profiles FOR UPDATE USING (auth.uid() = user_id);

-- uploaded_files policies
CREATE POLICY "Users can view own files" ON uploaded_files FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own files" ON uploaded_files FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can delete own files" ON uploaded_files FOR DELETE USING (auth.uid() = student_id);
CREATE POLICY "Users can update own files" ON uploaded_files FOR UPDATE USING (auth.uid() = student_id);

-- assignments policies
CREATE POLICY "Users can view own assignments" ON assignments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own assignments" ON assignments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own assignments" ON assignments FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete own assignments" ON assignments FOR DELETE USING (auth.uid() = student_id);

-- activities policies
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own activities" ON activities FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete own activities" ON activities FOR DELETE USING (auth.uid() = student_id);

-- assessment_criteria policies
CREATE POLICY "Users can view own criteria" ON assessment_criteria FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own criteria" ON assessment_criteria FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own criteria" ON assessment_criteria FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete own criteria" ON assessment_criteria FOR DELETE USING (auth.uid() = student_id);

-- conversations policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = student_id);

-- messages policies
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own messages" ON messages FOR INSERT WITH CHECK (auth.uid() = student_id);

-- student_tasks policies
CREATE POLICY "Users can manage own tasks" ON student_tasks FOR ALL USING (auth.uid() = student_id);

-- review_reports policies
CREATE POLICY "Users can view own reports" ON review_reports FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own reports" ON review_reports FOR INSERT WITH CHECK (auth.uid() = student_id);

-- ai_usage policies
CREATE POLICY "Users can view own usage" ON ai_usage FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can insert own usage" ON ai_usage FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Public read for reference tables
CREATE POLICY "Anyone can read specializations" ON specializations FOR SELECT USING (true);
CREATE POLICY "Anyone can read qualifications" ON qualifications FOR SELECT USING (true);
CREATE POLICY "Anyone can read units" ON units FOR SELECT USING (true);
CREATE POLICY "Anyone can read knowledge docs" ON knowledge_documents FOR SELECT USING (true);

-- =====================
-- FUNCTIONS
-- =====================
CREATE OR REPLACE FUNCTION reset_daily_ai_usage()
RETURNS void AS $$
BEGIN
  UPDATE student_profiles SET ai_usage_today = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW(), messages_count = messages_count + 1
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_updated_at();

-- =====================
-- SEED DATA
-- =====================
INSERT INTO specializations (name_ar, name_en, code) VALUES
('تقنية المعلومات', 'Information Technology', 'IT'),
('الأعمال', 'Business', 'BUS'),
('الصحة والعلوم الاجتماعية', 'Health and Social Care', 'HSC'),
('الهندسة', 'Engineering', 'ENG'),
('تصميم الجرافيك', 'Graphic Design', 'GD');
