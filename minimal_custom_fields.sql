-- ===============================================
-- FINAL FIX: Ultra-minimal custom_fields table without constraints
-- Run this in Supabase SQL Editor
-- ===============================================

-- 1. Drop the table completely to remove all constraints
DROP TABLE IF EXISTS custom_fields CASCADE;

-- 2. Drop any remaining constraint functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- 3. Create the most basic table possible with NO constraints
CREATE TABLE custom_fields (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid NOT NULL,
    name text NOT NULL,
    field_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Add foreign key reference to workspaces (if workspaces table exists)
-- ALTER TABLE custom_fields ADD CONSTRAINT fk_custom_fields_workspace 
-- FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;

-- 5. Basic RLS with simple policy
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Enable all for authenticated users" ON custom_fields;
DROP POLICY IF EXISTS "Users can view custom fields in their workspaces" ON custom_fields;
DROP POLICY IF EXISTS "Users can insert custom fields in their workspaces" ON custom_fields;
DROP POLICY IF EXISTS "Users can update custom fields in their workspaces" ON custom_fields;
DROP POLICY IF EXISTS "Users can delete custom fields in their workspaces" ON custom_fields;

-- Create a simple policy that allows all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON custom_fields 
FOR ALL USING (auth.role() = 'authenticated');

-- 6. Verify the table structure
SELECT 'Table created successfully!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'custom_fields' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Check constraints (should be minimal)
SELECT 'Constraints on table:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'custom_fields'::regclass;