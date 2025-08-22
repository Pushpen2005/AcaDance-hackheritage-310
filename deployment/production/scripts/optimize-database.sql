-- Performance Optimization for HH310 Academic System

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_timetable_slots_composite ON timetable_slots(timetable_id, day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_attendance_composite ON attendance_records(student_id, date, status);
CREATE INDEX IF NOT EXISTS idx_teachers_department ON teachers(department);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
CREATE INDEX IF NOT EXISTS idx_student_groups_program_year ON student_groups(program, year);

-- Analyze tables for query planning
ANALYZE profiles;
ANALYZE students;
ANALYZE subjects;
ANALYZE teachers;
ANALYZE classrooms;
ANALYZE student_groups;
ANALYZE timetables;
ANALYZE timetable_slots;
ANALYZE attendance_records;
ANALYZE system_settings;

-- Create views for common queries
CREATE OR REPLACE VIEW current_timetable_view AS
SELECT 
    ts.id,
    ts.day_of_week,
    ts.start_time,
    ts.end_time,
    s.name as subject_name,
    s.code as subject_code,
    t.name as teacher_name,
    c.name as classroom_name,
    sg.name as group_name,
    sg.program
FROM timetable_slots ts
JOIN subjects s ON ts.subject_id = s.id
JOIN teachers t ON ts.teacher_id = t.id
JOIN classrooms c ON ts.classroom_id = c.id
JOIN student_groups sg ON ts.group_id = sg.id
WHERE ts.timetable_id IN (
    SELECT id FROM timetables 
    WHERE status = 'completed' 
    ORDER BY created_at DESC 
    LIMIT 1
);

CREATE OR REPLACE VIEW attendance_summary_view AS
SELECT 
    st.student_id,
    st.program,
    st.group_name,
    COUNT(*) as total_classes,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_count,
    ROUND(
        (COUNT(CASE WHEN ar.status IN ('present', 'late') THEN 1 END) * 100.0) / COUNT(*), 
        2
    ) as attendance_percentage
FROM students st
LEFT JOIN attendance_records ar ON st.id = ar.student_id
GROUP BY st.id, st.student_id, st.program, st.group_name;

SELECT 'Database optimization completed!' as status;
