-- ===============================================
-- CUSTOM FIELDS DATABASE FIX
-- Copy this entire block and run in Supabase SQL Editor
-- ===============================================

-- 1. First, let's see the current table structure
SELECT 'Current custom_fields table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'custom_fields' 
ORDER BY ordinal_position;

-- 2. Add missing columns to custom_fields table
ALTER TABLE custom_fields 
ADD COLUMN IF NOT EXISTS position integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS options jsonb,
ADD COLUMN IF NOT EXISTS required boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS default_value text,
ADD COLUMN IF NOT EXISTS placeholder text,
ADD COLUMN IF NOT EXISTS help_text text;

-- 3. Update the field_type constraint to include all supported types
ALTER TABLE custom_fields 
DROP CONSTRAINT IF EXISTS custom_fields_field_type_check;

ALTER TABLE custom_fields 
ADD CONSTRAINT custom_fields_field_type_check 
CHECK (field_type IN (
  'text', 'number', 'date', 'select', 'multi-select', 
  'currency', 'url', 'email', 'phone', 'checkbox', 'textarea'
));

-- 4. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_fields_position 
ON custom_fields(workspace_id, position);

-- 5. Create or update the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Add update trigger for custom_fields
DROP TRIGGER IF EXISTS update_custom_fields_updated_at ON custom_fields;
CREATE TRIGGER update_custom_fields_updated_at 
  BEFORE UPDATE ON custom_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Verify the updated table structure
SELECT 'Updated custom_fields table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'custom_fields' 
ORDER BY ordinal_position;

-- 8. Check custom_field_values table exists and has correct structure
SELECT 'custom_field_values table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'custom_field_values' 
ORDER BY ordinal_position;

-- 9. Final success message
SELECT '✅ Custom fields database fix completed successfully!' as result;
SELECT 'You can now use custom fields in your application!' as next_step;