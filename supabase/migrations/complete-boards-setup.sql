-- Complete boards table setup
-- Run this in your Supabase SQL Editor: https://btiyyxmiwngikpuygpsq.supabase.co/project/_/sql

-- First, let's see what columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'boards'
ORDER BY ordinal_position;

-- If the table exists with the wrong structure, drop it and recreate
DROP TABLE IF EXISTS boards CASCADE;

-- Create boards table with ALL needed columns
CREATE TABLE boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id text NOT NULL,
  name text NOT NULL,
  description text,
  position integer DEFAULT 0,
  archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_boards_workspace_id ON boards(workspace_id);
CREATE INDEX idx_boards_position ON boards(position);
CREATE INDEX idx_boards_archived ON boards(archived);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Create policies for boards (permissive for now)
CREATE POLICY "Enable all access for authenticated users" ON boards
  FOR ALL USING (true);

-- Verify the table was created correctly
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'boards'
ORDER BY ordinal_position;
