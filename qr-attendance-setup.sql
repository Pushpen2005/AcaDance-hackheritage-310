-- Enhanced QR Attendance System Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create additional tables for QR attendance system
-- (Building on existing tables)

-- Enhanced Sessions table for QR functionality
DROP TABLE IF EXISTS qr_attendance_sessions CASCADE;
CREATE TABLE qr_attendance_sessions (
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

-- QR Attendance Records table
DROP TABLE IF EXISTS qr_attendance_records CASCADE;
CREATE TABLE qr_attendance_records (
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

-- Classes table (if not exists)
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

-- Student enrollment table
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'dropped', 'completed')) DEFAULT 'active',
  UNIQUE(class_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE qr_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for QR Attendance Sessions
CREATE POLICY "Teachers can manage their sessions" ON qr_attendance_sessions
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view active sessions for their classes" ON qr_attendance_sessions
  FOR SELECT USING (
    status = 'active' AND 
    expires_at > NOW() AND
    EXISTS (
      SELECT 1 FROM class_enrollments 
      WHERE class_enrollments.class_id = qr_attendance_sessions.class_id 
      AND class_enrollments.student_id = auth.uid()
      AND class_enrollments.status = 'active'
    )
  );

-- RLS Policies for QR Attendance Records
CREATE POLICY "Students can insert their own attendance" ON qr_attendance_records
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own attendance" ON qr_attendance_records
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view attendance for their sessions" ON qr_attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM qr_attendance_sessions 
      WHERE qr_attendance_sessions.id = qr_attendance_records.session_id
      AND qr_attendance_sessions.teacher_id = auth.uid()
    )
  );

-- RLS Policies for Classes
CREATE POLICY "Everyone can view classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Teachers can manage their classes" ON classes FOR ALL USING (auth.uid() = teacher_id);

-- RLS Policies for Class Enrollments
CREATE POLICY "Students can view their enrollments" ON class_enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view enrollments for their classes" ON class_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = class_enrollments.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage enrollments for their classes" ON class_enrollments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = class_enrollments.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Function to generate QR session
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

-- Function to mark attendance via QR
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
    -- Update session status
    UPDATE qr_attendance_sessions 
    SET status = 'expired' 
    WHERE id = v_session_id;
    
    RETURN json_build_object('success', false, 'error', 'QR code has expired');
  END IF;
  
  -- Check if student is enrolled in the class
  IF NOT EXISTS (
    SELECT 1 FROM class_enrollments 
    WHERE class_id = v_session_record.class_id 
    AND student_id = student_user_id 
    AND status = 'active'
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Student not enrolled in this class');
  END IF;
  
  -- Check if attendance already marked
  IF EXISTS (
    SELECT 1 FROM qr_attendance_records 
    WHERE session_id = v_session_id AND student_id = student_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Attendance already marked for this session');
  END IF;
  
  -- Get student profile info
  SELECT email, first_name, last_name 
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
    COALESCE(v_student_profile.first_name || ' ' || v_student_profile.last_name, 'Unknown'),
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

-- Function to get session attendance stats
CREATE OR REPLACE FUNCTION get_session_stats(session_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalScanned', COUNT(*),
    'presentCount', COUNT(*) FILTER (WHERE status = 'present'),
    'lateCount', COUNT(*) FILTER (WHERE status = 'late'),
    'lastScan', MAX(scanned_at)
  ) INTO v_stats
  FROM qr_attendance_records
  WHERE qr_attendance_records.session_id = get_session_stats.session_id;
  
  RETURN COALESCE(v_stats, json_build_object(
    'totalScanned', 0,
    'presentCount', 0,
    'lateCount', 0,
    'lastScan', null
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to close/complete session
CREATE OR REPLACE FUNCTION complete_qr_session(session_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_session_record RECORD;
BEGIN
  -- Get session details
  SELECT * INTO v_session_record
  FROM qr_attendance_sessions
  WHERE id = session_id AND teacher_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or unauthorized');
  END IF;
  
  -- Update session status
  UPDATE qr_attendance_sessions 
  SET status = 'completed', updated_at = NOW()
  WHERE id = session_id;
  
  -- Get final stats
  SELECT json_build_object(
    'success', true,
    'message', 'Session completed successfully',
    'stats', get_session_stats(session_id)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-expire sessions
CREATE OR REPLACE FUNCTION auto_expire_sessions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE qr_attendance_sessions 
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'active';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-expiring sessions (runs every minute)
-- Note: This is a simple approach. In production, consider using pg_cron or external job scheduler
CREATE OR REPLACE FUNCTION schedule_session_expiry()
RETURNS void AS $$
BEGIN
  -- This function can be called periodically to expire sessions
  UPDATE qr_attendance_sessions 
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing
-- Insert sample classes
INSERT INTO classes (id, name, code, teacher_id, description) VALUES
  (gen_random_uuid(), 'Computer Science 101', 'CS101', (SELECT id FROM profiles WHERE role = 'faculty' LIMIT 1), 'Introduction to Computer Science'),
  (gen_random_uuid(), 'Mathematics 201', 'MATH201', (SELECT id FROM profiles WHERE role = 'faculty' LIMIT 1), 'Advanced Mathematics'),
  (gen_random_uuid(), 'Physics 101', 'PHY101', (SELECT id FROM profiles WHERE role = 'faculty' LIMIT 1), 'Introduction to Physics')
ON CONFLICT (code) DO NOTHING;

-- Insert sample enrollments (enroll all students in all classes)
INSERT INTO class_enrollments (class_id, student_id)
SELECT c.id, p.id
FROM classes c
CROSS JOIN profiles p
WHERE p.role = 'student'
ON CONFLICT (class_id, student_id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_sessions_teacher ON qr_attendance_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_class ON qr_attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_status ON qr_attendance_sessions(status);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires ON qr_attendance_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_qr_records_session ON qr_attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_qr_records_student ON qr_attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ QR Attendance System database setup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created Tables:';
  RAISE NOTICE '   • qr_attendance_sessions - QR session management';
  RAISE NOTICE '   • qr_attendance_records - Attendance records via QR';
  RAISE NOTICE '   • classes - Class/subject information';
  RAISE NOTICE '   • class_enrollments - Student class enrollments';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Created Functions:';
  RAISE NOTICE '   • create_qr_session() - Generate QR attendance session';
  RAISE NOTICE '   • mark_attendance_qr() - Mark attendance via QR scan';
  RAISE NOTICE '   • get_session_stats() - Get session statistics';
  RAISE NOTICE '   • complete_qr_session() - Complete/close session';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Row Level Security enabled with appropriate policies';
  RAISE NOTICE '📊 Sample data inserted for testing';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update supabase-config.js with your project credentials';
  RAISE NOTICE '2. Create user accounts (students and teachers)';
  RAISE NOTICE '3. Test the QR attendance system';
END $$;
