# HH310 Academic System - Supabase Setup Guide

## 🗄️ Database Configuration for Your Institution

### Step 1: Create Supabase Project

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   ```
   Organization: Your Institution
   Name: HH310-Academic-System
   Database Password: [Generate strong password]
   Region: [Choose closest to your location]
   ```

### Step 2: Run Database Schema

1. **Go to SQL Editor in Supabase Dashboard**
2. **Run the main schema:**
   ```sql
   -- Copy and paste contents of enhanced-database-schema.sql
   ```
3. **Run the test data script:**
   ```sql
   -- Copy and paste contents of deployment/production/scripts/insert-test-data.sql
   ```
4. **Run performance optimizations:**
   ```sql
   -- Copy and paste contents of deployment/production/scripts/optimize-database.sql
   ```

### Step 3: Enable Real-time

1. **Go to Database → Replication**
2. **Enable real-time for these tables:**
   - ✅ `timetable_slots`
   - ✅ `timetables`
   - ✅ `attendance_records`
   - ✅ `subjects`
   - ✅ `teachers`
   - ✅ `classrooms`
   - ✅ `student_groups`

### Step 4: Configure Row Level Security

The schema automatically sets up RLS policies, but verify:

1. **Go to Authentication → Policies**
2. **Check that policies exist for all tables**
3. **Test with a sample user account**

### Step 5: Get API Credentials

1. **Go to Settings → API**
2. **Copy these values:**
   ```
   Project URL: https://your-project-id.supabase.co
   anon public key: eyJ... (long key)
   service_role key: eyJ... (keep this secret!)
   ```

## 🏫 Institution Customization

### Update Configuration File

Edit `deployment/production/config/production-config.js`:

```javascript
const PRODUCTION_CONFIG = {
    supabase: {
        url: 'https://your-project-id.supabase.co',
        anonKey: 'your-anon-key-here',
        realtime: true
    },
    app: {
        name: 'Your Institution Academic System',
        version: '2.0',
        environment: 'production',
        institution: 'Your Institution Name',
        logo: 'assets/your-logo.png',
        primaryColor: '#your-primary-color',
        secondaryColor: '#your-secondary-color'
    },
    features: {
        enableQRCode: true,
        enableRealtime: true,
        enableAnalytics: true,
        enableNotifications: true,
        autoSaveInterval: 30000
    }
};
```

### Customize Institution Data

Update the test data script with your actual data:

```sql
-- Update institution settings
UPDATE system_settings SET value = '"Your Institution Name"' WHERE key = 'institution_name';
UPDATE system_settings SET value = '"2024-25"' WHERE key = 'academic_year';
UPDATE system_settings SET value = '1' WHERE key = 'current_semester';

-- Add your actual subjects
INSERT INTO subjects (name, code, credits, duration, department) VALUES
  ('Your Subject 1', 'SUBJ101', 3, 60, 'Your Department'),
  ('Your Subject 2', 'SUBJ102', 4, 90, 'Your Department');

-- Add your actual teachers
INSERT INTO teachers (name, employee_id, specialization, department) VALUES
  ('Dr. Your Teacher', 'EMP001', 'Your Specialization', 'Your Department');

-- Add your actual classrooms
INSERT INTO classrooms (name, capacity, room_type, building) VALUES
  ('Your Room 1', 30, 'lecture', 'Your Building');

-- Add your actual student groups
INSERT INTO student_groups (name, program, year, semester, size) VALUES
  ('YOUR-2024-A1', 'Your Program', 1, 1, 30);
```

## 🎨 UI Customization

### Brand Colors and Styling

Edit the CSS variables in `home.html`:

```css
:root {
    --primary-color: #your-primary-color;
    --secondary-color: #your-secondary-color;
    --accent-color: #your-accent-color;
    --background-color: #your-bg-color;
    --text-color: #your-text-color;
}
```

### Logo and Branding

1. **Add your logo:**
   - Place logo file in `deployment/production/assets/`
   - Update logo path in configuration

2. **Update page title:**
   ```html
   <title>Your Institution: Academic Management System</title>
   ```

3. **Customize header:**
   ```html
   <h1>Your Institution Academic System</h1>
   ```

## 🔧 Environment-Specific Configurations

### Development Environment
```javascript
// Use local Supabase project or staging
const DEV_CONFIG = {
    supabase: {
        url: 'http://localhost:54321', // Local Supabase
        anonKey: 'your-local-key'
    },
    app: {
        name: 'HH310 (Development)',
        environment: 'development'
    }
};
```

### Staging Environment
```javascript
// For testing before production
const STAGING_CONFIG = {
    supabase: {
        url: 'https://staging-project.supabase.co',
        anonKey: 'staging-key'
    },
    app: {
        name: 'HH310 (Staging)',
        environment: 'staging'
    }
};
```

### Production Environment
```javascript
// Your live production settings
const PRODUCTION_CONFIG = {
    supabase: {
        url: 'https://production-project.supabase.co',
        anonKey: 'production-key'
    },
    app: {
        name: 'Your Institution Academic System',
        environment: 'production'
    }
};
```

## 🔐 Security Configuration

### 1. Environment Variables (Recommended)

Instead of hardcoding credentials, use environment variables:

```javascript
const PRODUCTION_CONFIG = {
    supabase: {
        url: process.env.SUPABASE_URL || 'fallback-url',
        anonKey: process.env.SUPABASE_ANON_KEY || 'fallback-key'
    }
};
```

### 2. Domain Restrictions

In Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://your-domain.com
Redirect URLs: https://your-domain.com/auth/callback
```

### 3. RLS Policies

Customize the RLS policies for your institution's access patterns:

```sql
-- Example: Restrict by department
CREATE POLICY "Department access only" ON subjects
  FOR SELECT USING (
    department = (
      SELECT department FROM profiles 
      WHERE id = auth.uid()
    )
  );
```

## 📊 Analytics Configuration

### Enable Supabase Analytics

1. **Go to Reports in Supabase Dashboard**
2. **Monitor:**
   - Database performance
   - API usage
   - Real-time connections
   - Storage usage

### Custom Analytics

Add your analytics tracking:

```javascript
// Google Analytics, Mixpanel, etc.
const ANALYTICS_CONFIG = {
    googleAnalytics: 'GA-XXXXX-X',
    enableTracking: true,
    trackEvents: ['timetable_generated', 'attendance_marked']
};
```

## 🚀 Deployment Checklist

### Pre-deployment
- ✅ Supabase project created and configured
- ✅ Database schema deployed
- ✅ Test data inserted (optional)
- ✅ Real-time enabled
- ✅ RLS policies active
- ✅ Institution branding applied
- ✅ Configuration files updated

### Deployment
- ✅ Files uploaded to web server
- ✅ HTTPS/SSL configured
- ✅ Domain pointed to server
- ✅ Web server configuration applied
- ✅ Security headers configured

### Post-deployment
- ✅ Application loads correctly
- ✅ Database connection working
- ✅ Real-time functionality tested
- ✅ QR code generation working
- ✅ Attendance system functional
- ✅ Timetable generation working
- ✅ User authentication (if enabled)
- ✅ Mobile responsiveness verified

## 🆘 Troubleshooting

### Common Issues

1. **"Supabase client not available"**
   - Check API credentials in config
   - Verify Supabase project is active
   - Check network connectivity

2. **Real-time not working**
   - Ensure real-time is enabled on tables
   - Check WebSocket connection in browser dev tools
   - Verify RLS policies don't block subscriptions

3. **QR code not displaying**
   - Check if QRious library is loaded
   - Verify QR code generation function
   - Check browser console for JavaScript errors

4. **Database connection issues**
   - Verify Supabase project URL and key
   - Check RLS policies
   - Ensure tables exist

### Support Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Project Repository**: Your GitHub repository
- **Institution IT Support**: Contact your IT department

---

*Last Updated: December 2024*  
*Version: 2.0 Enhanced*
