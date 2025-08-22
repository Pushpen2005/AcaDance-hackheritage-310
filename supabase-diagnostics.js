// Supabase Connection Troubleshooting Script
// Run this in the browser console to diagnose connection issues

console.log('🔍 Starting Supabase Connection Diagnostics...\n');

// Test 1: Check if Supabase client is loaded
console.log('1. Testing Supabase Client Initialization:');
if (typeof window.supabase !== 'undefined') {
  console.log('✅ Supabase client library loaded');
} else {
  console.error('❌ Supabase client library not loaded. Check if CDN is accessible.');
  console.log('   Add this to your HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
}

// Test 2: Check configuration
console.log('\n2. Testing Configuration:');
if (typeof window.supabaseClient !== 'undefined') {
  console.log('✅ Supabase client configured');
  console.log('   URL:', window.supabaseClient.supabaseUrl);
  console.log('   Key (first 20 chars):', window.supabaseClient.supabaseKey.substring(0, 20) + '...');
} else {
  console.error('❌ Supabase client not configured. Check supabase-config.js');
}

// Test 3: Check network connectivity
console.log('\n3. Testing Network Connectivity:');
async function testConnection() {
  try {
    // Test basic connectivity to Supabase
    const response = await fetch('https://supabase.com', { mode: 'no-cors' });
    console.log('✅ General internet connectivity working');
    
    // Test your specific Supabase instance
    if (window.supabaseClient) {
      const { data, error } = await window.supabaseClient.auth.getSession();
      if (error) {
        console.warn('⚠️  Session check returned error:', error.message);
      } else {
        console.log('✅ Supabase connection successful');
        console.log('   Current session:', data.session ? 'Active' : 'None');
      }
    }
  } catch (error) {
    console.error('❌ Network connectivity issue:', error.message);
    console.log('   Possible causes:');
    console.log('   - No internet connection');
    console.log('   - Firewall blocking requests');
    console.log('   - Supabase service temporarily unavailable');
  }
}

// Test 4: Check table access
console.log('\n4. Testing Database Table Access:');
async function testTableAccess() {
  if (!window.supabaseClient) {
    console.error('❌ Cannot test tables - Supabase client not available');
    return;
  }

  const tables = ['subjects', 'teachers', 'classrooms', 'student_groups'];
  
  for (const table of tables) {
    try {
      const { data, error } = await window.supabaseClient
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table "${table}" error:`, error.message);
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`   → Table "${table}" doesn't exist. Run the database setup SQL.`);
        } else if (error.message.includes('row-level security')) {
          console.log(`   → RLS policy issue for "${table}". Run the RLS fix script.`);
        }
      } else {
        console.log(`✅ Table "${table}" accessible (${data.length} records found)`);
      }
    } catch (fetchError) {
      console.error(`❌ Failed to fetch from "${table}":`, fetchError.message);
    }
  }
}

// Test 5: Check authentication status
console.log('\n5. Testing Authentication:');
async function testAuth() {
  if (!window.supabaseClient) {
    console.error('❌ Cannot test auth - Supabase client not available');
    return;
  }

  try {
    const { data: { user }, error } = await window.supabaseClient.auth.getUser();
    
    if (error) {
      console.error('❌ Auth error:', error.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
      console.log('   User ID:', user.id);
    } else {
      console.log('ℹ️  No authenticated user (this is normal if not logged in)');
    }
  } catch (authError) {
    console.error('❌ Auth check failed:', authError.message);
  }
}

// Run all tests
async function runAllTests() {
  await testConnection();
  await testTableAccess();
  await testAuth();
  
  console.log('\n📋 SUMMARY:');
  console.log('If you see ❌ errors above, follow these steps:');
  console.log('1. For client issues: Check internet connection and CDN access');
  console.log('2. For table issues: Run timetable-database-setup.sql in Supabase SQL Editor');
  console.log('3. For RLS issues: Run fix-rls-policies.sql in Supabase SQL Editor');
  console.log('4. For auth issues: Try logging in again');
  console.log('\n🔧 Quick fixes to try:');
  console.log('- Refresh the page');
  console.log('- Clear browser cache');
  console.log('- Check browser console for CORS errors');
  console.log('- Verify Supabase project is active (not paused)');
}

// Auto-run tests
runAllTests();
