-- Fix RLS Policies for Timetable Management
-- Run this SQL in your Supabase SQL Editor to fix the RLS policy issues

-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view all subjects" ON subjects;
DROP POLICY IF EXISTS "Authenticated users can manage subjects" ON subjects;
DROP POLICY IF EXISTS "Users can view all teachers" ON teachers;
DROP POLICY IF EXISTS "Authenticated users can manage teachers" ON teachers;
DROP POLICY IF EXISTS "Users can view all classrooms" ON classrooms;
DROP POLICY IF EXISTS "Authenticated users can manage classrooms" ON classrooms;
DROP POLICY IF EXISTS "Users can view all student groups" ON student_groups;
DROP POLICY IF EXISTS "Authenticated users can manage student groups" ON student_groups;
DROP POLICY IF EXISTS "Users can view all timetables" ON timetables;
DROP POLICY IF EXISTS "Authenticated users can manage timetables" ON timetables;
DROP POLICY IF EXISTS "Users can view all timetable slots" ON timetable_slots;
DROP POLICY IF EXISTS "Authenticated users can manage timetable slots" ON timetable_slots;
DROP POLICY IF EXISTS "Users can view all teacher constraints" ON teacher_constraints;
DROP POLICY IF EXISTS "Authenticated users can manage teacher constraints" ON teacher_constraints;
DROP POLICY IF EXISTS "Users can view all subject assignments" ON subject_assignments;
DROP POLICY IF EXISTS "Authenticated users can manage subject assignments" ON subject_assignments;

-- Create new, more specific RLS policies

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

-- Alternative: If you want to restrict access to only the creator's data, use these policies instead:
-- (Comment out the above policies and uncomment these if you want user-specific data isolation)

/*
-- SUBJECTS TABLE POLICIES (User-specific)
CREATE POLICY "Enable read access for all users" ON subjects FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON subjects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());
CREATE POLICY "Enable update for creator only" ON subjects FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Enable delete for creator only" ON subjects FOR DELETE USING (auth.uid() = created_by);

-- TEACHERS TABLE POLICIES (User-specific)
CREATE POLICY "Enable read access for all users" ON teachers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON teachers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());
CREATE POLICY "Enable update for creator only" ON teachers FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Enable delete for creator only" ON teachers FOR DELETE USING (auth.uid() = created_by);

-- CLASSROOMS TABLE POLICIES (User-specific)
CREATE POLICY "Enable read access for all users" ON classrooms FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON classrooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());
CREATE POLICY "Enable update for creator only" ON classrooms FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Enable delete for creator only" ON classrooms FOR DELETE USING (auth.uid() = created_by);

-- STUDENT GROUPS TABLE POLICIES (User-specific)
CREATE POLICY "Enable read access for all users" ON student_groups FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON student_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());
CREATE POLICY "Enable update for creator only" ON student_groups FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Enable delete for creator only" ON student_groups FOR DELETE USING (auth.uid() = created_by);

-- TIMETABLES TABLE POLICIES (User-specific)
CREATE POLICY "Enable read access for all users" ON timetables FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON timetables FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());
CREATE POLICY "Enable update for creator only" ON timetables FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Enable delete for creator only" ON timetables FOR DELETE USING (auth.uid() = created_by);
*/

-- Verify the policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('subjects', 'teachers', 'classrooms', 'student_groups', 'timetables', 'timetable_slots', 'teacher_constraints', 'subject_assignments')
ORDER BY tablename, cmd;
