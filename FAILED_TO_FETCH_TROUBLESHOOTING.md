# "Failed to fetch" Error Troubleshooting Guide

## 🚨 Issue: Failed to fetch

The "Failed to fetch" error occurs when your application cannot connect to the Supabase database. This is a common network connectivity issue.

## 🔍 Quick Diagnosis

### Step 1: Use the Connection Test Button
1. Open `home.html` in your browser
2. Look for the red "🔍 Test Connection" button in the top-right corner
3. Click it to run automated diagnostics
4. Check the browser console for detailed error messages

### Step 2: Manual Browser Console Test
1. Open Developer Tools (F12)
2. Go to the Console tab
3. Copy and run the diagnostics script from `supabase-diagnostics.js`

## 🛠️ Common Causes & Solutions

### 1. **Internet Connectivity Issues**
**Symptoms:** All network requests fail
**Solutions:**
- ✅ Check your internet connection
- ✅ Try opening other websites
- ✅ Restart your router/modem
- ✅ Try a different network (mobile hotspot)

### 2. **Supabase Project Issues**
**Symptoms:** Specific errors about project not found
**Solutions:**
- ✅ Check if your Supabase project is active (not paused)
- ✅ Verify your project URL in `supabase-config.js`
- ✅ Check your API key is correct and not expired
- ✅ Login to Supabase dashboard to confirm project status

### 3. **Browser/CORS Issues**
**Symptoms:** CORS errors in console
**Solutions:**
- ✅ Refresh the page (Ctrl+F5 / Cmd+Shift+R)
- ✅ Clear browser cache and cookies
- ✅ Try an incognito/private browsing window
- ✅ Try a different browser
- ✅ Disable browser extensions temporarily

### 4. **Firewall/Network Restrictions**
**Symptoms:** Requests blocked by security software
**Solutions:**
- ✅ Check if antivirus/firewall is blocking requests
- ✅ Try disabling VPN temporarily
- ✅ Check if you're on a restricted network (school/work)
- ✅ Add Supabase domains to firewall whitelist

### 5. **Database/RLS Issues**
**Symptoms:** Authentication works but data fetching fails
**Solutions:**
- ✅ Run the RLS fix script: `fix-rls-policies.sql`
- ✅ Check if database tables exist: `timetable-database-setup.sql`
- ✅ Verify you're logged in with proper permissions

## 🔧 Step-by-Step Fix Process

### Option A: Quick Fixes (Try First)
1. **Refresh the page** completely (Ctrl+F5)
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Check internet connection** (try google.com)
4. **Try incognito mode** to rule out extensions

### Option B: Configuration Check
1. Open `supabase-config.js`
2. Verify your URL: `https://your-project-ref.supabase.co`
3. Verify your anon key starts with `eyJhbGciOiJIUzI1NiIs...`
4. Check for typos or extra spaces

### Option C: Database Setup
1. Login to your Supabase dashboard
2. Go to SQL Editor
3. Run `timetable-database-setup.sql` (if not done already)
4. Run `fix-rls-policies.sql` (if getting RLS errors)

### Option D: Network Troubleshooting
1. **Test with mobile hotspot** (rules out network issues)
2. **Try different browser** (rules out browser issues)
3. **Check Supabase status** at https://status.supabase.com
4. **Contact network admin** if on restricted network

## 🧪 Testing Commands

Run these in your browser console to test specific components:

### Test 1: Basic Connectivity
```javascript
fetch('https://supabase.com').then(() => console.log('✅ Internet OK')).catch(e => console.log('❌ Internet issue:', e));
```

### Test 2: Supabase Client
```javascript
console.log('Supabase client:', window.supabaseClient ? '✅ Available' : '❌ Missing');
```

### Test 3: Authentication
```javascript
window.supabaseClient.auth.getSession().then(({data, error}) => {
  console.log(error ? `❌ Auth error: ${error.message}` : '✅ Auth working');
});
```

### Test 4: Database Access
```javascript
window.supabaseClient.from('subjects').select('*').limit(1).then(({data, error}) => {
  console.log(error ? `❌ DB error: ${error.message}` : '✅ Database working');
});
```

## 📞 Getting Help

If none of the above solutions work:

1. **Check browser console** for specific error messages
2. **Note your browser version** and operating system
3. **Check network setup** (corporate firewall, VPN, etc.)
4. **Verify Supabase project status** in dashboard
5. **Test from different device/network** to isolate the issue

## 🎯 Success Indicators

You'll know the issue is fixed when:
- ✅ "🔍 Test Connection" button shows all tests pass
- ✅ You can add subjects, teachers, classrooms, and groups
- ✅ Timetable generation works without errors
- ✅ No "Failed to fetch" errors in browser console
- ✅ Authentication status shows correctly in the UI

## 🔄 Prevention

To prevent future "Failed to fetch" errors:
- Keep your Supabase project active (use it regularly)
- Monitor Supabase usage limits
- Keep your API keys secure and up to date
- Test your application regularly
- Have a backup plan for network connectivity issues
