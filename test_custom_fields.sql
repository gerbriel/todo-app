-- MINIMAL CUSTOM FIELDS TEST
-- Run this to create a simple test custom field

-- 1. First, let's see what the current table structure looks like
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'custom_fields';

-- 2. Insert a simple test custom field (adjust based on your current columns)
INSERT INTO custom_fields (workspace_id, name, field_type, created_at, updated_at)
VALUES (
  'afa0b21a-9585-4e62-9908-9c36ed9b0d25',  -- Your workspace ID from the error
  'Test Field',
  'text',
  now(),
  now()
);

-- 3. Test selecting the field
SELECT * FROM custom_fields 
WHERE workspace_id = 'afa0b21a-9585-4e62-9908-9c36ed9b0d25';

-- Success message
SELECT 'Test custom field created!' as result;