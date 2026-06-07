-- ================================================
-- CHINA TRAVEL PORTAL — Supabase Database Schema
-- انسخ هذا الكود كاملاً والصقه في Supabase SQL Editor
-- ================================================

-- جدول الملفات الشخصية للمسافرين
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'traveler' CHECK (role IN ('admin', 'traveler')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'pending')),
  trip_date DATE,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول الدعوات
CREATE TABLE IF NOT EXISTS invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  token TEXT UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- المسافر يقرأ ملفه الشخصي فقط
CREATE POLICY "traveler_read_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- المدير يقرأ كل الملفات
CREATE POLICY "admin_read_all" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- المدير يدير الدعوات
CREATE POLICY "admin_manage_invites" ON invites
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- إنشاء حساب المدير الأول
-- غيّر الإيميل وكلمة المرور قبل التشغيل
-- بعد إنشاء الحساب من صفحة تسجيل الدخول، شغّل هذا:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@yourdomain.com';

-- ================================================
-- للتحقق: شغّل هذا بعد النشر
-- SELECT * FROM profiles;
-- SELECT * FROM invites;
-- ================================================
