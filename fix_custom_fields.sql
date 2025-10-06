-- FIX CUSTOM FIELDS TABLE - Add missing columns
-- Run this in your Supabase SQL Editor to fix the schema

-- 1. Add missing columns to custom_fields table
ALTER TABLE custom_fields 
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS options jsonb,
ADD COLUMN IF NOT EXISTS required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS default_value text,
ADD COLUMN IF NOT EXISTS placeholder text,
ADD COLUMN IF NOT EXISTS help_text text;

-- 2. Update the field_type constraint to include all types
ALTER TABLE custom_fields 
DROP CONSTRAINT IF EXISTS custom_fields_field_type_check;

ALTER TABLE custom_fields 
ADD CONSTRAINT custom_fields_field_type_check 
CHECK (field_type IN ('text', 'number', 'date', 'select', 'multi-select', 'currency', 'url', 'email', 'phone', 'checkbox', 'textarea'));

-- 3. Add missing indexes
CREATE INDEX IF NOT EXISTS idx_custom_fields_position ON custom_fields(workspace_id, position);

-- 4. Check the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'custom_fields' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Custom fields table updated successfully!' as result;