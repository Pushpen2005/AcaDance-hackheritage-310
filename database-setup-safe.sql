-- HH310 Academic System Database Setup (Safe Version)
-- This version handles existing tables gracefully
-- Run this SQL in your Supabase SQL Editor

-- Profiles table (extends auth.users) - using IF NOT EXISTS
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS students (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  student_id TEXT UNIQUE,
  program TEXT,
  year INTEGER,
  group_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Faculty table (for faculty-specific data)
CREATE TABLE IF NOT EXISTS faculty (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  employee_id TEXT UNIQUE,
  specialization TEXT,
  max_hours_per_week INTEGER DEFAULT 20,
  available_days TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table (for admin-specific data)
CREATE TABLE IF NOT EXISTS admins (
  id UUID REFERENCES profiles(id) PRIMARY KEY,
  admin_level TEXT DEFAULT 'standard',
  permissions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (only if not already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles'
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE students ENABLE ROW LEVEL SECURITY;
    ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
    ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies only if they don't exist
DO $$
BEGIN
  -- Profiles policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- Students policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Students can view own data') THEN
    CREATE POLICY "Students can view own data" ON students
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Students can update own data') THEN
    CREATE POLICY "Students can update own data" ON students
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'students' AND policyname = 'Students can insert own data') THEN
    CREATE POLICY "Students can insert own data" ON students
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- Faculty policies  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'faculty' AND policyname = 'Faculty can view own data') THEN
    CREATE POLICY "Faculty can view own data" ON faculty
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'faculty' AND policyname = 'Faculty can update own data') THEN
    CREATE POLICY "Faculty can update own data" ON faculty
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'faculty' AND policyname = 'Faculty can insert own data') THEN
    CREATE POLICY "Faculty can insert own data" ON faculty
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

  -- Admins policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Admins can view own data') THEN
    CREATE POLICY "Admins can view own data" ON admins
      FOR SELECT USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Admins can update own data') THEN
    CREATE POLICY "Admins can update own data" ON admins
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Admins can insert own data') THEN
    CREATE POLICY "Admins can insert own data" ON admins
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Function to handle user creation (replace if exists)
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

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Create storage bucket for avatars (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
  END IF;
END $$;

-- Storage policies (create only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Avatar images are publicly accessible') THEN
    CREATE POLICY "Avatar images are publicly accessible"
      ON storage.objects FOR SELECT
      USING ( bucket_id = 'avatars' );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload their own avatar') THEN
    CREATE POLICY "Users can upload their own avatar"
      ON storage.objects FOR INSERT
      WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update their own avatar') THEN
    CREATE POLICY "Users can update their own avatar"
      ON storage.objects FOR UPDATE
      USING ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
  END IF;
END $$;
