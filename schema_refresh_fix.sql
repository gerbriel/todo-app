-- ===============================================
-- SUPABASE SCHEMA CACHE REFRESH AND CUSTOM FIELDS FIX
-- Run this in Supabase SQL Editor to force schema refresh
-- ===============================================

-- 1. First, let's check the current table structure
SELECT 'Current custom_fields table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'custom_fields' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Drop and recreate the table with all required columns
-- This forces Supabase to refresh the schema cache
DROP TABLE IF EXISTS custom_fields CASCADE;

-- 3. Recreate the table with the complete schema
CREATE TABLE custom_fields (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name text NOT NULL,
    field_type text NOT NULL CHECK (field_type IN (
        'text', 'number', 'date', 'select', 'multi-select', 
        'currency', 'url', 'email', 'phone', 'checkbox', 'textarea'
    )),
    position integer DEFAULT 0 NOT NULL,
    options jsonb DEFAULT '[]'::jsonb,
    required boolean DEFAULT false NOT NULL,
    default_value text,
    placeholder text,
    help_text text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 4. Create indexes for performance
CREATE INDEX idx_custom_fields_workspace_position ON custom_fields(workspace_id, position);
CREATE INDEX idx_custom_fields_workspace ON custom_fields(workspace_id);

-- 5. Create the update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_fields_updated_at 
    BEFORE UPDATE ON custom_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable RLS (Row Level Security)
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies (adjust based on your auth setup)
CREATE POLICY "Users can view custom fields in their workspaces" ON custom_fields
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM workspaces 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert custom fields in their workspaces" ON custom_fields
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT id FROM workspaces 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update custom fields in their workspaces" ON custom_fields
    FOR UPDATE USING (
        workspace_id IN (
            SELECT id FROM workspaces 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete custom fields in their workspaces" ON custom_fields
    FOR DELETE USING (
        workspace_id IN (
            SELECT id FROM workspaces 
            WHERE owner_id = auth.uid()
        )
    );

-- 8. Verify the new table structure
SELECT 'Updated custom_fields table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'custom_fields' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Success message
SELECT '✅ Custom fields table recreated with complete schema!' as result;
SELECT 'Schema cache has been refreshed!' as cache_status;