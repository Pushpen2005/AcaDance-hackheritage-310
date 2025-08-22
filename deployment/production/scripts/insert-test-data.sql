-- Test Data for HH310 Academic System
-- Run after setting up the main schema

-- Insert test institution data
INSERT INTO subjects (name, code, credits, duration, department) VALUES
  ('Advanced Mathematics', 'MATH201', 4, 90, 'Mathematics'),
  ('Data Structures', 'CS201', 4, 90, 'Computer Science'),
  ('Organic Chemistry', 'CHEM201', 3, 60, 'Chemistry'),
  ('Modern Physics', 'PHY201', 4, 90, 'Physics'),
  ('Technical Writing', 'ENG201', 2, 45, 'English'),
  ('Genetics', 'BIO201', 3, 60, 'Biology'),
  ('Web Development', 'CS301', 3, 60, 'Computer Science'),
  ('Linear Algebra', 'MATH301', 3, 60, 'Mathematics')
ON CONFLICT (code) DO NOTHING;

INSERT INTO teachers (name, employee_id, specialization, department, max_hours_per_week) VALUES
  ('Dr. Alice Johnson', 'T001', 'Advanced Mathematics', 'Mathematics', 20),
  ('Prof. Bob Smith', 'T002', 'Data Structures & Algorithms', 'Computer Science', 18),
  ('Dr. Carol Brown', 'T003', 'Organic Chemistry', 'Chemistry', 22),
  ('Prof. David Wilson', 'T004', 'Quantum Physics', 'Physics', 20),
  ('Ms. Eva Davis', 'T005', 'Technical Communication', 'English', 16),
  ('Dr. Frank Garcia', 'T006', 'Molecular Biology', 'Biology', 20),
  ('Prof. Grace Lee', 'T007', 'Web Technologies', 'Computer Science', 18),
  ('Dr. Henry Miller', 'T008', 'Applied Mathematics', 'Mathematics', 20)
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO classrooms (name, capacity, room_type, building, floor) VALUES
  ('Smart Classroom 101', 35, 'smart_classroom', 'Main Building', 1),
  ('Computer Lab A', 30, 'computer_lab', 'Tech Building', 2),
  ('Physics Lab', 25, 'laboratory', 'Science Building', 1),
  ('Chemistry Lab B', 25, 'laboratory', 'Science Building', 2),
  ('Lecture Hall 1', 60, 'lecture_hall', 'Main Building', 2),
  ('Seminar Room 1', 20, 'seminar', 'Main Building', 3),
  ('Advanced Computer Lab', 25, 'computer_lab', 'Tech Building', 3),
  ('Mathematics Tutorial Room', 15, 'tutorial', 'Academic Building', 1)
ON CONFLICT DO NOTHING;

INSERT INTO student_groups (name, program, year, semester, size) VALUES
  ('CS-2024-A1', 'Computer Science', 2, 3, 32),
  ('CS-2024-A2', 'Computer Science', 2, 3, 30),
  ('MATH-2024-B1', 'Mathematics', 2, 3, 28),
  ('PHY-2024-C1', 'Physics', 2, 3, 25),
  ('CHEM-2024-D1', 'Chemistry', 2, 3, 30),
  ('BIO-2024-E1', 'Biology', 2, 3, 35),
  ('CS-2023-A1', 'Computer Science', 3, 5, 28),
  ('MATH-2023-B1', 'Mathematics', 3, 5, 25)
ON CONFLICT DO NOTHING;

-- Insert sample students for testing attendance
INSERT INTO students (student_id, program, year, group_name) VALUES
  ('CS2024001', 'Computer Science', 2, 'CS-2024-A1'),
  ('CS2024002', 'Computer Science', 2, 'CS-2024-A1'),
  ('CS2024003', 'Computer Science', 2, 'CS-2024-A1'),
  ('MATH2024001', 'Mathematics', 2, 'MATH-2024-B1'),
  ('MATH2024002', 'Mathematics', 2, 'MATH-2024-B1'),
  ('PHY2024001', 'Physics', 2, 'PHY-2024-C1'),
  ('PHY2024002', 'Physics', 2, 'PHY-2024-C1'),
  ('CHEM2024001', 'Chemistry', 2, 'CHEM-2024-D1')
ON CONFLICT (student_id) DO NOTHING;

-- Update system settings for your institution
INSERT INTO system_settings (key, value, description) VALUES
  ('institution_name', '"Your Institution Name"', 'Name of the educational institution'),
  ('academic_year', '"2024-25"', 'Current academic year'),
  ('current_semester', '3', 'Current semester number'),
  ('attendance_threshold', '75', 'Minimum attendance percentage required'),
  ('max_daily_hours', '8', 'Maximum teaching hours per day'),
  ('break_duration', '15', 'Default break duration in minutes'),
  ('class_duration', '60', 'Default class duration in minutes')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Show completion message
SELECT 'Test data inserted successfully!' as status;
