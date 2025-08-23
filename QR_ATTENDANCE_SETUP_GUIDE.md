# QR-Based Attendance System - Complete Setup Guide

Welcome to the QR-Based Attendance System! This is a modern, comprehensive solution for educational institutions to track attendance using QR codes, with real-time analytics and management features.

## 🎯 System Overview

This system provides:
- **QR Code Generation**: Teachers can generate QR codes for each class session
- **Mobile QR Scanning**: Students scan QR codes to mark attendance
- **Real-time Tracking**: Live attendance monitoring and updates
- **Analytics Dashboard**: Comprehensive reporting and analytics
- **User Management**: Separate interfaces for students, teachers, and administrators
- **Timetable Management**: Automated scheduling and class management

## 🏗️ Architecture

```
Frontend (HTML/CSS/JavaScript)
├── index.html (Landing page)
├── login.html (Authentication)
├── home.html (Main dashboard)
├── qr-scanner.html (Student QR scanner)
└── supabase-config.js (Backend configuration)

Backend (Supabase)
├── Authentication (User management)
├── Database (PostgreSQL with RLS)
├── Real-time subscriptions
└── Edge functions
```

## 📋 Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Modern Web Browser**: Chrome, Firefox, Safari, or Edge
3. **HTTPS Connection**: Required for camera access
4. **Mobile Device**: For QR code scanning (optional)

## 🚀 Step-by-Step Setup

### Step 1: Set up Supabase Backend

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new project with a secure password

2. **Get your project credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL` and `anon` key
   - Update `supabase-config.js` with your credentials:

```javascript
const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_PROJECT_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

3. **Set up the database**:
   - Go to the SQL Editor in your Supabase dashboard
   - Run the SQL from `qr-attendance-setup.sql`
   - This creates all necessary tables and functions

### Step 2: Configure Authentication

1. **Enable email authentication**:
   - Go to Authentication → Settings
   - Enable "Email" provider
   - Configure email templates (optional)

2. **Set up user roles**:
   - The system supports three roles: `student`, `teacher`, `admin`
   - Users are automatically assigned to the `profiles` table upon signup

### Step 3: Deploy the Frontend

#### Option A: Local Development
1. Clone or download this repository
2. Update `supabase-config.js` with your credentials
3. Open `index.html` in a web browser
4. For HTTPS (required for camera), use a local server:
   ```bash
   # Python
   python -m http.server 8080
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8080
   ```

#### Option B: Web Hosting
1. Upload all files to your web hosting provider
2. Ensure HTTPS is enabled for camera access
3. Update the configuration file
4. Test the system

### Step 4: Create Initial Data

1. **Access the system**:
   - Open your deployed application
   - Sign up as an administrator
   - Log in to the dashboard

2. **Add basic data**:
   - Go to Timetable Management → Setup
   - Add subjects, teachers, classrooms, and student groups
   - Or run the sample data SQL script

3. **Test QR functionality**:
   - Generate a QR code from the attendance module
   - Use the QR scanner to test scanning

## 👥 User Roles and Access

### Students
- **Login**: `login.html`
- **QR Scanner**: `qr-scanner.html`
- **Dashboard**: View attendance history and statistics
- **Mobile-first**: Optimized for mobile devices

### Teachers
- **Dashboard**: `home.html`
- **QR Generation**: Create QR codes for class sessions
- **Attendance Management**: Mark attendance manually or via QR
- **Analytics**: View class attendance reports

### Administrators
- **Full Access**: All system features
- **User Management**: Create and manage user accounts
- **System Configuration**: Set up classes, timetables, etc.
- **Reports**: Comprehensive system analytics

## 📱 How to Use the System

### For Teachers

1. **Start a Class Session**:
   - Login to the dashboard
   - Go to "Attendance Tracking"
   - Select your class and group
   - Click "Generate QR Code"

2. **Display the QR Code**:
   - Project the QR code on screen
   - Students scan to mark attendance
   - Monitor real-time scan count

3. **Manual Attendance** (if needed):
   - Switch to manual mode
   - Mark individual student attendance
   - Save the session

### For Students

1. **Scan QR Code**:
   - Open `qr-scanner.html` or click "Scan QR" from dashboard
   - Allow camera permissions
   - Point camera at QR code displayed by teacher
   - Receive confirmation of attendance marked

2. **View Attendance**:
   - Login to see attendance history
   - Check attendance statistics
   - View upcoming classes

### For Administrators

1. **System Setup**:
   - Add subjects, teachers, classrooms
   - Create student groups and enrollments
   - Configure system settings

2. **User Management**:
   - Create user accounts
   - Assign roles (student/teacher/admin)
   - Manage permissions

3. **Reports and Analytics**:
   - View system-wide statistics
   - Generate attendance reports
   - Monitor system usage

## 🔧 Advanced Configuration

### Database Functions

The system includes several PostgreSQL functions:

- `create_qr_session()`: Generates QR attendance sessions
- `mark_attendance_qr()`: Processes QR code scans
- `get_session_stats()`: Retrieves session statistics
- `complete_qr_session()`: Closes attendance sessions

### Real-time Features

- **Live Updates**: Attendance updates in real-time
- **WebSocket Connection**: Using Supabase real-time subscriptions
- **Conflict Resolution**: Handles multiple simultaneous users

### Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure user sessions
- **QR Code Expiration**: Time-limited QR codes
- **Data Validation**: Server-side validation of all inputs

## 🔍 Testing the System

### Quick Test Checklist

1. ✅ **Database Connection**: Check system status on homepage
2. ✅ **User Authentication**: Sign up and login functionality
3. ✅ **QR Generation**: Create a test QR code
4. ✅ **QR Scanning**: Scan the QR code with camera
5. ✅ **Real-time Updates**: Verify live attendance updates
6. ✅ **Data Persistence**: Check that attendance is saved

### Test Data

Sample test data is included in the setup script:
- Test subjects (CS101, MATH201, PHY101)
- Sample teachers and classrooms
- Test student groups

## 🛠️ Troubleshooting

### Common Issues

1. **Camera Not Working**:
   - Ensure HTTPS connection
   - Check browser permissions
   - Try a different browser

2. **Database Connection Failed**:
   - Verify Supabase credentials
   - Check internet connection
   - Ensure database is set up correctly

3. **QR Code Not Scanning**:
   - Check QR code hasn't expired
   - Ensure good lighting
   - Try moving camera closer/farther

4. **Authentication Issues**:
   - Clear browser cache
   - Check email confirmation
   - Verify user role assignment

### Error Messages

- **"Session not found"**: QR code may have expired
- **"Already marked"**: Attendance already recorded
- **"Not enrolled"**: Student not enrolled in the class
- **"Permission denied"**: User doesn't have required access

## 📊 System Monitoring

### Key Metrics to Monitor

- **Daily Active Users**: Track system usage
- **Attendance Rates**: Monitor class participation
- **QR Scan Success Rate**: Measure system efficiency
- **Session Duration**: Average time per session

### Performance Optimization

- Use database indexes for large datasets
- Implement caching for frequently accessed data
- Optimize QR code generation and scanning
- Monitor and optimize database queries

## 🔐 Security Best Practices

1. **Regular Updates**: Keep all components updated
2. **Strong Passwords**: Enforce password policies
3. **Access Logging**: Monitor system access
4. **Data Backup**: Regular database backups
5. **SSL/TLS**: Always use HTTPS in production

## 📞 Support and Maintenance

### Regular Maintenance Tasks

- Monitor system performance
- Update user accounts and roles
- Archive old attendance data
- Check database integrity
- Update documentation

### Getting Help

1. Check this documentation first
2. Review error logs in browser console
3. Check Supabase dashboard for database issues
4. Verify network connectivity and permissions

## 🎉 Congratulations!

You now have a fully functional QR-based attendance system! The system is designed to be scalable, secure, and user-friendly for educational institutions of all sizes.

### Next Steps

1. Train your teachers and students on the system
2. Set up regular backup procedures
3. Monitor usage and gather feedback
4. Consider additional features like:
   - Mobile app development
   - Integration with existing systems
   - Advanced analytics and reporting
   - Automated notifications

---

**System Version**: 2.0.0  
**Last Updated**: August 2025  
**Compatible Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
