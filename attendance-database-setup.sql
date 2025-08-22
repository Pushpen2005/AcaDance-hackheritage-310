-- Attendance Database Setup for HH310 Academic System
-- Run this SQL in your Supabase SQL Editor

-- Classes/Subjects table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 3,
  duration INTEGER DEFAULT 60, -- in minutes
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Groups table
CREATE TABLE IF NOT EXISTS student_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  program TEXT,
  year INTEGER,
  size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Sessions table (for each class session)
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  group_id UUID REFERENCES student_groups(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration INTEGER DEFAULT 60, -- in minutes
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')) DEFAULT 'scheduled',
  qr_code TEXT, -- QR code for session
  qr_expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, group_id, session_date, session_time)
);

-- Individual Attendance Records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'absent',
  marked_at TIMESTAMPTZ,
  marked_by UUID REFERENCES profiles(id), -- teacher who marked
  method TEXT CHECK (method IN ('manual', 'qr_code', 'rfid', 'biometric')) DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- Attendance Alerts table (for low attendance warnings)
CREATE TABLE IF NOT EXISTS attendance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('low_attendance', 'absent_streak', 'failing_grade')) NOT NULL,
  threshold_value DECIMAL(5,2), -- e.g., 75.00 for 75% attendance
  current_value DECIMAL(5,2),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Real-time attendance updates table (for live tracking)
CREATE TABLE IF NOT EXISTS attendance_live_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_live_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Classes
CREATE POLICY "Everyone can view classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Faculty and admins can manage classes" ON classes FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('faculty', 'admin')
  )
);

-- RLS Policies for Student Groups
CREATE POLICY "Everyone can view student groups" ON student_groups FOR SELECT USING (true);
CREATE POLICY "Faculty and admins can manage groups" ON student_groups FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('faculty', 'admin')
  )
);

-- RLS Policies for Attendance Sessions
CREATE POLICY "Everyone can view attendance sessions" ON attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Faculty and admins can manage sessions" ON attendance_sessions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('faculty', 'admin')
  )
);

-- RLS Policies for Attendance Records
CREATE POLICY "Students can view their own attendance" ON attendance_records FOR SELECT USING (
  student_id IN (
    SELECT id FROM students WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('faculty', 'admin')
  )
);

CREATE POLICY "Faculty and admins can manage attendance records" ON attendance_records FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('faculty', 'admin')
  )
);

-- RLS Policies for Attendance Alerts
CREATE POLICY "Students can view their own alerts" ON attendance_alerts FOR SELECT USING (
  student_id IN (
    SELECT id FROM students WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('faculty', 'admin')
  )
);

CREATE POLICY "Faculty and admins can manage alerts" ON attendance_alerts FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('faculty', 'admin')
  )
);

-- RLS Policies for Live Updates
CREATE POLICY "Everyone can view live updates for active sessions" ON attendance_live_updates FOR SELECT USING (true);
CREATE POLICY "Students can insert their own updates" ON attendance_live_updates FOR INSERT WITH CHECK (
  student_id IN (
    SELECT id FROM students WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('faculty', 'admin')
  )
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date);
CREATE INDEX idx_attendance_sessions_status ON attendance_sessions(status);
CREATE INDEX idx_attendance_records_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_alerts_student ON attendance_alerts(student_id);
CREATE INDEX idx_attendance_live_session ON attendance_live_updates(session_id);

-- Function to calculate attendance percentage
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
  p_student_id UUID,
  p_class_id UUID DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_sessions INTEGER;
  attended_sessions INTEGER;
  attendance_percentage DECIMAL(5,2);
BEGIN
  -- Count total sessions
  SELECT COUNT(*) INTO total_sessions
  FROM attendance_sessions s
  LEFT JOIN attendance_records r ON s.id = r.session_id AND r.student_id = p_student_id
  WHERE s.status = 'completed'
    AND (p_class_id IS NULL OR s.class_id = p_class_id)
    AND (p_start_date IS NULL OR s.session_date >= p_start_date)
    AND (p_end_date IS NULL OR s.session_date <= p_end_date);
  
  -- Count attended sessions (present + late)
  SELECT COUNT(*) INTO attended_sessions
  FROM attendance_sessions s
  INNER JOIN attendance_records r ON s.id = r.session_id
  WHERE s.status = 'completed'
    AND r.student_id = p_student_id
    AND r.status IN ('present', 'late')
    AND (p_class_id IS NULL OR s.class_id = p_class_id)
    AND (p_start_date IS NULL OR s.session_date >= p_start_date)
    AND (p_end_date IS NULL OR s.session_date <= p_end_date);
  
  -- Calculate percentage
  IF total_sessions > 0 THEN
    attendance_percentage := (attended_sessions::DECIMAL / total_sessions::DECIMAL) * 100;
  ELSE
    attendance_percentage := 0;
  END IF;
  
  RETURN ROUND(attendance_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to generate QR code for session
CREATE OR REPLACE FUNCTION generate_session_qr(p_session_id UUID)
RETURNS TEXT AS $$
DECLARE
  qr_data TEXT;
BEGIN
  -- Generate QR code data (session ID + timestamp)
  qr_data := p_session_id::TEXT || '-' || EXTRACT(EPOCH FROM NOW())::TEXT;
  
  -- Update session with QR code and expiry (30 minutes from now)
  UPDATE attendance_sessions 
  SET 
    qr_code = qr_data,
    qr_expires_at = NOW() + INTERVAL '30 minutes',
    updated_at = NOW()
  WHERE id = p_session_id;
  
  RETURN qr_data;
END;
$$ LANGUAGE plpgsql;

-- Function to mark attendance via QR code
CREATE OR REPLACE FUNCTION mark_attendance_qr(
  p_qr_code TEXT,
  p_student_id UUID
)
RETURNS JSON AS $$
DECLARE
  session_record RECORD;
  result JSON;
BEGIN
  -- Find active session with valid QR code
  SELECT s.id, s.class_id, s.group_id, s.session_date, s.qr_expires_at
  INTO session_record
  FROM attendance_sessions s
  WHERE s.qr_code = p_qr_code
    AND s.status = 'active'
    AND s.qr_expires_at > NOW();
  
  IF NOT FOUND THEN
    result := json_build_object(
      'success', false,
      'message', 'Invalid or expired QR code'
    );
    RETURN result;
  END IF;
  
  -- Check if student is in the session's group
  IF NOT EXISTS (
    SELECT 1 FROM students 
    WHERE id = p_student_id 
    AND EXISTS (
      SELECT 1 FROM student_groups 
      WHERE id = session_record.group_id
    )
  ) THEN
    result := json_build_object(
      'success', false,
      'message', 'Student not enrolled in this group'
    );
    RETURN result;
  END IF;
  
  -- Insert or update attendance record
  INSERT INTO attendance_records (
    session_id, student_id, status, marked_at, method
  )
  VALUES (
    session_record.id, p_student_id, 'present', NOW(), 'qr_code'
  )
  ON CONFLICT (session_id, student_id) 
  DO UPDATE SET 
    status = 'present',
    marked_at = NOW(),
    method = 'qr_code',
    updated_at = NOW();
  
  -- Log to live updates
  INSERT INTO attendance_live_updates (
    session_id, student_id, status
  )
  VALUES (
    session_record.id, p_student_id, 'present'
  );
  
  result := json_build_object(
    'success', true,
    'message', 'Attendance marked successfully',
    'session_date', session_record.session_date
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update attendance alerts
CREATE OR REPLACE FUNCTION check_attendance_alerts()
RETURNS TRIGGER AS $$
DECLARE
  student_attendance DECIMAL(5,2);
  alert_threshold DECIMAL(5,2) := 75.00; -- 75% attendance threshold
BEGIN
  -- Calculate current attendance percentage for the student
  student_attendance := calculate_attendance_percentage(
    NEW.student_id,
    NULL, -- all classes
    DATE_TRUNC('month', CURRENT_DATE)::DATE, -- current month
    CURRENT_DATE
  );
  
  -- Create alert if attendance is below threshold
  IF student_attendance < alert_threshold THEN
    INSERT INTO attendance_alerts (
      student_id, 
      alert_type, 
      threshold_value, 
      current_value
    )
    VALUES (
      NEW.student_id,
      'low_attendance',
      alert_threshold,
      student_attendance
    )
    ON CONFLICT DO NOTHING; -- Avoid duplicate alerts
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_attendance_alerts
  AFTER INSERT OR UPDATE ON attendance_records
  FOR EACH ROW
  EXECUTE FUNCTION check_attendance_alerts();

-- Insert sample data
INSERT INTO classes (name, code, credits, duration, department) VALUES
  ('Mathematics', 'MATH101', 4, 60, 'Mathematics'),
  ('Physics', 'PHYS101', 4, 60, 'Physics'),
  ('Chemistry', 'CHEM101', 3, 60, 'Chemistry'),
  ('English', 'ENG101', 2, 45, 'English'),
  ('Computer Science', 'CS101', 4, 90, 'Computer Science')
ON CONFLICT (code) DO NOTHING;

INSERT INTO student_groups (name, program, year, size) VALUES
  ('Group A', 'Engineering', 1, 30),
  ('Group B', 'Science', 1, 25),
  ('Group C', 'Engineering', 2, 28)
ON CONFLICT DO NOTHING;
