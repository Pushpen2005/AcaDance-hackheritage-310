# Timetable Management Setup Instructions

## ✅ Supabase Database Setup

### 1. Run the Database Schema
Execute the SQL in `timetable-database-setup.sql` in your Supabase SQL Editor to create the required tables:

- `subjects` - Course subjects
- `teachers` - Faculty members  
- `classrooms` - Available rooms
- `student_groups` - Student groups/classes
- `timetables` - Generated timetables
- `timetable_slots` - Individual time slots
- `teacher_constraints` - Teacher availability
- `subject_assignments` - Subject-teacher mappings

### 2. Tables Created
```
subjects (id, name, code, credits, duration, department)
teachers (id, name, specialization, max_hours_per_week)
classrooms (id, name, capacity, room_type)
student_groups (id, name, size, program, year, semester)
timetables (id, name, group_id, algorithm_used, status)
timetable_slots (id, timetable_id, subject_id, teacher_id, classroom_id, day_of_week, start_time, end_time)
```

## 🚀 Features Implemented

### **Setup Management**
- ✅ Add/Delete Subjects with credits and duration
- ✅ Add/Delete Teachers with specialization and max hours
- ✅ Add/Delete Classrooms with capacity and type
- ✅ Add/Delete Student Groups with program info

### **Timetable Generation**
- ✅ Algorithm selection (Genetic, CSP, Simulated Annealing, etc.)
- ✅ Automatic slot assignment
- ✅ Conflict detection and resolution
- ✅ Real-time progress tracking

### **Timetable Display**
- ✅ Interactive grid view
- ✅ Color-coded time slots
- ✅ Subject, teacher, and room information
- ✅ Export capabilities (future enhancement)

## 📋 How to Use

### 1. **Setup Phase**
1. Go to **Timetable Management** → **Setup**
2. Add subjects: Name, Code, Credits, Duration
3. Add teachers: Name, Specialization, Max hours/week
4. Add classrooms: Name, Capacity, Room type
5. Add student groups: Name, Size, Program

### 2. **Generation Phase**
1. Go to **Generation** tab
2. Select algorithm (Genetic Algorithm recommended)
3. Click "Start Generation"
4. Wait for completion

### 3. **View Phase**
1. Go to **View Timetable** tab
2. Select a student group
3. View the generated timetable grid
4. Export or print as needed

## 🔧 Algorithm Details

### **Simple Algorithm (Current)**
- Distributes subjects evenly across the week
- Assigns teachers and classrooms in rotation
- Uses standard time slots (9 AM - 4 PM)
- Generates Monday-Friday schedule

### **Future Enhancements**
- Advanced constraint satisfaction
- Teacher availability preferences
- Room-specific requirements
- Conflict optimization
- Multiple algorithm comparison

## 📊 Database Schema

### Core Tables Relationships:
```
timetables
├── student_groups (one-to-one)
└── timetable_slots (one-to-many)
    ├── subjects (many-to-one)
    ├── teachers (many-to-one)
    └── classrooms (many-to-one)
```

## 🎯 Key Functions

### JavaScript Functions:
- `addSubject()` - Add new subject to database
- `addTeacher()` - Add new teacher to database
- `addRoom()` - Add new classroom to database
- `addGroup()` - Add new student group to database
- `generateTimetable()` - Generate complete timetable
- `displayTimetable()` - Show timetable in grid format

### TimetableManager Class:
- `loadData()` - Load all data from Supabase
- `generateTimetableSlots()` - Algorithm implementation
- `renderTimetableGrid()` - Display timetable visually
- `updateLists()` - Refresh UI with latest data

## 🚨 Prerequisites

1. ✅ Supabase project configured
2. ✅ Database tables created
3. ✅ User authentication working
4. ✅ RLS policies enabled

## 🎨 UI Features

- **Responsive design** - Works on all screen sizes
- **Real-time updates** - Data syncs with database
- **Interactive tables** - Click to edit/delete
- **Progress tracking** - Visual feedback during generation
- **Color-coded grid** - Easy to read timetable layout

Your timetable management system is now fully functional with Supabase integration!
