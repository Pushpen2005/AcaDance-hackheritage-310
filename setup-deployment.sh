#!/bin/bash
# HH310 Academic System - Pre-deployment Setup Script
# This script prepares the application for testing and production deployment

echo "🚀 HH310 Academic System - Pre-deployment Setup"
echo "=================================================="

# Check if we're in the correct directory
if [ ! -f "home.html" ]; then
    echo "❌ Error: home.html not found. Please run this script from the project directory."
    exit 1
fi

echo "✅ Project directory confirmed"

# Create deployment directory structure
echo "📁 Creating deployment structure..."
mkdir -p deployment/{production,staging,local}
mkdir -p deployment/production/{assets,config,scripts}
mkdir -p deployment/staging/{assets,config,scripts}

# Copy essential files for deployment
echo "📋 Copying essential files..."
cp home.html deployment/production/index.html
cp attendance-manager.js deployment/production/assets/
cp supabase-config.js deployment/production/config/
cp enhanced-database-schema.sql deployment/production/scripts/

# Create production configuration template
echo "⚙️ Creating production configuration..."
cat > deployment/production/config/production-config.js << 'EOF'
// Production Configuration for HH310 Academic System
// Update these values with your production Supabase credentials

const PRODUCTION_CONFIG = {
    supabase: {
        url: 'YOUR_SUPABASE_URL_HERE',
        anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE',
        realtime: true
    },
    app: {
        name: 'HH310 Academic System',
        version: '2.0',
        environment: 'production',
        institution: 'Your Institution Name',
        logo: 'assets/logo.png',
        primaryColor: '#1f2937',
        secondaryColor: '#3b82f6'
    },
    features: {
        enableQRCode: true,
        enableRealtime: true,
        enableAnalytics: true,
        enableNotifications: true,
        autoSaveInterval: 30000 // 30 seconds
    }
};

// Initialize Supabase with production settings
const supabaseClient = supabase.createClient(
    PRODUCTION_CONFIG.supabase.url,
    PRODUCTION_CONFIG.supabase.anonKey,
    {
        realtime: {
            enabled: PRODUCTION_CONFIG.supabase.realtime
        }
    }
);

window.supabaseClient = supabaseClient;
window.PRODUCTION_CONFIG = PRODUCTION_CONFIG;
EOF

# Create staging configuration
echo "🧪 Creating staging configuration..."
cat > deployment/staging/config/staging-config.js << 'EOF'
// Staging Configuration for HH310 Academic System
// For testing before production deployment

const STAGING_CONFIG = {
    supabase: {
        url: 'YOUR_STAGING_SUPABASE_URL',
        anonKey: 'YOUR_STAGING_SUPABASE_ANON_KEY',
        realtime: true
    },
    app: {
        name: 'HH310 Academic System (Staging)',
        version: '2.0-staging',
        environment: 'staging',
        institution: 'Test Institution',
        logo: 'assets/logo.png',
        primaryColor: '#1f2937',
        secondaryColor: '#f59e0b' // Different color for staging
    },
    features: {
        enableQRCode: true,
        enableRealtime: true,
        enableAnalytics: true,
        enableNotifications: true,
        autoSaveInterval: 10000 // Faster for testing
    }
};

const supabaseClient = supabase.createClient(
    STAGING_CONFIG.supabase.url,
    STAGING_CONFIG.supabase.anonKey
);

window.supabaseClient = supabaseClient;
window.STAGING_CONFIG = STAGING_CONFIG;
EOF

# Create deployment README
echo "📖 Creating deployment documentation..."
cat > deployment/README.md << 'EOF'
# HH310 Academic System - Deployment Guide

## Quick Deployment Steps

### 1. Production Deployment
```bash
# 1. Update production configuration
nano deployment/production/config/production-config.js

# 2. Upload to your web server
rsync -av deployment/production/ user@yourserver:/var/www/html/

# 3. Configure web server (nginx example)
sudo nginx -t && sudo systemctl reload nginx
```

### 2. Supabase Setup
1. Create new Supabase project
2. Run `deployment/production/scripts/enhanced-database-schema.sql`
3. Enable real-time on all tables
4. Update `production-config.js` with your credentials

### 3. Testing
```bash
# Local testing
python3 -m http.server 8000
open http://localhost:8000/deployment/production/

# Or using Node.js
npx serve deployment/production/
```

### 4. Security Checklist
- [ ] HTTPS enabled
- [ ] Supabase RLS policies active
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] API keys not exposed in client code

## Environment Configurations

- **Production**: `deployment/production/`
- **Staging**: `deployment/staging/`
- **Local**: Use root directory for development
EOF

# Create nginx configuration template
echo "🌐 Creating nginx configuration template..."
cat > deployment/production/config/nginx.conf << 'EOF'
# Nginx configuration for HH310 Academic System

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'" always;

    # Main application
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to Supabase (optional)
    location /api/ {
        proxy_pass https://your-supabase-url.supabase.co/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOF

# Create test data insertion script
echo "🗄️ Creating test data script..."
cat > deployment/production/scripts/insert-test-data.sql << 'EOF'
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
EOF

# Create performance optimization script
echo "⚡ Creating performance optimization..."
cat > deployment/production/scripts/optimize-database.sql << 'EOF'
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
EOF

echo ""
echo "✅ Pre-deployment setup completed!"
echo ""
echo "📁 Deployment structure created in ./deployment/"
echo "⚙️ Configuration templates ready"
echo "🗄️ Database scripts prepared"
echo "📖 Documentation generated"
echo ""
echo "Next steps:"
echo "1. Update deployment/production/config/production-config.js with your Supabase credentials"
echo "2. Run the database setup scripts in your Supabase project"
echo "3. Test the application locally"
echo "4. Deploy to your web server"
echo ""
echo "For detailed instructions, see: deployment/README.md"
