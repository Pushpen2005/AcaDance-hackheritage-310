# 🗄️ Database Setup Guide for HH310 Academic System

## 📋 **Quick Setup Steps**

### 1. 🚀 **Deploy Database Schema**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `enhanced-database-schema.sql`
4. Click **Run** to execute the schema

### 2. ✅ **Verify Tables Created**
After running the schema, verify these tables exist:
- `profiles` - User profiles
- `subjects` - Course subjects  
- `teachers` - Faculty information
- `classrooms` - Room details
- `student_groups` - Class groups
- `timetables` - Timetable records
- `timetable_slots` - Individual time slots
- `attendance_records` - Attendance tracking
- `system_settings` - App configuration

### 3. 🔧 **Configure Supabase Settings**

#### Enable Real-time
1. Go to **Database > Replication**
2. Enable replication for these tables:
   - `subjects`
   - `teachers` 
   - `classrooms`
   - `student_groups`
   - `timetables`
   - `timetable_slots`

#### API Settings
1. Go to **Settings > API**
2. Copy your **Project URL** and **anon public key**
3. Update `supabase-config.js`:
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'YOUR_PROJECT_URL_HERE',
     anonKey: 'YOUR_ANON_KEY_HERE'
   };
   ```

### 4. 🧪 **Test the Setup**

#### Test Database Connection
1. Open `home.html` in your browser
2. Click the **🔍 Test Connection** button (top-right)
3. Verify all tests pass:
   - ✅ Supabase client available
   - ✅ Basic connection working  
   - ✅ Database access working

#### Test Timetable Generation
1. Navigate to **Timetable Management** tab
2. Go to **Setup** section
3. Sample data should already be loaded
4. Go to **Generation** section
5. Click **Generate Demo Timetable**
6. Verify timetable appears in **View Timetable** section

#### Test Real-time Sync
1. Open the app in two browser tabs
2. Add a subject in one tab
3. Verify it appears in the other tab automatically
4. Check for real-time notification toast

## 🔍 **Troubleshooting**

### ❌ **Connection Issues**
- Check your internet connection
- Verify Supabase project URL and API key
- Ensure Supabase project is active (not paused)

### 🗄️ **Database Issues**
- Run the complete schema from `enhanced-database-schema.sql`
- Check Row Level Security policies are enabled
- Verify table permissions in Supabase dashboard

### 📡 **Real-time Not Working**
- Enable replication for all tables in Database > Replication
- Check browser console for WebSocket errors
- Verify real-time indicator shows "Live Updates Active"

## 📊 **Sample Data Verification**

After schema deployment, you should see:
- **6 Subjects**: Math, Physics, Chemistry, CS, English, Biology
- **6 Teachers**: Dr. Smith, Prof. Johnson, Dr. Brown, etc.
- **6 Classrooms**: Room A1, Lab B2, Computer Lab, etc.
- **4 Student Groups**: CS-2024-A, CS-2024-B, MATH-2024, PHY-2024

## ✅ **Success Indicators**

When everything is working correctly:
- 🟢 **Connection indicator** shows "Live Updates Active"
- 📊 **Sample data** loads in Setup section
- 🔄 **Real-time sync** works between browser tabs
- 📅 **Demo timetable** generates successfully
- 💾 **Auto-save** notifications appear
- 🔔 **Toast notifications** show for all actions

## 🎯 **Ready for Production**

Once all tests pass, your system supports:
- ✅ Real-time collaborative editing
- ✅ Automatic conflict detection
- ✅ Progressive timetable generation
- ✅ Persistent auto-saving
- ✅ Cross-user synchronization
- ✅ Professional error handling

**Your HH310 Academic System is now fully operational with real-time capabilities!** 🎉
