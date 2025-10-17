-- Add archived column to boards table
-- Run this in your Supabase SQL Editor: https://btiyyxmiwngikpuygpsq.supabase.co/project/_/sql

-- Add the archived column if it doesn't exist
ALTER TABLE boards ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_boards_archived ON boards(archived);

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'boards' 
AND column_name = 'archived';
