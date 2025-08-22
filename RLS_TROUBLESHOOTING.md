# RLS Policy Fix Instructions

## Issue
You're encountering a Row Level Security (RLS) policy violation when trying to insert data into the timetable management tables. This happens because the current RLS policies are either too restrictive or not properly configured.

## Solution Steps

### Step 1: Run the RLS Fix Script
1. Go to your Supabase Dashboard
2. Navigate to the **SQL Editor**
3. Copy and paste the entire content of `fix-rls-policies.sql` into the SQL Editor
4. Click **Run** to execute the script

### Step 2: Verify Policies Are Working
After running the fix script, the verification query at the end will show you all the current policies. You should see:
- Each table should have 4 policies: SELECT, INSERT, UPDATE, DELETE
- INSERT, UPDATE, DELETE policies should check `auth.uid() IS NOT NULL`
- SELECT policies should allow `true` (all users can read)

### Step 3: Test the Application
1. Open `home.html` in your browser
2. Log in with your account
3. Try adding a subject, teacher, classroom, or student group
4. The operations should now work without RLS errors

## Understanding the Fix

### What Was Wrong
The original policies used `FOR ALL` which is supposed to cover all operations (SELECT, INSERT, UPDATE, DELETE), but sometimes Supabase requires more specific policies for each operation type.

### What Changed
- **Before**: `FOR ALL USING (auth.uid() IS NOT NULL)`
- **After**: Separate policies for each operation:
  - `FOR SELECT USING (true)` - Anyone can read
  - `FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)` - Only authenticated users can insert
  - `FOR UPDATE USING (auth.uid() IS NOT NULL)` - Only authenticated users can update
  - `FOR DELETE USING (auth.uid() IS NOT NULL)` - Only authenticated users can delete

### Policy Options

#### Current Setup (Recommended for Development)
- All authenticated users can manage all data
- Good for collaborative environments
- Easier to test and develop

#### Alternative Setup (For Production)
If you want to restrict users to only manage their own data, uncomment the alternative policies in `fix-rls-policies.sql`. These policies:
- Only allow users to modify records they created (`created_by = auth.uid()`)
- Provide better data isolation between users
- More secure for production environments

## Troubleshooting

### If You Still Get RLS Errors:
1. **Check Authentication**: Make sure you're logged in and `auth.uid()` returns a valid UUID
2. **Check Console**: Look for authentication errors in the browser console
3. **Verify User Session**: In your browser's developer tools, check that the Supabase session is active
4. **Check Policy Names**: Ensure no duplicate policy names exist (the fix script drops old policies first)

### Common Issues:
1. **User Not Authenticated**: RLS policies require a valid authenticated user
2. **Session Expired**: User session may have expired, requiring re-login
3. **Wrong Policy Names**: Duplicate or conflicting policy names
4. **Case Sensitivity**: Table names and policy names are case-sensitive

### Testing Authentication:
You can test if authentication is working by running this in the browser console:
```javascript
// Check if user is authenticated
console.log('Current user:', supabase.auth.getUser());

// Check current session
console.log('Current session:', supabase.auth.getSession());
```

## Next Steps
After fixing the RLS policies, you should be able to:
1. ✅ Add subjects, teachers, classrooms, and student groups
2. ✅ Delete items from the lists
3. ✅ Generate timetables
4. ✅ View and manage all timetable data

If you continue to have issues, check the browser console for specific error messages and verify that your Supabase authentication is working properly.
