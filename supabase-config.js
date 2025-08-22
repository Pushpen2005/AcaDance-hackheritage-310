// Supabase Configuration for HH310 Academic System
// Replace these with your actual Supabase project credentials

const SUPABASE_CONFIG = {
  // Replace with your Supabase project URL
  url: 'YOUR_SUPABASE_PROJECT_URL',
  
  // Replace with your Supabase anon/public key
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Initialize Supabase client
const supabase = window.supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Export for use in other files
window.supabaseClient = supabase;

// Database table names (customize as needed)
const TABLES = {
  PROFILES: 'profiles',
  STUDENTS: 'students', 
  FACULTY: 'faculty',
  ADMINS: 'admins'
};

window.TABLES = TABLES;

console.log('✅ Supabase client initialized');

// Setup instructions for first-time users
if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_PROJECT_URL') {
  console.warn(`
    🔧 SUPABASE SETUP REQUIRED:
    
    1. Create a Supabase project at https://supabase.com
    2. Get your project URL and anon key from Project Settings > API
    3. Replace the values in supabase-config.js:
       - SUPABASE_CONFIG.url: Your project URL
       - SUPABASE_CONFIG.anonKey: Your anon/public key
    
    4. Create the following tables in your Supabase database:
    
    -- Profiles table (extends auth.users)
    CREATE TABLE profiles (
      id UUID REFERENCES auth.users(id) PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      full_name TEXT,
      role TEXT CHECK (role IN ('student', 'faculty', 'admin')) NOT NULL,
      department TEXT,
      bio TEXT,
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Students table (for student-specific data)
    CREATE TABLE students (
      id UUID REFERENCES profiles(id) PRIMARY KEY,
      student_id TEXT UNIQUE,
      program TEXT,
      year INTEGER,
      group_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Faculty table (for faculty-specific data)
    CREATE TABLE faculty (
      id UUID REFERENCES profiles(id) PRIMARY KEY,
      employee_id TEXT UNIQUE,
      specialization TEXT,
      max_hours_per_week INTEGER DEFAULT 20,
      available_days TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Admins table (for admin-specific data)
    CREATE TABLE admins (
      id UUID REFERENCES profiles(id) PRIMARY KEY,
      admin_level TEXT DEFAULT 'standard',
      permissions TEXT[],
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE students ENABLE ROW LEVEL SECURITY;
    ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
    ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
    
    -- Profiles policies
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Students policies
    CREATE POLICY "Students can view own data" ON students
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Students can update own data" ON students
      FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Students can insert own data" ON students
      FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Faculty policies  
    CREATE POLICY "Faculty can view own data" ON faculty
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Faculty can update own data" ON faculty
      FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Faculty can insert own data" ON faculty
      FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Admins policies
    CREATE POLICY "Admins can view own data" ON admins
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Admins can update own data" ON admins
      FOR UPDATE USING (auth.uid() = id);
    
    CREATE POLICY "Admins can insert own data" ON admins
      FOR INSERT WITH CHECK (auth.uid() = id);
    
    -- Function to handle user creation
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO profiles (id, email, full_name)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Trigger for new user creation
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    
    5. Enable email confirmations in Authentication > Settings if desired
    6. Configure email templates in Authentication > Email Templates
  `);
}
