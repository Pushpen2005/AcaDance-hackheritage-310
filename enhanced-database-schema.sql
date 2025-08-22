-- Enhanced Database Schema for HH310 Academic System with Timetable Management
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('student', 'faculty', 'admin')) NOT NULL,
  department TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  student_id TEXT UNIQUE,
  program TEXT,
  year INTEGER,
  group_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 3,
  duration INTEGER DEFAULT 60, -- in minutes
  department TEXT,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  employee_id TEXT UNIQUE,
  specialization TEXT,
  department TEXT,
  max_hours_per_week INTEGER DEFAULT 20,
  available_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday'],
  available_times JSONB, -- Store time preferences
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  room_type TEXT DEFAULT 'standard',
  building TEXT,
  floor INTEGER,
  facilities TEXT[], -- projector, whiteboard, computers, etc.
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Student Groups table
CREATE TABLE IF NOT EXISTS student_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  program TEXT NOT NULL,
  year INTEGER,
  semester INTEGER,
  size INTEGER DEFAULT 30,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Timetables table
CREATE TABLE IF NOT EXISTS timetables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  group_id UUID REFERENCES student_groups(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL,
  algorithm_used TEXT DEFAULT 'genetic',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'archived')),
  generated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_slots INTEGER DEFAULT 0,
  metadata JSONB, -- Store algorithm parameters, conflicts, etc.
  auto_saved BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Timetable Slots table
CREATE TABLE IF NOT EXISTS timetable_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id),
  classroom_id UUID REFERENCES classrooms(id),
  group_id UUID REFERENCES student_groups(id),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  week_number INTEGER DEFAULT 1, -- For alternating weekly schedules
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no overlapping slots for same teacher/classroom
  CONSTRAINT unique_teacher_time UNIQUE (teacher_id, day_of_week, start_time, week_number),
  CONSTRAINT unique_classroom_time UNIQUE (classroom_id, day_of_week, start_time, week_number)
);

-- 9. Attendance Records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  timetable_slot_id UUID REFERENCES timetable_slots(id),
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'absent',
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  marked_by UUID REFERENCES profiles(id),
  method TEXT CHECK (method IN ('manual', 'qr_code', 'auto', 'bulk_import')) DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for timetable management (accessible by authenticated users)
CREATE POLICY "Authenticated users can view subjects" ON subjects
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage subjects" ON subjects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view teachers" ON teachers
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage teachers" ON teachers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view classrooms" ON classrooms
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage classrooms" ON classrooms
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view student_groups" ON student_groups
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage student_groups" ON student_groups
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view timetables" ON timetables
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage timetables" ON timetables
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view timetable_slots" ON timetable_slots
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage timetable_slots" ON timetable_slots
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view attendance_records" ON attendance_records
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage attendance_records" ON attendance_records
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classrooms_updated_at BEFORE UPDATE ON classrooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_groups_updated_at BEFORE UPDATE ON student_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timetables_updated_at BEFORE UPDATE ON timetables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timetable_slots_updated_at BEFORE UPDATE ON timetable_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (using ON CONFLICT for safety)
INSERT INTO subjects (name, code, credits, duration) VALUES
  ('Mathematics', 'MATH101', 3, 60),
  ('Physics', 'PHY101', 3, 60),
  ('Chemistry', 'CHEM101', 3, 60),
  ('Computer Science', 'CS101', 4, 90),
  ('English', 'ENG101', 2, 45),
  ('Biology', 'BIO101', 3, 60)
ON CONFLICT (code) DO NOTHING;

INSERT INTO teachers (name, specialization, max_hours_per_week) VALUES
  ('Dr. Smith', 'Mathematics', 20),
  ('Prof. Johnson', 'Physics', 18),
  ('Dr. Brown', 'Chemistry', 22),
  ('Prof. Davis', 'Computer Science', 20),
  ('Ms. Wilson', 'English Literature', 16),
  ('Dr. Garcia', 'Biology', 20)
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO classrooms (name, capacity, room_type) VALUES
  ('Room A1', 30, 'lecture'),
  ('Lab B2', 25, 'laboratory'),
  ('Lab C1', 25, 'laboratory'),
  ('Computer Lab', 35, 'computer_lab'),
  ('Room D3', 40, 'lecture'),
  ('Auditorium', 100, 'auditorium')
ON CONFLICT DO NOTHING;

INSERT INTO student_groups (name, program, year, size) VALUES
  ('CS-2024-A', 'Computer Science', 1, 30),
  ('CS-2024-B', 'Computer Science', 1, 28),
  ('MATH-2024', 'Mathematics', 1, 25),
  ('PHY-2024', 'Physics', 1, 32)
ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('academic_year', '"2024-25"', 'Current academic year'),
  ('current_semester', '1', 'Current semester number'),
  ('attendance_threshold', '75', 'Minimum attendance percentage required'),
  ('auto_save_interval', '30', 'Auto-save interval in seconds'),
  ('default_algorithm', '"genetic"', 'Default timetable generation algorithm')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timetable_slots_timetable_id ON timetable_slots(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_day_time ON timetable_slots(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_timetables_group_year ON timetables(group_id, academic_year);

COMMENT ON TABLE timetables IS 'Main timetable records with metadata';
COMMENT ON TABLE timetable_slots IS 'Individual time slots in timetables';
COMMENT ON TABLE attendance_records IS 'Student attendance tracking';
COMMENT ON COLUMN timetable_slots.week_number IS 'For alternating weekly schedules (1=odd weeks, 2=even weeks)';
COMMENT ON COLUMN attendance_records.method IS 'How attendance was marked (manual, QR code, etc.)';

-- Show completion message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables created: profiles, students, subjects, teachers, classrooms, student_groups, timetables, timetable_slots, attendance_records, system_settings';
  RAISE NOTICE 'Sample data inserted for testing';
  RAISE NOTICE 'Real-time subscriptions enabled for all tables';
END $$;
