-- QR Attendance System - Simplified Database Setup
-- Copy and paste this SQL into your Supabase SQL Editor

-- 1. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL,
  department TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id),
  credits INTEGER DEFAULT 3,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create QR attendance sessions table
CREATE TABLE IF NOT EXISTS qr_attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_time TIME NOT NULL DEFAULT CURRENT_TIME,
  duration_minutes INTEGER DEFAULT 60,
  qr_code_token TEXT UNIQUE NOT NULL,
  qr_code_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('active', 'expired', 'completed', 'cancelled')) DEFAULT 'active',
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create QR attendance records table
CREATE TABLE IF NOT EXISTS qr_attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES qr_attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  student_email TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  location_data JSONB,
  status TEXT CHECK (status IN ('present', 'late')) DEFAULT 'present',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- 5. Create class enrollments table
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'dropped', 'completed')) DEFAULT 'active',
  UNIQUE(class_id, student_id)
);

-- 6. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Create RLS policies for classes
DROP POLICY IF EXISTS "Everyone can view classes" ON classes;
CREATE POLICY "Everyone can view classes" ON classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers can manage their classes" ON classes;
CREATE POLICY "Teachers can manage their classes" ON classes FOR ALL USING (auth.uid() = teacher_id);

-- 9. Create RLS policies for QR sessions
DROP POLICY IF EXISTS "Teachers can manage their sessions" ON qr_attendance_sessions;
CREATE POLICY "Teachers can manage their sessions" ON qr_attendance_sessions
  FOR ALL USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Students can view active sessions" ON qr_attendance_sessions;
CREATE POLICY "Students can view active sessions" ON qr_attendance_sessions
  FOR SELECT USING (
    status = 'active' AND 
    expires_at > NOW()
  );

-- 10. Create RLS policies for attendance records
DROP POLICY IF EXISTS "Students can insert their attendance" ON qr_attendance_records;
CREATE POLICY "Students can insert their attendance" ON qr_attendance_records
  FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view their attendance" ON qr_attendance_records;
CREATE POLICY "Students can view their attendance" ON qr_attendance_records
  FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view session attendance" ON qr_attendance_records;
CREATE POLICY "Teachers can view session attendance" ON qr_attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM qr_attendance_sessions 
      WHERE qr_attendance_sessions.id = qr_attendance_records.session_id
      AND qr_attendance_sessions.teacher_id = auth.uid()
    )
  );

-- 11. Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 13. Create QR attendance marking function
CREATE OR REPLACE FUNCTION mark_attendance_qr(
  qr_data TEXT,
  student_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_qr_content JSONB;
  v_session_id UUID;
  v_session_record RECORD;
  v_student_profile RECORD;
  v_result JSON;
  v_is_late BOOLEAN := FALSE;
BEGIN
  -- Parse QR data
  BEGIN
    v_qr_content := qr_data::JSONB;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', 'Invalid QR code format');
  END;
  
  -- Extract session ID
  v_session_id := (v_qr_content->>'sessionId')::UUID;
  
  IF v_session_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid session ID in QR code');
  END IF;
  
  -- Get session details
  SELECT * INTO v_session_record
  FROM qr_attendance_sessions
  WHERE id = v_session_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Check if session is still active
  IF v_session_record.status != 'active' THEN
    RETURN json_build_object('success', false, 'error', 'Session is not active');
  END IF;
  
  -- Check if session has expired
  IF v_session_record.expires_at < NOW() THEN
    UPDATE qr_attendance_sessions 
    SET status = 'expired' 
    WHERE id = v_session_id;
    
    RETURN json_build_object('success', false, 'error', 'QR code has expired');
  END IF;
  
  -- Check if attendance already marked
  IF EXISTS (
    SELECT 1 FROM qr_attendance_records 
    WHERE session_id = v_session_id AND student_id = student_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Attendance already marked for this session');
  END IF;
  
  -- Get student profile info
  SELECT email, first_name, last_name, full_name 
  INTO v_student_profile
  FROM profiles 
  WHERE id = student_user_id;
  
  -- Determine if student is late (more than 10 minutes after session time)
  IF NOW() > (v_session_record.session_date::TIMESTAMP + v_session_record.session_time + INTERVAL '10 minutes') THEN
    v_is_late := TRUE;
  END IF;
  
  -- Insert attendance record
  INSERT INTO qr_attendance_records (
    session_id, student_id, student_name, student_email, 
    scanned_at, status
  ) VALUES (
    v_session_id, student_user_id, 
    COALESCE(v_student_profile.full_name, v_student_profile.first_name || ' ' || v_student_profile.last_name, 'Unknown'),
    v_student_profile.email,
    NOW(),
    CASE WHEN v_is_late THEN 'late' ELSE 'present' END
  );
  
  -- Return success
  v_result := json_build_object(
    'success', true,
    'message', 'Attendance marked successfully',
    'status', CASE WHEN v_is_late THEN 'late' ELSE 'present' END,
    'timestamp', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create function to generate QR session
CREATE OR REPLACE FUNCTION create_qr_session(
  p_class_id UUID,
  p_session_name TEXT,
  p_duration_minutes INTEGER DEFAULT 60
)
RETURNS JSON AS $$
DECLARE
  v_session_id UUID;
  v_qr_token TEXT;
  v_expires_at TIMESTAMPTZ;
  v_qr_data JSONB;
  v_result JSON;
BEGIN
  -- Generate unique QR token
  v_qr_token := encode(gen_random_bytes(32), 'base64');
  v_expires_at := NOW() + (p_duration_minutes || ' minutes')::INTERVAL;
  v_session_id := gen_random_uuid();
  
  -- Create QR data
  v_qr_data := json_build_object(
    'sessionId', v_session_id,
    'classId', p_class_id,
    'token', v_qr_token,
    'timestamp', extract(epoch from NOW()),
    'expiresAt', extract(epoch from v_expires_at)
  );
  
  -- Insert session
  INSERT INTO qr_attendance_sessions (
    id, class_id, teacher_id, session_name, qr_code_token, 
    qr_code_data, expires_at, duration_minutes
  ) VALUES (
    v_session_id, p_class_id, auth.uid(), p_session_name, 
    v_qr_token, v_qr_data, v_expires_at, p_duration_minutes
  );
  
  -- Return session data
  v_result := json_build_object(
    'success', true,
    'sessionId', v_session_id,
    'qrToken', v_qr_token,
    'qrData', v_qr_data,
    'expiresAt', v_expires_at
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Insert sample data for testing
INSERT INTO classes (id, name, code, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Computer Science 101', 'CS101', 'Introduction to Computer Science'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Mathematics 201', 'MATH201', 'Advanced Mathematics'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Physics 101', 'PHY101', 'Introduction to Physics')
ON CONFLICT (code) DO NOTHING;

-- 16. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_sessions_teacher ON qr_attendance_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_class ON qr_attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_status ON qr_attendance_sessions(status);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires ON qr_attendance_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_records_session ON qr_attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_qr_records_student ON qr_attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);

-- Success notification
SELECT 'QR Attendance System database setup completed successfully!' as setup_status;
