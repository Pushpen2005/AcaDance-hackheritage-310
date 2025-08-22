-- Additional Tables for Timetable Management
-- Add these to your existing database setup

-- Subjects table
CREATE TABLE subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3,
  duration INTEGER NOT NULL DEFAULT 60, -- in minutes
  department TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  specialization TEXT,
  max_hours_per_week INTEGER DEFAULT 20,
  available_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  department TEXT,
  phone TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classrooms table
CREATE TABLE classrooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  room_type TEXT DEFAULT 'standard',
  building TEXT,
  floor INTEGER,
  equipment TEXT[],
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student groups table
CREATE TABLE student_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  program TEXT NOT NULL,
  year INTEGER,
  semester INTEGER,
  department TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetables table
CREATE TABLE timetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  group_id UUID REFERENCES student_groups(id),
  academic_year TEXT,
  semester INTEGER,
  status TEXT DEFAULT 'draft', -- draft, active, archived
  algorithm_used TEXT,
  generation_time INTERVAL,
  conflicts_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timetable slots table
CREATE TABLE timetable_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID REFERENCES timetables(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id),
  classroom_id UUID REFERENCES classrooms(id),
  group_id UUID REFERENCES student_groups(id),
  day_of_week INTEGER NOT NULL, -- 1=Monday, 2=Tuesday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teacher constraints table
CREATE TABLE teacher_constraints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teachers(id),
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  constraint_type TEXT DEFAULT 'unavailable', -- unavailable, preferred
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subject assignments table (which teacher teaches which subject)
CREATE TABLE subject_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id),
  group_id UUID REFERENCES student_groups(id),
  hours_per_week INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, teacher_id, group_id)
);

-- Enable RLS for all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - More specific policies for better compatibility
-- SUBJECTS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON subjects FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON subjects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users only" ON subjects FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users only" ON subjects FOR DELETE USING (auth.uid() IS NOT NULL);

-- TEACHERS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON teachers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON teachers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users only" ON teachers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users only" ON teachers FOR DELETE USING (auth.uid() IS NOT NULL);

-- CLASSROOMS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON classrooms FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON classrooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users only" ON classrooms FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users only" ON classrooms FOR DELETE USING (auth.uid() IS NOT NULL);

-- STUDENT GROUPS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON student_groups FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON student_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users only" ON student_groups FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users only" ON student_groups FOR DELETE USING (auth.uid() IS NOT NULL);

-- TIMETABLES TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON timetables FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON timetables FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users only" ON timetables FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users only" ON timetables FOR DELETE USING (auth.uid() IS NOT NULL);

-- TIMETABLE SLOTS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON timetable_slots FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON timetable_slots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users only" ON timetable_slots FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users only" ON timetable_slots FOR DELETE USING (auth.uid() IS NOT NULL);

-- TEACHER CONSTRAINTS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON teacher_constraints FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON teacher_constraints FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users only" ON teacher_constraints FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users only" ON teacher_constraints FOR DELETE USING (auth.uid() IS NOT NULL);

-- SUBJECT ASSIGNMENTS TABLE POLICIES
CREATE POLICY "Enable read access for all users" ON subject_assignments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON subject_assignments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for authenticated users only" ON subject_assignments FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Enable delete for authenticated users only" ON subject_assignments FOR DELETE USING (auth.uid() IS NOT NULL);

-- Indexes for better performance
CREATE INDEX idx_timetable_slots_timetable_id ON timetable_slots(timetable_id);
CREATE INDEX idx_timetable_slots_day_time ON timetable_slots(day_of_week, start_time);
CREATE INDEX idx_teacher_constraints_teacher_day ON teacher_constraints(teacher_id, day_of_week);
CREATE INDEX idx_subject_assignments_subject_teacher ON subject_assignments(subject_id, teacher_id);
