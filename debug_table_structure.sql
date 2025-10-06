-- ===============================================
-- DEBUG: Check what columns actually exist in custom_fields table
-- Run this in Supabase SQL Editor to see the real table structure
-- ===============================================

-- Check if the table exists at all
SELECT 'Checking if custom_fields table exists...' as info;
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'custom_fields'
) as table_exists;

-- Show actual columns if table exists
SELECT 'Current custom_fields table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'custom_fields' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show any existing data
SELECT 'Sample data from custom_fields (if any):' as info;
SELECT * FROM custom_fields LIMIT 5;

-- Check table permissions
SELECT 'RLS policies on custom_fields:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'custom_fields';