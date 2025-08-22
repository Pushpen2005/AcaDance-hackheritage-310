# Supabase Setup Instructions for HH310 Academic System

## Quick Setup Guide

### 1. Create Supabase Project
1. Visit [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project credentials

### 2. Update Configuration
Open `supabase-config.js` and replace:
```javascript
url: 'https://your-project-ref.supabase.co'
anonKey: 'your-anon-key-here'
```

### 3. Set Up Database
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database-setup.sql`
3. Run the SQL script

### 4. Test Your Setup
1. Open `login.html` in your browser
2. Try creating a new account
3. Check your Supabase dashboard to see the new user

## Features Already Implemented

✅ **User Authentication**
- Login with email/password
- User registration with role selection
- Password reset functionality
- Email confirmation support

✅ **User Profiles**
- Role-based profiles (Student, Faculty, Admin)
- Profile setup with photo upload
- Department assignment
- Additional role-specific data

✅ **Security**
- Row Level Security (RLS) policies
- Secure API access
- Protected user data

✅ **UI/UX**
- Responsive design
- Dark/light theme toggle
- Form validation
- Loading states and error handling

## Database Schema

The system creates these tables:
- `profiles` - Basic user information
- `students` - Student-specific data
- `faculty` - Faculty-specific data  
- `admins` - Admin-specific data

## Next Steps

After setup, users can:
1. Register for accounts with different roles
2. Complete profile setup
3. Access role-specific features
4. Upload profile photos to Supabase Storage

## Troubleshooting

- Check browser console for any errors
- Verify Supabase credentials are correct
- Ensure database tables are created properly
- Check Row Level Security policies are active
